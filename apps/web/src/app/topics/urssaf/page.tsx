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

export default async function URSSAFPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'urssaf'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'URSSAF / Cotisations sociales',
    icon: '💼',
    tldr: 'Pour les indépendants, micro-entrepreneurs et freelances. Vous devez déclarer vos revenus et payer vos cotisations sociales chaque mois ou trimestre. Des aides et exonérations sont possibles selon votre situation.',
    checklist: [
      'S\'inscrire en tant que micro-entrepreneur ou auto-entrepreneur',
      'Choisir votre régime (micro-fiscal, réel simplifié, réel normal)',
      'Déclarer vos revenus mensuellement ou trimestriellement',
      'Payer vos cotisations sociales (URSSAF)',
      'Vérifier vos droits aux aides (ACRE, exonération de début d\'activité)',
      'Tenir un livre de recettes si micro-entrepreneur',
      'Conserver tous vos justificatifs de revenus',
      'Déclarer votre chiffre d\'affaires avant la date limite',
      'Vérifier votre taux de cotisations selon votre activité'
    ],
    faq: [
      {
        question: 'Quand dois-je déclarer mes revenus à l\'URSSAF ?',
        answer: 'En tant que micro-entrepreneur, vous déclarez mensuellement ou trimestriellement. Les dates limites varient selon votre choix : avant le dernier jour du mois suivant pour la déclaration mensuelle.'
      },
      {
        question: 'Quelles aides puis-je obtenir ?',
        answer: 'L\'ACRE (Aide à la Création ou Reprise d\'Entreprise) permet une exonération partielle de cotisations la première année. Des exonérations sont aussi possibles selon votre zone géographique (ZRR, quartiers prioritaires).'
      },
      {
        question: 'Comment calculer mes cotisations ?',
        answer: 'Les cotisations varient selon votre activité : 12,8% pour les ventes, 22% pour les prestations de services, 22% pour les activités libérales. Le calcul se fait sur votre chiffre d\'affaires déclaré.'
      },
      {
        question: 'Que faire si je ne peux pas payer mes cotisations ?',
        answer: 'Contactez l\'URSSAF rapidement pour demander un échelonnement ou un report. Des solutions existent pour éviter les majorations de retard.'
      },
      {
        question: 'Quelle est la différence entre micro-entrepreneur et auto-entrepreneur ?',
        answer: 'C\'est la même chose ! Le terme "auto-entrepreneur" a été remplacé par "micro-entrepreneur" en 2016, mais les deux désignent le même régime simplifié.'
      }
    ],
    resources: [
      { name: 'Site officiel URSSAF', url: 'https://www.urssaf.fr' },
      { name: 'Espace auto-entrepreneur', url: 'https://www.autoentrepreneur.urssaf.fr' },
      { name: 'Simulateur de cotisations', url: 'https://www.autoentrepreneur.urssaf.fr/portail/accueil/simulateur.html' },
      { name: 'Déclarer en ligne', url: 'https://www.autoentrepreneur.urssaf.fr/portail/accueil/declarer-et-payer.html' },
      { name: 'Guide ACRE', url: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F23547' }
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

