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

export default async function MedecinGeneralistePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'medecin-generaliste'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

  const topic = {
    title: 'Médecin généraliste',
    icon: '🏥',
    tldr: 'Le médecin généraliste (médecin traitant) est votre médecin de référence pour tous vos soins. Il coordonne votre parcours de santé, prescrit vos médicaments, peut vous orienter vers des spécialistes et suit votre dossier médical. La consultation est remboursée à 70% par la Sécurité sociale, le reste par votre mutuelle selon votre contrat.',
    checklist: [
      'Choisir un médecin traitant (libre choix)',
      'Déclarer votre médecin traitant sur ameli.fr ou en lui donnant le formulaire',
      'Prendre rendez-vous régulièrement (au moins une fois par an)',
      'Apporter votre carte Vitale et votre mutuelle',
      'Conserver vos ordonnances (3 mois de validité)',
      'Respecter les prescriptions et posologies',
      'Consulter en cas d\'urgence ou symptômes persistants',
      'Demander un renouvellement d\'ordonnance si besoin',
      'Vérifier vos remboursements sur votre compte Ameli'
    ],
    faq: [
      {
        question: 'Comment choisir un médecin traitant ?',
        answer: 'Vous pouvez choisir librement votre médecin traitant parmi les médecins généralistes (ou spécialistes dans certains cas). Renseignez-vous sur les médecins près de chez vous, vérifiez s\'ils acceptent de nouveaux patients. Déclarez-le ensuite à votre caisse d\'assurance maladie (en ligne sur ameli.fr ou en lui donnant le formulaire S3704).'
      },
      {
        question: 'Dois-je payer la consultation ?',
        answer: 'Si votre médecin est conventionné secteur 1, le tarif est de 25€. La Sécurité sociale rembourse 70% (17,50€), votre mutuelle rembourse le reste (30% = 7,50€) selon votre contrat. Si vous avez le tiers payant, vous ne payez rien directement.'
      },
      {
        question: 'Que faire en cas d\'urgence médicale ?',
        answer: 'En cas d\'urgence vitale, appelez le 15 (SAMU). Pour une urgence non vitale, consultez votre médecin traitant, un médecin de garde, ou allez aux urgences de l\'hôpital le plus proche. Vous pouvez aussi appeler le 116 117 pour joindre un médecin de garde.'
      },
      {
        question: 'Puis-je changer de médecin traitant ?',
        answer: 'Oui, vous pouvez changer de médecin traitant à tout moment. Il suffit de déclarer votre nouveau médecin traitant (en ligne sur ameli.fr ou en lui donnant le formulaire). Il n\'y a pas de limite au nombre de changements.'
      },
      {
        question: 'Combien de temps est valable une ordonnance ?',
        answer: 'Une ordonnance est valable 3 mois à compter de la date de prescription. Pour les médicaments à renouveler, la durée de validité peut être de 1 an maximum. Après cette date, vous devez retourner chez votre médecin pour un renouvellement.'
      }
    ],
    resources: [
      { name: 'Ameli - Trouver un médecin', url: 'https://www.ameli.fr/assure/sante/services-en-ligne/trouver-un-professionnel-de-sante' },
      { name: 'Déclarer un médecin traitant', url: 'https://www.ameli.fr/assure/droits-demarches/principes/medecin-traitant/declarer-votre-medecin-traitant' },
      { name: 'Tarifs des consultations', url: 'https://www.service-public.fr/particuliers/vosdroits/F1634' },
      { name: 'Urgences médicales - SAMU', url: 'https://www.service-public.fr/particuliers/vosdroits/F1647' },
      { name: 'Médecin de garde - 116 117', url: 'https://www.service-public.fr/particuliers/vosdroits/F1649' }
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR */}
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-red-600 to-pink-600 rounded-[2rem] p-6 text-white overflow-hidden">
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {topic.checklist.map((item, index) => (
                <div key={index} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-all duration-300 border border-red-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
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
