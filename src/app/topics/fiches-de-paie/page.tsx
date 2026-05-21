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

export default async function FichesDePaiePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'fiches-de-paie'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Fiches de paie',
    icon: '💰',
    tldr: 'Comprendre son salaire net/brut, les cotisations sociales, les avantages en nature. Vérifier les anomalies, comprendre chaque ligne et savoir lire son bulletin de paie correctement.',
    checklist: [
      'Vérifier que vous recevez bien votre fiche de paie chaque mois',
      'Comprendre la différence entre salaire brut et net',
      'Identifier les cotisations sociales (sécurité sociale, chômage, retraite)',
      'Vérifier les heures travaillées et les heures supplémentaires',
      'Contrôler les congés payés et RTT',
      'Vérifier les avantages en nature (tickets restaurant, transport)',
      'Conserver toutes vos fiches de paie (obligatoire 5 ans)',
      'Signaler toute anomalie à votre employeur',
      'Vérifier le montant des cotisations retraite'
    ],
    faq: [
      {
        question: 'Quelle est la différence entre salaire brut et net ?',
        answer: 'Le salaire brut est votre salaire avant déduction des cotisations sociales. Le salaire net est ce que vous recevez réellement après déduction de toutes les cotisations (environ 23% de cotisations en moyenne).'
      },
      {
        question: 'Que sont les cotisations sociales ?',
        answer: 'Ce sont des prélèvements obligatoires : sécurité sociale (maladie, famille), assurance chômage, retraite complémentaire, prévoyance. Elles financent votre protection sociale.'
      },
      {
        question: 'Dois-je conserver mes fiches de paie ?',
        answer: 'Oui, vous devez conserver vos fiches de paie pendant 5 ans minimum. Elles sont nécessaires pour vos déclarations d\'impôts, votre retraite, et en cas de litige.'
      },
      {
        question: 'Que faire en cas d\'erreur sur ma fiche de paie ?',
        answer: 'Contactez immédiatement votre service RH ou votre employeur. Les erreurs peuvent concerner les heures, le salaire, les cotisations. Gardez une trace écrite de votre réclamation.'
      },
      {
        question: 'Qu\'est-ce qu\'un avantage en nature ?',
        answer: 'C\'est un avantage non monétaire : tickets restaurant, voiture de fonction, logement, etc. Il est soumis à cotisations et apparaît sur votre fiche de paie.'
      }
    ],
    resources: [
      { name: 'Service-Public - Fiche de paie', url: 'https://www.service-public.fr/particuliers/vosdroits/F2352' },
      { name: 'Lire sa fiche de paie', url: 'https://www.service-public.fr/particuliers/vosdroits/F2353' },
      { name: 'URSSAF - Comprendre sa fiche de paie', url: 'https://www.urssaf.fr/portail/home/employeur/calculer-et-declarer/les-salaries/comprendre-la-fiche-de-paie.html' },
      { name: 'Calculer son salaire net', url: 'https://www.service-public.fr/particuliers/vosdroits/F2354' },
      { name: 'Conservation des documents', url: 'https://www.service-public.fr/particuliers/vosdroits/F2355' }
    ]
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/20 mb-3">
            <span className="text-sm">{topic.icon}</span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Sujet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{topic.title}</h1>
        </div>

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

