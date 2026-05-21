import type { ReactNode } from 'react'
import { formatMonthRu, previousMonthKey } from '../lib/monthLabel'

type Props = { currentMonth: string }

export default function UserGuide({ currentMonth }: Props) {
  const prev = previousMonthKey(currentMonth)

  return (
    <details
      className="rounded-[20px] border-2 border-graphite bg-white overflow-hidden group"
      open
    >
      <summary className="cursor-pointer px-5 py-4 bg-ivory font-semibold text-graphite list-none flex items-center justify-between gap-2">
        <span>Инструкция: как пользоваться</span>
        <span className="mono-tag text-[9px] uppercase text-muted font-normal group-open:hidden">
          развернуть
        </span>
      </summary>

      <div className="px-5 pb-5 pt-2 space-y-5 text-sm text-graphite border-t border-graphite/15">
        <Step n={1} title="Выбери месяц расчёта">
          В шапке — поле <strong>Месяц</strong>. Это <strong>текущий</strong> месяц, за который
          считаешь мотивацию (например, {formatMonthRu(currentMonth)}).
        </Step>

        <Step n={2} title="Добавь проекты">
          Кнопка «+ Проект». На каждом проекте — одна или несколько строк{' '}
          <strong>воронок / KPI</strong> (кнопка «+ KPI / воронка»).
        </Step>

        <Step n={3} title="Заполни таблицу за текущий месяц">
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
            <li>
              <strong className="text-graphite">KPI цена, ₽</strong> — плановая цена лида из Аспро
              (ввод).
            </li>
            <li>
              <strong className="text-graphite">Н1 / Н2 бюджет и лиды</strong> — факт за 1–14 и
              15–31 (ввод).
            </li>
            <li>
              <strong className="text-graphite">Н1 / Н2 цена лида</strong> — считается само: бюджет
              ÷ лиды; ниже % от KPI.
            </li>
          </ul>
        </Step>

        <Step
          n={4}
          title="Прирост бюджета — открут прошлого месяца"
          highlight
        >
          <p className="mt-2">
            Фиолетовая полоса над таблицей каждого проекта:{' '}
            <strong>«Открут за {formatMonthRu(prev)}»</strong> — это суммарный бюджет, который
            ты вёл на этом проекте в <em>прошлом</em> месяце.
          </p>
          <p className="mt-2 text-muted">
            Текущий месяц ({formatMonthRu(currentMonth)}) в таблице: Н1 + Н2 по всем воронкам.
            Калькулятор сам сложит их и сравнит с прошлым месяцем — справа в блоке{' '}
            <strong>«Прирост бюджета»</strong>.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-muted">
            <li>
              Проект был и в прошлом, и в текущем месяце — вводи открут за {formatMonthRu(prev)}.
            </li>
            <li>
              Проект <strong>новый</strong> в этом месяце — поставь галочку{' '}
              <strong>«Не в приросте»</strong> (или оставь прошлый открут 0).
            </li>
            <li>
              Проект <strong>ушёл</strong> — тоже «Не в приросте».
            </li>
          </ul>
        </Step>

        <Step n={5} title="Блок KPI · цена лида (зелёная секция)">
          После ввода данных открой таблицу <strong>KPI · цена лида</strong>: вкладки Н1, Н2 или
          Месяц. Там видно по каждой воронке: факт CPL, % от KPI, вес и вклад в итог.{' '}
          <strong>Итог KPI ≤ 105%</strong> — зелёная зона (максимальный коэф. за лид 3%).
        </Step>

        <Step n={6} title="Смотри итог справа">
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
            <li>
              <strong>KPI · сводка</strong> — итог % и коэф. за Н1 и Н2.
            </li>
            <li>
              <strong>CPL 1 · 1–14</strong> и <strong>CPL 2 · 15–31</strong> — зарплата за лид по
              половинам месяца.
            </li>
            <li>
              <strong>Прирост бюджета</strong> — % и выплата за рост (норма ≥ 90%).
            </li>
            <li>
              <strong>Итого к выплате</strong> — сумма трёх частей, не больше 350 000 ₽.
            </li>
          </ul>
        </Step>

        <p className="text-xs text-muted border-t border-graphite/15 pt-3">
          Данные сохраняются в браузере автоматически. Экспорт JSON — бэкап. Формулы — в блоке
          «Лист формул» ниже.
        </p>
      </div>
    </details>
  )
}

function Step({
  n,
  title,
  children,
  highlight,
}: {
  n: number
  title: string
  children: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-xl border-2 border-violet-300 bg-violet-50/80 p-4 -mx-1'
          : ''
      }
    >
      <p className="font-semibold flex items-center gap-2">
        <span className="mono-tag text-[10px] w-6 h-6 rounded-full bg-graphite text-ivory flex items-center justify-center shrink-0">
          {n}
        </span>
        {title}
      </p>
      <div className="pl-8 mt-1">{children}</div>
    </div>
  )
}
