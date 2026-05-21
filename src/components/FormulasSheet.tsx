import { MOTIVATION_RULES } from '../lib/motivation/rules'

/** Справочник формул — как лист в Excel, всё зашито в src/lib/motivation */
export default function FormulasSheet() {
  return (
    <details className="rounded-[20px] border border-graphite bg-ivory p-4">
      <summary className="cursor-pointer font-semibold text-sm">
        Лист формул (как в Excel) — что считает код
      </summary>
      <div className="mt-4 space-y-4 text-sm text-graphite font-mono leading-relaxed">
        <section>
          <p className="font-sans font-bold text-xs uppercase text-muted mb-2">Ячейки ввода</p>
          <ul className="list-disc pl-5 space-y-1 font-sans text-graphite">
            <li>KPI план — плановая цена лида, ₽</li>
            <li>H1/H2 бюджет — факт открута за 1–14 и 15–31</li>
            <li>H1/H2 лиды — количество лидов за период</li>
            <li>M−1 открут — прошлый месяц по проекту (для прироста)</li>
          </ul>
        </section>

        <section>
          <p className="font-sans font-bold text-xs uppercase text-muted mb-2">Расчётные</p>
          <p>factCpl = budgetFact / leads</p>
          <p>pctOfKpi = (factCpl / kpiPlan) × 100</p>
          <p>weight = budget линии / Σ budget периода</p>
          <p className="font-bold text-accent">aggregateKpi = Σ (pctOfKpi × weight)</p>
        </section>

        <section>
          <p className="font-sans font-bold text-xs uppercase text-muted mb-2">
            Коэф. за лид (половина)
          </p>
          {MOTIVATION_RULES.leadCoefTiers.map((t) => (
            <p key={t.id}>
              IF aggregateKpi ≤ {t.maxKpiPercentInclusive ?? '∞'} → {t.coefPercent}%
            </p>
          ))}
          <p className="mt-2">payHalf = totalBudgetHalf × leadCoef / 100</p>
        </section>

        <section>
          <p className="font-sans font-bold text-xs uppercase text-muted mb-2">Прирост</p>
          <p>matched = проекты с открутом в M и M−1, не excludeFromGrowth</p>
          <p>growthPct = Σ spend(M) / Σ spend(M−1) × 100</p>
          {MOTIVATION_RULES.growthCoefTiers.map((t) => (
            <p key={t.id}>
              IF growthPct ≥ {t.minGrowthPercentInclusive} → {t.coefPercent}%
            </p>
          ))}
          <p className="mt-2">payGrowth = monthTotalSpend × growthCoef / 100</p>
        </section>

        <section>
          <p className="font-bold">total = payH1 + payH2 + payGrowth</p>
          <p>total = MIN(total, {MOTIVATION_RULES.salaryCapRub})</p>
        </section>

        <p className="font-sans text-xs text-muted">
          Файлы: src/lib/motivation/calculate.ts · config/motivationRules.json · tests/
        </p>
      </div>
    </details>
  )
}
