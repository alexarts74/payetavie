'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAllReminders() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('completed', false)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function getAllDocuments() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return { data: [], error: error.message }
  }

  // Récupérer les URLs signées pour chaque document (60 minutes de validité)
  const documentsWithUrls = await Promise.all(
    (data || []).map(async (doc) => {
      const { data: urlData } = await supabase.storage
        .from('Documents')
        .createSignedUrl(doc.file_path, 3600)

      return {
        ...doc,
        public_url: urlData?.signedUrl || '',
      }
    })
  )

  return { data: documentsWithUrls, error: null }
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalReminders: 0,
      activeReminders: 0,
      overdueReminders: 0,
      totalDocuments: 0,
      expiringDocuments: 0,
      totalBookmarks: 0,
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // Compter les rappels
  const { count: totalReminders } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: activeReminders } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', false)

  const { count: overdueReminders } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', false)
    .lt('due_date', today)

  // Compter les documents
  const { count: totalDocuments } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Documents expirant dans les 30 prochains jours
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0]

  const { count: expiringDocuments } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('expires_at', 'is', null)
    .gte('expires_at', today)
    .lte('expires_at', thirtyDaysFromNowStr)

  // Compter les favoris
  const { count: totalBookmarks } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return {
    totalReminders: totalReminders || 0,
    activeReminders: activeReminders || 0,
    overdueReminders: overdueReminders || 0,
    totalDocuments: totalDocuments || 0,
    expiringDocuments: expiringDocuments || 0,
    totalBookmarks: totalBookmarks || 0,
  }
}

export async function getExpenseStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { totalSpent: 0, totalBudget: null, expenseCount: 0 }
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Total spent this month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lt('expense_date', endDate)

  const totalSpent = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
  const expenseCount = (expenses || []).length

  // Global budget from user_preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('global_monthly_budget')
    .eq('user_id', user.id)
    .single()

  return {
    totalSpent,
    totalBudget: prefs?.global_monthly_budget ? Number(prefs.global_monthly_budget) : null,
    expenseCount,
  }
}
