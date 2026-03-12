import { getQuotation } from '@/app/actions/quotations'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import QuotationDetailContent from '@/components/QuotationDetailContent'
import { redirect } from 'next/navigation'

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: quotation }, { data: profile }] = await Promise.all([
    getQuotation(id),
    getProfessionalProfile(),
  ])

  if (!quotation) {
    redirect('/freelance/facturation/devis')
  }

  return <QuotationDetailContent quotation={quotation} profile={profile} />
}
