/** Период половины месяца */
export type Half = 'h1' | 'h2'

export interface PeriodInput {
  budgetFactRub: number
  leads: number
}

export interface KpiLine {
  id: string
  label: string
  /** Плановая цена лида (KPI из карточки проекта), ₽ */
  kpiPlanRub: number
  /** Плановое количество лидов по KPI (из карточки / план на месяц) */
  kpiPlanLeads: number
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

export interface MonthWorkspace {
  month: string
  projects: Project[]
}

export interface LinePeriodMetrics {
  lineId: string
  projectId: string
  projectName: string
  label: string
  kpiPlanRub: number
  kpiPlanLeads: number
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

export interface SalaryResult {
  h1: HalfPeriodResult
  h2: HalfPeriodResult
  growth: GrowthResult
  totalBeforeCapRub: number
  totalRub: number
  capped: boolean
  salaryCapRub: number
}
