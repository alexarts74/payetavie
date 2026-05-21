'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BillingDocument, BillingDocumentWithItems, QuotationStatus } from '@/types'
import { createInvoice } from './invoices'
import { requirePlan } from '@/lib/subscription'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  tva_rate: number
}

function computeTotals(items: LineItem[], globalTvaRate: number) {
  const totalHt = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tvaAmount = Math.round(totalHt * globalTvaRate) / 100
  const totalTtc = totalHt + tvaAmount
  return { totalHt: Math.round(totalHt * 100) / 100, tvaAmount: Math.round(tvaAmount * 100) / 100, totalTtc: Math.round(totalTtc * 100) / 100 }
}

export async function getQuotations(filters?: { status?: QuotationStatus; clientId?: string }) {
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
    .eq('type', 'quotation')
    .order('document_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as (BillingDocument & { client: import('@/types').Client })[], error: null }
}

export async function getQuotation(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Non authentifie' }
  }

  const { data: quotation, error } = await supabase
    .from('billing_documents')
    .select('*, client:clients(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'quotation')
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
    data: { ...quotation, items: items || [] } as BillingDocumentWithItems,
    error: null,
  }
}

export async function createQuotation(input: {
  clientId: string
  items: LineItem[]
  quotationDate: string
  expiryDate?: string
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

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('quotation_prefix')
    .eq('user_id', user.id)
    .maybeSingle()

  const prefix = profile?.quotation_prefix || 'D'
  const year = new Date(input.quotationDate).getFullYear()

  const { data: numberResult, error: numberError } = await supabase
    .rpc('get_next_document_number', {
      p_user_id: user.id,
      p_document_type: 'quotation',
      p_year: year,
      p_prefix: prefix,
    })

  if (numberError) {
    return { error: numberError.message }
  }

  const quotationNumber = numberResult as string
  const { totalHt, tvaAmount, totalTtc } = computeTotals(input.items, input.tvaRate)

  const { data: quotation, error: quotationError } = await supabase
    .from('billing_documents')
    .insert({
      user_id: user.id,
      client_id: input.clientId,
      type: 'quotation',
      document_number: quotationNumber,
      document_date: input.quotationDate,
      expiry_date: input.expiryDate || null,
      tva_rate: input.tvaRate,
      total_ht: totalHt,
      tva_amount: tvaAmount,
      total_ttc: totalTtc,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (quotationError) {
    return { error: quotationError.message }
  }

  const itemsToInsert = input.items.map((item, index) => ({
    document_id: quotation.id,
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
  revalidatePath('/freelance/facturation/devis')
  return { data: quotation as BillingDocument }
}

export async function updateQuotation(id: string, input: {
  clientId?: string
  items?: LineItem[]
  quotationDate?: string
  expiryDate?: string | null
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

  const { data: existing, error: fetchError } = await supabase
    .from('billing_documents')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'quotation')
    .single()

  if (fetchError || !existing) {
    return { error: 'Devis non trouve' }
  }

  if (existing.status !== 'brouillon') {
    return { error: 'Seuls les devis en brouillon peuvent etre modifies' }
  }

  const updates: Record<string, unknown> = {}
  if (input.clientId) updates.client_id = input.clientId
  if (input.quotationDate) updates.document_date = input.quotationDate
  if (input.expiryDate !== undefined) updates.expiry_date = input.expiryDate
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
  revalidatePath(`/freelance/facturation/devis/${id}`)
  return { success: true }
}

export async function deleteQuotation(id: string) {
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
    .eq('type', 'quotation')
    .single()

  if (fetchError || !existing) {
    return { error: 'Devis non trouve' }
  }

  if (existing.status !== 'brouillon') {
    return { error: 'Seuls les devis en brouillon peuvent etre supprimes' }
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
  revalidatePath('/freelance/facturation/devis')
  return { success: true }
}

const VALID_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  brouillon: ['envoye', 'refuse'],
  envoye: ['accepte', 'refuse'],
  accepte: ['facture'],
  refuse: [],
  facture: [],
}

export async function updateQuotationStatus(id: string, newStatus: QuotationStatus) {
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
    .eq('type', 'quotation')
    .single()

  if (fetchError || !existing) {
    return { error: 'Devis non trouve' }
  }

  const allowed = VALID_TRANSITIONS[existing.status as QuotationStatus] || []
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
  revalidatePath(`/freelance/facturation/devis/${id}`)
  return { success: true }
}

export async function convertQuotationToInvoice(quotationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Fetch quotation with items
  const { data: quotation, error: fetchError } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('id', quotationId)
    .eq('user_id', user.id)
    .eq('type', 'quotation')
    .single()

  if (fetchError || !quotation) {
    return { error: 'Devis non trouve' }
  }

  if (quotation.status === 'facture') {
    return { error: 'Ce devis a deja ete converti en facture' }
  }

  const { data: quotationItems } = await supabase
    .from('billing_document_items')
    .select('*')
    .eq('document_id', quotationId)
    .order('sort_order', { ascending: true })

  const items = (quotationItems || []).map(item => ({
    description: item.description,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    tva_rate: Number(item.tva_rate),
  }))

  const today = new Date().toISOString().split('T')[0]
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  // Create invoice from quotation data
  const result = await createInvoice({
    clientId: quotation.client_id,
    items,
    invoiceDate: today,
    dueDate: dueDate.toISOString().split('T')[0],
    tvaRate: Number(quotation.tva_rate),
    notes: quotation.notes,
  })

  if (result.error || !result.data) {
    return { error: result.error || 'Erreur lors de la creation de la facture' }
  }

  // Link quotation and invoice via source_document_id, update quotation status
  await supabase
    .from('billing_documents')
    .update({ source_document_id: quotationId })
    .eq('id', result.data.id)
    .eq('user_id', user.id)

  await supabase
    .from('billing_documents')
    .update({ status: 'facture', source_document_id: result.data.id })
    .eq('id', quotationId)
    .eq('user_id', user.id)

  revalidatePath('/freelance/facturation')
  revalidatePath(`/freelance/facturation/devis/${quotationId}`)
  return { data: result.data }
}
