'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BillingDocument, BillingDocumentWithItems, InvoicingStats, InvoiceStatus } from '@/types'
import { requirePlan } from '@/lib/subscription'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  tva_rate: number
}

function computeTotals(items: LineItem[], globalTvaRate: number) {
  const totalHt = items.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)
  const tvaAmount = Math.round(totalHt * globalTvaRate) / 100
  const totalTtc = totalHt + tvaAmount
  return { totalHt: Math.round(totalHt * 100) / 100, tvaAmount: Math.round(tvaAmount * 100) / 100, totalTtc: Math.round(totalTtc * 100) / 100 }
}

export async function getInvoices(filters?: { status?: InvoiceStatus; clientId?: string; year?: number }) {
  const planCheck = await requirePlan('pro')
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

  let query = supabase
    .from('billing_documents')
    .select('*, client:clients(*)')
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .order('document_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.year) {
    query = query
      .gte('document_date', `${filters.year}-01-01`)
      .lt('document_date', `${filters.year + 1}-01-01`)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as (BillingDocument & { client: import('@/types').Client })[], error: null }
}

export async function getInvoice(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Non authentifie' }
  }

  const { data: invoice, error } = await supabase
    .from('billing_documents')
    .select('*, client:clients(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const { data: items, error: itemsError } = await supabase
    .from('billing_document_items')
    .select('*')
    .eq('document_id', id)
    .order('sort_order', { ascending: true })

  if (itemsError) {
    return { data: null, error: itemsError.message }
  }

  return {
    data: { ...invoice, items: items || [] } as BillingDocumentWithItems,
    error: null,
  }
}

export async function createInvoice(input: {
  clientId: string
  items: LineItem[]
  invoiceDate: string
  dueDate: string
  tvaRate: number
  notes?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (!input.items.length) {
    return { error: 'Au moins une ligne est requise' }
  }

  // Get prefix from professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('invoice_prefix')
    .eq('user_id', user.id)
    .maybeSingle()

  const prefix = profile?.invoice_prefix || 'F'
  const year = new Date(input.invoiceDate).getFullYear()

  // Get next sequential number
  const { data: numberResult, error: numberError } = await supabase
    .rpc('get_next_document_number', {
      p_user_id: user.id,
      p_document_type: 'invoice',
      p_year: year,
      p_prefix: prefix,
    })

  if (numberError) {
    return { error: numberError.message }
  }

  const invoiceNumber = numberResult as string
  const { totalHt, tvaAmount, totalTtc } = computeTotals(input.items, input.tvaRate)

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('billing_documents')
    .insert({
      user_id: user.id,
      client_id: input.clientId,
      type: 'invoice',
      document_number: invoiceNumber,
      document_date: input.invoiceDate,
      due_date: input.dueDate,
      tva_rate: input.tvaRate,
      total_ht: totalHt,
      tva_amount: tvaAmount,
      total_ttc: totalTtc,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (invoiceError) {
    return { error: invoiceError.message }
  }

  // Create items
  const itemsToInsert = input.items.map((item, index) => ({
    document_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    tva_rate: item.tva_rate,
    line_total: Math.round(item.quantity * item.unit_price * 100) / 100,
    sort_order: index,
  }))

  const { error: itemsError } = await supabase
    .from('billing_document_items')
    .insert(itemsToInsert)

  if (itemsError) {
    return { error: itemsError.message }
  }

  revalidatePath('/freelance/facturation')
  revalidatePath('/freelance/facturation/factures')
  return { data: invoice as BillingDocument }
}

export async function updateInvoice(id: string, input: {
  clientId?: string
  items?: LineItem[]
  invoiceDate?: string
  dueDate?: string
  tvaRate?: number
  notes?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Verify invoice is in brouillon status
  const { data: existing, error: fetchError } = await supabase
    .from('billing_documents')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (fetchError || !existing) {
    return { error: 'Facture non trouvee' }
  }

  if (existing.status !== 'brouillon') {
    return { error: 'Seules les factures en brouillon peuvent etre modifiees' }
  }

  const updates: Record<string, unknown> = {}
  if (input.clientId) updates.client_id = input.clientId
  if (input.invoiceDate) updates.document_date = input.invoiceDate
  if (input.dueDate) updates.due_date = input.dueDate
  if (input.tvaRate !== undefined) updates.tva_rate = input.tvaRate
  if (input.notes !== undefined) updates.notes = input.notes

  if (input.items) {
    const tvaRate = input.tvaRate ?? 0
    const { totalHt, tvaAmount, totalTtc } = computeTotals(input.items, tvaRate)
    updates.total_ht = totalHt
    updates.tva_amount = tvaAmount
    updates.total_ttc = totalTtc
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('billing_documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }
  }

  // Replace items if provided
  if (input.items) {
    await supabase.from('billing_document_items').delete().eq('document_id', id)

    const itemsToInsert = input.items.map((item, index) => ({
      document_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tva_rate: item.tva_rate,
      line_total: Math.round(item.quantity * item.unit_price * 100) / 100,
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from('billing_document_items')
      .insert(itemsToInsert)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  revalidatePath('/freelance/facturation')
  revalidatePath(`/facturation/factures/${id}`)
  return { success: true }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Verify invoice is in brouillon status
  const { data: existing, error: fetchError } = await supabase
    .from('billing_documents')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (fetchError || !existing) {
    return { error: 'Facture non trouvee' }
  }

  if (existing.status !== 'brouillon') {
    return { error: 'Seules les factures en brouillon peuvent etre supprimees' }
  }

  const { error } = await supabase
    .from('billing_documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/freelance/facturation')
  revalidatePath('/freelance/facturation/factures')
  return { success: true }
}

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  brouillon: ['envoyee', 'annulee'],
  envoyee: ['payee', 'en_retard', 'annulee'],
  en_retard: ['payee', 'annulee'],
  payee: [],
  annulee: [],
}

export async function updateInvoiceStatus(id: string, newStatus: InvoiceStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('billing_documents')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (fetchError || !existing) {
    return { error: 'Facture non trouvee' }
  }

  const allowed = VALID_TRANSITIONS[existing.status as InvoiceStatus] || []
  if (!allowed.includes(newStatus)) {
    return { error: `Transition de "${existing.status}" vers "${newStatus}" non autorisee` }
  }

  const { error } = await supabase
    .from('billing_documents')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/freelance/facturation')
  revalidatePath(`/facturation/factures/${id}`)
  return { success: true }
}

export async function getInvoicingStats(year?: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: { totalRevenue: 0, totalUnpaid: 0, totalPending: 0, invoiceCount: 0, quotationCount: 0 }, error: null }
  }

  const currentYear = year || new Date().getFullYear()

  const { data: invoices, error } = await supabase
    .from('billing_documents')
    .select('status, total_ttc')
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .gte('document_date', `${currentYear}-01-01`)
    .lt('document_date', `${currentYear + 1}-01-01`)

  if (error) {
    return { data: { totalRevenue: 0, totalUnpaid: 0, totalPending: 0, invoiceCount: 0, quotationCount: 0 }, error: error.message }
  }

  const { data: quotations } = await supabase
    .from('billing_documents')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'quotation')
    .gte('document_date', `${currentYear}-01-01`)
    .lt('document_date', `${currentYear + 1}-01-01`)

  const stats: InvoicingStats = {
    totalRevenue: 0,
    totalUnpaid: 0,
    totalPending: 0,
    invoiceCount: invoices?.length || 0,
    quotationCount: quotations?.length || 0,
  }

  for (const inv of invoices || []) {
    const amount = Number(inv.total_ttc)
    if (inv.status === 'payee') {
      stats.totalRevenue += amount
    } else if (inv.status === 'en_retard') {
      stats.totalUnpaid += amount
    } else if (inv.status === 'envoyee') {
      stats.totalPending += amount
    }
  }

  return { data: stats, error: null }
}

export async function duplicateInvoice(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Fetch original invoice with items
  const { data: original, error: fetchError } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (fetchError || !original) {
    return { error: 'Facture non trouvee' }
  }

  const { data: originalItems } = await supabase
    .from('billing_document_items')
    .select('*')
    .eq('document_id', id)
    .order('sort_order', { ascending: true })

  const items = (originalItems || []).map(item => ({
    description: item.description,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    tva_rate: Number(item.tva_rate),
  }))

  const today = new Date().toISOString().split('T')[0]
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  return createInvoice({
    clientId: original.client_id,
    items,
    invoiceDate: today,
    dueDate: dueDate.toISOString().split('T')[0],
    tvaRate: Number(original.tva_rate),
    notes: original.notes,
  })
}
