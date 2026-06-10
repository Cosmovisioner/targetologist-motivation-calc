import type { MonthWorkspace } from '../lib/motivation/types'
import { MOTIVATION_RULES } from '../lib/motivation/rules'
import { parseNum } from '../lib/format'

type Props = {
  workspace: MonthWorkspace
  onChange: (ws: MonthWorkspace) => void
}

export default function VacationPanel({ workspace, onChange }: Props) {
  const spendRub = workspace.vacation?.spendRub ?? 0

  return (
    <section className="rounded-[20px] border border-graphite bg-white overflow-hidden card-hover">
      <div className="px-4 py-3 border-b border-graphite/15 bg-amber-50">
        <h2 className="display-head text-xl">Отпуск</h2>
        <p className="text-sm text-muted mt-1">
          Пул {MOTIVATION_RULES.vacationCoefPercent}% от отпускного открута: замене{' '}
          {MOTIVATION_RULES.vacationReplacerShare * 100}%, вам{' '}
          {MOTIVATION_RULES.vacationOwnerShare * 100}%
        </p>
      </div>
      <div className="px-4 py-4">
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-sm font-semibold text-graphite">Открут за отпуск, ₽</span>
          <input
            type="number"
            min={0}
            step={0.01}
            className="w-full px-2 py-2 border border-graphite/25 rounded-md"
            value={Number.isFinite(spendRub) ? spendRub : ''}
            onChange={(e) =>
              onChange({
                ...workspace,
                vacation: { spendRub: parseNum(e.target.value, 2) },
              })
            }
            onBlur={(e) =>
              onChange({
                ...workspace,
                vacation: { spendRub: parseNum(e.target.value, 2) },
              })
            }
            placeholder="0"
          />
        </label>
      </div>
    </section>
  )
}
