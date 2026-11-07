'use client'

import type { ExpenseCategory, MonthlyExpenseSummary } from '@/types'

const COLOR_VALUES: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6',
  zinc: '#71717a',
}

interface ExpenseChartsProps {
  summary: MonthlyExpenseSummary
  categories: ExpenseCategory[]
}

export default function ExpenseCharts({ summary }: ExpenseChartsProps) {
  if (summary.totalSpent === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Aucune donnee a afficher pour ce mois
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          Repartition par categorie
        </h3>
        <DonutChart data={summary.byCategory} total={summary.totalSpent} />
      </div>

      {/* Bar chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          Depenses par jour
        </h3>
        <BarChart data={summary.dailyTotals} />
      </div>
    </div>
  )
}

function DonutChart({
  data,
  total,
}: {
  data: MonthlyExpenseSummary['byCategory']
  total: number
}) {
  const size = 200
  const strokeWidth = 35
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let accumulatedOffset = 0

  const segments = data.map((item) => {
    const percentage = total > 0 ? item.spent / total : 0
    const dashLength = percentage * circumference
    const dashOffset = circumference - accumulatedOffset
    accumulatedOffset += dashLength
    const color = item.category?.color
      ? COLOR_VALUES[item.category.color] || COLOR_VALUES.zinc
      : COLOR_VALUES.zinc

    return { ...item, dashLength, dashOffset, color, percentage }
  })

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-700"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={seg.dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {seg.category?.icon && `${seg.category.icon} `}
                {seg.category?.name || 'Sans categorie'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {seg.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 w-10 text-right">
                {Math.round(seg.percentage * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data }: { data: MonthlyExpenseSummary['dailyTotals'] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
        Aucune donnee
      </p>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total))
  const chartHeight = 200
  const barWidth = Math.max(8, Math.min(24, Math.floor(600 / data.length) - 4))

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 min-w-fit" style={{ height: chartHeight + 40 }}>
        {data.map((day) => {
          const height = maxTotal > 0 ? (day.total / maxTotal) * chartHeight : 0
          const dayNum = new Date(day.date + 'T00:00:00').getDate()

          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div className="relative group">
                <div
                  className="rounded-t-md bg-indigo-500 transition-all duration-300 hover:bg-indigo-600"
                  style={{ width: barWidth, height: Math.max(2, height) }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                    {day.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{dayNum}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
