'use client'

import { useState } from 'react'
import type { ExpenseCategory, RecurringExpense } from '@/types'
import {
  createRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  generateRecurringExpenses,
} from '@/app/actions/recurring-expenses'
import { RefreshCw, Plus, Trash2, X, ArrowLeft, Zap, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
}

interface RecurringExpensesPageContentProps {
  initialRecurringExpenses: RecurringExpense[]
  categories: ExpenseCategory[]
}

export default function RecurringExpensesPageContent({
  initialRecurringExpenses,
  categories,
}: RecurringExpensesPageContentProps) {
  const [recurringExpenses, setRecurringExpenses] = useState(initialRecurringExpenses)
  const [showAddForm, setShowAddForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [dayOfMonth, setDayOfMonth] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-[#1a2e22] text-sm focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all placeholder:text-[#5A6B61]/60'

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setFrequency('monthly')
    setDayOfMonth('')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate('')
    setCategoryId('')
    setNotes('')
    setError('')
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Le montant doit etre superieur a 0')
      return
    }

    setLoading(true)
    const result = await createRecurringExpense(
      title.trim(),
      parsedAmount,
      frequency,
      startDate,
      categoryId || undefined,
      dayOfMonth ? parseInt(dayOfMonth) : undefined,
      endDate || undefined,
      notes.trim() || undefined
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.data) {
      setRecurringExpenses([result.data as RecurringExpense, ...recurringExpenses])
    }
    setShowAddForm(false)
    resetForm()
    setLoading(false)
  }

  const handleToggle = async (id: string) => {
    const result = await toggleRecurringExpense(id)
    if (result.data) {
      setRecurringExpenses(recurringExpenses.map((r) =>
        r.id === id ? (result.data as RecurringExpense) : r
      ))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette depense recurrente ?')) return
    const result = await deleteRecurringExpense(id)
    if (result.success) {
      setRecurringExpenses(recurringExpenses.filter((r) => r.id !== id))
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateResult(null)
    const result = await generateRecurringExpenses()
    if ('generated' in result && result.generated !== undefined) {
      setGenerateResult(
        result.generated > 0
          ? `${result.generated} depense(s) generee(s) avec succes`
          : 'Aucune depense a generer'
      )
    } else if (result.error) {
      setGenerateResult(`Erreur : ${result.error}`)
    }
    setGenerating(false)
  }

  const activeRecurring = recurringExpenses.filter((r) => r.is_active)
  const inactiveRecurring = recurringExpenses.filter((r) => !r.is_active)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/depenses"
            className="inline-flex items-center gap-2 text-sm text-[#5A6B61] hover:text-[#235037] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux depenses
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a2e22] mb-2">
                Depenses recurrentes
              </h1>
              <p className="text-[#5A6B61]">
                Gerez vos depenses automatiques (loyer, abonnements, etc.)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#5A6B61] hover:text-[#235037] card transition-all disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                Generer
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {generateResult && (
          <div className="mb-6 p-3 rounded-xl bg-[#EEF7F1] border border-[#235037]/20 text-sm text-[#235037] flex items-center justify-between">
            <span>{generateResult}</span>
            <button onClick={() => setGenerateResult(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="card rounded-2xl p-6 mb-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-[#1a2e22] mb-4">
              Nouvelle depense recurrente
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Titre *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Loyer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Montant (EUR) *</label>
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
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Frequence</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className={inputClass}
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Jour du mois</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    placeholder="Ex: 5"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Date de debut *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A6B61] mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A6B61] mb-1">Categorie</label>
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
                <label className="block text-sm font-medium text-[#5A6B61] mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes optionnelles..."
                  className={inputClass}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); resetForm() }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[#5A6B61] hover:bg-[#EEF7F1] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active recurring expenses */}
        {activeRecurring.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-[#1a2e22] flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#235037]" />
              Actives ({activeRecurring.length})
            </h3>
            {activeRecurring.map((recurring) => (
              <RecurringCard
                key={recurring.id}
                recurring={recurring}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Inactive recurring expenses */}
        {inactiveRecurring.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#5A6B61]">
              Inactives ({inactiveRecurring.length})
            </h3>
            {inactiveRecurring.map((recurring) => (
              <RecurringCard
                key={recurring.id}
                recurring={recurring}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {recurringExpenses.length === 0 && !showAddForm && (
          <div className="card rounded-2xl p-12 text-center">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-[#E8E8E8]" />
            <h3 className="text-lg font-semibold text-[#1a2e22] mb-2">
              Aucune depense recurrente
            </h3>
            <p className="text-sm text-[#5A6B61] mb-6">
              Ajoutez vos depenses automatiques pour les generer chaque mois
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-xl transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter une depense recurrente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RecurringCard({
  recurring,
  onToggle,
  onDelete,
}: {
  recurring: RecurringExpense
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={`card rounded-2xl p-5 border border-[#E8E8E8] ${
        !recurring.is_active ? 'opacity-50' : ''
      } transition-all`}
    >
      <div className="flex items-center gap-4">
        {/* Category icon */}
        <div className="flex-shrink-0 text-2xl">
          {recurring.category?.icon || '📦'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#1a2e22]">
              {recurring.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF7F1] text-[#235037]">
              {FREQUENCY_LABELS[recurring.frequency] || recurring.frequency}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5A6B61]">
            {recurring.category && <span>{recurring.category.name}</span>}
            {recurring.day_of_month && <span>Le {recurring.day_of_month} du mois</span>}
            <span>
              Depuis le {new Date(recurring.start_date).toLocaleDateString('fr-FR')}
            </span>
            {recurring.end_date && (
              <span>
                Jusqu&apos;au {new Date(recurring.end_date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          {recurring.notes && (
            <p className="text-xs text-[#5A6B61]/60 mt-1">{recurring.notes}</p>
          )}
        </div>

        {/* Amount */}
        <span className="text-sm font-bold text-[#1a2e22] flex-shrink-0">
          {Number(recurring.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(recurring.id)}
            className="p-1.5 rounded-lg hover:bg-[#EEF7F1] transition-colors"
            title={recurring.is_active ? 'Desactiver' : 'Activer'}
          >
            {recurring.is_active ? (
              <ToggleRight className="w-5 h-5 text-[#235037]" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-[#5A6B61]" />
            )}
          </button>
          <button
            onClick={() => onDelete(recurring.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
