import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CAFPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

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

