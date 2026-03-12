import { getQuotations } from '@/app/actions/quotations'
import { getClients } from '@/app/actions/clients'
import QuotationsListContent from '@/components/QuotationsListContent'

export default async function DevisPage() {
  const [{ data: quotations }, { data: clients }] = await Promise.all([
    getQuotations(),
    getClients(undefined, true),
  ])

  return <QuotationsListContent initialQuotations={quotations} clients={clients} />
}
