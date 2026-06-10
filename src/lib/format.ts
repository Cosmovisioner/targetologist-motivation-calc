export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatRub(n: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatPct(n: number | null, digits = 1): string {
  if (n === null || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits).replace('.', ',')}%`
}

export function parseNum(raw: string, decimals?: number): number {
  const v = parseFloat(raw.replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(v)) return 0
  return decimals !== undefined ? roundMoney(v) : v
}

export function uid(): string {
  return crypto.randomUUID()
}
