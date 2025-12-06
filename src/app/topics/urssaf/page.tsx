import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function URSSAFPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topic = {
    title: 'URSSAF / Cotisations sociales',
    icon: '💼',
    tldr: 'Pour les indépendants, micro-entrepreneurs et freelances. Vous devez déclarer vos revenus et payer vos cotisations sociales chaque mois ou trimestre. Des aides et exonérations sont possibles selon votre situation.',
    checklist: [
      'S\'inscrire en tant que micro-entrepreneur ou auto-entrepreneur',
      'Choisir votre régime (micro-fiscal, réel simplifié, réel normal)',
      'Déclarer vos revenus mensuellement ou trimestriellement',
      'Payer vos cotisations sociales (URSSAF)',
      'Vérifier vos droits aux aides (ACRE, exonération de début d\'activité)',
      'Tenir un livre de recettes si micro-entrepreneur',
      'Conserver tous vos justificatifs de revenus',
      'Déclarer votre chiffre d\'affaires avant la date limite',
      'Vérifier votre taux de cotisations selon votre activité'
    ],
    faq: [
      {
        question: 'Quand dois-je déclarer mes revenus à l\'URSSAF ?',
        answer: 'En tant que micro-entrepreneur, vous déclarez mensuellement ou trimestriellement. Les dates limites varient selon votre choix : avant le dernier jour du mois suivant pour la déclaration mensuelle.'
      },
      {
        question: 'Quelles aides puis-je obtenir ?',
        answer: 'L\'ACRE (Aide à la Création ou Reprise d\'Entreprise) permet une exonération partielle de cotisations la première année. Des exonérations sont aussi possibles selon votre zone géographique (ZRR, quartiers prioritaires).'
      },
      {
        question: 'Comment calculer mes cotisations ?',
        answer: 'Les cotisations varient selon votre activité : 12,8% pour les ventes, 22% pour les prestations de services, 22% pour les activités libérales. Le calcul se fait sur votre chiffre d\'affaires déclaré.'
      },
      {
        question: 'Que faire si je ne peux pas payer mes cotisations ?',
        answer: 'Contactez l\'URSSAF rapidement pour demander un échelonnement ou un report. Des solutions existent pour éviter les majorations de retard.'
      },
      {
        question: 'Quelle est la différence entre micro-entrepreneur et auto-entrepreneur ?',
        answer: 'C\'est la même chose ! Le terme "auto-entrepreneur" a été remplacé par "micro-entrepreneur" en 2016, mais les deux désignent le même régime simplifié.'
      }
    ],
    resources: [
      { name: 'Site officiel URSSAF', url: 'https://www.urssaf.fr' },
      { name: 'Espace auto-entrepreneur', url: 'https://www.autoentrepreneur.urssaf.fr' },
      { name: 'Simulateur de cotisations', url: 'https://www.autoentrepreneur.urssaf.fr/portail/accueil/simulateur.html' },
      { name: 'Déclarer en ligne', url: 'https://www.autoentrepreneur.urssaf.fr/portail/accueil/declarer-et-payer.html' },
      { name: 'Guide ACRE', url: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F23547' }
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

