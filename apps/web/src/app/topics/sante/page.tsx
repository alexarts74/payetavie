import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReminders } from '@/app/actions/reminders'
import { getDocuments } from '@/app/actions/documents'
import { getChecklistProgress } from '@/app/actions/checklists'
import RemindersSection from '@/components/RemindersSection'
import DocumentsSection from '@/components/DocumentsSection'
import FAQModal from '@/components/FAQModal'
import { getPredefinedReminders } from '@/lib/predefined-reminders'
import ChecklistSection from '@/components/ChecklistSection'
import { Zap } from 'lucide-react'
import { getUserSubscription, getPlanLimits } from '@/lib/subscription'

export default async function SantePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'sante'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const { data: checklistProgress } = await getChecklistProgress(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)
  const { plan } = await getUserSubscription()
  const limits = getPlanLimits(plan)

  const topic = {
    title: 'Santé',
    icon: '🩺',
    tldr: 'Médecin, pharmacie, analyses — votre suivi de santé au quotidien. Déclarez votre médecin traitant sur Ameli, conservez vos ordonnances et suivez vos remboursements. Tout ce dont vous avez besoin est centralisé ici.',
    checklist: [
      'Choisir un médecin traitant et le déclarer sur ameli.fr',
      'Prendre rendez-vous régulièrement (au moins une fois par an)',
      'Apporter votre carte Vitale et votre mutuelle à chaque consultation',
      'Conserver vos ordonnances (validité 3 mois)',
      'Respecter les prescriptions et posologies',
      'Vérifier les interactions médicamenteuses avec le pharmacien',
      'Rapporter les médicaments non utilisés à la pharmacie',
      'Obtenir une ordonnance avant tout bilan sanguin ou analyse',
      'Respecter les consignes avant une prise de sang (être à jeun si demandé)',
      'Conserver vos résultats d\'analyses dans votre dossier médical',
      'Consulter votre médecin pour interpréter les résultats',
      'Vérifier vos remboursements sur votre compte Ameli',
    ],
    faq: [
      {
        question: 'Comment déclarer un médecin traitant ?',
        answer: 'Vous pouvez le déclarer directement sur ameli.fr dans votre espace personnel, ou en remettant le formulaire Cerfa à votre médecin lors d\'une consultation. Sans médecin traitant, le remboursement de vos soins est réduit.',
      },
      {
        question: 'Quelle est la durée de validité d\'une ordonnance ?',
        answer: 'Une ordonnance est valable 3 mois pour la plupart des médicaments. Passé ce délai, vous ne pouvez plus la faire exécuter en pharmacie. Pour les traitements chroniques, votre médecin peut mentionner un renouvellement.',
      },
      {
        question: 'Comment fonctionne le remboursement des médicaments ?',
        answer: 'L\'Assurance Maladie rembourse une partie du prix selon le taux (100%, 65%, 30% ou 15% selon le médicament). Votre mutuelle peut compléter le reste. Présentez votre carte Vitale à la pharmacie pour que le remboursement soit automatique.',
      },
      {
        question: 'Dois-je être à jeun pour une prise de sang ?',
        answer: 'Pas systématiquement — cela dépend des examens prescrits. Si un bilan lipidique (cholestérol) ou une glycémie est demandé, vous devez être à jeun depuis au moins 12 heures. Votre médecin ou le laboratoire vous indiquera les consignes.',
      },
      {
        question: 'Comment consulter mes remboursements Ameli ?',
        answer: 'Connectez-vous sur ameli.fr ou utilisez l\'application Ameli. Vous pouvez y consulter votre historique de remboursements, télécharger votre attestation de droits et accéder à votre dossier médical partagé (Mon Espace Santé).',
      },
    ],
    resources: [
      { name: 'Ameli — Trouver un médecin', url: 'https://www.ameli.fr/assure/remboursements/rembourse/medecin-generaliste-specialiste-dentiste/consultations-medecin-generaliste' },
      { name: 'Doctolib', url: 'https://www.doctolib.fr' },
      { name: 'Mon Espace Santé', url: 'https://www.monespacesante.fr' },
      { name: 'Médicaments — Vidal', url: 'https://www.vidal.fr' },
      { name: 'Trouver un laboratoire', url: 'https://www.ameli.fr/assure/remboursements/rembourse/analyses-examens/analyses-biologiques' },
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF7F1] border border-[#235037]/20 mb-3">
            <span className="text-sm">{topic.icon}</span>
            <span className="text-[11px] font-semibold text-[#235037] uppercase tracking-wider">Sujet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#235037]">{topic.title}</h1>
        </div>

        <div className="relative mb-8">
          <div className="relative bg-[#235037] rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold">TL;DR</h2>
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
            plan={plan}
            remindersCount={(reminders ?? []).filter(r => !r.completed).length}
            remindersLimit={limits.reminders}
          />
        </div>

        {/* Section Documents */}
        <div className="mb-8">
          <DocumentsSection topicSlug={topicSlug} initialDocuments={documents} plan={plan} documentsCount={(documents ?? []).length} documentsLimit={limits.documents} />
        </div>

        {/* Checklist */}
        <div className="mb-8">
          <ChecklistSection items={topic.checklist} topicSlug={topicSlug} initialProgress={checklistProgress} />
        </div>
      </div>

      {/* Modal FAQ */}
      <FAQModal faq={topic.faq} />
    </div>
  )
}
