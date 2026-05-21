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

export default async function AnalysesMedicalesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'analyses-medicales'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Analyses médicales',
    icon: '🧪',
    tldr: 'Les analyses médicales (prise de sang, urines, etc.) sont prescrites par votre médecin pour diagnostiquer ou suivre une maladie. Elles sont remboursées par la Sécurité sociale si prescrites. Les résultats sont disponibles sous 24-48h, en ligne ou au laboratoire. Conservez vos résultats, ils font partie de votre dossier médical.',
    checklist: [
      'Obtenir une ordonnance de votre médecin',
      'Prendre rendez-vous au laboratoire (souvent sans RDV pour prises de sang)',
      'Respecter les consignes (être à jeun si demandé)',
      'Apporter votre carte Vitale et votre mutuelle',
      'Consulter vos résultats (en ligne ou au laboratoire)',
      'Conserver vos résultats dans votre dossier médical',
      'Prendre rendez-vous avec votre médecin pour les interpréter',
      'Respecter les recommandations et traitements si besoin'
    ],
    faq: [
      {
        question: 'Comment consulter mes résultats d\'analyses ?',
        answer: 'Les résultats sont généralement disponibles sous 24-48h. Vous pouvez les consulter en ligne sur le site du laboratoire (avec vos identifiants), les récupérer au laboratoire, ou les recevoir par email/lettre selon le laboratoire. Certains laboratoires envoient aussi les résultats à votre médecin directement.'
      },
      {
        question: 'Dois-je être à jeun pour une prise de sang ?',
        answer: 'Cela dépend des analyses demandées. Pour la glycémie, le cholestérol, les triglycérides, il faut être à jeun (ne rien manger ni boire sauf de l\'eau depuis 12h). Vérifiez les consignes sur votre ordonnance ou demandez au laboratoire.'
      },
      {
        question: 'Comment sont remboursées les analyses ?',
        answer: 'Les analyses prescrites par un médecin sont remboursées à 60% par la Sécurité sociale, puis complétées par votre mutuelle selon votre contrat. Avec le tiers payant, vous ne payez que la part non remboursée. Certaines analyses sont remboursées à 100% (grossesse, dépistage).'
      },
      {
        question: 'Combien de temps conserver les résultats ?',
        answer: 'Conservez tous vos résultats d\'analyses dans votre dossier médical personnel. Ils sont utiles pour le suivi de votre santé, les comparaisons au fil du temps, et pour les médecins. Vous pouvez les conserver indéfiniment, de préférence classés par date.'
      },
      {
        question: 'Puis-je faire des analyses sans ordonnance ?',
        answer: 'Oui, vous pouvez faire certaines analyses sans ordonnance (prises de sang classiques), mais elles ne seront pas remboursées. Pour les analyses remboursées, une ordonnance médicale est obligatoire.'
      }
    ],
    resources: [
      { name: 'Ameli - Analyses biologiques', url: 'https://www.ameli.fr/assure/remboursements/rembourse/analyses-biologiques' },
      { name: 'À jeun ou pas pour une prise de sang ?', url: 'https://www.service-public.fr/particuliers/vosdroits/F33995' },
      { name: 'Comprendre ses analyses', url: 'https://www.ameli.fr/assure/sante/themes/analyses-medicales' },
      { name: 'Tiers payant analyses', url: 'https://www.ameli.fr/assure/remboursements/etre-bien-rembourse/le-tiers-payant' }
    ],
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
