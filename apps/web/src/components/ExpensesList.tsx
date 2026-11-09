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
  indigo: 'bg-[#235037]',
  purple: 'bg-[#235037]',
  pink: 'bg-[#EBA7CB]',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  zinc: 'bg-[#5A6B61]',
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
      <div className="card rounded-2xl p-12 text-center animate-slide-up">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-[#E8E8E8]" />
        <h3 className="text-lg font-semibold text-[#1a2e22] mb-2">
          Aucune depense ce mois
        </h3>
        <p className="text-sm text-[#5A6B61]">
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
          <div key={date} className="card rounded-2xl overflow-hidden">
            {/* Date header */}
            <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5A6B61]">
                {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
              <span className="text-sm font-bold text-[#1a2e22]">
                {dayTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>

            {/* Expenses */}
            <div className="divide-y divide-[#E8E8E8]">
              {dateExpenses.map((expense) => {
                const colorClass = expense.category?.color
                  ? COLOR_MAP[expense.category.color] || 'bg-[#5A6B61]'
                  : 'bg-[#E8E8E8]'

                return (
                  <div
                    key={expense.id}
                    className="group flex items-center gap-4 px-6 py-4 hover:bg-[#EEF7F1]/30 transition-colors"
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
                        <span className="text-sm font-semibold text-[#1a2e22] truncate">
                          {expense.title}
                        </span>
                        {expense.is_recurring && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF7F1] text-[#235037]">
                            Recurrent
                          </span>
                        )}
                      </div>
                      {expense.category && (
                        <span className="text-xs text-[#5A6B61]">
                          {expense.category.name}
                        </span>
                      )}
                      {expense.notes && (
                        <p className="text-xs text-[#5A6B61]/60 mt-0.5 truncate">
                          {expense.notes}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-bold text-[#1a2e22] flex-shrink-0">
                      {Number(expense.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg hover:bg-[#EEF7F1] text-[#235037] transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
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
