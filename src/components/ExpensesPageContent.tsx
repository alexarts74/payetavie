'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ExpenseCategory, ExpenseWithCategory, MonthlyExpenseSummary } from '@/types'
import { getExpenses, getExpenseSummary } from '@/app/actions/expenses'
import { type BudgetEntry, getBudgets } from '@/app/actions/budgets'
import AddExpenseModal from '@/components/AddExpenseModal'
import ExpensesList from '@/components/ExpensesList'
import ExpenseCharts from '@/components/ExpenseCharts'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Receipt,
  Download,
  PiggyBank,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { exportExpensesCsv } from '@/app/actions/expenses'
import Link from 'next/link'

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

interface ExpensesPageContentProps {
  initialCategories: ExpenseCategory[]
  initialExpenses: ExpenseWithCategory[]
  initialSummary: MonthlyExpenseSummary
  initialBudgets: BudgetEntry[]
  initialMonth: number
  initialYear: number
}

export default function ExpensesPageContent({
  initialCategories,
  initialExpenses,
  initialSummary,
  initialBudgets,
  initialMonth,
  initialYear,
}: ExpensesPageContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [categories] = useState(initialCategories)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [summary, setSummary] = useState(initialSummary)
  const [budgets] = useState(initialBudgets)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null)
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null)
  const [showCharts, setShowCharts] = useState(false)

  const refreshData = (newMonth: number, newYear: number) => {
    startTransition(async () => {
      const [{ data: newExpenses }, { data: newSummary }] = await Promise.all([
        getExpenses(newMonth, newYear, filterCategoryId || undefined),
        getExpenseSummary(newMonth, newYear),
      ])
      setExpenses(newExpenses)
      setSummary(newSummary)
    })
  }

  const handlePrevMonth = () => {
    const newMonth = month === 1 ? 12 : month - 1
    const newYear = month === 1 ? year - 1 : year
    setMonth(newMonth)
    setYear(newYear)
    refreshData(newMonth, newYear)
  }

  const handleNextMonth = () => {
    const newMonth = month === 12 ? 1 : month + 1
    const newYear = month === 12 ? year + 1 : year
    setMonth(newMonth)
    setYear(newYear)
    refreshData(newMonth, newYear)
  }

  const handleFilterCategory = (catId: string | null) => {
    setFilterCategoryId(catId)
    startTransition(async () => {
      const { data: newExpenses } = await getExpenses(month, year, catId || undefined)
      setExpenses(newExpenses)
    })
  }

  const handleExpenseAdded = () => {
    setShowAddModal(false)
    setEditingExpense(null)
    refreshData(month, year)
    router.refresh()
  }

  const handleExportCsv = async () => {
    const result = await exportExpensesCsv(month, year)
    if ('data' in result && result.data) {
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `depenses-${year}-${String(month).padStart(2, '0')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const totalBudget = budgets.find(b => b.category_id === null)?.amount ?? summary.totalBudget
  const budgetPercentage = totalBudget ? Math.round((summary.totalSpent / totalBudget) * 100) : null

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Depenses
              </h1>
              <p className="text-zinc-700 dark:text-zinc-400">
                Suivez et gerez vos depenses mensuelles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/depenses/recurrents"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 glass-card transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recurrents
              </Link>
              <Link
                href="/depenses/budgets"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 glass-card transition-all"
              >
                <PiggyBank className="w-4 h-4" />
                Budgets
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.05s' }}>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              {budgetPercentage !== null && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  budgetPercentage > 100
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    : budgetPercentage > 80
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {budgetPercentage}% du budget
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {summary.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-400">Total du mois</div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {expenses.length}
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-400">Depenses ce mois</div>
          </div>

          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {summary.byCategory.length}
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-400">Categories utilisees</div>
          </div>
        </div>

        {/* Budget progress bar */}
        {totalBudget && (
          <div className="glass-card rounded-2xl p-4 mb-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Budget global</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {summary.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / {totalBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (budgetPercentage ?? 0) > 100
                    ? 'bg-red-500'
                    : (budgetPercentage ?? 0) > 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage ?? 0, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-slide-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
            <button
              onClick={() => handleFilterCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategoryId === null
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterCategoryId === cat.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Toggle charts / list */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setShowCharts(false)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !showCharts
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setShowCharts(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showCharts
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Graphiques
          </button>
          {expenses.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          )}
        </div>

        {/* Content */}
        {isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isPending && showCharts ? (
          <ExpenseCharts summary={summary} categories={categories} />
        ) : !isPending ? (
          <ExpensesList
            expenses={expenses}
            onEdit={(expense) => { setEditingExpense(expense); setShowAddModal(true) }}
            onDeleted={() => { refreshData(month, year); router.refresh() }}
          />
        ) : null}

        {/* Add/Edit modal */}
        {showAddModal && (
          <AddExpenseModal
            categories={categories}
            expense={editingExpense}
            onClose={() => { setShowAddModal(false); setEditingExpense(null) }}
            onSaved={handleExpenseAdded}
          />
        )}
      </div>
    </div>
  )
}
