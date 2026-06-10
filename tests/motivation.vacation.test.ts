import { describe, expect, it } from 'vitest'
import { calcSalary } from '../src/lib/motivation/calculate'
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
    kpiPriceRub: kpiPlan,
    h1: { budgetFactRub: budgetH1, leads: leadsH1 || 1, leadPriceRub: 0 },
    h2: { budgetFactRub: budgetH2, leads: leadsH2 || 1, leadPriceRub: 0 },
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
    name: 'Сводный проект',
    excludeFromGrowth: false,
    budgetPreviousMonthRub: prevMonth,
    kpiLines: [line(h1Budget, h2Budget, kpiPlan, pctH1, pctH2)],
  }
  return { month: '2026-04', projects: [project] }
}

describe('отпуск 60/40 при ставке 5,5%', () => {
  it('был в отпуске: 100k → пул 5500, −3300 замене, 2200 вам', () => {
    const ws: MonthWorkspace = {
      ...workspace(0, 0, 100, 100, 0),
      vacation: { awaySpendRub: 100_000, replacementSpendRub: 0 },
    }

    const salary = calcSalary(ws)
    expect(salary.vacation).not.toBeNull()
    expect(salary.vacation!.awayPoolRub).toBe(5500)
    expect(salary.vacation!.awayDeductionRub).toBe(3300)
    expect(salary.vacation!.awayYourShareRub).toBe(2200)
    expect(salary.vacation!.replacementBonusRub).toBe(0)
    expect(salary.vacation!.netAdjustmentRub).toBe(-3300)
  })

  it('замещал коллегу: 100k → +3300 к итогу', () => {
    const ws: MonthWorkspace = {
      ...workspace(500_000, 420_000, 108, 101, 1_000_000),
      vacation: { awaySpendRub: 0, replacementSpendRub: 100_000 },
    }

    const salary = calcSalary(ws)
    expect(salary.totalRub).toBe(45_600)
    expect(salary.vacation!.replacementBonusRub).toBe(3300)
    expect(salary.netTotalRub).toBe(48_900)
  })

  it('оба сценария в одном месяце: −отпуск +замещение', () => {
    const ws: MonthWorkspace = {
      ...workspace(500_000, 420_000, 108, 101, 1_000_000),
      vacation: { awaySpendRub: 368_801.12, replacementSpendRub: 200_000 },
    }

    const salary = calcSalary(ws)
    expect(salary.vacation!.awayDeductionRub).toBeGreaterThan(0)
    expect(salary.vacation!.replacementBonusRub).toBe(6600)
    expect(salary.netTotalRub).toBe(
      round(salary.totalRub + salary.vacation!.netAdjustmentRub),
    )
  })
})

function round(n: number) {
  return Math.round(n * 100) / 100
}
