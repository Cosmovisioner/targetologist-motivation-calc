import { roundMoney } from '../format'
import { MOTIVATION_RULES } from './rules'
import type { MonthWorkspace, VacationHalf, VacationHalfBreakdown, VacationResult } from './types'

export function defaultVacationHalf(): VacationHalf {
  return { enabled: false, spendRub: 0 }
}

function calcHalfBreakdown(half: VacationHalf | undefined): VacationHalfBreakdown {
  const enabled = half?.enabled ?? false
  const spendRub = enabled ? roundMoney(half?.spendRub ?? 0) : 0
  if (!enabled || spendRub <= 0) {
    return {
      enabled,
      spendRub,
      vacationPoolRub: 0,
      replacerShareRub: 0,
      yourShareRub: 0,
    }
  }

  const vacationPoolRub = roundMoney(
    (spendRub * MOTIVATION_RULES.vacationCoefPercent) / 100,
  )
  const replacerShareRub = roundMoney(
    vacationPoolRub * MOTIVATION_RULES.vacationReplacerShare,
  )
  const yourShareRub = roundMoney(
    vacationPoolRub * MOTIVATION_RULES.vacationOwnerShare,
  )

  return {
    enabled,
    spendRub,
    vacationPoolRub,
    replacerShareRub,
    yourShareRub,
  }
}

export function calcVacation(workspace: MonthWorkspace): VacationResult | null {
  const h1 = calcHalfBreakdown(workspace.vacationH1)
  const h2 = calcHalfBreakdown(workspace.vacationH2)

  if (!h1.enabled && !h2.enabled) return null
  if (h1.spendRub <= 0 && h2.spendRub <= 0) return null

  const vacationSpendRub = roundMoney(h1.spendRub + h2.spendRub)
  const vacationPoolRub = roundMoney(h1.vacationPoolRub + h2.vacationPoolRub)
  const replacerShareRub = roundMoney(h1.replacerShareRub + h2.replacerShareRub)
  const yourVacationShareRub = roundMoney(h1.yourShareRub + h2.yourShareRub)

  return {
    vacationSpendRub,
    vacationPoolRub,
    replacerShareRub,
    yourVacationShareRub,
    h1,
    h2,
  }
}
