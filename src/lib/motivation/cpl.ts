import { roundMoney } from '../format'
import type { PeriodInput } from './types'

/** Фактическая цена лида = бюджет ÷ лиды */
export function factCplRub(budgetRub: number, leads: number): number | null {
  if (leads <= 0 || budgetRub <= 0) return null
  return budgetRub / leads
}

/** Цена лида для расчётов: из поля ввода или бюджет ÷ лиды */
export function effectiveLeadPriceRub(period: PeriodInput): number | null {
  if (period.leadPriceRub > 0) return period.leadPriceRub
  return factCplRub(period.budgetFactRub, period.leads)
}

/** После изменения бюджета или лидов — подставить авто-цену в поле */
export function periodWithAutoLeadPrice(period: PeriodInput): PeriodInput {
  const auto = factCplRub(period.budgetFactRub, period.leads)
  if (auto === null) {
    return { ...period, leadPriceRub: 0 }
  }
  return {
    ...period,
    leadPriceRub: roundMoney(auto),
  }
}

/** % от KPI = (факт CPL ÷ KPI цена) × 100 */
export function pctOfKpi(factCpl: number | null, kpiPriceRub: number): number | null {
  if (factCpl === null || kpiPriceRub <= 0) return null
  return (factCpl / kpiPriceRub) * 100
}
