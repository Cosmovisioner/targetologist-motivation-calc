import { roundMoney } from '../format'
import { MOTIVATION_RULES } from './rules'
import type { MonthWorkspace, VacationInput, VacationResult } from './types'

export function defaultVacation(): VacationInput {
  return { awaySpendRub: 0, replacementSpendRub: 0 }
}

function poolFromSpend(spendRub: number): number {
  if (spendRub <= 0) return 0
  return roundMoney((spendRub * MOTIVATION_RULES.vacationCoefPercent) / 100)
}

export function calcVacation(workspace: MonthWorkspace): VacationResult | null {
  const awaySpendRub = roundMoney(workspace.vacation?.awaySpendRub ?? 0)
  const replacementSpendRub = roundMoney(workspace.vacation?.replacementSpendRub ?? 0)
  if (awaySpendRub <= 0 && replacementSpendRub <= 0) return null

  const awayPoolRub = poolFromSpend(awaySpendRub)
  const replacementPoolRub = poolFromSpend(replacementSpendRub)
  const awayDeductionRub = roundMoney(
    awayPoolRub * MOTIVATION_RULES.vacationReplacerShare,
  )
  const awayYourShareRub = roundMoney(
    awayPoolRub * MOTIVATION_RULES.vacationOwnerShare,
  )
  const replacementBonusRub = roundMoney(
    replacementPoolRub * MOTIVATION_RULES.vacationReplacerShare,
  )
  const netAdjustmentRub = roundMoney(replacementBonusRub - awayDeductionRub)

  return {
    awaySpendRub,
    replacementSpendRub,
    awayPoolRub,
    replacementPoolRub,
    awayDeductionRub,
    awayYourShareRub,
    replacementBonusRub,
    netAdjustmentRub,
  }
}
