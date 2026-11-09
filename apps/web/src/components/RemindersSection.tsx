'use client'

import { useState, useMemo } from 'react'
import { createReminder, updateReminder, deleteReminder } from '@/app/actions/reminders'
import { exportTopicRemindersToIcs } from '@/app/actions/calendar-export'
import type { Reminder } from '@/types'
import type { PredefinedReminder } from '@/lib/predefined-reminders'
import { Clock, Check, Calendar, Trash2, Plus, Sparkles, Download, RefreshCw } from 'lucide-react'
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newRecurrence, setNewRecurrence] = useState<'annuel' | 'mensuel' | ''>('')
  const [addingReminder, setAddingReminder] = useState(false)

  const activatedPredefinedIds = useMemo(() => {
    return new Set(
      reminders
        .filter(r => {
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

  const availablePredefined = useMemo(() => {
    return predefinedReminders.filter(pr => !activatedPredefinedIds.has(pr.id))
  }, [predefinedReminders, activatedPredefinedIds])

  const handleAddCustomReminder = async () => {
    if (!newTitle.trim()) return
    setAddingReminder(true)
    const result = await createReminder(
      topicSlug,
      newTitle.trim(),
      undefined,
      newDueDate || undefined,
      newRecurrence || null
    )
    if (result.data) {
      setReminders([...reminders, result.data].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }))
      setNewTitle('')
      setNewDueDate('')
      setNewRecurrence('')
      setShowAddForm(false)
    }
    setAddingReminder(false)
  }

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
      const updated = reminders.map(r => r.id === reminderId ? result.data : r)
      setReminders(updated)
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
    <div className="card rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EEF7F1] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#235037]" />
          </div>
          <h2 className="text-lg font-semibold text-[#235037]">Rappels</h2>
        </div>
        <div className="flex items-center gap-1">
          {reminders.length > 0 && plan !== 'free' && (
            <button
              onClick={handleExportIcs}
              className="p-2 rounded-lg hover:bg-[#EEF7F1] transition-colors"
              title="Exporter les rappels (.ics)"
            >
              <Download className="w-4 h-4 text-[#5A6B61]" />
            </button>
          )}
          {!reminderLimitReached && (
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="p-2 rounded-lg hover:bg-[#EEF7F1] transition-colors"
              title="Ajouter un rappel"
            >
              <Plus className="w-4 h-4 text-[#5A6B61]" />
            </button>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout rapide */}
      {showAddForm && !reminderLimitReached && (
        <div className="mb-4 p-4 rounded-xl border border-[#E8E8E8] bg-[#EEF7F1]/40 space-y-3">
          <input
            type="text"
            placeholder="Titre du rappel"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E8E8E8] bg-white text-sm text-[#1a2e22] placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-[#E8E8E8] bg-white text-sm text-[#1a2e22] focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40"
            />
            <select
              value={newRecurrence}
              onChange={e => setNewRecurrence(e.target.value as 'annuel' | 'mensuel' | '')}
              className="flex-1 px-3 py-2 rounded-lg border border-[#E8E8E8] bg-white text-sm text-[#1a2e22] focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40"
            >
              <option value="">Aucune récurrence</option>
              <option value="mensuel">Mensuelle</option>
              <option value="annuel">Annuelle</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDueDate(''); setNewRecurrence('') }}
              className="px-3 py-1.5 rounded-lg text-xs text-[#5A6B61] hover:text-[#1a2e22] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddCustomReminder}
              disabled={!newTitle.trim() || addingReminder}
              className="px-4 py-1.5 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {addingReminder ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

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
            <Sparkles className="w-4 h-4 text-[#235037]" />
            <h3 className="text-sm font-semibold text-[#5A6B61]">Rappels proposés</h3>
          </div>
          <div className="space-y-2">
            {availablePredefined.map((predefined) => (
              <div
                key={predefined.id}
                className="group relative p-3 rounded-xl border border-[#235037]/20 bg-[#EEF7F1]/50 hover:bg-[#EEF7F1] transition-all duration-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#235037]/40 flex items-center justify-center">
                    <Plus className="w-2.5 h-2.5 text-[#235037]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[#1a2e22] mb-0.5 leading-tight">
                      {predefined.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3 h-3 text-[#235037]" />
                      <span className="text-xs text-[#235037] font-medium">
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
                    className="px-2.5 py-1 rounded-lg bg-[#235037] hover:bg-[#1a3d2a] text-white text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    Activer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Mes rappels actives */}
      {reminders.length > 0 && (
        <div>
          {availablePredefined.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#235037]" />
              <h3 className="text-sm font-semibold text-[#5A6B61]">Mes rappels</h3>
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
                      ? 'border-[#E8E8E8] bg-[#EEF7F1]/30 opacity-60'
                      : overdue
                      ? 'border-red-200 bg-red-50'
                      : 'border-[#E8E8E8] hover:border-[#235037]/20 bg-white hover:bg-[#EEF7F1]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(reminder.id, !reminder.completed)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        reminder.completed
                          ? 'bg-[#235037] border-[#235037]'
                          : 'border-[#E8E8E8] hover:border-[#235037]'
                      }`}
                    >
                      {reminder.completed && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`text-sm font-semibold ${
                          reminder.completed ? 'text-[#5A6B61] line-through' : 'text-[#1a2e22]'
                        }`}>
                          {reminder.title}
                        </h3>
                        {isPredefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF7F1] text-[#235037]">
                            Automatique
                          </span>
                        )}
                        {reminder.recurrence && (
                          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-[#EBA7CB]/20 text-[#235037]">
                            <RefreshCw className="w-2.5 h-2.5" />
                            {reminder.recurrence === 'annuel' ? 'Annuel' : 'Mensuel'}
                          </span>
                        )}
                      </div>
                      {reminder.description && (
                        <p className={`text-xs mb-2 ${
                          reminder.completed ? 'text-[#5A6B61]' : 'text-[#5A6B61]'
                        }`}>
                          {reminder.description}
                        </p>
                      )}
                      {reminder.due_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-[#5A6B61]" />
                          <span className={`text-xs ${
                            overdue && !reminder.completed ? 'text-red-600 font-semibold' : 'text-[#5A6B61]'
                          }`}>
                            {new Date(reminder.due_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {overdue && !reminder.completed && (
                            <span className="text-xs text-red-600 font-semibold">(En retard)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => isPredefined ? handleDeactivateReminder(reminder.id) : handleDeleteReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-red-500"
                      title={isPredefined ? 'Désactiver ce rappel' : 'Supprimer ce rappel'}
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
        <p className="text-[#5A6B61] text-sm text-center py-8">
          Aucun rappel disponible pour ce sujet.
        </p>
      )}
    </div>
  )
}
