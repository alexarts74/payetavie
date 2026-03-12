'use client'

import { useState, useMemo } from 'react'
import { createReminder, updateReminder, deleteReminder } from '@/app/actions/reminders'
import { exportTopicRemindersToIcs } from '@/app/actions/calendar-export'
import type { Reminder } from '@/types'
import type { PredefinedReminder } from '@/lib/predefined-reminders'
import { Clock, Check, Calendar, Trash2, Plus, Sparkles, Download } from 'lucide-react'
import type { PlanName } from '@/types'
import UpgradePrompt from '@/components/UpgradePrompt'

interface RemindersSectionProps {
  topicSlug: string
  initialReminders: Reminder[]
  predefinedReminders: PredefinedReminder[]
  plan?: PlanName
  remindersCount?: number
  remindersLimit?: number
}

export default function RemindersSection({ topicSlug, initialReminders, predefinedReminders, plan, remindersCount, remindersLimit }: RemindersSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)

  // Identifier quels rappels predefinis sont deja actives
  // On compare par titre et date pour matcher
  const activatedPredefinedIds = useMemo(() => {
    return new Set(
      reminders
        .filter(r => {
          // Verifier si ce rappel correspond a un rappel predefini
          return predefinedReminders.some(pr =>
            pr.title === r.title &&
            pr.dueDate === r.due_date
          )
        })
        .map(r => {
          const match = predefinedReminders.find(pr =>
            pr.title === r.title &&
            pr.dueDate === r.due_date
          )
          return match?.id
        })
        .filter(Boolean) as string[]
    )
  }, [reminders, predefinedReminders])

  // Separer les rappels predefinis en actives et non actives
  const availablePredefined = useMemo(() => {
    return predefinedReminders.filter(pr => !activatedPredefinedIds.has(pr.id))
  }, [predefinedReminders, activatedPredefinedIds])

  const handleActivatePredefined = async (predefined: PredefinedReminder) => {
    const result = await createReminder(
      topicSlug,
      predefined.title,
      predefined.description || undefined,
      predefined.dueDate
    )
    if (result.data) {
      setReminders([...reminders, result.data].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }))
    }
  }

  const handleDeactivateReminder = async (reminderId: string) => {
    const result = await deleteReminder(reminderId)
    if (result.success) {
      setReminders(reminders.filter(r => r.id !== reminderId))
    }
  }

  const handleToggleComplete = async (reminderId: string, completed: boolean) => {
    const result = await updateReminder(reminderId, { completed })
    if (result.data) {
      setReminders(reminders.map(r => r.id === reminderId ? result.data : r))
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Supprimer ce rappel ?')) return

    const result = await deleteReminder(reminderId)
    if (result.success) {
      setReminders(reminders.filter(r => r.id !== reminderId))
    }
  }

  const handleExportIcs = async () => {
    const result = await exportTopicRemindersToIcs(topicSlug)
    if ('data' in result) {
      const blob = new Blob([result.data], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payetavie-${topicSlug}.ics`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const isOverdue = (dueDate: string | null, reminderId: string) => {
    if (!dueDate) return false
    const reminder = reminders.find(r => r.id === reminderId)
    return new Date(dueDate) < new Date() && !reminder?.completed
  }

  const reminderLimitReached = plan === 'free' && remindersCount !== undefined && remindersLimit !== undefined && remindersCount >= remindersLimit

  return (
    <div className="glass-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Rappels</h2>
        </div>
        {reminders.length > 0 && plan !== 'free' && (
          <button
            onClick={handleExportIcs}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Exporter les rappels (.ics)"
          >
            <Download className="w-4 h-4 text-zinc-700 dark:text-zinc-400" />
          </button>
        )}
      </div>

      {reminderLimitReached && (
        <div className="mb-4">
          <UpgradePrompt
            requiredPlan="essentiel"
            currentCount={remindersCount}
            limit={remindersLimit}
            resourceLabel="rappels actifs"
          />
        </div>
      )}

      {/* Section Rappels proposes */}
      {availablePredefined.length > 0 && !reminderLimitReached && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Rappels proposes</h3>
          </div>
          <div className="space-y-2">
            {availablePredefined.map((predefined) => {
              return (
                <div
                  key={predefined.id}
                  className="group relative p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-indigo-400 dark:border-indigo-500 flex items-center justify-center">
                      <Plus className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5 leading-tight">
                        {predefined.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                          {new Date(predefined.dueDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleActivatePredefined(predefined)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Activer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Section Mes rappels actives */}
      {reminders.length > 0 && (
        <div>
          {availablePredefined.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Mes rappels</h3>
            </div>
          )}
          <div className="space-y-2">
            {reminders.map((reminder) => {
              const overdue = isOverdue(reminder.due_date, reminder.id)
              const isPredefined = predefinedReminders.some(pr =>
                pr.title === reminder.title &&
                pr.dueDate === reminder.due_date
              )
              return (
                <div
                  key={reminder.id}
                  className={`group relative p-4 rounded-[1.25rem] border transition-all duration-300 ${
                    reminder.completed
                      ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 opacity-60'
                      : overdue
                      ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/30'
                      : 'border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600/50 bg-white dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(reminder.id, !reminder.completed)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        reminder.completed
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-500 dark:hover:border-indigo-500'
                      }`}
                    >
                      {reminder.completed && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${
                          reminder.completed ? 'text-zinc-600 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {reminder.title}
                        </h3>
                        {isPredefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                            Automatique
                          </span>
                        )}
                      </div>
                      {reminder.description && (
                        <p className={`text-xs mb-2 ${
                          reminder.completed ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-400'
                        }`}>
                          {reminder.description}
                        </p>
                      )}
                      {reminder.due_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-zinc-500 dark:text-zinc-500" />
                          <span className={`text-xs ${
                            overdue && !reminder.completed ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {new Date(reminder.due_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {overdue && !reminder.completed && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">(En retard)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => isPredefined ? handleDeactivateReminder(reminder.id) : handleDeleteReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                      title={isPredefined ? 'Desactiver ce rappel' : 'Supprimer ce rappel'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Message si aucun rappel */}
      {reminders.length === 0 && availablePredefined.length === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center py-8">
          Aucun rappel disponible pour ce sujet.
        </p>
      )}
    </div>
  )
}
