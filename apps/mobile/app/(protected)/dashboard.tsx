import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  remindersCount: number
  documentsCount: number
  bookmarksCount: number
  overdueReminders: { id: string; title: string; due_date: string; topic_slug: string }[]
  upcomingReminders: { id: string; title: string; due_date: string | null; topic_slug: string }[]
  expiringDocs: { id: string; name: string; expires_at: string; topic_slug: string }[]
  recentDocs: { id: string; name: string; created_at: string; topic_slug: string }[]
  expenseTotal: number
  expenseBudget: number | null
  totalReminders: number
  completedReminders: number
}

export default function DashboardScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadStats() {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0]

    const [
      remindersActive,
      remindersTotal,
      remindersCompleted,
      documents,
      bookmarks,
      overdueRes,
      upcomingRes,
      expiringRes,
      recentDocsRes,
      expenseRes,
      prefsRes,
    ] = await Promise.all([
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', false),
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reminders').select('id, title, due_date, topic_slug')
        .eq('user_id', user.id).eq('completed', false)
        .not('due_date', 'is', null).lt('due_date', today)
        .order('due_date').limit(5),
      supabase.from('reminders').select('id, title, due_date, topic_slug')
        .eq('user_id', user.id).eq('completed', false)
        .not('due_date', 'is', null).gte('due_date', today)
        .order('due_date').limit(5),
      supabase.from('documents').select('id, name, expires_at, topic_slug')
        .eq('user_id', user.id).not('expires_at', 'is', null).gte('expires_at', today)
        .order('expires_at').limit(3),
      supabase.from('documents').select('id, name, created_at, topic_slug')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('expenses').select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', startOfMonthStr).lte('expense_date', endOfMonthStr),
      supabase.from('user_preferences').select('global_monthly_budget').eq('user_id', user.id).single(),
    ])

    const expenseTotal = (expenseRes.data ?? []).reduce((sum, e) => sum + (e.amount ?? 0), 0)

    setStats({
      remindersCount: remindersActive.count ?? 0,
      documentsCount: documents.count ?? 0,
      bookmarksCount: bookmarks.count ?? 0,
      overdueReminders: (overdueRes.data ?? []) as DashboardStats['overdueReminders'],
      upcomingReminders: upcomingRes.data ?? [],
      expiringDocs: (expiringRes.data ?? []) as DashboardStats['expiringDocs'],
      recentDocs: recentDocsRes.data ?? [],
      expenseTotal,
      expenseBudget: prefsRes.data?.global_monthly_budget ?? null,
      totalReminders: remindersTotal.count ?? 0,
      completedReminders: remindersCompleted.count ?? 0,
    })
  }

  useEffect(() => { loadStats() }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    ''

  const expensePct = stats?.expenseBudget
    ? Math.min((stats.expenseTotal / stats.expenseBudget) * 100, 100)
    : 0
  const expenseOver = stats?.expenseBudget ? stats.expenseTotal > stats.expenseBudget : false

  const completionPct = stats && stats.totalReminders > 0
    ? Math.round((stats.completedReminders / stats.totalReminders) * 100)
    : 0

  // Items urgents pour "À traiter"
  const urgentItems = stats
    ? [
        ...stats.overdueReminders.map((r) => ({ type: 'reminder' as const, item: r, daysLeft: 0 })),
        ...stats.expiringDocs
          .map((d) => ({
            type: 'doc' as const,
            item: d,
            daysLeft: Math.ceil((new Date(d.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          }))
          .filter((d) => d.daysLeft <= 30),
      ]
    : []

  const statCards = stats
    ? [
        {
          label: 'Rappels actifs',
          value: stats.remindersCount,
          badge: stats.overdueReminders.length > 0
            ? { text: `${stats.overdueReminders.length} en retard`, color: '#EF4444', bg: '#FEE2E2' }
            : null,
          icon: 'alarm-outline' as const,
          iconColor: '#235037',
          iconBg: '#EEF7F1',
        },
        {
          label: 'Documents',
          value: stats.documentsCount,
          badge: stats.expiringDocs.length > 0
            ? { text: `${stats.expiringDocs.length} expirant`, color: '#D97706', bg: '#FEF3C7' }
            : null,
          icon: 'document-text-outline' as const,
          iconColor: '#235037',
          iconBg: '#EEF7F1',
        },
        {
          label: 'Favoris',
          value: stats.bookmarksCount,
          badge: null,
          icon: 'bookmark-outline' as const,
          iconColor: '#235037',
          iconBg: '#FDEEF6',
        },
        {
          label: 'Rappels complétés',
          value: `${completionPct}%`,
          badge: null,
          icon: 'checkmark-circle-outline' as const,
          iconColor: '#235037',
          iconBg: '#FDEEF6',
        },
      ]
    : []

  const QUICK_ACTIONS = [
    { label: 'Topics', icon: 'grid-outline' as const, route: '/(protected)/topics' as const },
    { label: 'Documents', icon: 'cloud-upload-outline' as const, route: '/(protected)/topics' as const },
    { label: 'Calendrier', icon: 'calendar-outline' as const, route: '/(protected)/calendar' as const },
  ]

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 110 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#235037" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.title}>Tableau{'\n'}de bord</Text>
          <Text style={styles.subtitle}>
            Bonjour{firstName ? `, ${firstName}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0D0D0D" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>

        {/* ── Stat cards 2×2 ── */}
        {stats && (
          <View style={styles.statGrid}>
            {statCards.map((card, i) => (
              <View key={card.label} style={styles.statCard}>
                {/* Top row: label + badge */}
                <View style={styles.statCardTop}>
                  <Text style={styles.statLabel}>{card.label}</Text>
                  {card.badge && (
                    <View style={[styles.badge, { backgroundColor: card.badge.bg }]}>
                      <Text style={[styles.badgeText, { color: card.badge.color }]}>{card.badge.text}</Text>
                    </View>
                  )}
                </View>
                {/* Icon */}
                <View style={[styles.statIcon, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={18} color={card.iconColor} />
                </View>
                {/* Value */}
                <Text style={styles.statValue}>{String(card.value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Dépenses du mois (full-width card) ── */}
        {stats && (
          <TouchableOpacity
            onPress={() => router.push('/(protected)/depenses/index')}
            activeOpacity={0.85}
            style={styles.expenseCard}
          >
            <View style={styles.expenseCardTop}>
              <Text style={styles.expenseCardLabel}>Dépenses ce mois</Text>
              {stats.expenseBudget && (
                <View style={[styles.badge, {
                  backgroundColor: expenseOver ? '#FEE2E2' : expensePct > 80 ? '#FEF3C7' : '#FDEEF6',
                }]}>
                  <Text style={[styles.badgeText, {
                    color: expenseOver ? '#EF4444' : expensePct > 80 ? '#D97706' : '#B05080',
                  }]}>
                    {expensePct.toFixed(0)}% budget
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#EBA7CB" style={{ marginLeft: 'auto' }} />
            </View>

            <Text style={[styles.expenseAmount, expenseOver && { color: '#EF4444' }]}>
              {stats.expenseTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </Text>

            {stats.expenseBudget ? (
              <>
                <Text style={styles.expenseSubtitle}>
                  sur {stats.expenseBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} de budget mensuel
                </Text>
                {/* Gradient-style progress bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${expensePct}%` as any,
                        backgroundColor: expenseOver ? '#EF4444' : expensePct > 80 ? '#F59E0B' : '#235037',
                      },
                    ]}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={styles.progressLabel}>0 €</Text>
                  <Text style={styles.progressLabel}>{stats.expenseBudget.toFixed(0)} €</Text>
                </View>
              </>
            ) : (
              <Text style={styles.expenseSubtitle}>Définir un budget →</Text>
            )}
          </TouchableOpacity>
        )}

        {/* ── À traiter ── */}
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, {
              backgroundColor: urgentItems.length > 0 ? '#FEE2E2' : '#EEF7F1',
            }]}>
              <Ionicons
                name="notifications-outline"
                size={16}
                color={urgentItems.length > 0 ? '#EF4444' : '#235037'}
              />
            </View>
            <Text style={styles.sectionTitle}>À traiter</Text>
            {urgentItems.length > 0 && (
              <View style={[styles.badge, { backgroundColor: '#FEE2E2', marginLeft: 6 }]}>
                <Text style={[styles.badgeText, { color: '#EF4444' }]}>{urgentItems.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.listCard}>
            {urgentItems.length > 0 ? (
              urgentItems.map((entry, i) => {
                const isReminder = entry.type === 'reminder'
                const item = entry.item as any
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/(protected)/topics/${item.topic_slug}`)}
                    activeOpacity={0.7}
                    style={[styles.listItem, i > 0 && styles.listItemBorder]}
                  >
                    <View style={[styles.listItemIcon, {
                      backgroundColor: isReminder ? '#FEE2E2' : '#FEF3C7',
                    }]}>
                      <Ionicons
                        name={isReminder ? 'alarm' : 'document-outline'}
                        size={16}
                        color={isReminder ? '#EF4444' : '#D97706'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        {item.title ?? item.name}
                      </Text>
                      <Text style={[styles.listItemSub, {
                        color: isReminder ? '#EF4444' : '#D97706',
                      }]}>
                        {isReminder
                          ? new Date(item.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                          : `Expire dans ${entry.daysLeft} jour${entry.daysLeft !== 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <View style={[styles.badge, {
                      backgroundColor: isReminder ? '#FEE2E2' : '#FEF3C7',
                    }]}>
                      <Text style={[styles.badgeText, { color: isReminder ? '#EF4444' : '#D97706' }]}>
                        {isReminder ? 'En retard' : `J-${entry.daysLeft}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.listItemIcon, { backgroundColor: '#EEF7F1' }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#235037" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>Tout est à jour !</Text>
                  <Text style={styles.listItemSub}>Aucun rappel urgent ni document expirant.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(protected)/topics')}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>Créer un rappel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── Prochains rappels ── */}
        {stats && stats.upcomingReminders.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#EEF7F1' }]}>
                <Ionicons name="calendar-outline" size={16} color="#235037" />
              </View>
              <Text style={styles.sectionTitle}>Prochains rappels</Text>
            </View>
            <View style={styles.listCard}>
              {stats.upcomingReminders.map((reminder, i) => (
                <TouchableOpacity
                  key={reminder.id}
                  onPress={() => router.push(`/(protected)/topics/${reminder.topic_slug}`)}
                  activeOpacity={0.7}
                  style={[styles.listItem, i > 0 && styles.listItemBorder]}
                >
                  <View style={[styles.listItemIcon, { backgroundColor: '#EEF7F1' }]}>
                    <Ionicons name="alarm-outline" size={16} color="#235037" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{reminder.title}</Text>
                    {reminder.due_date && (
                      <Text style={styles.listItemSub}>
                        {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EBA7CB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Documents récents ── */}
        {stats && stats.recentDocs.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#EEF7F1' }]}>
                <Ionicons name="folder-open-outline" size={16} color="#235037" />
              </View>
              <Text style={styles.sectionTitle}>Documents récents</Text>
            </View>
            <View style={styles.listCard}>
              {stats.recentDocs.slice(0, 4).map((doc, i) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => router.push(`/(protected)/topics/${doc.topic_slug}`)}
                  activeOpacity={0.7}
                  style={[styles.listItem, i > 0 && styles.listItemBorder]}
                >
                  <View style={[styles.listItemIcon, { backgroundColor: '#EEF7F1' }]}>
                    <Ionicons name="document-text-outline" size={16} color="#235037" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.listItemSub}>
                      {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#EBA7CB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Actions rapides (toujours visible) ── */}
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#FDEEF6' }]}>
              <Ionicons name="flash-outline" size={16} color="#235037" />
            </View>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
          </View>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route)}
                activeOpacity={0.8}
                style={styles.actionBtn}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={22} color="#235037" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5E9AF',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Caprasimo_400Regular',
    color: '#0D0D0D',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Jost_300Light',
    color: '#71717A',
    marginTop: 6,
  },
  bellBtn: {
    width: 46,
    height: 46,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    gap: 16,
  },

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
    color: '#71717A',
    flex: 1,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 30,
    fontFamily: 'Caprasimo_400Regular',
    color: '#0D0D0D',
    letterSpacing: -0.5,
    lineHeight: 36,
  },

  // Badge
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
  },

  // Expense card
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  expenseCardLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    color: '#71717A',
  },
  expenseAmount: {
    fontSize: 38,
    fontFamily: 'Caprasimo_400Regular',
    color: '#0D0D0D',
    letterSpacing: -1,
    lineHeight: 46,
  },
  expenseSubtitle: {
    fontSize: 12,
    fontFamily: 'Jost_300Light',
    color: '#71717A',
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F5E9AF',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Jost_300Light',
    color: '#A1A1AA',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Caprasimo_400Regular',
    color: '#0D0D0D',
  },

  // List card
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  listItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F5E9AF',
  },
  listItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listItemTitle: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
    color: '#0D0D0D',
  },
  listItemSub: {
    fontSize: 12,
    fontFamily: 'Jost_300Light',
    color: '#71717A',
    marginTop: 1,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cta: {
    backgroundColor: '#EBA7CB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ctaText: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
    color: '#235037',
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#FDEEF6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    color: '#0D0D0D',
  },
})
