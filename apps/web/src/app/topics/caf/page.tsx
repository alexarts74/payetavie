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

export default async function CAFPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'caf'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'CAF / Aides',
    icon: '🤝',
    tldr: 'Les allocations logement, RSA, aides familiales sont gérées par la CAF. Connaître vos droits selon votre situation, faire les demandes en ligne et respecter les échéances pour continuer à percevoir vos aides.',
    checklist: [
      'Créer votre compte sur caf.fr',
      'Vérifier vos droits selon votre situation (revenus, composition familiale)',
      'Faire une demande d\'allocation logement si éligible',
      'Demander le RSA si vos revenus sont insuffisants',
      'Déclarer vos ressources tous les 3 mois (obligatoire)',
      'Déclarer tout changement de situation (déménagement, revenus, famille)',
      'Consulter votre espace personnel régulièrement',
      'Répondre aux demandes de justificatifs dans les délais',
      'Vérifier vos paiements sur votre compte bancaire'
    ],
    faq: [
      {
        question: 'Quelles aides puis-je obtenir de la CAF ?',
        answer: 'Selon votre situation : allocation logement (APL, ALF, ALS), RSA, allocations familiales, prime d\'activité, aide au logement étudiant, etc. Utilisez le simulateur sur caf.fr pour connaître vos droits.'
      },
      {
        question: 'Comment faire une demande d\'aide ?',
        answer: 'Connectez-vous sur caf.fr avec votre compte, remplissez le formulaire de demande en ligne, joignez les justificatifs demandés. La CAF étudie votre dossier sous 1 à 2 mois.'
      },
      {
        question: 'Dois-je déclarer mes ressources ?',
        answer: 'Oui, tous les 3 mois vous devez déclarer vos ressources (salaires, allocations, etc.) sur votre espace caf.fr. C\'est obligatoire pour continuer à percevoir vos aides.'
      },
      {
        question: 'Que faire en cas de changement de situation ?',
        answer: 'Déclarez immédiatement tout changement : déménagement, changement de revenus, naissance, séparation, etc. Cela peut modifier vos droits aux aides.'
      },
      {
        question: 'Comment contester une décision de la CAF ?',
        answer: 'Vous pouvez faire un recours gracieux dans les 2 mois, puis un recours contentieux. Contactez d\'abord votre CAF pour comprendre la décision.'
      }
    ],
    resources: [
      { name: 'Site officiel CAF', url: 'https://www.caf.fr' },
      { name: 'Simulateur de droits', url: 'https://www.caf.fr/aides-et-services/les-aides-et-services/simulateurs' },
      { name: 'Allocation logement', url: 'https://www.caf.fr/aides-et-services/les-aides-et-services/aides-au-logement' },
      { name: 'RSA', url: 'https://www.caf.fr/aides-et-services/les-aides-et-services/rsa-revenu-de-solidarite-active' },
      { name: 'Déclarer ses ressources', url: 'https://www.caf.fr/aides-et-services/les-aides-et-services/declarer-ses-ressources' }
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

