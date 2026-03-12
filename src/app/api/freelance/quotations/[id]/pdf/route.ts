import { createClient } from '@/lib/supabase/server'
import { generateQuotationHtml } from '@/lib/pdf/quotation-template'
import type { BillingDocumentWithItems, ProfessionalProfile } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Non authentifie', { status: 401 })
  }

  const { data: quotation, error } = await supabase
    .from('billing_documents')
    .select('*, client:clients(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'quotation')
    .single()

  if (error || !quotation) {
    return new Response('Devis non trouve', { status: 404 })
  }

  const { data: items } = await supabase
    .from('billing_document_items')
    .select('*')
    .eq('document_id', id)
    .order('sort_order', { ascending: true })

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const quotationWithItems: BillingDocumentWithItems = { ...quotation, items: items || [] }
  const html = generateQuotationHtml(quotationWithItems, profile as ProfessionalProfile | null)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
