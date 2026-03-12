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

export default async function LogementPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'logement'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Logement',
    icon: '🏠',
    tldr: 'Comprendre le bail, le dépôt de garantie, les charges, l\'assurance habitation. Connaître vos droits en tant que locataire ou propriétaire, et les démarches pour louer ou quitter un logement.',
    checklist: [
      'Lire attentivement le bail avant de signer',
      'Vérifier l\'état des lieux d\'entrée (photos recommandées)',
      'Comprendre le dépôt de garantie (maximum 1 mois de loyer)',
      'Souscrire une assurance habitation (obligatoire)',
      'Comprendre les charges (eau, électricité, charges de copropriété)',
      'Connaître les délais de préavis pour quitter le logement',
      'Faire l\'état des lieux de sortie',
      'Récupérer votre dépôt de garantie dans les délais',
      'Déclarer votre changement d\'adresse'
    ],
    faq: [
      {
        question: 'Qu\'est-ce que le dépôt de garantie ?',
        answer: 'C\'est une somme versée au propriétaire lors de la signature du bail (maximum 1 mois de loyer hors charges). Il sert à couvrir d\'éventuels dommages. Il doit être restitué dans les 2 mois après l\'état des lieux de sortie.'
      },
      {
        question: 'L\'assurance habitation est-elle obligatoire ?',
        answer: 'Oui, l\'assurance habitation (multirisque) est obligatoire pour tous les locataires. Elle couvre les dommages causés au logement et aux biens des voisins.'
      },
      {
        question: 'Comment quitter mon logement ?',
        answer: 'Vous devez respecter un préavis (1 mois pour une location vide, 3 mois pour un meublé). Envoyez une lettre recommandée avec AR. Faites l\'état des lieux de sortie avec le propriétaire.'
      },
      {
        question: 'Que faire si le propriétaire refuse de rendre le dépôt de garantie ?',
        answer: 'Le propriétaire doit justifier les retenues. En cas de litige, contactez l\'ADIL (Agence Départementale d\'Information sur le Logement) ou saisissez le conciliateur de justice.'
      },
      {
        question: 'Quelles sont mes obligations en tant que locataire ?',
        answer: 'Payer le loyer et les charges, entretenir le logement, effectuer les petites réparations, souscrire une assurance, informer le propriétaire de tout problème, respecter le voisinage.'
      }
    ],
    resources: [
      { name: 'Service-Public - Logement', url: 'https://www.service-public.fr/particuliers/vosdroits/N19839' },
      { name: 'ADIL - Agence Logement', url: 'https://www.anil.org' },
      { name: 'Dépôt de garantie', url: 'https://www.service-public.fr/particuliers/vosdroits/F2000' },
      { name: 'Assurance habitation', url: 'https://www.service-public.fr/particuliers/vosdroits/F2001' },
      { name: 'Résiliation bail', url: 'https://www.service-public.fr/particuliers/vosdroits/F2002' }
    ]
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
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

        {/* Section Rappels */}
        <div className="mb-8">
          <RemindersSection
            topicSlug={topicSlug}
            initialReminders={reminders}
            predefinedReminders={predefinedReminders}
            plan={plan}
            remindersCount={(reminders ?? []).filter(r => !r.completed).length}
            remindersLimit={limits.reminders}
          />
        </div>

        {/* Section Documents */}
        <div className="mb-8">
          <DocumentsSection topicSlug={topicSlug} initialDocuments={documents} plan={plan} documentsCount={(documents ?? []).length} documentsLimit={limits.documents} />
        </div>


        {/* Checklist */}
        <div className="mb-8">
          <ChecklistSection items={topic.checklist} topicSlug={topicSlug} initialProgress={checklistProgress} />
        </div>

        {/* Resources Section */}
        <BookmarksSection
          topicSlug={topicSlug}
          initialBookmarks={bookmarks}
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

