/** Фактическая цена лида = бюджет ÷ лиды */
export function factCplRub(budgetRub: number, leads: number): number | null {
  if (leads <= 0 || budgetRub <= 0) return null
  return budgetRub / leads
}

/** % от KPI = (факт CPL ÷ KPI цена) × 100 */
export function pctOfKpi(factCpl: number | null, kpiPriceRub: number): number | null {
  if (factCpl === null || kpiPriceRub <= 0) return null
  return (factCpl / kpiPriceRub) * 100
}
