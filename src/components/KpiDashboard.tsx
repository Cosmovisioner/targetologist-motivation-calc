import { useMemo, useState, type ReactNode } from 'react'
import {
  aggregateKpiPercentFullMonth,
  calcHalfPeriod,
  collectLines,
  collectLinesFullMonth,
  kpiZone,
  leadCoefFromAggregateKpi,
} from '../lib/motivation/calculate'
import { MOTIVATION_RULES } from '../lib/motivation/rules'
import type { Half, LinePeriodMetrics, MonthWorkspace } from '../lib/motivation/types'
import { formatPct, formatRub } from '../lib/format'

type Tab = Half | 'month'

type Props = { workspace: MonthWorkspace }

export default function KpiDashboard({ workspace }: Props) {
  const [tab, setTab] = useState<Tab>('h1')

  const h1 = useMemo(() => calcHalfPeriod(workspace, 'h1'), [workspace])
  const h2 = useMemo(() => calcHalfPeriod(workspace, 'h2'), [workspace])
  const monthAgg = useMemo(() => aggregateKpiPercentFullMonth(workspace), [workspace])

  const lines = useMemo(() => {
    if (tab === 'month') return collectLinesFullMonth(workspace)
    return collectLines(workspace, tab)
  }, [workspace, tab])

  const aggregate =
    tab === 'month'
      ? monthAgg
      : tab === 'h1'
        ? h1.aggregateKpiPercent
        : h2.aggregateKpiPercent

  const coef =
    aggregate !== null ? leadCoefFromAggregateKpi(aggregate) : null
  const zone =
    aggregate !== null ? kpiZone(aggregate) : ('yellow' as const)

  return (
    <section className="rounded-[20px] border-2 border-graphite bg-white overflow-hidden">
      <div className="px-5 py-4 bg-[#e8f5e9] border-b border-graphite/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display-head text-xl">KPI · цена лида</h2>
          <p className="text-xs text-muted mt-1 max-w-xl">
            Сводный показатель по мотивации: средневзвешенный % от планового KPI. Норма — не
            выше {MOTIVATION_RULES.kpiNormMaxPercent}%. От него зависит коэффициент за лид (Н1 / Н2).
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-graphite p-0.5 bg-ivory">
          <TabBtn active={tab === 'h1'} onClick={() => setTab('h1')}>
            Н1 · 1–14
          </TabBtn>
          <TabBtn active={tab === 'h2'} onClick={() => setTab('h2')}>
            Н2 · 15–31
          </TabBtn>
          <TabBtn active={tab === 'month'} onClick={() => setTab('month')}>
            Месяц
          </TabBtn>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 p-5 border-b border-graphite/15">
        <KpiSummaryCard
          label="Итог KPI"
          value={formatPct(aggregate)}
          zone={zone}
          hint={
            aggregate !== null
              ? aggregate <= MOTIVATION_RULES.kpiNormMaxPercent
                ? 'В норме (≤105%)'
                : 'Выше нормы (>105%)'
              : 'Заполни KPI план, бюджет и лиды'
          }
        />
        <KpiSummaryCard
          label="Коэф. за лид (для ЗП)"
          value={coef !== null ? `${coef}%` : '—'}
          zone={zone}
          hint={tab === 'month' ? 'Для ЗП считаются отдельно Н1 и Н2' : 'Применяется к откруту этой половины'}
        />
        <KpiSummaryCard
          label="Открут периода"
          value={
            tab === 'h1'
              ? formatRub(h1.totalBudgetRub)
              : tab === 'h2'
                ? formatRub(h2.totalBudgetRub)
                : formatRub(h1.totalBudgetRub + h2.totalBudgetRub)
          }
          zone="neutral"
          hint="Сумма бюджетов всех воронок"
        />
      </div>

      <div className="px-5 py-3 bg-ivory/80 border-b border-graphite/10 text-xs text-muted font-mono leading-relaxed">
        <strong className="text-graphite font-sans">Формула:</strong> факт CPL = бюджет ÷ лиды · % от
        KPI = (факт CPL ÷ KPI план) × 100 · вес = бюджет строки ÷ Σ бюджет ·{' '}
        <strong className="text-graphite">цена лида = бюджет ÷ лиды</strong> ·{' '}
        <strong className="text-graphite">итог = Σ (% от KPI × вес)</strong>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[880px]">
          <thead>
            <tr className="mono-tag text-[9px] uppercase tracking-wider text-muted border-b border-graphite/20">
              <th className="p-3 text-left">Проект</th>
              <th className="p-3 text-left">Воронка</th>
              <th className="p-3 text-right">KPI цена</th>
              <th className="p-3 text-right">Бюджет</th>
              <th className="p-3 text-right">Лиды</th>
              <th className="p-3 text-right">Факт CPL</th>
              <th className="p-3 text-right">% от KPI</th>
              <th className="p-3 text-right">Вес</th>
              <th className="p-3 text-right">Вклад</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-muted">
                  Нет строк — добавь проект и воронку
                </td>
              </tr>
            ) : (
              lines.map((row) => <KpiRow key={`${row.projectId}-${row.lineId}`} row={row} />)
            )}
          </tbody>
          {lines.length > 0 && aggregate !== null && (
            <tfoot>
              <tr className="border-t-2 border-graphite bg-[#e8f5e9] font-semibold">
                <td colSpan={6} className="p-3 text-right mono-tag text-[10px] uppercase">
                  Итог KPI (средневзвешенный)
                </td>
                <td className="p-3 text-right">
                  <PctCell value={aggregate} />
                </td>
                <td className="p-3 text-right text-muted">100%</td>
                <td className="p-3 text-right">{formatPct(aggregate)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <p className="px-5 py-3 text-[10px] text-muted border-t border-graphite/10">
        Вклад = % от KPI × вес. Сумма вкладов = итог в строке футера. Вкладку «Месяц» используй для
        общей картины; для выплаты по лиду смотри Н1 и Н2 отдельно (как в PDF).
      </p>
    </section>
  )
}

function KpiRow({ row }: { row: LinePeriodMetrics }) {
  const zone =
    row.pctOfKpi !== null ? kpiZone(row.pctOfKpi) : ('yellow' as const)
  return (
    <tr className="border-b border-dashed border-graphite/10 hover:bg-ivory/40">
      <td className="p-2 font-medium">{row.projectName}</td>
      <td className="p-2 text-muted">{row.label}</td>
      <td className="p-2 text-right font-mono text-xs">
        {row.kpiPriceRub > 0 ? formatRub(row.kpiPriceRub) : '—'}
      </td>
      <td className="p-2 text-right font-mono text-xs">{formatRub(row.budgetRub)}</td>
      <td className="p-2 text-right font-mono text-xs">{row.leads || '—'}</td>
      <td className="p-2 text-right font-mono text-xs">
        {row.factCplRub !== null ? formatRub(row.factCplRub) : '—'}
      </td>
      <td className="p-2 text-right">
        <PctCell value={row.pctOfKpi} />
      </td>
      <td className="p-2 text-right font-mono text-xs text-muted">
        {row.weight > 0 ? formatPct(row.weight * 100, 1) : '—'}
      </td>
      <td className={`p-2 text-right font-mono text-xs rounded ${zoneClass(zone)}`}>
        {row.pctOfKpi !== null ? formatPct(row.weightedContribution, 2) : '—'}
      </td>
    </tr>
  )
}

function PctCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">—</span>
  const zone = kpiZone(value)
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-bold ${zoneClass(zone)}`}
    >
      {formatPct(value)}
    </span>
  )
}

function KpiSummaryCard({
  label,
  value,
  zone,
  hint,
}: {
  label: string
  value: string
  zone: 'green' | 'red' | 'yellow' | 'neutral'
  hint: string
}) {
  const bg =
    zone === 'green'
      ? 'zone-green'
      : zone === 'red'
        ? 'zone-red'
        : zone === 'yellow'
          ? 'zone-yellow'
          : 'bg-ivory border-graphite/20'
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="mono-tag text-[9px] uppercase text-muted mb-1">{label}</p>
      <p className="hero-num text-2xl text-graphite">{value}</p>
      <p className="text-[10px] text-muted mt-2">{hint}</p>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
        active ? 'bg-graphite text-ivory' : 'text-muted hover:text-graphite'
      }`}
    >
      {children}
    </button>
  )
}

function zoneClass(zone: 'green' | 'yellow' | 'red'): string {
  if (zone === 'green') return 'zone-green'
  if (zone === 'red') return 'zone-red'
  return 'zone-yellow'
}
