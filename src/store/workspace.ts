import type {
  KpiLine,
  MonthWorkspace,
  PeriodInput,
  Project,
  VacationInput,
} from '../lib/motivation/types'
import { defaultVacation } from '../lib/motivation/vacation'
import { uid } from '../lib/format'

type LegacyVacationHalf = {
  enabled: boolean
  spendRub: number
  note?: string
}

const STORAGE_KEY = 'targetologist-motivation-workspace'

type LegacyKpiLine = KpiLine & { kpiPlanRub?: number; kpiPlanLeads?: number }

type LegacyMonthWorkspace = MonthWorkspace & {
  vacationH1?: LegacyVacationHalf
  vacationH2?: LegacyVacationHalf
}

function normalizePeriod(p: PeriodInput & { leadPriceRub?: number }): PeriodInput {
  return {
    budgetFactRub: p.budgetFactRub ?? 0,
    leads: p.leads ?? 0,
    leadPriceRub: p.leadPriceRub ?? 0,
  }
}

function normalizeLine(raw: LegacyKpiLine): KpiLine {
  const { kpiPlanRub, kpiPlanLeads: _drop, ...rest } = raw
  return {
    ...rest,
    kpiPriceRub: rest.kpiPriceRub ?? kpiPlanRub ?? 0,
    h1: normalizePeriod(rest.h1),
    h2: normalizePeriod(rest.h2),
  }
}

function migrateVacation(parsed: LegacyMonthWorkspace): VacationInput {
  if (parsed.vacation) {
    return { spendRub: parsed.vacation.spendRub ?? 0 }
  }

  const h1Spend = parsed.vacationH1?.enabled ? (parsed.vacationH1.spendRub ?? 0) : 0
  const h2Spend = parsed.vacationH2?.enabled ? (parsed.vacationH2.spendRub ?? 0) : 0
  return { spendRub: h1Spend + h2Spend }
}

function normalizeWorkspace(parsed: LegacyMonthWorkspace): MonthWorkspace {
  const { vacationH1: _h1, vacationH2: _h2, ...rest } = parsed
  return {
    ...rest,
    vacation: migrateVacation(parsed),
    projects: parsed.projects.map((p) => ({
      ...p,
      kpiLines: p.kpiLines.map((l) => normalizeLine(l as LegacyKpiLine)),
    })),
  }
}

export function defaultKpiLine(): KpiLine {
  return {
    id: uid(),
    label: 'Воронка 1',
    kpiPriceRub: 0,
    h1: { budgetFactRub: 0, leads: 0, leadPriceRub: 0 },
    h2: { budgetFactRub: 0, leads: 0, leadPriceRub: 0 },
  }
}

export function defaultProject(): Project {
  return {
    id: uid(),
    name: 'Новый проект',
    excludeFromGrowth: false,
    budgetPreviousMonthRub: 0,
    kpiLines: [defaultKpiLine()],
  }
}

export function defaultWorkspace(month?: string): MonthWorkspace {
  const m =
    month ??
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return {
    month: m,
    projects: [defaultProject()],
    vacation: defaultVacation(),
  }
}

export function loadWorkspace(): MonthWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultWorkspace()
    const parsed = JSON.parse(raw) as LegacyMonthWorkspace
    if (!parsed.month || !Array.isArray(parsed.projects)) {
      return defaultWorkspace()
    }
    return normalizeWorkspace(parsed)
  } catch {
    return defaultWorkspace()
  }
}

export function saveWorkspace(ws: MonthWorkspace): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ws))
}

export function exportJson(ws: MonthWorkspace): void {
  const blob = new Blob([JSON.stringify(ws, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `motivation-${ws.month}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importJson(file: File): Promise<MonthWorkspace> {
  const text = await file.text()
  const parsed = JSON.parse(text) as LegacyMonthWorkspace
  if (!parsed.month || !Array.isArray(parsed.projects)) {
    throw new Error('Неверный формат файла')
  }
  return normalizeWorkspace(parsed)
}
