import { calcHalfPeriod } from '../lib/motivation/calculate'
import type { MonthWorkspace, VacationHalf } from '../lib/motivation/types'
import { MOTIVATION_RULES } from '../lib/motivation/rules'
import { formatRub, parseNum } from '../lib/format'

type Props = {
  workspace: MonthWorkspace
  onChange: (ws: MonthWorkspace) => void
}

function halfSpend(workspace: MonthWorkspace, half: 'h1' | 'h2'): number {
  return calcHalfPeriod(workspace, half).totalBudgetRub
}

function VacationRow({
  label,
  half,
  totalSpend,
  onPatch,
}: {
  label: string
  half: VacationHalf
  totalSpend: number
  onPatch: (patch: Partial<VacationHalf>) => void
}) {
  const overLimit = half.enabled && half.spendRub > totalSpend && totalSpend > 0

  return (
    <div className="flex flex-wrap items-end gap-4 py-3 border-b border-graphite/10 last:border-0">
      <label className="flex items-center gap-2 text-sm font-semibold shrink-0 min-w-[140px]">
        <input
          type="checkbox"
          checked={half.enabled}
          onChange={(e) => onPatch({ enabled: e.target.checked })}
        />
        {label}
      </label>
      <label className="flex flex-col gap-1 min-w-[180px] flex-1">
        <span className="text-xs text-muted">Открут за отпуск, ₽</span>
        <input
          type="number"
          min={0}
          step={0.01}
          disabled={!half.enabled}
          className="w-full max-w-xs px-2 py-1 border border-graphite/25 rounded-md disabled:opacity-50"
          value={half.enabled && Number.isFinite(half.spendRub) ? half.spendRub : ''}
          onChange={(e) => onPatch({ spendRub: parseNum(e.target.value, 2) })}
          onBlur={(e) => onPatch({ spendRub: parseNum(e.target.value, 2) })}
        />
      </label>
      <label className="flex flex-col gap-1 min-w-[160px] flex-1">
        <span className="text-xs text-muted">Дни (опционально)</span>
        <input
          type="text"
          disabled={!half.enabled}
          placeholder="напр. 5–12"
          className="w-full max-w-xs px-2 py-1 border border-graphite/25 rounded-md disabled:opacity-50"
          value={half.note ?? ''}
          onChange={(e) => onPatch({ note: e.target.value })}
        />
      </label>
      <p className="text-xs text-muted pb-1">
        Открут половины: <strong>{formatRub(totalSpend)}</strong>
        {overLimit && (
          <span className="block text-amber-700 mt-1">
            Отпускной открут больше факта за половину
          </span>
        )}
      </p>
    </div>
  )
}

export default function VacationPanel({ workspace, onChange }: Props) {
  const patchHalf = (key: 'vacationH1' | 'vacationH2', patch: Partial<VacationHalf>) => {
    onChange({
      ...workspace,
      [key]: { ...workspace[key]!, ...patch },
    })
  }

  const h1Spend = halfSpend(workspace, 'h1')
  const h2Spend = halfSpend(workspace, 'h2')

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
      <div className="px-4">
        <VacationRow
          label="Н1 · 1–14"
          half={workspace.vacationH1!}
          totalSpend={h1Spend}
          onPatch={(patch) => patchHalf('vacationH1', patch)}
        />
        <VacationRow
          label="Н2 · 15–31"
          half={workspace.vacationH2!}
          totalSpend={h2Spend}
          onPatch={(patch) => patchHalf('vacationH2', patch)}
        />
      </div>
    </section>
  )
}
