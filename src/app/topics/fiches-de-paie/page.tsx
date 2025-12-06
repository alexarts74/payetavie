import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FichesDePaiePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topic = {
    title: 'Fiches de paie',
    icon: '💰',
    tldr: 'Comprendre son salaire net/brut, les cotisations sociales, les avantages en nature. Vérifier les anomalies, comprendre chaque ligne et savoir lire son bulletin de paie correctement.',
    checklist: [
      'Vérifier que vous recevez bien votre fiche de paie chaque mois',
      'Comprendre la différence entre salaire brut et net',
      'Identifier les cotisations sociales (sécurité sociale, chômage, retraite)',
      'Vérifier les heures travaillées et les heures supplémentaires',
      'Contrôler les congés payés et RTT',
      'Vérifier les avantages en nature (tickets restaurant, transport)',
      'Conserver toutes vos fiches de paie (obligatoire 5 ans)',
      'Signaler toute anomalie à votre employeur',
      'Vérifier le montant des cotisations retraite'
    ],
    faq: [
      {
        question: 'Quelle est la différence entre salaire brut et net ?',
        answer: 'Le salaire brut est votre salaire avant déduction des cotisations sociales. Le salaire net est ce que vous recevez réellement après déduction de toutes les cotisations (environ 23% de cotisations en moyenne).'
      },
      {
        question: 'Que sont les cotisations sociales ?',
        answer: 'Ce sont des prélèvements obligatoires : sécurité sociale (maladie, famille), assurance chômage, retraite complémentaire, prévoyance. Elles financent votre protection sociale.'
      },
      {
        question: 'Dois-je conserver mes fiches de paie ?',
        answer: 'Oui, vous devez conserver vos fiches de paie pendant 5 ans minimum. Elles sont nécessaires pour vos déclarations d\'impôts, votre retraite, et en cas de litige.'
      },
      {
        question: 'Que faire en cas d\'erreur sur ma fiche de paie ?',
        answer: 'Contactez immédiatement votre service RH ou votre employeur. Les erreurs peuvent concerner les heures, le salaire, les cotisations. Gardez une trace écrite de votre réclamation.'
      },
      {
        question: 'Qu\'est-ce qu\'un avantage en nature ?',
        answer: 'C\'est un avantage non monétaire : tickets restaurant, voiture de fonction, logement, etc. Il est soumis à cotisations et apparaît sur votre fiche de paie.'
      }
    ],
    resources: [
      { name: 'Service-Public - Fiche de paie', url: 'https://www.service-public.fr/particuliers/vosdroits/F2352' },
      { name: 'Lire sa fiche de paie', url: 'https://www.service-public.fr/particuliers/vosdroits/F2353' },
      { name: 'URSSAF - Comprendre sa fiche de paie', url: 'https://www.urssaf.fr/portail/home/employeur/calculer-et-declarer/les-salaries/comprendre-la-fiche-de-paie.html' },
      { name: 'Calculer son salaire net', url: 'https://www.service-public.fr/particuliers/vosdroits/F2354' },
      { name: 'Conservation des documents', url: 'https://www.service-public.fr/particuliers/vosdroits/F2355' }
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

