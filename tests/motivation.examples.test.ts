import { describe, expect, it } from 'vitest'
import {
  aggregateKpiPercent,
  calcGrowth,
  calcHalfPeriod,
  calcSalary,
  growthMatchedProjects,
} from '../src/lib/motivation/calculate'
import { leadCoefFromAggregateKpi, growthCoefFromPercent } from '../src/lib/motivation/rules'
import type { KpiLine, MonthWorkspace, Project } from '../src/lib/motivation/types'

function line(
  budgetH1: number,
  budgetH2: number,
  kpiPlan: number,
  pctH1: number,
  pctH2: number,
): KpiLine {
  const leadsH1 = Math.round(budgetH1 / ((pctH1 / 100) * kpiPlan))
  const leadsH2 = Math.round(budgetH2 / ((pctH2 / 100) * kpiPlan))
  return {
    id: 'l1',
    label: 'Воронка',
    kpiPlanRub: kpiPlan,
    h1: { budgetFactRub: budgetH1, leads: leadsH1 || 1 },
    h2: { budgetFactRub: budgetH2, leads: leadsH2 || 1 },
  }
}

function workspace(
  h1Budget: number,
  h2Budget: number,
  pctH1: number,
  pctH2: number,
  prevMonth: number,
): MonthWorkspace {
  const kpiPlan = 1000
  const project: Project = {
    id: 'p1',
    name: 'Сводный проект (тест PDF)',
    excludeFromGrowth: false,
    budgetPreviousMonthRub: prevMonth,
    kpiLines: [line(h1Budget, h2Budget, kpiPlan, pctH1, pctH2)],
  }
  return { month: '2026-04', projects: [project] }
}

describe('коэффициенты (таблица правил)', () => {
  it('лид ≤105% → 3%', () => {
    expect(leadCoefFromAggregateKpi(105)).toBe(3)
    expect(leadCoefFromAggregateKpi(101)).toBe(3)
  })

  it('лид >105% → 2%', () => {
    expect(leadCoefFromAggregateKpi(108)).toBe(2)
    expect(leadCoefFromAggregateKpi(123)).toBe(2)
  })

  it('прирост ≥90% → 2.5%', () => {
    expect(growthCoefFromPercent(92)).toBe(2.5)
    expect(growthCoefFromPercent(102.95)).toBe(2.5)
  })

  it('прирост 65–89% → 2%', () => {
    expect(growthCoefFromPercent(88)).toBe(2)
    expect(growthCoefFromPercent(74)).toBe(2)
  })

  it('прирост <65% → 1.5%', () => {
    expect(growthCoefFromPercent(64)).toBe(1.5)
  })
})

describe('средневзвешенный KPI', () => {
  it('одна линия: % от KPI = факт/план', () => {
    const ws = workspace(500_000, 0, 108, 100, 1_000_000)
    const agg = aggregateKpiPercent(ws, 'h1')
    expect(agg).not.toBeNull()
    expect(agg!).toBeGreaterThan(105)
    expect(agg!).toBeLessThan(112)
  })
})

describe('прирост: пересечение проектов', () => {
  it('новый проект без прошлого месяца не входит в прирост', () => {
    const ws: MonthWorkspace = {
      month: '2026-04',
      projects: [
        {
          id: 'old',
          name: 'Старый',
          excludeFromGrowth: false,
          budgetPreviousMonthRub: 100_000,
          kpiLines: [line(200_000, 0, 1000, 100, 100)],
        },
        {
          id: 'new',
          name: 'Новый',
          excludeFromGrowth: false,
          budgetPreviousMonthRub: 0,
          kpiLines: [line(160_000, 0, 1000, 100, 100)],
        },
      ],
    }
    const matched = growthMatchedProjects(ws)
    expect(matched).toHaveLength(1)
    expect(matched[0].id).toBe('old')
    const g = calcGrowth(ws)
    expect(g.matchedCurrentRub).toBe(200_000)
    expect(g.matchedPreviousRub).toBe(100_000)
    expect(g.growthPercent).toBe(200)
  })
})

describe('PDF пример 1', () => {
  const ws = workspace(500_000, 420_000, 108, 101, 1_000_000)

  it('половины: открут и коэффициенты', () => {
    const h1 = calcHalfPeriod(ws, 'h1')
    const h2 = calcHalfPeriod(ws, 'h2')
    expect(h1.totalBudgetRub).toBe(500_000)
    expect(h2.totalBudgetRub).toBe(420_000)
    expect(h1.leadCoefPercent).toBe(2)
    expect(h2.leadCoefPercent).toBe(3)
    expect(h1.payoutRub).toBe(10_000)
    expect(h2.payoutRub).toBe(12_600)
  })

  it('прирост 92% и выплата 23 000', () => {
    const g = calcGrowth(ws)
    expect(g.growthPercent).toBeCloseTo(92, 1)
    expect(g.growthCoefPercent).toBe(2.5)
    expect(g.monthTotalBudgetRub).toBe(920_000)
    expect(g.payoutRub).toBe(23_000)
  })

  it('итого ЗП 45 600', () => {
    const s = calcSalary(ws)
    expect(s.totalBeforeCapRub).toBe(45_600)
    expect(s.totalRub).toBe(45_600)
    expect(s.capped).toBe(false)
  })
})

describe('PDF пример 2', () => {
  const ws = workspace(680_000, 670_000, 123, 112, 1_534_091)

  it('половины: коэф 2% + 2%', () => {
    const h1 = calcHalfPeriod(ws, 'h1')
    const h2 = calcHalfPeriod(ws, 'h2')
    expect(h1.leadCoefPercent).toBe(2)
    expect(h2.leadCoefPercent).toBe(2)
    expect(h1.payoutRub).toBe(13_600)
    expect(h2.payoutRub).toBe(13_400)
  })

  it('прирост ~88% → коэф 2%, выплата 27 000', () => {
    const g = calcGrowth(ws)
    expect(g.growthPercent).toBeCloseTo(88, 0)
    expect(g.growthCoefPercent).toBe(2)
    expect(g.monthTotalBudgetRub).toBe(1_350_000)
    expect(g.payoutRub).toBe(27_000)
  })

  it('итого ЗП 54 000', () => {
    const s = calcSalary(ws)
    expect(s.totalRub).toBe(54_000)
  })
})

describe('потолок ЗП 350 000', () => {
  it('обрезает сумму', () => {
    const ws = workspace(5_000_000, 5_000_000, 100, 100, 10_000_000)
    const s = calcSalary(ws)
    expect(s.totalBeforeCapRub).toBeGreaterThan(350_000)
    expect(s.totalRub).toBe(350_000)
    expect(s.capped).toBe(true)
  })
})
