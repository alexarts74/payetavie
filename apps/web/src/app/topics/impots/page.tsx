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

export default async function ImpotsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'impots'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Impôts',
    icon: '📊',
    tldr: 'L\'impôt sur le revenu est déclaré chaque année entre avril et juin. Le prélèvement à la source permet de payer l\'impôt au fur et à mesure. Les erreurs fréquentes : oublier des revenus, ne pas déclarer les changements de situation, mal remplir le formulaire.',
    checklist: [
      'Récupérer tous vos justificatifs (fiches de paie, revenus fonciers, etc.)',
      'Vérifier votre situation familiale (mariage, pacs, enfants)',
      'Accéder à votre espace impots.gouv.fr',
      'Remplir la déclaration en ligne avant le 31 mai (ou 8 juin en ligne)',
      'Vérifier le montant calculé automatiquement',
      'Valider et envoyer la déclaration',
      'Conserver l\'accusé de réception',
      'Vérifier votre avis d\'imposition (reçu en août/septembre)',
      'Contrôler les prélèvements à la source pour l\'année suivante'
    ],
    faq: [
      {
        question: 'Quand dois-je déclarer mes impôts ?',
        answer: 'La déclaration se fait généralement entre avril et juin. La date limite est le 31 mai pour le papier et le 8 juin pour la déclaration en ligne.'
      },
      {
        question: 'Comment réduire mes impôts ?',
        answer: 'Vous pouvez réduire vos impôts grâce aux réductions d\'impôts (dons, investissements locatifs, etc.) et aux crédits d\'impôts (emploi à domicile, transition énergétique, etc.).'
      },
      {
        question: 'Qu\'est-ce que le prélèvement à la source ?',
        answer: 'Le prélèvement à la source permet de payer l\'impôt au fur et à mesure de la perception des revenus, plutôt qu\'en une seule fois l\'année suivante.'
      },
      {
        question: 'Que faire si je me suis trompé dans ma déclaration ?',
        answer: 'Vous pouvez corriger votre déclaration en ligne jusqu\'à la fin de l\'année. Connectez-vous à votre espace et utilisez la fonction "Modifier ma déclaration".'
      },
      {
        question: 'Dois-je déclarer tous mes revenus ?',
        answer: 'Oui, vous devez déclarer tous vos revenus : salaires, revenus fonciers, revenus de capitaux mobiliers, plus-values, etc. L\'omission volontaire est passible de pénalités.'
      }
    ],
    resources: [
      { name: 'Site officiel des impôts', url: 'https://www.impots.gouv.fr' },
      { name: 'Espace particulier impots.gouv.fr', url: 'https://www.impots.gouv.fr/portail' },
      { name: 'Simulateur de calcul d\'impôt', url: 'https://www.impots.gouv.fr/portail/outils/simulateurs' },
      { name: 'Calendrier fiscal', url: 'https://www.impots.gouv.fr/portail/particulier/calendrier-fiscal' },
      { name: 'Guide de la déclaration en ligne', url: 'https://www.impots.gouv.fr/portail/particulier/declarer-ses-revenus' }
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

        {/* Hero TL;DR avec éléments flottants */}
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

        {/* Section Rappels - En premier car plus important */}
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

        {/* Resources Section avec favoris */}
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

