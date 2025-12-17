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

export default async function URSSAFPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'urssaf'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

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

