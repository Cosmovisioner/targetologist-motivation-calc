const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
]

export function parseMonthKey(month: string): { year: number; month: number } {
  const [y, m] = month.split('-').map(Number)
  return { year: y, month: m }
}

export function formatMonthRu(month: string): string {
  const { year, month: m } = parseMonthKey(month)
  return `${MONTHS_RU[m - 1]} ${year}`
}

/** Ключ прошлого месяца, напр. 2026-05 → 2026-04 */
export function previousMonthKey(month: string): string {
  const { year, month: m } = parseMonthKey(month)
  const d = new Date(year, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
