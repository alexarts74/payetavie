'use client'

import { useState } from 'react'
import { createExpense, updateExpense } from '@/app/actions/expenses'
import type { ExpenseCategory, ExpenseWithCategory } from '@/types'
import { X } from 'lucide-react'

interface AddExpenseModalProps {
  categories: ExpenseCategory[]
  expense: ExpenseWithCategory | null
  onClose: () => void
  onSaved: () => void
}

export default function AddExpenseModal({
  categories,
  expense,
  onClose,
  onSaved,
}: AddExpenseModalProps) {
  const isEditing = !!expense
  const [title, setTitle] = useState(expense?.title || '')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date || new Date().toISOString().split('T')[0]
  )
  const [categoryId, setCategoryId] = useState(expense?.category_id || '')
  const [notes, setNotes] = useState(expense?.notes || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-[#1a2e22] placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Le montant doit etre un nombre superieur a 0')
      return
    }

    setLoading(true)

    if (isEditing && expense) {
      const result = await updateExpense(expense.id, {
        title: title.trim(),
        amount: parsedAmount,
        expense_date: expenseDate,
        category_id: categoryId || null,
        notes: notes.trim() || null,
      })
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
    } else {
      const result = await createExpense(
        title.trim(),
        parsedAmount,
        expenseDate,
        categoryId || undefined,
        notes.trim() || undefined
      )
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1a2e22]">
            {isEditing ? 'Modifier la depense' : 'Ajouter une depense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#EEF7F1] transition-colors"
          >
            <X className="w-5 h-5 text-[#5A6B61]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5A6B61] mb-1.5">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Courses Carrefour"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5A6B61] mb-1.5">
              Montant (EUR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5A6B61] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5A6B61] mb-1.5">
              Categorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sans categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5A6B61] mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optionnelles..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[#5A6B61] hover:bg-[#EEF7F1] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
