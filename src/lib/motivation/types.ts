/** Период половины месяца */
export type Half = 'h1' | 'h2'

export interface PeriodInput {
  budgetFactRub: number
  leads: number
  /** Фактическая цена лида, ₽ — ввод вручную; при смене бюджета/лидов пересчитывается автоматически */
  leadPriceRub: number
}

export interface KpiLine {
  id: string
  label: string
  /** KPI цена лида (план из карточки проекта), ₽ */
  kpiPriceRub: number
  h1: PeriodInput
  h2: PeriodInput
}

export interface Project {
  id: string
  name: string
  /** Исключить из расчёта прироста (новый / ушёл / запуск) */
  excludeFromGrowth: boolean
  kpiLines: KpiLine[]
  /** Открут в прошлом месяце (для прироста), ₽ — сумма по проекту */
  budgetPreviousMonthRub: number
}

export interface VacationInput {
  /** Открут, пока вас заменяли (вы в отпуске) */
  awaySpendRub: number
  /** Открут, пока вы заменяли коллегу */
  replacementSpendRub: number
}

export interface MonthWorkspace {
  month: string
  projects: Project[]
  vacation?: VacationInput
}

export interface LinePeriodMetrics {
  lineId: string
  projectId: string
  projectName: string
  label: string
  kpiPriceRub: number
  budgetRub: number
  leads: number
  factCplRub: number | null
  pctOfKpi: number | null
  weight: number
  weightedContribution: number
}

export interface HalfPeriodResult {
  half: Half
  totalBudgetRub: number
  aggregateKpiPercent: number | null
  leadCoefPercent: number
  payoutRub: number
  lines: LinePeriodMetrics[]
}

export interface GrowthResult {
  growthPercent: number | null
  growthCoefPercent: number
  matchedProjectIds: string[]
  matchedCurrentRub: number
  matchedPreviousRub: number
  monthTotalBudgetRub: number
  payoutRub: number
}

export interface VacationResult {
  awaySpendRub: number
  replacementSpendRub: number
  awayPoolRub: number
  replacementPoolRub: number
  /** 60% пула — уходит замене (минус из ЗП отпускника) */
  awayDeductionRub: number
  /** 40% пула — остаётся отпускнику */
  awayYourShareRub: number
  /** 60% пула — бонус замещающему */
  replacementBonusRub: number
  /** replacementBonus − awayDeduction */
  netAdjustmentRub: number
}

export interface SalaryResult {
  h1: HalfPeriodResult
  h2: HalfPeriodResult
  growth: GrowthResult
  totalBeforeCapRub: number
  totalRub: number
  capped: boolean
  salaryCapRub: number
  vacation: VacationResult | null
  netTotalRub: number
}
