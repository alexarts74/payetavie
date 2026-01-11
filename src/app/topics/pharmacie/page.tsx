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

export default async function PharmaciePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'pharmacie'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

  const topic = {
    title: 'Pharmacie',
    icon: '💊',
    tldr: 'La pharmacie délivre vos médicaments sur ordonnance et vous conseille. Les médicaments prescrits sont remboursés par la Sécurité sociale (65% pour la plupart) puis par votre mutuelle. Les ordonnances sont valables 3 mois. Vous pouvez faire renouveler certains traitements en pharmacie sans repasser chez le médecin (pour 6 mois maximum).',
    checklist: [
      'Présenter votre ordonnance et votre carte Vitale',
      'Vérifier que votre pharmacie a les médicaments en stock',
      'Conserver vos ordonnances (validité 3 mois)',
      'Noter les dates de renouvellement si traitement long',
      'Respecter les posologies et heures de prise',
      'Vérifier les interactions médicamenteuses avec le pharmacien',
      'Demander conseil pour l\'automédication (sans ordonnance)',
      'Conserver les notices des médicaments',
      'Rapporter les médicaments non utilisés à la pharmacie',
      'Vérifier vos remboursements sur votre compte Ameli'
    ],
    faq: [
      {
        question: 'Combien de temps est valable une ordonnance ?',
        answer: 'Une ordonnance est valable 3 mois à compter de la date de prescription. Pour les médicaments à renouveler plusieurs fois, la durée de validité totale peut être de 1 an maximum. Après cette date, vous devez retourner chez votre médecin.'
      },
      {
        question: 'Puis-je renouveler une ordonnance en pharmacie ?',
        answer: 'Oui, depuis 2020, le pharmacien peut renouveler certains traitements chroniques (hypertension, diabète, etc.) sans ordonnance, pour une durée maximale de 6 mois, si vous êtes déjà sous ce traitement depuis au moins 3 mois. Cette mesure est réservée aux traitements chroniques stables.'
      },
      {
        question: 'Comment sont remboursés les médicaments ?',
        answer: 'La Sécurité sociale rembourse généralement 65% du prix des médicaments (15% pour certains). Votre mutuelle complète selon votre contrat. Avec le tiers payant, vous ne payez que la part non remboursée. Certains médicaments (sur liste) sont remboursés à 100%.'
      },
      {
        question: 'Que faire si je n\'ai pas mon ordonnance ?',
        answer: 'Sans ordonnance, le pharmacien peut seulement délivrer des médicaments sans ordonnance (paracétamol, certains anti-inflammatoires, etc.). Pour les médicaments sur ordonnance, vous devez absolument présenter votre ordonnance valide.'
      },
      {
        question: 'Comment jeter les médicaments non utilisés ?',
        answer: 'Ne jetez jamais les médicaments à la poubelle ou dans les toilettes. Rapportez-les à votre pharmacie qui les récupère gratuitement via Cyclamed. C\'est gratuit, anonyme et écologique.'
      }
    ],
    resources: [
      { name: 'Ameli - Remboursements médicaments', url: 'https://www.ameli.fr/assure/remboursements/rembourse/medicaments' },
      { name: 'Renouvellement en pharmacie', url: 'https://www.service-public.fr/particuliers/actualites/A13991' },
      { name: 'Cyclamed - Recyclage médicaments', url: 'https://www.cyclamed.org' },
      { name: 'Tiers payant pharmacie', url: 'https://www.ameli.fr/assure/remboursements/etre-bien-rembourse/le-tiers-payant' },
      { name: 'Base de données médicaments', url: 'https://base-donnees-publique.medicaments.gouv.fr' }
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR */}
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl -ml-24 -mb-24" />
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

        {/* Checklist */}
        <div className="mb-8">
          <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {topic.checklist.map((item, index) => (
                <div key={index} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all duration-300 border border-purple-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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

        {/* Reminders */}
        <RemindersSection
          topicSlug={topicSlug}
          initialReminders={reminders || []}
          predefinedReminders={predefinedReminders}
        />

        {/* Documents */}
        <div className="mb-8">
          <DocumentsSection topicSlug={topicSlug} initialDocuments={documents || []} />
        </div>

        {/* Resources */}
        <BookmarksSection
          topicSlug={topicSlug}
          initialBookmarks={bookmarks || []}
          resources={topic.resources}
        />
      </div>

      {/* Modal FAQ */}
      <FAQModal faq={topic.faq} />
    </div>
  )
}
