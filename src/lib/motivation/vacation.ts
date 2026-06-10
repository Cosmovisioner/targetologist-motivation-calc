import { roundMoney } from '../format'
import { MOTIVATION_RULES } from './rules'
import type { MonthWorkspace, VacationInput, VacationResult } from './types'

export function defaultVacation(): VacationInput {
  return { spendRub: 0 }
}

export function calcVacation(workspace: MonthWorkspace): VacationResult | null {
  const spendRub = roundMoney(workspace.vacation?.spendRub ?? 0)
  if (spendRub <= 0) return null

  const vacationPoolRub = roundMoney(
    (spendRub * MOTIVATION_RULES.vacationCoefPercent) / 100,
  )
  const replacerShareRub = roundMoney(
    vacationPoolRub * MOTIVATION_RULES.vacationReplacerShare,
  )
  const yourVacationShareRub = roundMoney(
    vacationPoolRub * MOTIVATION_RULES.vacationOwnerShare,
  )

  return {
    vacationSpendRub: spendRub,
    vacationPoolRub,
    replacerShareRub,
    yourVacationShareRub,
  }
}
