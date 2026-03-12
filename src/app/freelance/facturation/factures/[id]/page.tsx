import { getInvoice } from '@/app/actions/invoices'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import InvoiceDetailContent from '@/components/InvoiceDetailContent'
import { redirect } from 'next/navigation'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: invoice }, { data: profile }] = await Promise.all([
    getInvoice(id),
    getProfessionalProfile(),
  ])

  if (!invoice) {
    redirect('/freelance/facturation/factures')
  }

  return <InvoiceDetailContent invoice={invoice} profile={profile} />
}
