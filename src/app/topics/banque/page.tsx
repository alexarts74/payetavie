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

export default async function BanquePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'banque'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

  const topic = {
    title: 'Banque / Finances',
    icon: '🏦',
    tldr: 'Ouvrir un compte, gérer son budget, comprendre les frais bancaires, les prêts et l\'épargne. Éviter les frais inutiles et bien choisir ses produits bancaires selon ses besoins.',
    checklist: [
      'Ouvrir un compte bancaire (droit au compte)',
      'Comprendre les frais bancaires (tenue de compte, virements, etc.)',
      'Choisir une carte bancaire adaptée à vos besoins',
      'Mettre en place un budget mensuel',
      'Comprendre les différents types de comptes (courant, épargne, PEL, etc.)',
      'Comparer les offres bancaires avant de souscrire',
      'Surveiller vos relevés bancaires régulièrement',
      'Éviter les découverts et leurs frais',
      'Comprendre les prêts (immobilier, consommation) avant de signer'
    ],
    faq: [
      {
        question: 'Comment ouvrir un compte bancaire ?',
        answer: 'Vous pouvez ouvrir un compte dans n\'importe quelle banque en présentant une pièce d\'identité, un justificatif de domicile et un RIB. Si une banque refuse, vous avez droit au "droit au compte" via la Banque de France.'
      },
      {
        question: 'Quels sont les frais bancaires à éviter ?',
        answer: 'Les frais de tenue de compte, les frais de virement, les frais de découvert, les frais de carte. Comparez les tarifs et négociez avec votre banque. Les banques en ligne proposent souvent moins de frais.'
      },
      {
        question: 'Comment gérer mon budget ?',
        answer: 'Notez vos revenus et dépenses, catégorisez vos dépenses (fixes, variables), utilisez une application de budget, mettez en place des virements automatiques pour l\'épargne.'
      },
      {
        question: 'Qu\'est-ce qu\'un découvert autorisé ?',
        answer: 'C\'est une autorisation de la banque de laisser votre compte en négatif jusqu\'à un montant défini. Il génère des agios (intérêts). Mieux vaut l\'éviter ou le limiter au strict nécessaire.'
      },
      {
        question: 'Comment comparer les offres de prêt ?',
        answer: 'Comparez le TAEG (Taux Annuel Effectif Global) qui inclut tous les frais, la durée, les mensualités, les assurances. Utilisez un comparateur en ligne et négociez avec plusieurs banques.'
      }
    ],
    resources: [
      { name: 'Service-Public - Banque', url: 'https://www.service-public.fr/particuliers/vosdroits/N20100' },
      { name: 'Droit au compte', url: 'https://www.service-public.fr/particuliers/vosdroits/F2003' },
      { name: 'Frais bancaires', url: 'https://www.service-public.fr/particuliers/vosdroits/F2004' },
      { name: 'Comparateur banques', url: 'https://www.quechoisir.org/comparateur-banque' },
      { name: 'Gérer son budget', url: 'https://www.service-public.fr/particuliers/vosdroits/F2005' }
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

