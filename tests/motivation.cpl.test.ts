import { describe, expect, it } from 'vitest'
import { factCplRub, pctOfKpi } from '../src/lib/motivation/cpl'

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
})
