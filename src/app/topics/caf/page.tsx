import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReminders } from '@/app/actions/reminders'
import { getBookmarks } from '@/app/actions/bookmarks'
import { getDocuments } from '@/app/actions/documents'
import RemindersSection from '@/components/RemindersSection'
import BookmarksSection from '@/components/BookmarksSection'
import DocumentsSection from '@/components/DocumentsSection'
import FAQModal from '@/components/FAQModal'
import { getPredefinedReminders } from '@/lib/predefined-reminders'
import { Zap, CheckCircle2 } from 'lucide-react'

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
  const predefinedReminders = getPredefinedReminders(topicSlug)

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
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">TL;DR</h2>
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
          />
        </div>

        {/* Section Documents */}
        <div className="mb-8">
          <DocumentsSection topicSlug={topicSlug} initialDocuments={documents} />
        </div>

        {/* Checklist */}
        <div className="mb-8">
          <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {topic.checklist.map((item, index) => (
                <div key={index} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-blue-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <span className="text-white font-semibold text-xs">{index + 1}</span>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed flex-1 pt-0.5 group-hover:text-zinc-900 transition-colors">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <BookmarksSection
          topicSlug={topicSlug}
          initialBookmarks={bookmarks}
          resources={topic.resources}
        />
      </div>

      {/* Modal FAQ */}
      <FAQModal faq={topic.faq} />
    </div>
  )
}

