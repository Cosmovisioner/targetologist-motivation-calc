import { describe, expect, it } from 'vitest'
import {
  effectiveLeadPriceRub,
  factCplRub,
  pctOfKpi,
  periodWithAutoLeadPrice,
} from '../src/lib/motivation/cpl'

describe('цена лида (CPL)', () => {
  it('factCplRub = бюджет / лиды', () => {
    expect(factCplRub(500_000, 500)).toBe(1000)
    expect(factCplRub(0, 10)).toBeNull()
    expect(factCplRub(100, 0)).toBeNull()
  })

  it('pctOfKpi = факт / KPI цена × 100', () => {
    expect(pctOfKpi(1080, 1000)).toBe(108)
    expect(pctOfKpi(900, 1000)).toBe(90)
    expect(pctOfKpi(null, 1000)).toBeNull()
  })

  it('effectiveLeadPriceRub берёт ручной ввод', () => {
    expect(
      effectiveLeadPriceRub({ budgetFactRub: 100_000, leads: 50, leadPriceRub: 2500 }),
    ).toBe(2500)
  })

  it('periodWithAutoLeadPrice пересчитывает при бюджете/лидах', () => {
    const p = periodWithAutoLeadPrice({ budgetFactRub: 500_000, leads: 500, leadPriceRub: 0 })
    expect(p.leadPriceRub).toBe(1000)
  })
})
