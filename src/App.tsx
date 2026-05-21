import { useCallback, useEffect, useRef, useState } from 'react'
import FormulasSheet from './components/FormulasSheet'
import KpiDashboard from './components/KpiDashboard'
import ProjectsTable from './components/ProjectsTable'
import ResultsPanel from './components/ResultsPanel'
import UserGuide from './components/UserGuide'
import type { MonthWorkspace } from './lib/motivation/types'
import {
  defaultWorkspace,
  exportJson,
  importJson,
  loadWorkspace,
  saveWorkspace,
} from './store/workspace'

export default function App() {
  const [workspace, setWorkspace] = useState<MonthWorkspace>(() => loadWorkspace())
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

  const onMonthChange = useCallback((month: string) => {
    setWorkspace((ws) => ({ ...ws, month }))
  }, [])

  const onImport = async (file: File) => {
    try {
      const ws = await importJson(file)
      setWorkspace(ws)
    } catch {
      alert('Не удалось прочитать JSON')
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b-2 border-graphite bg-ivory">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="display-head text-2xl">Калькулятор мотивации</h1>
            <p className="text-sm text-muted mt-1">Таргетолог · правила с 01.03.2026</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="mono-tag text-[9px] uppercase text-muted">Месяц</label>
            <input
              type="month"
              className="border-2 border-graphite rounded-lg px-3 py-2 font-mono text-sm"
              value={workspace.month}
              onChange={(e) => onMonthChange(e.target.value)}
            />
            <button
              type="button"
              onClick={() => exportJson(workspace)}
              className="rounded-full border border-graphite px-3 py-2 text-xs font-semibold hover:bg-graphite hover:text-ivory"
            >
              Экспорт JSON
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-graphite px-3 py-2 text-xs font-semibold hover:bg-graphite hover:text-ivory"
            >
              Импорт
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImport(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (confirm('Сбросить данные месяца?')) setWorkspace(defaultWorkspace(workspace.month))
              }}
              className="text-xs text-muted hover:text-graphite"
            >
              Сброс
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <UserGuide currentMonth={workspace.month} />
          <KpiDashboard workspace={workspace} />
          <ProjectsTable workspace={workspace} onChange={setWorkspace} />
          <FormulasSheet />
        </div>
        <ResultsPanel workspace={workspace} />
      </main>
    </div>
  )
}
