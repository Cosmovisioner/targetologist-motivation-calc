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
  it('100k отпускного открута → пул 5500, замене 3300, вам 2200', () => {
    const ws: MonthWorkspace = {
      ...workspace(0, 0, 100, 100, 0),
      vacationH1: { enabled: true, spendRub: 100_000 },
      vacationH2: { enabled: false, spendRub: 0 },
    }

    const salary = calcSalary(ws)
    expect(salary.vacation).not.toBeNull()
    expect(salary.vacation!.vacationPoolRub).toBe(5500)
    expect(salary.vacation!.replacerShareRub).toBe(3300)
    expect(salary.vacation!.yourVacationShareRub).toBe(2200)
  })

  it('вычитает долю замены из итога', () => {
    const ws: MonthWorkspace = {
      ...workspace(500_000, 420_000, 108, 101, 1_000_000),
      vacationH1: { enabled: true, spendRub: 100_000 },
    }

    const salary = calcSalary(ws)
    expect(salary.totalRub).toBe(45_600)
    expect(salary.vacation!.replacerShareRub).toBe(3300)
    expect(salary.netTotalRub).toBe(42_300)
  })
})
