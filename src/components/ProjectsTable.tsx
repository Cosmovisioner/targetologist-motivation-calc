import type { KpiLine, MonthWorkspace, Project } from '../lib/motivation/types'
import { aggregateKpiPercent, growthMatchedProjects } from '../lib/motivation/calculate'
import { formatMonthRu, previousMonthKey } from '../lib/monthLabel'
import { defaultKpiLine, defaultProject } from '../store/workspace'
import { formatPct, formatRub, parseNum, uid } from '../lib/format'

function projectMonthSpend(project: Project): number {
  return project.kpiLines.reduce(
    (s, line) => s + line.h1.budgetFactRub + line.h2.budgetFactRub,
    0,
  )
}

type Props = {
  workspace: MonthWorkspace
  onChange: (ws: MonthWorkspace) => void
}

export default function ProjectsTable({ workspace, onChange }: Props) {
  const update = (projects: Project[]) => onChange({ ...workspace, projects })

  const addProject = () => update([...workspace.projects, defaultProject()])

  const removeProject = (id: string) => {
    if (workspace.projects.length <= 1) return
    update(workspace.projects.filter((p) => p.id !== id))
  }

  const patchProject = (id: string, patch: Partial<Project>) => {
    update(workspace.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const patchLine = (projectId: string, lineId: string, patch: Partial<KpiLine>) => {
    update(
      workspace.projects.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          kpiLines: p.kpiLines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
        }
      }),
    )
  }

  const addLine = (projectId: string) => {
    update(
      workspace.projects.map((p) =>
        p.id === projectId
          ? { ...p, kpiLines: [...p.kpiLines, { ...defaultKpiLine(), id: uid() }] }
          : p,
      ),
    )
  }

  const removeLine = (projectId: string, lineId: string) => {
    update(
      workspace.projects.map((p) => {
        if (p.id !== projectId) return p
        if (p.kpiLines.length <= 1) return p
        return { ...p, kpiLines: p.kpiLines.filter((l) => l.id !== lineId) }
      }),
    )
  }

  const aggH1 = aggregateKpiPercent(workspace, 'h1')
  const aggH2 = aggregateKpiPercent(workspace, 'h2')
  const prevKey = previousMonthKey(workspace.month)
  const matchedIds = new Set(growthMatchedProjects(workspace).map((p) => p.id))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display-head text-xl">Проекты и ввод</h2>
          <p className="text-sm text-muted mt-1">
            Сводный KPI за половину: Н1 {formatPct(aggH1)} · Н2 {formatPct(aggH2)}
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="rounded-full border-2 border-graphite px-4 py-2 text-sm font-semibold hover:bg-graphite hover:text-ivory transition-colors"
        >
          + Проект
        </button>
      </div>

      {workspace.projects.map((project) => {
        const currentSpend = projectMonthSpend(project)
        const inGrowth = matchedIds.has(project.id)

        return (
        <div
          key={project.id}
          className="rounded-[20px] border border-graphite bg-white overflow-hidden card-hover"
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-graphite/15 bg-ivory px-4 py-3">
            <input
              className="flex-1 min-w-[160px] font-semibold bg-transparent border-b border-transparent focus:border-graphite outline-none"
              value={project.name}
              onChange={(e) => patchProject(project.id, { name: e.target.value })}
              placeholder="Название проекта"
            />
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={project.excludeFromGrowth}
                onChange={(e) =>
                  patchProject(project.id, { excludeFromGrowth: e.target.checked })
                }
              />
              Не в приросте
            </label>
            {workspace.projects.length > 1 && (
              <button
                type="button"
                onClick={() => removeProject(project.id)}
                className="text-xs text-red-600 hover:underline shrink-0"
              >
                Удалить
              </button>
            )}
          </div>

          <div className="px-4 py-3 bg-violet-50 border-b-2 border-violet-200">
            <p className="mono-tag text-[9px] uppercase tracking-wider text-violet-800 mb-2">
              Прирост бюджета · прошлый месяц ({formatMonthRu(prevKey)})
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 min-w-[200px] flex-1">
                <span className="text-xs font-semibold text-graphite">
                  Открут за {formatMonthRu(prevKey)}, ₽
                </span>
                <span className="text-[10px] text-muted leading-snug">
                  Сумма по проекту в прошлом месяце — для сравнения с текущим
                </span>
                <NumInput
                  value={project.budgetPreviousMonthRub}
                  onChange={(v) => patchProject(project.id, { budgetPreviousMonthRub: v })}
                  className="w-full max-w-xs border-violet-300 bg-white"
                />
              </label>
              <div className="text-xs space-y-1 pb-1">
                <p>
                  <span className="text-muted">Текущий месяц ({formatMonthRu(workspace.month)}):</span>{' '}
                  <strong>{formatRub(currentSpend)}</strong>
                  <span className="text-muted text-[10px]"> (Н1+Н2)</span>
                </p>
                <p className={inGrowth ? 'text-emerald-700' : 'text-amber-700'}>
                  {inGrowth
                    ? '✓ Участвует в расчёте прироста'
                    : project.excludeFromGrowth
                      ? '— Исключён из прироста'
                      : '— Нужны открут в обоих месяцах'}
                </p>
              </div>
            </div>
          </div>

          <p className="mono-tag text-[9px] uppercase tracking-wider text-muted px-4 pt-3 pb-1">
            Текущий месяц · {formatMonthRu(workspace.month)}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="mono-tag text-[9px] uppercase tracking-wider text-muted border-b border-graphite/20">
                  <th className="p-3 bg-[#e8f5e9]">Воронка / KPI</th>
                  <th className="p-3">KPI план, ₽</th>
                  <th className="p-3 bg-[#fff8e1]">Н1 бюджет · 1–14</th>
                  <th className="p-3 bg-[#fff8e1]">Н1 лиды</th>
                  <th className="p-3 bg-[#e3f2fd]">Н2 бюджет · 15–31</th>
                  <th className="p-3 bg-[#e3f2fd]">Н2 лиды</th>
                  <th className="p-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {project.kpiLines.map((line) => (
                  <KpiRow
                    key={line.id}
                    line={line}
                    onPatch={(patch) => patchLine(project.id, line.id, patch)}
                    onRemove={() => removeLine(project.id, line.id)}
                    canRemove={project.kpiLines.length > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 border-t border-graphite/10">
            <button
              type="button"
              onClick={() => addLine(project.id)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              + KPI / воронка
            </button>
          </div>
        </div>
      )})}
    </div>
  )
}

function KpiRow({
  line,
  onPatch,
  onRemove,
  canRemove,
}: {
  line: KpiLine
  onPatch: (p: Partial<KpiLine>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const cplH1 =
    line.h1.leads > 0 ? line.h1.budgetFactRub / line.h1.leads : null
  const cplH2 =
    line.h2.leads > 0 ? line.h2.budgetFactRub / line.h2.leads : null
  const pctH1 =
    cplH1 !== null && line.kpiPlanRub > 0 ? (cplH1 / line.kpiPlanRub) * 100 : null
  const pctH2 =
    cplH2 !== null && line.kpiPlanRub > 0 ? (cplH2 / line.kpiPlanRub) * 100 : null

  return (
    <tr className="border-b border-dashed border-graphite/15 hover:bg-ivory/50">
      <td className="p-2">
        <input
          className="w-full px-2 py-1 border border-graphite/20 rounded-md"
          value={line.label}
          onChange={(e) => onPatch({ label: e.target.value })}
        />
        <p className="mono-tag text-[9px] text-muted mt-1 px-1">
          CPL: {formatPct(pctH1)} / {formatPct(pctH2)}
        </p>
      </td>
      <td className="p-2">
        <NumInput value={line.kpiPlanRub} onChange={(v) => onPatch({ kpiPlanRub: v })} />
      </td>
      <td className="p-2">
        <NumInput
          value={line.h1.budgetFactRub}
          onChange={(v) => onPatch({ h1: { ...line.h1, budgetFactRub: v } })}
        />
      </td>
      <td className="p-2">
        <NumInput
          value={line.h1.leads}
          onChange={(v) => onPatch({ h1: { ...line.h1, leads: v } })}
          integer
        />
      </td>
      <td className="p-2">
        <NumInput
          value={line.h2.budgetFactRub}
          onChange={(v) => onPatch({ h2: { ...line.h2, budgetFactRub: v } })}
        />
      </td>
      <td className="p-2">
        <NumInput
          value={line.h2.leads}
          onChange={(v) => onPatch({ h2: { ...line.h2, leads: v } })}
          integer
        />
      </td>
      <td className="p-2">
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-muted hover:text-red-600">
            ×
          </button>
        )}
      </td>
    </tr>
  )
}

function NumInput({
  value,
  onChange,
  className = '',
  integer = false,
}: {
  value: number
  onChange: (v: number) => void
  className?: string
  integer?: boolean
}) {
  return (
    <input
      type="number"
      min={0}
      step={integer ? 1 : 1000}
      className={`w-full px-2 py-1 border border-graphite/25 rounded-md ${className}`}
      value={value || ''}
      onChange={(e) => {
        const v = parseNum(e.target.value)
        onChange(integer ? Math.round(v) : v)
      }}
    />
  )
}
