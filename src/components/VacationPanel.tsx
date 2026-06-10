import type { MonthWorkspace, VacationInput } from '../lib/motivation/types'
import { MOTIVATION_RULES } from '../lib/motivation/rules'
import { parseNum } from '../lib/format'

type Props = {
  workspace: MonthWorkspace
  onChange: (ws: MonthWorkspace) => void
}

function SpendField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-graphite">{label}</span>
      <span className="text-xs text-muted">{hint}</span>
      <input
        type="number"
        min={0}
        step={0.01}
        className="w-full max-w-sm px-2 py-2 border border-graphite/25 rounded-md"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseNum(e.target.value, 2))}
        onBlur={(e) => onChange(parseNum(e.target.value, 2))}
        placeholder="0"
      />
    </label>
  )
}

export default function VacationPanel({ workspace, onChange }: Props) {
  const vacation = workspace.vacation ?? { awaySpendRub: 0, replacementSpendRub: 0 }

  const patch = (patch: Partial<VacationInput>) => {
    onChange({
      ...workspace,
      vacation: { ...vacation, ...patch },
    })
  }

  return (
    <section className="rounded-[20px] border border-graphite bg-white overflow-hidden card-hover">
      <div className="px-4 py-3 border-b border-graphite/15 bg-amber-50">
        <h2 className="display-head text-xl">Отпуск</h2>
        <p className="text-sm text-muted mt-1">
          Пул {MOTIVATION_RULES.vacationCoefPercent}% от открута: замене{' '}
          {MOTIVATION_RULES.vacationReplacerShare * 100}%, отпускнику{' '}
          {MOTIVATION_RULES.vacationOwnerShare * 100}%
        </p>
      </div>
      <div className="px-4 py-4 grid gap-4 sm:grid-cols-2">
        <SpendField
          label="Был в отпуске — открут, ₽"
          hint="Пока вас заменяли: −60% пула из итога"
          value={vacation.awaySpendRub}
          onChange={(v) => patch({ awaySpendRub: v })}
        />
        <SpendField
          label="Замещал коллегу — открут, ₽"
          hint="Пока вы заменяли: +60% пула к итогу"
          value={vacation.replacementSpendRub}
          onChange={(v) => patch({ replacementSpendRub: v })}
        />
      </div>
    </section>
  )
}
