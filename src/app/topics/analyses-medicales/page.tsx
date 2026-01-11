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

export default async function AnalysesMedicalesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'analyses-medicales'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

  const topic = {
    title: 'Analyses médicales',
    icon: '🧪',
    tldr: 'Les analyses médicales (prise de sang, urines, etc.) sont prescrites par votre médecin pour diagnostiquer ou suivre une maladie. Elles sont remboursées par la Sécurité sociale si prescrites. Les résultats sont disponibles sous 24-48h, en ligne ou au laboratoire. Conservez vos résultats, ils font partie de votre dossier médical.',
    checklist: [
      'Obtenir une ordonnance de votre médecin',
      'Prendre rendez-vous au laboratoire (souvent sans RDV pour prises de sang)',
      'Respecter les consignes (être à jeun si demandé)',
      'Apporter votre carte Vitale et votre mutuelle',
      'Consulter vos résultats (en ligne ou au laboratoire)',
      'Conserver vos résultats dans votre dossier médical',
      'Prendre rendez-vous avec votre médecin pour les interpréter',
      'Respecter les recommandations et traitements si besoin'
    ],
    faq: [
      {
        question: 'Comment consulter mes résultats d\'analyses ?',
        answer: 'Les résultats sont généralement disponibles sous 24-48h. Vous pouvez les consulter en ligne sur le site du laboratoire (avec vos identifiants), les récupérer au laboratoire, ou les recevoir par email/lettre selon le laboratoire. Certains laboratoires envoient aussi les résultats à votre médecin directement.'
      },
      {
        question: 'Dois-je être à jeun pour une prise de sang ?',
        answer: 'Cela dépend des analyses demandées. Pour la glycémie, le cholestérol, les triglycérides, il faut être à jeun (ne rien manger ni boire sauf de l\'eau depuis 12h). Vérifiez les consignes sur votre ordonnance ou demandez au laboratoire.'
      },
      {
        question: 'Comment sont remboursées les analyses ?',
        answer: 'Les analyses prescrites par un médecin sont remboursées à 60% par la Sécurité sociale, puis complétées par votre mutuelle selon votre contrat. Avec le tiers payant, vous ne payez que la part non remboursée. Certaines analyses sont remboursées à 100% (grossesse, dépistage).'
      },
      {
        question: 'Combien de temps conserver les résultats ?',
        answer: 'Conservez tous vos résultats d\'analyses dans votre dossier médical personnel. Ils sont utiles pour le suivi de votre santé, les comparaisons au fil du temps, et pour les médecins. Vous pouvez les conserver indéfiniment, de préférence classés par date.'
      },
      {
        question: 'Puis-je faire des analyses sans ordonnance ?',
        answer: 'Oui, vous pouvez faire certaines analyses sans ordonnance (prises de sang classiques), mais elles ne seront pas remboursées. Pour les analyses remboursées, une ordonnance médicale est obligatoire.'
      }
    ],
    resources: [
      { name: 'Ameli - Analyses biologiques', url: 'https://www.ameli.fr/assure/remboursements/rembourse/analyses-biologiques' },
      { name: 'À jeun ou pas pour une prise de sang ?', url: 'https://www.service-public.fr/particuliers/vosdroits/F33995' },
      { name: 'Comprendre ses analyses', url: 'https://www.ameli.fr/assure/sante/themes/analyses-medicales' },
      { name: 'Tiers payant analyses', url: 'https://www.ameli.fr/assure/remboursements/etre-bien-rembourse/le-tiers-payant' }
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR */}
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl -ml-24 -mb-24" />
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {topic.checklist.map((item, index) => (
                <div key={index} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-blue-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
