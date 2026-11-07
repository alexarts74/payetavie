'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProfessionalProfile } from '@/types'
import { requirePlan } from '@/lib/subscription'

export async function getProfessionalProfile() {
  const planCheck = await requirePlan('pro')
  if (!planCheck.allowed) {
    return { data: null, error: planCheck.error, upgradeRequired: planCheck.upgradeRequired }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ProfessionalProfile | null, error: null }
}

export async function upsertProfessionalProfile(profileData: {
  business_name?: string | null
  siret?: string | null
  address_line1?: string | null
  address_line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string
  tva_number?: string | null
  iban?: string | null
  bic?: string | null
  hourly_rate?: number | null
  is_micro_entrepreneur?: boolean
  logo_path?: string | null
  invoice_prefix?: string
  quotation_prefix?: string
  default_payment_terms_days?: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { data, error } = await supabase
    .from('professional_profiles')
    .upsert(
      { user_id: user.id, ...profileData },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/freelance/facturation')
  return { data: data as ProfessionalProfile }
}
