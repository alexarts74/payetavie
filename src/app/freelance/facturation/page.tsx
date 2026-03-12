import { getInvoicingStats, getInvoices } from '@/app/actions/invoices'
import { getQuotations } from '@/app/actions/quotations'
import { getProfessionalProfile } from '@/app/actions/professional-profile'
import FacturationDashboard from '@/components/FacturationDashboard'
import FAQModal from '@/components/FAQModal'

const faq = [
  {
    question: 'Comment creer une facture ?',
    answer: 'Cliquez sur "Nouvelle facture", selectionnez un client, ajoutez vos lignes de prestation avec les montants, puis validez. La facture est creee en brouillon — vous pouvez la modifier avant de l\'envoyer.',
  },
  {
    question: 'Quels sont les statuts d\'une facture ?',
    answer: 'Une facture passe par plusieurs etats : Brouillon (modifiable) → Envoyee → Payee ou En retard. Vous pouvez aussi annuler une facture a tout moment sauf si elle est deja payee.',
  },
  {
    question: 'Comment convertir un devis en facture ?',
    answer: 'Ouvrez le devis accepte et cliquez sur "Convertir en facture". Une facture sera automatiquement creee avec les memes lignes et le meme client. Les deux documents restent lies.',
  },
  {
    question: 'Comment telecharger un PDF ?',
    answer: 'Sur la page de detail d\'une facture ou d\'un devis, cliquez sur le bouton "Telecharger PDF". Le document est genere avec vos informations professionnelles (logo, SIRET, coordonnees bancaires).',
  },
  {
    question: 'Dois-je remplir mon profil professionnel ?',
    answer: 'Oui, c\'est recommande. Votre profil (nom d\'entreprise, SIRET, IBAN, logo...) est utilise pour generer les PDF de vos factures et devis. Allez dans Profil pour le completer.',
  },
  {
    question: 'Comment fonctionne la TVA pour les micro-entrepreneurs ?',
    answer: 'Si vous indiquez "micro-entrepreneur" dans votre profil professionnel, la TVA sera automatiquement fixee a 0% sur vos factures et devis, avec la mention legale appropriee.',
  },
]

export default async function FacturationPage() {
  const currentYear = new Date().getFullYear()

  const [{ data: stats }, { data: recentInvoices }, { data: recentQuotations }, { data: profile }] =
    await Promise.all([
      getInvoicingStats(currentYear),
      getInvoices({ year: currentYear }),
      getQuotations(),
      getProfessionalProfile(),
    ])

  return (
    <>
      <FacturationDashboard
        stats={stats}
        recentInvoices={recentInvoices.slice(0, 5)}
        recentQuotations={recentQuotations.slice(0, 5)}
        hasProfile={!!profile?.business_name}
        year={currentYear}
      />
      <FAQModal faq={faq} />
    </>
  )
}
