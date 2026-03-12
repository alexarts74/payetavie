'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePlan } from '@/lib/subscription'
import type { ExpenseCategory } from '@/types'

// Budget data is now stored in expense_categories.monthly_budget (per category)
// and user_preferences.global_monthly_budget (global budget)
// We keep the same API shape for backward compatibility

export interface BudgetEntry {
  id: string
  category_id: string | null
  amount: number
  category?: ExpenseCategory | null
}

export async function getBudgets(_month: number, _year: number) {
  const planCheck = await requirePlan('essentiel')
  if (!planCheck.allowed) {
    return { data: [] as BudgetEntry[], error: planCheck.error, upgradeRequired: planCheck.upgradeRequired }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [] as BudgetEntry[], error: null }
  }

  const budgets: BudgetEntry[] = []

  // Get global budget from user_preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('id, global_monthly_budget')
    .eq('user_id', user.id)
    .single()

  if (prefs?.global_monthly_budget) {
    budgets.push({
      id: `global-${prefs.id}`,
      category_id: null,
      amount: Number(prefs.global_monthly_budget),
    })
  }

  // Get category budgets from expense_categories
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .not('monthly_budget', 'is', null)

  for (const cat of categories || []) {
    budgets.push({
      id: `cat-${cat.id}`,
      category_id: cat.id,
      amount: Number(cat.monthly_budget),
      category: cat as ExpenseCategory,
    })
  }

  return { data: budgets, error: null }
}

export async function setBudget(
  categoryId: string | null,
  amount: number,
  _month: number,
  _year: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (amount <= 0) {
    return { error: 'Le montant du budget doit etre superieur a 0' }
  }

  if (categoryId === null) {
    // Update global budget in user_preferences
    const { error } = await supabase
      .from('user_preferences')
      .update({ global_monthly_budget: amount })
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  } else {
    // Update category budget
    const { error } = await supabase
      .from('expense_categories')
      .update({ monthly_budget: amount })
      .eq('id', categoryId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  }

  revalidatePath('/depenses')
  revalidatePath('/dashboard')
  return { data: { id: categoryId || 'global', amount } }
}

export async function deleteBudget(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (id.startsWith('global-')) {
    // Clear global budget
    const { error } = await supabase
      .from('user_preferences')
      .update({ global_monthly_budget: null })
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  } else if (id.startsWith('cat-')) {
    // Clear category budget
    const categoryId = id.replace('cat-', '')
    const { error } = await supabase
      .from('expense_categories')
      .update({ monthly_budget: null })
      .eq('id', categoryId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  }

  revalidatePath('/depenses')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function copyBudgetsFromPreviousMonth(_month: number, _year: number) {
  // With the new schema, budgets are not per-month anymore.
  // They persist as fixed values on categories. This function is no longer needed
  // but we keep it for backward compatibility.
  return { error: 'Les budgets sont desormais fixes par categorie et n\'ont plus besoin d\'etre copies' }
}
