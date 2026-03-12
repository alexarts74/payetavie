'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Client, BillingDocument } from '@/types'
import { requirePlan } from '@/lib/subscription'

export async function getClients(search?: string, activeOnly?: boolean) {
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
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('company_name', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as Client[], error: null }
}

export async function getClient(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Non authentifie' }
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Client, error: null }
}

export async function createClientAction(clientData: {
  company_name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  address_line1?: string | null
  address_line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string
  siret?: string | null
  payment_terms_days?: number
  notes?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  if (!clientData.company_name.trim()) {
    return { error: 'Le nom de l\'entreprise est requis' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      ...clientData,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/freelance/clients')
  return { data: data as Client }
}

export async function updateClient(id: string, updates: {
  company_name?: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  address_line1?: string | null
  address_line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string
  siret?: string | null
  payment_terms_days?: number
  notes?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/freelance/clients')
  revalidatePath(`/clients/${id}`)
  return { data: data as Client }
}

export async function toggleClientActive(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Get current state
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('is_active')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !client) {
    return { error: 'Client non trouve' }
  }

  const { error } = await supabase
    .from('clients')
    .update({ is_active: !client.is_active })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/freelance/clients')
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function getClientInvoices(clientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .order('document_date', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as BillingDocument[], error: null }
}

export async function getClientQuotations(clientId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .eq('type', 'quotation')
    .order('document_date', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as BillingDocument[], error: null }
}
