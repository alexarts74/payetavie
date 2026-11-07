import { getClients } from '@/app/actions/clients'
import ClientsPageContent from '@/components/ClientsPageContent'
import FAQModal from '@/components/FAQModal'

const faq = [
  {
    question: 'Comment ajouter un nouveau client ?',
    answer: 'Cliquez sur le bouton "Nouveau client" en haut de la page. Remplissez les informations du client (nom, email, adresse, SIRET...) puis validez. Le client sera disponible pour vos factures et devis.',
  },
  {
    question: 'Puis-je desactiver un client sans le supprimer ?',
    answer: 'Oui, ouvrez la fiche du client et cliquez sur "Desactiver". Le client ne sera plus propose lors de la creation de factures ou devis, mais son historique est conserve.',
  },
  {
    question: 'Comment retrouver les factures d\'un client ?',
    answer: 'Ouvrez la fiche du client en cliquant dessus. Vous y trouverez la liste de toutes ses factures et devis, ainsi que les statistiques de facturation.',
  },
  {
    question: 'Quelles informations sont obligatoires pour un client ?',
    answer: 'Seul le nom de l\'entreprise (ou du client) est obligatoire. Les autres champs (email, adresse, SIRET, conditions de paiement) sont optionnels mais recommandes pour generer des factures completes.',
  },
]

export default async function ClientsPage() {
  const { data: clients } = await getClients()

  return (
    <>
      <ClientsPageContent initialClients={clients} />
      <FAQModal faq={faq} />
    </>
  )
}
