import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AssurancesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topic = {
    title: 'Assurances',
    icon: '🛡️',
    tldr: 'Assurance auto (obligatoire), habitation (obligatoire pour locataires), responsabilité civile, santé. Comprendre vos obligations, bien choisir vos garanties, résilier et gérer un sinistre.',
    checklist: [
      'Souscrire une assurance auto (obligatoire)',
      'Souscrire une assurance habitation (obligatoire si locataire)',
      'Vérifier votre responsabilité civile (souvent incluse)',
      'Comparer les offres avant de souscrire',
      'Comprendre les garanties et franchises',
      'Conserver tous vos contrats d\'assurance',
      'Déclarer un sinistre dans les délais',
      'Savoir comment résilier (tous les ans)',
      'Vérifier vos garanties avant de voyager'
    ],
    faq: [
      {
        question: 'Quelles assurances sont obligatoires ?',
        answer: 'L\'assurance auto (responsabilité civile) est obligatoire pour tous les véhicules. L\'assurance habitation est obligatoire pour les locataires. La responsabilité civile est souvent incluse dans l\'assurance habitation.'
      },
      {
        question: 'Comment résilier mon assurance ?',
        answer: 'Vous pouvez résilier votre assurance chaque année à l\'échéance (1 mois avant). Envoyez une lettre recommandée avec AR. Vous pouvez aussi résilier en cas de changement de situation (vente de véhicule, déménagement, etc.).'
      },
      {
        question: 'Que faire en cas de sinistre ?',
        answer: 'Déclarez le sinistre rapidement (souvent dans les 5 jours ouvrés). Remplissez la déclaration, joignez les justificatifs (photos, factures, constat amiable). Conservez tous les documents.'
      },
      {
        question: 'Qu\'est-ce qu\'une franchise ?',
        answer: 'C\'est le montant que vous devez payer vous-même en cas de sinistre avant que l\'assurance ne prenne le relais. Plus la franchise est élevée, plus la prime est basse.'
      },
      {
        question: 'Dois-je assurer mon véhicule si je ne l\'utilise pas ?',
        answer: 'Oui, même si votre véhicule est à l\'arrêt, vous devez maintenir au minimum l\'assurance responsabilité civile. Vous pouvez opter pour une assurance "au garage" moins chère.'
      }
    ],
    resources: [
      { name: 'Service-Public - Assurances', url: 'https://www.service-public.fr/particuliers/vosdroits/F2006' },
      { name: 'Assurance auto obligatoire', url: 'https://www.service-public.fr/particuliers/vosdroits/F2007' },
      { name: 'Résiliation assurance', url: 'https://www.service-public.fr/particuliers/vosdroits/F2008' },
      { name: 'Déclarer un sinistre', url: 'https://www.service-public.fr/particuliers/vosdroits/F2009' },
      { name: 'Comparateur assurances', url: 'https://www.lelynx.fr' }
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

