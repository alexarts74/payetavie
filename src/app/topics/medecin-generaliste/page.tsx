import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReminders } from '@/app/actions/reminders'
import { getBookmarks } from '@/app/actions/bookmarks'
import { getDocuments } from '@/app/actions/documents'
import { getChecklistProgress } from '@/app/actions/checklists'
import RemindersSection from '@/components/RemindersSection'
import BookmarksSection from '@/components/BookmarksSection'
import DocumentsSection from '@/components/DocumentsSection'
import FAQModal from '@/components/FAQModal'
import { getPredefinedReminders } from '@/lib/predefined-reminders'
import ChecklistSection from '@/components/ChecklistSection'
import { Zap } from 'lucide-react'
import { getUserSubscription, getPlanLimits } from '@/lib/subscription'

export default async function MedecinGeneralistePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'medecin-generaliste'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Médecin généraliste',
    icon: '🏥',
    tldr: 'Le médecin généraliste (médecin traitant) est votre médecin de référence pour tous vos soins. Il coordonne votre parcours de santé, prescrit vos médicaments, peut vous orienter vers des spécialistes et suit votre dossier médical. La consultation est remboursée à 70% par la Sécurité sociale, le reste par votre mutuelle selon votre contrat.',
    checklist: [
      'Choisir un médecin traitant (libre choix)',
      'Déclarer votre médecin traitant sur ameli.fr ou en lui donnant le formulaire',
      'Prendre rendez-vous régulièrement (au moins une fois par an)',
      'Apporter votre carte Vitale et votre mutuelle',
      'Conserver vos ordonnances (3 mois de validité)',
      'Respecter les prescriptions et posologies',
      'Consulter en cas d\'urgence ou symptômes persistants',
      'Demander un renouvellement d\'ordonnance si besoin',
      'Vérifier vos remboursements sur votre compte Ameli'
    ],
    faq: [
      {
        question: 'Comment choisir un médecin traitant ?',
        answer: 'Vous pouvez choisir librement votre médecin traitant parmi les médecins généralistes (ou spécialistes dans certains cas). Renseignez-vous sur les médecins près de chez vous, vérifiez s\'ils acceptent de nouveaux patients. Déclarez-le ensuite à votre caisse d\'assurance maladie (en ligne sur ameli.fr ou en lui donnant le formulaire S3704).'
      },
      {
        question: 'Dois-je payer la consultation ?',
        answer: 'Si votre médecin est conventionné secteur 1, le tarif est de 25€. La Sécurité sociale rembourse 70% (17,50€), votre mutuelle rembourse le reste (30% = 7,50€) selon votre contrat. Si vous avez le tiers payant, vous ne payez rien directement.'
      },
      {
        question: 'Que faire en cas d\'urgence médicale ?',
        answer: 'En cas d\'urgence vitale, appelez le 15 (SAMU). Pour une urgence non vitale, consultez votre médecin traitant, un médecin de garde, ou allez aux urgences de l\'hôpital le plus proche. Vous pouvez aussi appeler le 116 117 pour joindre un médecin de garde.'
      },
      {
        question: 'Puis-je changer de médecin traitant ?',
        answer: 'Oui, vous pouvez changer de médecin traitant à tout moment. Il suffit de déclarer votre nouveau médecin traitant (en ligne sur ameli.fr ou en lui donnant le formulaire). Il n\'y a pas de limite au nombre de changements.'
      },
      {
        question: 'Combien de temps est valable une ordonnance ?',
        answer: 'Une ordonnance est valable 3 mois à compter de la date de prescription. Pour les médicaments à renouveler, la durée de validité peut être de 1 an maximum. Après cette date, vous devez retourner chez votre médecin pour un renouvellement.'
      }
    ],
    resources: [
      { name: 'Ameli - Trouver un médecin', url: 'https://www.ameli.fr/assure/sante/services-en-ligne/trouver-un-professionnel-de-sante' },
      { name: 'Déclarer un médecin traitant', url: 'https://www.ameli.fr/assure/droits-demarches/principes/medecin-traitant/declarer-votre-medecin-traitant' },
      { name: 'Tarifs des consultations', url: 'https://www.service-public.fr/particuliers/vosdroits/F1634' },
      { name: 'Urgences médicales - SAMU', url: 'https://www.service-public.fr/particuliers/vosdroits/F1647' },
      { name: 'Médecin de garde - 116 117', url: 'https://www.service-public.fr/particuliers/vosdroits/F1649' }
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR */}
        <div className="relative mb-8">
          <div className="relative bg-indigo-600 rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold">TL;DR</h2>
              </div>
              <p className="text-base leading-relaxed opacity-95">
                {topic.tldr}
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-8">
          <ChecklistSection items={topic.checklist} topicSlug={topicSlug} initialProgress={checklistProgress} />
        </div>

        {/* Reminders */}
        <div className="mb-8">
          <RemindersSection
            topicSlug={topicSlug}
            initialReminders={reminders || []}
            predefinedReminders={predefinedReminders}
            plan={plan}
            remindersCount={(reminders ?? []).filter(r => !r.completed).length}
            remindersLimit={limits.reminders}
          />
        </div>

        {/* Documents */}
        <div className="mb-8">
          <DocumentsSection topicSlug={topicSlug} initialDocuments={documents || []} plan={plan} documentsCount={(documents ?? []).length} documentsLimit={limits.documents} />
        </div>


        {/* Resources */}
        <BookmarksSection
          topicSlug={topicSlug}
          initialBookmarks={bookmarks || []}
          resources={topic.resources}
          plan={plan}
          bookmarksCount={(bookmarks ?? []).length}
          bookmarksLimit={limits.bookmarksPerTopic}
        />
      </div>

      {/* Modal FAQ */}
      <FAQModal faq={topic.faq} />
    </div>
  )
}
