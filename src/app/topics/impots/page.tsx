import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getNotes } from '@/app/actions/notes'
import { getReminders } from '@/app/actions/reminders'
import { getBookmarks } from '@/app/actions/bookmarks'
import NotesSection from '@/components/NotesSection'
import RemindersSection from '@/components/RemindersSection'
import BookmarksSection from '@/components/BookmarksSection'
import { Zap, CheckCircle2, HelpCircle } from 'lucide-react'

export default async function ImpotsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'impots'
  const { data: notes } = await getNotes(topicSlug)
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)

  const topic = {
    title: 'Impôts',
    icon: '📊',
    tldr: 'L\'impôt sur le revenu est déclaré chaque année entre avril et juin. Le prélèvement à la source permet de payer l\'impôt au fur et à mesure. Les erreurs fréquentes : oublier des revenus, ne pas déclarer les changements de situation, mal remplir le formulaire.',
    checklist: [
      'Récupérer tous vos justificatifs (fiches de paie, revenus fonciers, etc.)',
      'Vérifier votre situation familiale (mariage, pacs, enfants)',
      'Accéder à votre espace impots.gouv.fr',
      'Remplir la déclaration en ligne avant le 31 mai (ou 8 juin en ligne)',
      'Vérifier le montant calculé automatiquement',
      'Valider et envoyer la déclaration',
      'Conserver l\'accusé de réception',
      'Vérifier votre avis d\'imposition (reçu en août/septembre)',
      'Contrôler les prélèvements à la source pour l\'année suivante'
    ],
    faq: [
      {
        question: 'Quand dois-je déclarer mes impôts ?',
        answer: 'La déclaration se fait généralement entre avril et juin. La date limite est le 31 mai pour le papier et le 8 juin pour la déclaration en ligne.'
      },
      {
        question: 'Comment réduire mes impôts ?',
        answer: 'Vous pouvez réduire vos impôts grâce aux réductions d\'impôts (dons, investissements locatifs, etc.) et aux crédits d\'impôts (emploi à domicile, transition énergétique, etc.).'
      },
      {
        question: 'Qu\'est-ce que le prélèvement à la source ?',
        answer: 'Le prélèvement à la source permet de payer l\'impôt au fur et à mesure de la perception des revenus, plutôt qu\'en une seule fois l\'année suivante.'
      },
      {
        question: 'Que faire si je me suis trompé dans ma déclaration ?',
        answer: 'Vous pouvez corriger votre déclaration en ligne jusqu\'à la fin de l\'année. Connectez-vous à votre espace et utilisez la fonction "Modifier ma déclaration".'
      },
      {
        question: 'Dois-je déclarer tous mes revenus ?',
        answer: 'Oui, vous devez déclarer tous vos revenus : salaires, revenus fonciers, revenus de capitaux mobiliers, plus-values, etc. L\'omission volontaire est passible de pénalités.'
      }
    ],
    resources: [
      { name: 'Site officiel des impôts', url: 'https://www.impots.gouv.fr' },
      { name: 'Espace particulier impots.gouv.fr', url: 'https://www.impots.gouv.fr/portail' },
      { name: 'Simulateur de calcul d\'impôt', url: 'https://www.impots.gouv.fr/portail/outils/simulateurs' },
      { name: 'Calendrier fiscal', url: 'https://www.impots.gouv.fr/portail/particulier/calendrier-fiscal' },
      { name: 'Guide de la déclaration en ligne', url: 'https://www.impots.gouv.fr/portail/particulier/declarer-ses-revenus' }
    ]
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR avec éléments flottants */}
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white overflow-hidden">
            {/* Formes organiques en arrière-plan */}
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

        {/* Notes Section */}
        <div className="flex justify-around">
          <div className="mb-8">
            <NotesSection topicSlug={topicSlug} initialNotes={notes} />
          </div>

          {/* Reminders Section */}
          <div className="mb-8">
            <RemindersSection topicSlug={topicSlug} initialReminders={reminders} />
          </div>
        </div>

        {/* Layout en 2 colonnes pour Checklist et FAQ */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Checklist - Colonne gauche */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-white" />
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

          {/* FAQ - Colonne droite */}
          <div>
            <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                  <HelpCircle className="w-5 h-5 text-white" />
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

        {/* Resources Section avec favoris */}
        <BookmarksSection
          topicSlug={topicSlug}
          initialBookmarks={bookmarks}
          resources={topic.resources}
        />
      </div>
    </div>
  )
}

