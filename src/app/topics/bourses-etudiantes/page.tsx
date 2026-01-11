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

export default async function BoursesEtudiantesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const topicSlug = 'bourses-etudiantes'
  const { data: reminders } = await getReminders(topicSlug)
  const { data: bookmarks } = await getBookmarks(topicSlug)
  const { data: documents } = await getDocuments(topicSlug)
  const predefinedReminders = getPredefinedReminders(topicSlug)

  const topic = {
    title: 'Bourses étudiantes',
    icon: '💰',
    tldr: 'Comprendre les bourses sur critères sociaux, le CROUS et les aides financières pour étudiants.',
    checklist: [
      'Vérifier votre éligibilité',
      'Faire votre demande sur messervices.etudiant.gouv.fr',
      'Fournir les documents nécessaires',
      'Suivre l\'état de votre demande',
    ],
    faq: [
      {
        question: 'Comment faire une demande de bourse ?',
        answer: 'La demande se fait en ligne sur messervices.etudiant.gouv.fr. Vous devez créer un compte et compléter votre dossier avec les justificatifs de revenus de votre foyer fiscal.',
      },
    ],
    resources: [
      { name: 'Messervices Étudiant', url: 'https://www.messervices.etudiant.gouv.fr' },
      { name: 'CROUS', url: 'https://www.crous.fr' },
    ],
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero TL;DR */}
        <div className="relative mb-8">
          <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-[2rem] p-6 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  {topic.icon}
                </div>
                <h1 className="text-3xl font-bold">{topic.title}</h1>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 mt-1 flex-shrink-0" />
                <p className="text-lg leading-relaxed">{topic.tldr}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-[2rem] border border-blue-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900">Checklist</h2>
          </div>
          <ul className="space-y-3">
            {topic.checklist.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-zinc-700">{item}</span>
              </li>
            ))}
          </ul>
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
