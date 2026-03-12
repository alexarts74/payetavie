import { createClient } from '@/lib/supabase/server'
import { generateInvoiceHtml } from '@/lib/pdf/invoice-template'
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

  const { data: invoice, error } = await supabase
    .from('billing_documents')
    .select('*, client:clients(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .single()

  if (error || !invoice) {
    return new Response('Facture non trouvee', { status: 404 })
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

  const invoiceWithItems: BillingDocumentWithItems = { ...invoice, items: items || [] }
  const html = generateInvoiceHtml(invoiceWithItems, profile as ProfessionalProfile | null)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
