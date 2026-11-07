'use client'

import { useState } from 'react'
import type { ExpenseWithCategory } from '@/types'
import { deleteExpense } from '@/app/actions/expenses'
import { Trash2, Pencil, Receipt } from 'lucide-react'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  zinc: 'bg-zinc-500',
}

interface ExpensesListProps {
  expenses: ExpenseWithCategory[]
  onEdit: (expense: ExpenseWithCategory) => void
  onDeleted: () => void
}

export default function ExpensesList({ expenses, onEdit, onDeleted }: ExpensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center animate-slide-up">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Aucune depense ce mois
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Ajoutez votre premiere depense pour commencer le suivi
        </p>
      </div>
    )
  }

  // Group expenses by date
  const grouped = new Map<string, ExpenseWithCategory[]>()
  for (const expense of expenses) {
    const date = expense.expense_date
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(expense)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette depense ?')) return
    setDeletingId(id)
    const result = await deleteExpense(id)
    if (result.success) {
      onDeleted()
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {Array.from(grouped.entries()).map(([date, dateExpenses]) => {
        const dayTotal = dateExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
        return (
          <div key={date} className="glass-card rounded-2xl overflow-hidden">
            {/* Date header */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {dayTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>

            {/* Expenses */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
              {dateExpenses.map((expense) => {
                const colorClass = expense.category?.color
                  ? COLOR_MAP[expense.category.color] || 'bg-zinc-400'
                  : 'bg-zinc-400'

                return (
                  <div
                    key={expense.id}
                    className="group flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Category dot */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colorClass}`} />

                    {/* Category icon */}
                    {expense.category?.icon && (
                      <span className="text-lg flex-shrink-0">{expense.category.icon}</span>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {expense.title}
                        </span>
                        {expense.is_recurring && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                            Recurrent
                          </span>
                        )}
                      </div>
                      {expense.category && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {expense.category.name}
                        </span>
                      )}
                      {expense.notes && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                          {expense.notes}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex-shrink-0">
                      {Number(expense.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
