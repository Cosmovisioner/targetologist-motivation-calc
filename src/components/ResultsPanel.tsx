import { useMemo } from 'react'
import { calcSalary, growthZone, kpiZone } from '../lib/motivation/calculate'
import { MOTIVATION_RULES } from '../lib/motivation/rules'
import type { MonthWorkspace } from '../lib/motivation/types'
import { formatPct, formatRub } from '../lib/format'

function zoneClass(zone: 'green' | 'yellow' | 'red'): string {
  if (zone === 'green') return 'zone-green'
  if (zone === 'yellow') return 'zone-yellow'
  return 'zone-red'
}

export default function ResultsPanel({ workspace }: { workspace: MonthWorkspace }) {
  const salary = useMemo(() => calcSalary(workspace), [workspace])

  const capPct =
    salary.salaryCapRub > 0
      ? Math.min(100, (salary.totalRub / salary.salaryCapRub) * 100)
      : 0

  const h1Zone =
    salary.h1.aggregateKpiPercent !== null
      ? kpiZone(salary.h1.aggregateKpiPercent)
      : 'yellow'
  const h2Zone =
    salary.h2.aggregateKpiPercent !== null
      ? kpiZone(salary.h2.aggregateKpiPercent)
      : 'yellow'
  const grZone =
    salary.growth.growthPercent !== null
      ? growthZone(salary.growth.growthPercent)
      : 'yellow'

  return (
    <aside className="lg:sticky lg:top-4 space-y-4">
      <div className="rounded-[20px] border-2 border-graphite bg-lime p-5 card-hover">
        <p className="mono-tag text-[9px] uppercase tracking-[0.18em] text-graphite/70 mb-2">
          Итого к выплате
        </p>
        <div className="hero-num text-4xl text-graphite">{formatRub(salary.totalRub)}</div>
        {salary.capped && (
          <p className="text-xs text-graphite/80 mt-2">
            До расчёта {formatRub(salary.totalBeforeCapRub)} — применён потолок{' '}
            {formatRub(salary.salaryCapRub)}
          </p>
        )}
        <div className="mt-4">
          <div className="flex justify-between mono-tag text-[9px] uppercase mb-1">
            <span>Потолок ЗП</span>
            <span>{formatPct(capPct, 0)}</span>
          </div>
          <div className="pb-track">
            <div className="pb-fill bg-graphite" style={{ width: `${capPct}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-graphite bg-ivory p-4 space-y-3 card-hover">
        <p className="mono-tag text-[9px] uppercase tracking-widest text-muted">
          Разбивка (формулы в коде)
        </p>

        <ResultRow
          title="CPL 1 · 1–14"
          kpi={salary.h1.aggregateKpiPercent}
          coef={salary.h1.leadCoefPercent}
          spend={salary.h1.totalBudgetRub}
          payout={salary.h1.payoutRub}
          zone={h1Zone}
          formula="открут × коэф лида"
        />
        <ResultRow
          title="CPL 2 · 15–31"
          kpi={salary.h2.aggregateKpiPercent}
          coef={salary.h2.leadCoefPercent}
          spend={salary.h2.totalBudgetRub}
          payout={salary.h2.payoutRub}
          zone={h2Zone}
          formula="открут × коэф лида"
        />
        <ResultRow
          title="Прирост бюджета"
          kpi={salary.growth.growthPercent}
          coef={salary.growth.growthCoefPercent}
          spend={salary.growth.monthTotalBudgetRub}
          payout={salary.growth.payoutRub}
          zone={grZone}
          formula="открут месяца × коэф прироста"
          sub={`Пересечение: ${formatRub(salary.growth.matchedCurrentRub)} / ${formatRub(salary.growth.matchedPreviousRub)}`}
        />
      </div>

      <div className="rounded-[20px] border border-graphite bg-ivory p-4 text-xs text-muted space-y-2">
        <p className="font-semibold text-graphite">Нормы</p>
        <p>Лид: ≤ {MOTIVATION_RULES.kpiNormMaxPercent}% от KPI → зелёная зона</p>
        <p>Прирост: ≥ {MOTIVATION_RULES.growthNormMinPercent}% → зелёная зона</p>
        <p className="pt-2 border-t border-graphite/20">
          В приросте: {salary.growth.matchedProjectIds.length} проект(ов). Исключённые и без
          пары M/M−1 не считаются.
        </p>
      </div>
    </aside>
  )
}

function ResultRow({
  title,
  kpi,
  coef,
  spend,
  payout,
  zone,
  formula,
  sub,
}: {
  title: string
  kpi: number | null
  coef: number
  spend: number
  payout: number
  zone: 'green' | 'yellow' | 'red'
  formula: string
  sub?: string
}) {
  return (
    <div className={`rounded-xl border p-3 ${zoneClass(zone)}`}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-semibold text-sm text-graphite">{title}</span>
        <span className="mono-tag text-sm">{formatRub(payout)}</span>
      </div>
      <p className="mono-tag text-[10px] text-graphite/80">
        KPI {formatPct(kpi)} · коэф {coef}% · открут {formatRub(spend)}
      </p>
      <p className="text-[10px] mt-1 opacity-70">{formula}</p>
      {sub && <p className="text-[10px] mt-1 opacity-70">{sub}</p>}
    </div>
  )
}
