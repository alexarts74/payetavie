'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePlan } from '@/lib/subscription'

export async function getRecurringExpenses() {
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

  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, category:expense_categories(*)')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .order('title', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function createRecurringExpense(
  title: string,
  amount: number,
  frequency: string,
  startDate: string,
  categoryId?: string,
  dayOfMonth?: number,
  endDate?: string,
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
    .from('recurring_expenses')
    .insert({
      user_id: user.id,
      title,
      amount,
      frequency,
      start_date: startDate,
      category_id: categoryId || null,
      day_of_month: dayOfMonth || null,
      end_date: endDate || null,
      notes: notes || null,
      is_active: true,
    })
    .select('*, category:expense_categories(*)')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses/recurrents')
  return { data }
}

export async function updateRecurringExpense(
  id: string,
  updates: {
    title?: string
    amount?: number
    frequency?: string
    day_of_month?: number | null
    start_date?: string
    end_date?: string | null
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
    .from('recurring_expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, category:expense_categories(*)')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses/recurrents')
  return { data }
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses/recurrents')
  return { success: true }
}

export async function toggleRecurringExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Get current state
  const { data: current } = await supabase
    .from('recurring_expenses')
    .select('is_active')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) {
    return { error: 'Depense recurrente introuvable' }
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update({ is_active: !current.is_active })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, category:expense_categories(*)')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/depenses/recurrents')
  return { data }
}

export async function generateRecurringExpenses() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const { data: recurringList, error: fetchError } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (fetchError) {
    return { error: fetchError.message }
  }

  if (!recurringList || recurringList.length === 0) {
    return { generated: 0 }
  }

  let totalGenerated = 0

  for (const recurring of recurringList) {
    // Skip if end date is passed
    if (recurring.end_date && recurring.end_date < todayStr) continue

    const startDate = new Date(recurring.start_date)
    const lastGenerated = recurring.last_generated_date
      ? new Date(recurring.last_generated_date)
      : new Date(startDate.getTime() - 86400000) // day before start

    const expensesToCreate: Array<{
      user_id: string
      title: string
      amount: number
      expense_date: string
      category_id: string | null
      is_recurring: boolean
      recurring_id: string
      notes: string | null
    }> = []

    let currentDate = new Date(lastGenerated)

    // Advance to next occurrence after lastGenerated
    while (currentDate <= today) {
      currentDate = getNextOccurrence(currentDate, recurring.frequency, recurring.day_of_month)

      if (currentDate > today) break
      if (currentDate < startDate) continue
      if (recurring.end_date && currentDate > new Date(recurring.end_date)) break

      const dateStr = currentDate.toISOString().split('T')[0]

      expensesToCreate.push({
        user_id: user.id,
        title: recurring.title,
        amount: recurring.amount,
        expense_date: dateStr,
        category_id: recurring.category_id,
        is_recurring: true,
        recurring_id: recurring.id,
        notes: recurring.notes,
      })
    }

    if (expensesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert(expensesToCreate)

      if (!insertError) {
        totalGenerated += expensesToCreate.length
        const lastDate = expensesToCreate[expensesToCreate.length - 1].expense_date
        await supabase
          .from('recurring_expenses')
          .update({ last_generated_date: lastDate })
          .eq('id', recurring.id)
      }
    }
  }

  if (totalGenerated > 0) {
    revalidatePath('/depenses')
    revalidatePath('/dashboard')
  }

  return { generated: totalGenerated }
}

function getNextOccurrence(
  fromDate: Date,
  frequency: string,
  dayOfMonth: number | null
): Date {
  const next = new Date(fromDate)

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next.setDate(Math.min(dayOfMonth, maxDay))
      }
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      if (dayOfMonth) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next.setDate(Math.min(dayOfMonth, maxDay))
      }
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}
