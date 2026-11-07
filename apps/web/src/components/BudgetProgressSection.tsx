'use client'

import { useState, useTransition } from 'react'
import type { ExpenseCategory, MonthlyExpenseSummary } from '@/types'
import { type BudgetEntry, setBudget, deleteBudget, copyBudgetsFromPreviousMonth, getBudgets } from '@/app/actions/budgets'
import { getExpenseSummary } from '@/app/actions/expenses'
import { PiggyBank, Plus, Trash2, Copy, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

interface BudgetPageContentProps {
  initialCategories: ExpenseCategory[]
  initialBudgets: BudgetEntry[]
  initialSummary: MonthlyExpenseSummary
  initialMonth: number
  initialYear: number
}

export default function BudgetPageContent({
  initialCategories,
  initialBudgets,
  initialSummary,
  initialMonth,
  initialYear,
}: BudgetPageContentProps) {
  const [isPending, startTransition] = useTransition()
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [categories] = useState(initialCategories)
  const [budgets, setBudgets] = useState(initialBudgets)
  const [summary, setSummary] = useState(initialSummary)
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string | null; amount: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState<string>('')
  const [newBudgetAmount, setNewBudgetAmount] = useState('')
  const [error, setError] = useState('')

  const refreshData = (m: number, y: number) => {
    startTransition(async () => {
      const [{ data: newBudgets }, { data: newSummary }] = await Promise.all([
        getBudgets(m, y),
        getExpenseSummary(m, y),
      ])
      setBudgets(newBudgets)
      setSummary(newSummary)
    })
  }

  const handlePrevMonth = () => {
    const m = month === 1 ? 12 : month - 1
    const y = month === 1 ? year - 1 : year
    setMonth(m)
    setYear(y)
    refreshData(m, y)
  }

  const handleNextMonth = () => {
    const m = month === 12 ? 1 : month + 1
    const y = month === 12 ? year + 1 : year
    setMonth(m)
    setYear(y)
    refreshData(m, y)
  }

  const handleSetBudget = async (categoryId: string | null, amount: number) => {
    setError('')
    const result = await setBudget(categoryId, amount, month, year)
    if (result.error) {
      setError(result.error)
      return
    }
    setEditingBudget(null)
    refreshData(month, year)
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Supprimer ce budget ?')) return
    const result = await deleteBudget(budgetId)
    if (result.error) {
      setError(result.error)
      return
    }
    refreshData(month, year)
  }

  const handleCopyPrevious = async () => {
    setError('')
    const result = await copyBudgetsFromPreviousMonth(month, year)
    if (result.error) {
      setError(result.error)
      return
    }
    refreshData(month, year)
  }

  const handleAddBudget = async () => {
    const amount = parseFloat(newBudgetAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Le montant doit etre superieur a 0')
      return
    }
    const catId = newBudgetCategoryId === '' ? null : newBudgetCategoryId
    await handleSetBudget(catId, amount)
    setShowAddForm(false)
    setNewBudgetAmount('')
    setNewBudgetCategoryId('')
  }

  // Global budget
  const globalBudget = budgets.find((b) => b.category_id === null)
  const globalPercentage = globalBudget
    ? Math.round((summary.totalSpent / Number(globalBudget.amount)) * 100)
    : null

  // Category budgets mapped with spent
  const categoryBudgets = budgets
    .filter((b) => b.category_id !== null)
    .map((b) => {
      const cat = categories.find((c) => c.id === b.category_id)
      const catSummary = summary.byCategory.find((s) => s.category?.id === b.category_id)
      const spent = catSummary?.spent || 0
      const percentage = Math.round((spent / Number(b.amount)) * 100)
      return { budget: b, category: cat, spent, percentage }
    })

  // Categories without budgets
  const budgetedCategoryIds = new Set(budgets.filter(b => b.category_id).map((b) => b.category_id))
  const unbugdetedCategories = categories.filter((c) => !budgetedCategoryIds.has(c.id))

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/depenses"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux depenses
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Budgets
              </h1>
              <p className="text-zinc-700 dark:text-zinc-400">
                Definissez vos budgets mensuels par categorie
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrevious}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 glass-card transition-all"
              >
                <Copy className="w-4 h-4" />
                Copier du mois precedent
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Add budget form */}
        {showAddForm && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Nouveau budget
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={newBudgetCategoryId}
                onChange={(e) => setNewBudgetCategoryId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Budget global</option>
                {unbugdetedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                placeholder="Montant (EUR)"
                className="w-40 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddBudget}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-green-700 transition-all"
              >
                Valider
              </button>
              <button
                onClick={() => { setShowAddForm(false); setError('') }}
                className="px-4 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Global budget */}
        {globalBudget && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Budget global</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {summary.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / {Number(globalBudget.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingBudget?.categoryId === null ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editingBudget.amount}
                      onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                      className="w-28 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSetBudget(null, parseFloat(editingBudget.amount))}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingBudget(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`text-sm font-bold ${
                      (globalPercentage ?? 0) > 100 ? 'text-red-600 dark:text-red-400'
                        : (globalPercentage ?? 0) > 80 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {globalPercentage}%
                    </span>
                    <button
                      onClick={() => setEditingBudget({ categoryId: null, amount: String(globalBudget.amount) })}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(globalBudget.id)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <BudgetBar percentage={globalPercentage ?? 0} />
          </div>
        )}

        {/* Category budgets */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Budgets par categorie
            </h3>
            {categoryBudgets.map(({ budget, category, spent, percentage }) => (
              <div key={budget.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {category?.icon && <span className="text-lg">{category.icon}</span>}
                    <div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {category?.name || 'Categorie inconnue'}
                      </span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / {Number(budget.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      percentage > 100 ? 'text-red-600 dark:text-red-400'
                        : percentage > 80 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {percentage}%
                    </span>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <BudgetBar percentage={percentage} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {budgets.length === 0 && !showAddForm && !isPending && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Aucun budget defini
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Definissez un budget global ou par categorie pour suivre vos depenses
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md shadow-indigo-500/30"
            >
              <Plus className="w-4 h-4" />
              Creer un budget
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BudgetBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          percentage > 100
            ? 'bg-red-500'
            : percentage > 80
            ? 'bg-amber-500'
            : 'bg-indigo-500'
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
