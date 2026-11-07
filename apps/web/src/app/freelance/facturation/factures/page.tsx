import { getInvoices } from '@/app/actions/invoices'
import { getClients } from '@/app/actions/clients'
import InvoicesListContent from '@/components/InvoicesListContent'

export default async function FacturesPage() {
  const [{ data: invoices }, { data: clients }] = await Promise.all([
    getInvoices(),
    getClients(undefined, true),
  ])

  return <InvoicesListContent initialInvoices={invoices} clients={clients} />
}
