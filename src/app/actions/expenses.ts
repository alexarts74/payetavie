'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ExpenseWithCategory } from '@/types'
import { requirePlan } from '@/lib/subscription'

export async function getExpenses(month: number, year: number, categoryId?: string) {
  const planCheck = await requirePlan('essentiel')
  if (!planCheck.allowed) {
    return { data: [], error: planCheck.error, upgradeRequired: planCheck.upgradeRequired }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  let query = supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lt('expense_date', endDate)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as ExpenseWithCategory[], error: null }
}

export async function createExpense(
  title: string,
  amount: number,
  expenseDate: string,
  categoryId?: string,
  notes?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (amount <= 0) {
    return { error: 'Le montant doit etre superieur a 0' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      title,
      amount,
      expense_date: expenseDate,
      category_id: categoryId || null,
      notes: notes || null,
    })
    .select('*, category:expense_categories(*)')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  revalidatePath('/dashboard')
  return { data: data as ExpenseWithCategory }
}

export async function updateExpense(
  id: string,
  updates: {
    title?: string
    amount?: number
    expense_date?: string
    category_id?: string | null
    notes?: string | null
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (updates.amount !== undefined && updates.amount <= 0) {
    return { error: 'Le montant doit etre superieur a 0' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, category:expense_categories(*)')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  revalidatePath('/dashboard')
  return { data: data as ExpenseWithCategory }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getExpenseSummary(month: number, year: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: { totalSpent: 0, totalBudget: null, byCategory: [], dailyTotals: [] },
      error: null,
    }
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Get all expenses for the month with categories
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lt('expense_date', endDate)

  if (error) {
    return { data: { totalSpent: 0, totalBudget: null, byCategory: [], dailyTotals: [] }, error: error.message }
  }

  const expensesList = expenses || []
  const totalSpent = expensesList.reduce((sum, e) => sum + Number(e.amount), 0)

  // Group by category
  const categoryMap = new Map<string | null, { category: typeof expensesList[0]['category']; spent: number }>()
  for (const expense of expensesList) {
    const key = expense.category_id
    const existing = categoryMap.get(key)
    if (existing) {
      existing.spent += Number(expense.amount)
    } else {
      categoryMap.set(key, { category: expense.category, spent: Number(expense.amount) })
    }
  }

  // Get budgets from expense_categories.monthly_budget + user_preferences.global_monthly_budget
  const { data: categoriesWithBudgets } = await supabase
    .from('expense_categories')
    .select('id, monthly_budget')
    .eq('user_id', user.id)
    .not('monthly_budget', 'is', null)

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('global_monthly_budget')
    .eq('user_id', user.id)
    .single()

  const budgetMap = new Map<string | null, number>()
  let totalBudget: number | null = prefs?.global_monthly_budget ? Number(prefs.global_monthly_budget) : null
  if (categoriesWithBudgets) {
    for (const c of categoriesWithBudgets) {
      budgetMap.set(c.id, Number(c.monthly_budget))
    }
  }

  const byCategory = Array.from(categoryMap.entries()).map(([catId, { category, spent }]) => {
    const budget = budgetMap.get(catId) ?? null
    return {
      category: category || null,
      spent,
      budget,
      percentage: budget ? Math.round((spent / budget) * 100) : null,
    }
  }).sort((a, b) => b.spent - a.spent)

  // Daily totals
  const dailyMap = new Map<string, number>()
  for (const expense of expensesList) {
    const date = expense.expense_date
    dailyMap.set(date, (dailyMap.get(date) || 0) + Number(expense.amount))
  }

  const dailyTotals = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    data: { totalSpent, totalBudget, byCategory, dailyTotals },
    error: null,
  }
}

export async function exportExpensesCsv(month: number, year: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(name)')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lt('expense_date', endDate)
    .order('expense_date', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  const header = 'Date,Titre,Montant,Categorie,Notes'
  const rows = (expenses || []).map((e) => {
    const catName = e.category?.name || 'Sans categorie'
    const notes = (e.notes || '').replace(/"/g, '""')
    return `${e.expense_date},"${e.title}",${e.amount},"${catName}","${notes}"`
  })

  return { data: [header, ...rows].join('\n') }
}
