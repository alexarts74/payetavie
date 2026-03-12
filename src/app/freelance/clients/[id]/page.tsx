import { getClient, getClientInvoices, getClientQuotations } from '@/app/actions/clients'
import ClientDetailContent from '@/components/ClientDetailContent'
import { redirect } from 'next/navigation'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: client }, { data: invoices }, { data: quotations }] = await Promise.all([
    getClient(id),
    getClientInvoices(id),
    getClientQuotations(id),
  ])

  if (!client) {
    redirect('/freelance/clients')
  }

  return <ClientDetailContent client={client} invoices={invoices} quotations={quotations} />
}
