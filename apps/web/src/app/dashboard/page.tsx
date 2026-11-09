import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllReminders, getAllDocuments, getDashboardStats, getExpenseStats } from '@/app/actions/dashboard'
import { getUserPreferences } from '@/app/actions/preferences'
import { getUserSubscription } from '@/lib/subscription'
import { getTopicTitle, getTopicIcon } from '@/lib/topic-utils'
import Link from 'next/link'
import {
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell,
  FolderOpen,
  Bookmark,
  Wallet,
} from 'lucide-react'
import CalendarView from '@/components/CalendarView'
import AnnuaireGlobal from '@/components/AnnuaireGlobal'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: reminders }, { data: documents }, stats, { data: preferences }, { plan }] = await Promise.all([
    getAllReminders(),
    getAllDocuments(),
    getDashboardStats(),
    getUserPreferences(),
    getUserSubscription(),
  ])

  const canAccessEssentiel = plan === 'essentiel' || plan === 'pro'

  const expenseStats = canAccessEssentiel
    ? await getExpenseStats()
    : { totalSpent: 0, totalBudget: null }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  type ActivityItem =
    | { kind: 'overdue'; reminder: NonNullable<typeof reminders>[number] }
    | { kind: 'expiring'; doc: NonNullable<typeof documents>[number] }
    | { kind: 'upcoming'; reminder: NonNullable<typeof reminders>[number] }

  const overdueItems: ActivityItem[] = (reminders?.filter(r =>
    r.due_date && r.due_date < todayStr && !r.completed
  ) || []).map(r => ({ kind: 'overdue', reminder: r }))

  const todayItems: ActivityItem[] = (reminders?.filter(r =>
    r.due_date && r.due_date === todayStr && !r.completed
  ) || []).map(r => ({ kind: 'upcoming', reminder: r }))

  const expiringItems: ActivityItem[] = (documents?.filter(doc => {
    if (!doc.expires_at) return false
    const expiresDate = new Date(doc.expires_at)
    return expiresDate <= thirtyDaysFromNow && expiresDate >= today
  }) || []).map(doc => ({ kind: 'expiring', doc }))

  const upcomingItems: ActivityItem[] = (reminders?.filter(r =>
    r.due_date && r.due_date > todayStr && r.due_date <= nextWeekStr
  ) || []).map(r => ({ kind: 'upcoming', reminder: r }))

  const activityItems: ActivityItem[] = [
    ...overdueItems,
    ...todayItems,
    ...expiringItems,
    ...upcomingItems,
  ].slice(0, 8)

  return (
    <div className="p-8 relative">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
<h1 className="text-2xl sm:text-3xl font-bold text-[#235037] mb-1" style={{ fontFamily: 'var(--font-caprasimo)' }}>
            Tableau de bord
          </h1>
          <p className="text-[#5A6B61] text-sm">
            Votre vie administrative en un coup d&apos;œil
          </p>
        </div>

        {/* Stat Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${canAccessEssentiel ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-8`}>
          {/* Rappels actifs */}
          <div className="card rounded-2xl p-5 animate-slide-up stagger-1 overflow-hidden" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#EEF7F1] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#235037]" />
              </div>
              {stats.overdueReminders > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {stats.overdueReminders} en retard
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-[#235037] mb-0.5" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              {stats.activeReminders}
            </div>
            <div className="text-xs font-medium text-[#5A6B61]">Rappels actifs</div>
          </div>

          {/* Documents */}
          <div className="card rounded-2xl p-5 animate-slide-up stagger-2 overflow-hidden" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#EEF7F1] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#235037]" />
              </div>
              {stats.expiringDocuments > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  {stats.expiringDocuments} expirant
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-[#235037] mb-0.5" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              {stats.totalDocuments}
            </div>
            <div className="text-xs font-medium text-[#5A6B61]">Documents stockés</div>
          </div>

          {/* Favoris */}
          <div className="card rounded-2xl p-5 animate-slide-up stagger-3 overflow-hidden" style={{ opacity: 0 }}>
            <div className="w-11 h-11 rounded-xl bg-[#FDEEF6] flex items-center justify-center mb-4">
              <Bookmark className="w-5 h-5 text-[#235037]" />
            </div>
            <div className="text-3xl font-bold text-[#235037] mb-0.5" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              {stats.totalBookmarks}
            </div>
            <div className="text-xs font-medium text-[#5A6B61]">Ressources favorites</div>
          </div>

          {/* Completion */}
          <div className="card rounded-2xl p-5 animate-slide-up stagger-4 overflow-hidden" style={{ opacity: 0 }}>
            <div className="w-11 h-11 rounded-xl bg-[#EEF7F1] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#235037]" />
            </div>
            <div className="text-3xl font-bold text-[#235037] mb-0.5" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              {stats.totalReminders > 0
                ? Math.round(((stats.totalReminders - stats.activeReminders) / stats.totalReminders) * 100)
                : 0}%
            </div>
            <div className="text-xs font-medium text-[#5A6B61]">Rappels complétés</div>
          </div>

          {/* Depenses du mois - Essentiel+ only */}
          {canAccessEssentiel && (
            <Link href="/depenses" className="card rounded-2xl p-5 animate-slide-up overflow-hidden hover:border-[#235037]/30 transition-colors" style={{ opacity: 0, animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#EEF7F1] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#235037]" />
                </div>
                {expenseStats.totalBudget && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    (expenseStats.totalSpent / expenseStats.totalBudget) > 1
                      ? 'bg-red-100 text-red-700'
                      : (expenseStats.totalSpent / expenseStats.totalBudget) > 0.8
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-[#EEF7F1] text-[#235037]'
                  }`}>
                    {Math.round((expenseStats.totalSpent / expenseStats.totalBudget) * 100)}% budget
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-[#235037] mb-0.5" style={{ fontFamily: 'var(--font-caprasimo)' }}>
                {expenseStats.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="text-xs font-medium text-[#5A6B61]">Dépenses du mois</div>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Colonne gauche : À traiter + Documents récents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section À traiter */}
            <AnimateOnScroll>
              <div className="card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activityItems.some(i => i.kind === 'overdue')
                      ? 'bg-red-100'
                      : 'bg-[#EEF7F1]'
                  }`}>
                    <Bell className={`w-4 h-4 ${
                      activityItems.some(i => i.kind === 'overdue') ? 'text-red-600' : 'text-[#235037]'
                    }`} />
                  </div>
                  <h2 className="text-base font-semibold text-[#1a2e22]">À traiter</h2>
                  {activityItems.length > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activityItems.some(i => i.kind === 'overdue')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#EEF7F1] text-[#235037]'
                    }`}>
                      {activityItems.length}
                    </span>
                  )}
                </div>
                {activityItems.length > 0 ? (
                  <div className="space-y-2">
                    {activityItems.map((item) => {
                      if (item.kind === 'overdue') {
                        const reminder = item.reminder
                        const isLate = reminder.due_date && reminder.due_date < todayStr
                        return (
                          <Link key={`overdue-${reminder.id}`} href={`/topics/${reminder.topic_slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 transition-colors border border-red-100 group"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                              <span className="text-sm">{getTopicIcon(reminder.topic_slug)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1a2e22] truncate">{reminder.title}</span>
                                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex-shrink-0">
                                  {isLate ? 'En retard' : "Aujourd'hui"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#5A6B61]">
                                <span>{getTopicTitle(reminder.topic_slug)}</span>
                                {reminder.due_date && (<><span>•</span><span className="text-red-600">{new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span></>)}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#5A6B61] flex-shrink-0 group-hover:text-red-500 transition-colors" />
                          </Link>
                        )
                      }
                      if (item.kind === 'expiring') {
                        const doc = item.doc
                        return (
                          <Link key={`expiring-${doc.id}`} href={`/topics/${doc.topic_slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 transition-colors border border-amber-100 group"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#1a2e22] truncate">{doc.name}</span>
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-full flex-shrink-0">Expire bientôt</span>
                              </div>
                              {doc.expires_at && (
                                <div className="text-xs text-amber-600">
                                  {getTopicTitle(doc.topic_slug)} • Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#5A6B61] flex-shrink-0 group-hover:text-amber-500 transition-colors" />
                          </Link>
                        )
                      }
                      const reminder = item.reminder
                      return (
                        <Link key={`upcoming-${reminder.id}`} href={`/topics/${reminder.topic_slug}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EEF7F1]/50 transition-colors border border-[#E8E8E8] group"
                        >
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#EEF7F1] flex items-center justify-center">
                            <span className="text-sm">{getTopicIcon(reminder.topic_slug)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#1a2e22] truncate">{reminder.title}</div>
                            <div className="flex items-center gap-2 text-xs text-[#5A6B61]">
                              <span>{getTopicTitle(reminder.topic_slug)}</span>
                              {reminder.due_date && (<><span>•</span><span className="text-[#235037]">{new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span></>)}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#5A6B61] flex-shrink-0 group-hover:text-[#235037] transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#EEF7F1] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#235037]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a2e22]">Tout est à jour !</p>
                        <p className="text-xs text-[#5A6B61]">Aucun rappel urgent ni document expirant.</p>
                      </div>
                    </div>
                    <Link href="/topics"
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-lg transition-all text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Créer un rappel
                    </Link>
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* Documents récents */}
            <AnimateOnScroll delay={0.05}>
              <div className="card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF7F1] flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-[#235037]" />
                    </div>
                    <h2 className="text-base font-semibold text-[#1a2e22]">Documents récents</h2>
                  </div>
                  <Link href="/topics" className="text-xs text-[#235037] hover:text-[#1a3d2a] font-medium flex items-center gap-1">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => (
                      <Link key={doc.id} href={`/topics/${doc.topic_slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EEF7F1]/50 transition-colors border border-[#E8E8E8] group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EEF7F1] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#235037]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#1a2e22] truncate">{doc.name}</div>
                          <div className="text-xs text-[#5A6B61]">
                            {getTopicTitle(doc.topic_slug)} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#5A6B61] flex-shrink-0 group-hover:text-[#235037] transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[#5A6B61]">
                    <div className="w-8 h-8 rounded-xl bg-[#EEF7F1] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-[#5A6B61]" />
                    </div>
                    <p className="text-sm">Aucun document pour le moment</p>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>

          {/* Colonne droite : Calendrier uniquement */}
          <div className="animate-slide-up">
            <CalendarView />
          </div>
        </div>

        {/* Actions rapides - pleine largeur */}
        <AnimateOnScroll className="mt-6">
          <div className="card rounded-2xl p-4 overflow-hidden relative">
            <h2 className="text-sm font-semibold text-[#1a2e22] mb-3">Actions rapides</h2>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/topics"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#EEF7F1] transition-colors border border-[#E8E8E8] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#235037] flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[#1a2e22]">Créer un rappel</span>
              </Link>
              <Link href="/topics"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#EEF7F1] transition-colors border border-[#E8E8E8] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#235037] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[#1a2e22]">Uploader un document</span>
              </Link>
              <Link href="/topics"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#EEF7F1] transition-colors border border-[#E8E8E8] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#235037] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[#1a2e22]">Voir tous les topics</span>
              </Link>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Annuaire des administrations - Essentiel+ only */}
        {canAccessEssentiel && (
          <AnimateOnScroll className="mt-6">
            <AnnuaireGlobal initialPostalCode={preferences?.postal_code ?? null} />
          </AnimateOnScroll>
        )}
      </div>
    </div>
  )
}
