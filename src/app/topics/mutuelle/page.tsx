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

export default async function MutuellePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'mutuelle'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Mutuelle / Santé',
    icon: '🏥',
    tldr: 'La complémentaire santé est obligatoire pour tous. Elle rembourse les frais de santé non couverts par la Sécurité sociale. Vous pouvez comparer les offres, changer de mutuelle et résilier selon certaines conditions.',
    checklist: [
      'Vérifier si vous avez déjà une mutuelle (entreprise, conjoint)',
      'Comparer les garanties et tarifs sur un comparateur',
      'Vérifier les taux de remboursement (optique, dentaire, hospitalisation)',
      'Choisir une mutuelle adaptée à vos besoins',
      'Souscrire en ligne ou par téléphone',
      'Conserver votre attestation de mutuelle',
      'Comprendre les délais de carence',
      'Savoir comment résilier (tous les ans au 1er décembre)',
      'Vérifier les remboursements sur votre compte mutuelle'
    ],
    faq: [
      {
        question: 'La mutuelle est-elle obligatoire ?',
        answer: 'Oui, depuis 2016, tous les salariés doivent avoir une complémentaire santé. Elle peut être fournie par l\'employeur ou souscrite individuellement.'
      },
      {
        question: 'Comment comparer les mutuelles ?',
        answer: 'Utilisez un comparateur en ligne (Santéclair, LeLynx, etc.) en comparant les garanties (optique, dentaire, hospitalisation) et les tarifs. Attention aux garanties minimales obligatoires.'
      },
      {
        question: 'Quand puis-je résilier ma mutuelle ?',
        answer: 'Vous pouvez résilier chaque année au 1er décembre (avec préavis d\'un mois). Vous pouvez aussi résilier en cas de changement de situation (déménagement, perte d\'emploi, etc.).'
      },
      {
        question: 'Qu\'est-ce qu\'un délai de carence ?',
        answer: 'C\'est une période pendant laquelle certains remboursements ne sont pas pris en charge (souvent 3 mois pour l\'optique, 6 mois pour le dentaire). Vérifiez ces délais avant de souscrire.'
      },
      {
        question: 'Comment sont calculés les remboursements ?',
        answer: 'La Sécurité sociale rembourse d\'abord (ex: 70% pour une consultation), puis votre mutuelle complète selon votre contrat. Le reste à charge dépend de votre niveau de garantie.'
      }
    ],
    resources: [
      { name: 'Ameli - Complémentaire santé', url: 'https://www.ameli.fr/assure/droits-demarches/principes/complementaire-sante' },
      { name: 'Comparateur mutuelles', url: 'https://www.lelynx.fr/complementaire-sante/' },
      { name: 'Résiliation mutuelle', url: 'https://www.service-public.fr/particuliers/vosdroits/F34009' },
      { name: 'Garanties obligatoires', url: 'https://www.service-public.fr/particuliers/vosdroits/F34010' },
      { name: 'Changer de mutuelle', url: 'https://www.ameli.fr/assure/droits-demarches/principes/complementaire-sante/changer-complementaire-sante' }
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

