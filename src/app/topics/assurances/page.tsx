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

export default async function AssurancesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'assurances'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Assurances',
    icon: '🛡️',
    tldr: 'Assurance auto (obligatoire), habitation (obligatoire pour locataires), responsabilité civile, santé. Comprendre vos obligations, bien choisir vos garanties, résilier et gérer un sinistre.',
    checklist: [
      'Souscrire une assurance auto (obligatoire)',
      'Souscrire une assurance habitation (obligatoire si locataire)',
      'Vérifier votre responsabilité civile (souvent incluse)',
      'Comparer les offres avant de souscrire',
      'Comprendre les garanties et franchises',
      'Conserver tous vos contrats d\'assurance',
      'Déclarer un sinistre dans les délais',
      'Savoir comment résilier (tous les ans)',
      'Vérifier vos garanties avant de voyager'
    ],
    faq: [
      {
        question: 'Quelles assurances sont obligatoires ?',
        answer: 'L\'assurance auto (responsabilité civile) est obligatoire pour tous les véhicules. L\'assurance habitation est obligatoire pour les locataires. La responsabilité civile est souvent incluse dans l\'assurance habitation.'
      },
      {
        question: 'Comment résilier mon assurance ?',
        answer: 'Vous pouvez résilier votre assurance chaque année à l\'échéance (1 mois avant). Envoyez une lettre recommandée avec AR. Vous pouvez aussi résilier en cas de changement de situation (vente de véhicule, déménagement, etc.).'
      },
      {
        question: 'Que faire en cas de sinistre ?',
        answer: 'Déclarez le sinistre rapidement (souvent dans les 5 jours ouvrés). Remplissez la déclaration, joignez les justificatifs (photos, factures, constat amiable). Conservez tous les documents.'
      },
      {
        question: 'Qu\'est-ce qu\'une franchise ?',
        answer: 'C\'est le montant que vous devez payer vous-même en cas de sinistre avant que l\'assurance ne prenne le relais. Plus la franchise est élevée, plus la prime est basse.'
      },
      {
        question: 'Dois-je assurer mon véhicule si je ne l\'utilise pas ?',
        answer: 'Oui, même si votre véhicule est à l\'arrêt, vous devez maintenir au minimum l\'assurance responsabilité civile. Vous pouvez opter pour une assurance "au garage" moins chère.'
      }
    ],
    resources: [
      { name: 'Service-Public - Assurances', url: 'https://www.service-public.fr/particuliers/vosdroits/F2006' },
      { name: 'Assurance auto obligatoire', url: 'https://www.service-public.fr/particuliers/vosdroits/F2007' },
      { name: 'Résiliation assurance', url: 'https://www.service-public.fr/particuliers/vosdroits/F2008' },
      { name: 'Déclarer un sinistre', url: 'https://www.service-public.fr/particuliers/vosdroits/F2009' },
      { name: 'Comparateur assurances', url: 'https://www.lelynx.fr' }
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

