export function formatRub(n: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}

export function formatPct(n: number | null, digits = 1): string {
  if (n === null || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits).replace('.', ',')}%`
}

export function parseNum(raw: string): number {
  const v = parseFloat(raw.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

export function uid(): string {
  return crypto.randomUUID()
}
