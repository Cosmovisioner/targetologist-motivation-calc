import rulesJson from '../../config/motivationRules.json'

export interface LeadCoefTier {
  id: string
  label: string
  maxKpiPercentInclusive: number | null
  coefPercent: number
}

export interface GrowthCoefTier {
  id: string
  label: string
  minGrowthPercentInclusive: number
  coefPercent: number
}

export interface MotivationRules {
  salaryCapRub: number
  kpiNormMaxPercent: number
  growthNormMinPercent: number
  leadCoefTiers: LeadCoefTier[]
  growthCoefTiers: GrowthCoefTier[]
}

export const MOTIVATION_RULES = rulesJson as MotivationRules

/** Коэффициент за лид по средневзвешенному % от KPI за половину месяца */
export function leadCoefFromAggregateKpi(aggregateKpiPercent: number): number {
  const sorted = [...MOTIVATION_RULES.leadCoefTiers].sort((a, b) => {
    const am = a.maxKpiPercentInclusive ?? Infinity
    const bm = b.maxKpiPercentInclusive ?? Infinity
    return am - bm
  })
  for (const tier of sorted) {
    if (tier.maxKpiPercentInclusive === null) continue
    if (aggregateKpiPercent <= tier.maxKpiPercentInclusive) {
      return tier.coefPercent
    }
  }
  return sorted[sorted.length - 1]?.coefPercent ?? 2
}

/** Коэффициент за прирост бюджета (на весь открут месяца) */
export function growthCoefFromPercent(growthPercent: number): number {
  const sorted = [...MOTIVATION_RULES.growthCoefTiers].sort(
    (a, b) => b.minGrowthPercentInclusive - a.minGrowthPercentInclusive,
  )
  for (const tier of sorted) {
    if (growthPercent >= tier.minGrowthPercentInclusive) {
      return tier.coefPercent
    }
  }
  return sorted[sorted.length - 1]?.coefPercent ?? 1.5
}

export function kpiZone(aggregateKpiPercent: number): 'green' | 'red' {
  return aggregateKpiPercent <= MOTIVATION_RULES.kpiNormMaxPercent ? 'green' : 'red'
}

export function growthZone(growthPercent: number): 'green' | 'yellow' | 'red' {
  if (growthPercent >= MOTIVATION_RULES.growthNormMinPercent) return 'green'
  if (growthPercent >= 65) return 'yellow'
  return 'red'
}
