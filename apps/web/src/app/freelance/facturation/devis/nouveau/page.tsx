import { getClients } from '@/app/actions/clients'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import InvoiceForm from '@/components/InvoiceForm'

export default async function NouveauDevisPage() {
  const [{ data: clients }, { data: profile }] = await Promise.all([
    getClients(undefined, true),
    getProfessionalProfile(),
  ])

  return <InvoiceForm clients={clients} profile={profile} type="quotation" />
}
