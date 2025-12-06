import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BanquePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

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
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold">TL;DR</h2>
              </div>
              <p className="text-base leading-relaxed opacity-95">
                {topic.tldr}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="relative">
            <div className="sticky top-8">
              <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
                </div>
                <div className="space-y-2">
                  {topic.checklist.map((item, index) => (
                    <div key={index} className="group flex items-start gap-3 p-3 rounded-[1.25rem] hover:bg-blue-50 transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <span className="text-white font-semibold text-xs">{index + 1}</span>
                      </div>
                      <p className="text-zinc-600 text-sm leading-relaxed flex-1 pt-1.5 group-hover:text-zinc-900 transition-colors">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900">FAQ</h2>
              </div>
              <div className="space-y-3">
                {topic.faq.map((item, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-[1.25rem] border border-blue-100 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-base font-semibold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.question}
                    </h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900">Ressources officielles</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {topic.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  {resource.name}
                </span>
                <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

