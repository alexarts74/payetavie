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
  AlertCircle,
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

  const urgentReminders = reminders?.filter(r =>
    r.due_date && r.due_date <= todayStr && !r.completed
  ) || []

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  const upcomingReminders = reminders?.filter(r =>
    r.due_date && r.due_date > todayStr && r.due_date <= nextWeekStr
  ) || []

  const expiringDocuments = documents?.filter(doc => {
    if (!doc.expires_at) return false
    const expiresDate = new Date(doc.expires_at)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiresDate <= thirtyDaysFromNow && expiresDate >= today
  }) || []

  return (
    <div className="p-8 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 app-bg opacity-60 pointer-events-none" />
      <div className="absolute top-[-60px] right-[-80px] w-[350px] h-[350px] rounded-full bg-indigo-400/6 dark:bg-indigo-500/8 blur-3xl pointer-events-none" />
      <div className="absolute top-[30%] left-[-60px] w-[280px] h-[280px] rounded-full bg-violet-400/5 dark:bg-violet-500/6 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Vue d&apos;ensemble</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
            Tableau de bord
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Votre vie administrative en un coup d&apos;œil
          </p>
        </div>

        {/* Stat Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${canAccessEssentiel ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-8`}>
          {/* Rappels actifs */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-1 overflow-hidden relative" style={{ opacity: 0 }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Clock className="w-5 h-5 text-white" />
              </div>
              {stats.overdueReminders > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                  {stats.overdueReminders} en retard
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
              {stats.activeReminders}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rappels actifs</div>
          </div>

          {/* Documents */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-2 overflow-hidden relative" style={{ opacity: 0 }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              {stats.expiringDocuments > 0 && (
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                  {stats.expiringDocuments} expirant
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
              {stats.totalDocuments}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Documents stockes</div>
          </div>

          {/* Favoris */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-3 overflow-hidden relative" style={{ opacity: 0 }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 mb-4">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
              {stats.totalBookmarks}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Ressources favorites</div>
          </div>

          {/* Completion */}
          <div className="glass-card rounded-2xl p-5 animate-slide-up stagger-4 overflow-hidden relative" style={{ opacity: 0 }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 mb-4">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
              {stats.totalReminders > 0
                ? Math.round(((stats.totalReminders - stats.activeReminders) / stats.totalReminders) * 100)
                : 0}%
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rappels completes</div>
          </div>

          {/* Depenses du mois - Essentiel+ only */}
          {canAccessEssentiel && (
            <Link href="/depenses" className="glass-card rounded-2xl p-5 animate-slide-up overflow-hidden relative hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-colors" style={{ opacity: 0, animationDelay: '0.4s' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-2xl" />
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                {expenseStats.totalBudget && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    (expenseStats.totalSpent / expenseStats.totalBudget) > 1
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                      : (expenseStats.totalSpent / expenseStats.totalBudget) > 0.8
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {Math.round((expenseStats.totalSpent / expenseStats.totalBudget) * 100)}% budget
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                {expenseStats.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Depenses du mois</div>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Rappels et documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rappels urgents */}
            {urgentReminders.length > 0 && (
              <AnimateOnScroll>
                <div className="glass-card rounded-2xl p-5 border-red-200/50 dark:border-red-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/30">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Rappels urgents</h2>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                      {urgentReminders.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {urgentReminders.slice(0, 5).map((reminder) => {
                      const isOverdue = reminder.due_date && reminder.due_date < todayStr
                      return (
                        <Link
                          key={reminder.id}
                          href={`/topics/${reminder.topic_slug}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-800/30 group"
                        >
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <span className="text-sm">{getTopicIcon(reminder.topic_slug)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {reminder.title}
                              </span>
                              {isOverdue && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex-shrink-0">
                                  En retard
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                              <span>{getTopicTitle(reminder.topic_slug)}</span>
                              {reminder.due_date && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600 dark:text-red-400">
                                    {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* Rappels a venir */}
            {upcomingReminders.length > 0 && (
              <AnimateOnScroll delay={0.05}>
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Prochains rappels</h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">7 jours</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingReminders.slice(0, 5).map((reminder) => (
                      <Link
                        key={reminder.id}
                        href={`/topics/${reminder.topic_slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors border border-indigo-100/50 dark:border-indigo-800/30 group"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                          <span className="text-sm">{getTopicIcon(reminder.topic_slug)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {reminder.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{getTopicTitle(reminder.topic_slug)}</span>
                            {reminder.due_date && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-600 dark:text-indigo-400">
                                  {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* Documents recents */}
            <AnimateOnScroll delay={0.1}>
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                      <FolderOpen className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Documents recents</h2>
                  </div>
                  <Link
                    href="/topics"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Voir tout
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/topics/${doc.topic_slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors border border-indigo-100/50 dark:border-indigo-800/30 group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {doc.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {getTopicTitle(doc.topic_slug)} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm">Aucun document pour le moment</p>
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* Documents expirant */}
            {expiringDocuments.length > 0 && (
              <AnimateOnScroll delay={0.05}>
                <div className="glass-card rounded-2xl p-5 border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm shadow-amber-500/30">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Documents expirant</h2>
                  </div>
                  <div className="space-y-2">
                    {expiringDocuments.slice(0, 3).map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/topics/${doc.topic_slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors border border-amber-100 dark:border-amber-800/30 group"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {doc.name}
                          </div>
                          {doc.expires_at && (
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* Message si pas de rappels */}
            {reminders && reminders.length === 0 && (
              <div className="glass-card rounded-2xl p-5 text-center animate-slide-up">
                <Clock className="w-10 h-10 mx-auto mb-2 text-indigo-400 dark:text-indigo-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 text-sm">Aucun rappel actif</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  Creez votre premier rappel pour ne rien oublier
                </p>
                <Link
                  href="/topics"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-sm hover:shadow-md hover:shadow-indigo-500/25 transition-all duration-150 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Creer un rappel
                </Link>
              </div>
            )}
          </div>

          {/* Colonne droite - Calendrier et actions rapides */}
          <div className="space-y-6">
            {/* Calendrier compact */}
            <div className="animate-slide-up">
              <CalendarView />
            </div>

            {/* Actions rapides */}
            <div className="glass-card rounded-2xl p-4 animate-slide-up overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50 rounded-t-2xl" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Actions rapides</h2>
              <div className="space-y-1.5">
                <Link
                  href="/topics"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 transition-colors border border-zinc-200 dark:border-zinc-700/50 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:shadow-md group-hover:shadow-indigo-500/30 transition-shadow">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Creer un rappel</span>
                </Link>
                <Link
                  href="/topics"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 transition-colors border border-zinc-200 dark:border-zinc-700/50 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:shadow-md group-hover:shadow-indigo-500/30 transition-shadow">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Uploader un document</span>
                </Link>
                <Link
                  href="/topics"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 transition-colors border border-zinc-200 dark:border-zinc-700/50 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:shadow-md group-hover:shadow-indigo-500/30 transition-shadow">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Voir tous les topics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

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
