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
  const predefinedReminders = getPredefinedReminders(topicSlug)

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

