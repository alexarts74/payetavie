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

export default async function FichesDePaiePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'fiches-de-paie'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

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

