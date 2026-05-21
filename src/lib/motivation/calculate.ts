/**
 * Формулы мотивации таргетологов ВК (с 01.03.2026).
 * Источник: PDF «Мотивация таргетологи ВК с 01.03.26» + видео-разбор.
 *
 * CPL / KPI за половину:
 *   factCpl = budgetFact / leads
 *   % от KPI = (factCpl / kpiPlan) * 100
 *   вес = бюджет линии / сумма бюджетов периода
 *   итог KPI = Σ (% от KPI × вес)
 *
 * ЗП за половину = открут половины × коэф_лид(итог KPI)
 * Прирост % = Σ открут пересечённых в M / Σ открут тех же в M-1 × 100
 * ЗП прирост = открут всего месяца × коэф_прирост(прирост %)
 * Итого = min(слагаемые, 350 000)
 */

import {
  growthCoefFromPercent,
  kpiZone,
  leadCoefFromAggregateKpi,
  MOTIVATION_RULES,
} from './rules'
import type {
  Half,
  HalfPeriodResult,
  GrowthResult,
  KpiLine,
  LinePeriodMetrics,
  MonthWorkspace,
  PeriodInput,
  Project,
  SalaryResult,
} from './types'

function periodOf(line: KpiLine, half: Half): PeriodInput {
  return half === 'h1' ? line.h1 : line.h2
}

function projectBudgetInHalf(project: Project, half: Half): number {
  return project.kpiLines.reduce((s, line) => s + periodOf(line, half).budgetFactRub, 0)
}

function monthBudget(project: Project): number {
  return projectBudgetInHalf(project, 'h1') + projectBudgetInHalf(project, 'h2')
}

export function collectLines(workspace: MonthWorkspace, half: Half): LinePeriodMetrics[] {
  const rows: LinePeriodMetrics[] = []
  for (const project of workspace.projects) {
    for (const line of project.kpiLines) {
      const p = periodOf(line, half)
      rows.push({
        lineId: line.id,
        projectId: project.id,
        projectName: project.name,
        label: line.label,
        kpiPlanRub: line.kpiPlanRub,
        kpiPlanLeads: line.kpiPlanLeads ?? 0,
        budgetRub: p.budgetFactRub,
        leads: p.leads,
        factCplRub: null,
        pctOfKpi: null,
        weight: 0,
        weightedContribution: 0,
      })
    }
  }
  const totalBudget = rows.reduce((s, r) => s + r.budgetRub, 0)
  return rows.map((row) => {
    const line = workspace.projects
      .find((p) => p.id === row.projectId)!
      .kpiLines.find((l) => l.id === row.lineId)!
    const p = periodOf(line, half)
    const factCpl =
      p.leads > 0 && p.budgetFactRub > 0 ? p.budgetFactRub / p.leads : null
    const pctOfKpi =
      factCpl !== null && line.kpiPlanRub > 0
        ? (factCpl / line.kpiPlanRub) * 100
        : null
    const weight = totalBudget > 0 ? p.budgetFactRub / totalBudget : 0
    const weightedContribution =
      pctOfKpi !== null ? pctOfKpi * weight : 0
    return {
      ...row,
      factCplRub: factCpl,
      pctOfKpi,
      weight,
      weightedContribution,
    }
  })
}

/** Строки KPI за весь месяц (Н1+Н2 по каждой воронке) — для ориентира, не для коэф. ЗП */
export function collectLinesFullMonth(workspace: MonthWorkspace): LinePeriodMetrics[] {
  const rows: LinePeriodMetrics[] = []
  for (const project of workspace.projects) {
    for (const line of project.kpiLines) {
      const budgetRub = line.h1.budgetFactRub + line.h2.budgetFactRub
      const leads = line.h1.leads + line.h2.leads
      rows.push({
        lineId: line.id,
        projectId: project.id,
        projectName: project.name,
        label: line.label,
        kpiPlanRub: line.kpiPlanRub,
        kpiPlanLeads: line.kpiPlanLeads ?? 0,
        budgetRub,
        leads,
        factCplRub: null,
        pctOfKpi: null,
        weight: 0,
        weightedContribution: 0,
      })
    }
  }
  const totalBudget = rows.reduce((s, r) => s + r.budgetRub, 0)
  return rows.map((row) => {
    const line = workspace.projects
      .find((p) => p.id === row.projectId)!
      .kpiLines.find((l) => l.id === row.lineId)!
    const budgetRub = line.h1.budgetFactRub + line.h2.budgetFactRub
    const leads = line.h1.leads + line.h2.leads
    const factCpl =
      leads > 0 && budgetRub > 0 ? budgetRub / leads : null
    const pctOfKpi =
      factCpl !== null && line.kpiPlanRub > 0
        ? (factCpl / line.kpiPlanRub) * 100
        : null
    const weight = totalBudget > 0 ? budgetRub / totalBudget : 0
    const weightedContribution =
      pctOfKpi !== null ? pctOfKpi * weight : 0
    return {
      ...row,
      budgetRub,
      leads,
      factCplRub: factCpl,
      pctOfKpi,
      weight,
      weightedContribution,
    }
  })
}

export function aggregateKpiPercentFullMonth(workspace: MonthWorkspace): number | null {
  const lines = collectLinesFullMonth(workspace)
  const totalBudget = lines.reduce((s, r) => s + r.budgetRub, 0)
  if (totalBudget <= 0) return null
  if (!lines.some((r) => r.pctOfKpi !== null)) return null
  return lines.reduce((s, r) => s + r.weightedContribution, 0)
}

/** Средневзвешенный % от KPI за половину месяца */
export function aggregateKpiPercent(workspace: MonthWorkspace, half: Half): number | null {
  const lines = collectLines(workspace, half)
  const totalBudget = lines.reduce((s, r) => s + r.budgetRub, 0)
  if (totalBudget <= 0) return null
  const hasData = lines.some((r) => r.pctOfKpi !== null)
  if (!hasData) return null
  return lines.reduce((s, r) => s + r.weightedContribution, 0)
}

export function calcHalfPeriod(
  workspace: MonthWorkspace,
  half: Half,
): HalfPeriodResult {
  const lines = collectLines(workspace, half)
  const totalBudgetRub = lines.reduce((s, r) => s + r.budgetRub, 0)
  const aggregate = aggregateKpiPercent(workspace, half)
  const leadCoefPercent =
    aggregate !== null ? leadCoefFromAggregateKpi(aggregate) : 0
  const payoutRub =
    aggregate !== null ? (totalBudgetRub * leadCoefPercent) / 100 : 0

  return {
    half,
    totalBudgetRub,
    aggregateKpiPercent: aggregate,
    leadCoefPercent,
    payoutRub,
    lines,
  }
}

/** Проекты, участвующие в приросте: не исключены и есть открут в M и M-1 */
export function growthMatchedProjects(workspace: MonthWorkspace): Project[] {
  return workspace.projects.filter((p) => {
    if (p.excludeFromGrowth) return false
    const current = monthBudget(p)
    const prev = p.budgetPreviousMonthRub
    return current > 0 && prev > 0
  })
}

/**
 * Прирост бюджета: только пересечение проектов (PDF п.2).
 * Запуски и новые/ушедшие — excludeFromGrowth или нулевой prev/current.
 */
export function calcGrowth(workspace: MonthWorkspace): GrowthResult {
  const matched = growthMatchedProjects(workspace)
  const matchedCurrentRub = matched.reduce((s, p) => s + monthBudget(p), 0)
  const matchedPreviousRub = matched.reduce(
    (s, p) => s + p.budgetPreviousMonthRub,
    0,
  )
  const monthTotalBudgetRub = workspace.projects.reduce(
    (s, p) => s + monthBudget(p),
    0,
  )

  const growthPercent =
    matchedPreviousRub > 0
      ? (matchedCurrentRub / matchedPreviousRub) * 100
      : null

  const growthCoefPercent =
    growthPercent !== null ? growthCoefFromPercent(growthPercent) : 0

  const payoutRub =
    growthPercent !== null
      ? (monthTotalBudgetRub * growthCoefPercent) / 100
      : 0

  return {
    growthPercent,
    growthCoefPercent,
    matchedProjectIds: matched.map((p) => p.id),
    matchedCurrentRub,
    matchedPreviousRub,
    monthTotalBudgetRub,
    payoutRub,
  }
}

export function calcSalary(workspace: MonthWorkspace): SalaryResult {
  const h1 = calcHalfPeriod(workspace, 'h1')
  const h2 = calcHalfPeriod(workspace, 'h2')
  const growth = calcGrowth(workspace)
  const totalBeforeCapRub = h1.payoutRub + h2.payoutRub + growth.payoutRub
  const cap = MOTIVATION_RULES.salaryCapRub
  const totalRub = Math.min(totalBeforeCapRub, cap)

  return {
    h1,
    h2,
    growth,
    totalBeforeCapRub,
    totalRub,
    capped: totalBeforeCapRub > cap,
    salaryCapRub: cap,
  }
}

export { kpiZone, growthCoefFromPercent, leadCoefFromAggregateKpi }

export function growthZone(growthPercent: number): 'green' | 'yellow' | 'red' {
  if (growthPercent >= MOTIVATION_RULES.growthNormMinPercent) return 'green'
  if (growthPercent >= 65) return 'yellow'
  return 'red'
}
