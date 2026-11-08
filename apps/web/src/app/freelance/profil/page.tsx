import { getProfessionalProfile } from '@/app/actions/professional-profile'
import ProfilProfessionnelContent from '@/components/ProfilProfessionnelContent'

export default async function ProfilProfessionnelPage() {
  const { data: profile } = await getProfessionalProfile()

  return <ProfilProfessionnelContent initialProfile={profile ?? null} />
}
