import { describe, expect, it } from 'vitest'
import { aggregateKpiPercent, calcHalfPeriod } from '../src/lib/motivation/calculate'
import type { MonthWorkspace } from '../src/lib/motivation/types'

describe('нулевые значения в половине месяца', () => {
  const ws: MonthWorkspace = {
    month: '2026-05',
    projects: [
      {
        id: 'p1',
        name: 'Проект',
        excludeFromGrowth: false,
        budgetPreviousMonthRub: 500_000,
        kpiLines: [
          {
            id: 'l1',
            label: 'Воронка',
            kpiPriceRub: 1000,
            h1: { budgetFactRub: 500_000, leads: 500, leadPriceRub: 1000 },
            h2: { budgetFactRub: 0, leads: 0, leadPriceRub: 0 },
          },
        ],
      },
    ],
  }

  it('Н2 с нулевым открутом и лидами — payout 0', () => {
    const h2 = calcHalfPeriod(ws, 'h2')
    expect(h2.totalBudgetRub).toBe(0)
    expect(h2.aggregateKpiPercent).toBeNull()
    expect(h2.payoutRub).toBe(0)
  })

  it('Н1 считается нормально при нулевой Н2', () => {
    const h1 = calcHalfPeriod(ws, 'h1')
    expect(h1.totalBudgetRub).toBe(500_000)
    expect(aggregateKpiPercent(ws, 'h1')).not.toBeNull()
    expect(h1.payoutRub).toBeGreaterThan(0)
  })
})
