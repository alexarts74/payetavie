'use client'

import { useState, useMemo } from 'react'
import { createReminder, updateReminder, deleteReminder } from '@/app/actions/reminders'
import type { Reminder } from '@/types'
import type { PredefinedReminder } from '@/lib/predefined-reminders'
import { Clock, Check, Calendar, Trash2, Plus, Sparkles } from 'lucide-react'

interface RemindersSectionProps {
  topicSlug: string
  initialReminders: Reminder[]
  predefinedReminders: PredefinedReminder[]
}

export default function RemindersSection({ topicSlug, initialReminders, predefinedReminders }: RemindersSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)

  // Identifier quels rappels prédéfinis sont déjà activés
  // On compare par titre et date pour matcher
  const activatedPredefinedIds = useMemo(() => {
    return new Set(
      reminders
        .filter(r => {
          // Vérifier si ce rappel correspond à un rappel prédéfini
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

  // Séparer les rappels prédéfinis en activés et non activés
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

  const isOverdue = (dueDate: string | null, reminderId: string) => {
    if (!dueDate) return false
    const reminder = reminders.find(r => r.id === reminderId)
    return new Date(dueDate) < new Date() && !reminder?.completed
  }

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
      <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Rappels</h2>
        </div>

      {/* Section Rappels proposés */}
      {availablePredefined.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-zinc-700">Rappels proposés</h3>
          </div>
          <div className="space-y-2">
            {availablePredefined.map((predefined) => {
              return (
                <div
                  key={predefined.id}
                  className="group relative p-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                      <Plus className="w-2.5 h-2.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-zinc-900 mb-0.5 leading-tight">
                        {predefined.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span className="text-xs text-indigo-700 font-medium">
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
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium hover:shadow-md transition-all flex items-center gap-1 flex-shrink-0"
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

      {/* Section Mes rappels activés */}
      {reminders.length > 0 && (
        <div>
          {availablePredefined.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-semibold text-zinc-700">Mes rappels</h3>
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
                    ? 'border-zinc-200 bg-zinc-50 opacity-60'
                    : overdue
                    ? 'border-red-200 bg-red-50'
                    : 'border-orange-100 hover:border-orange-300 bg-white hover:bg-orange-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(reminder.id, !reminder.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      reminder.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-orange-300 hover:border-orange-500'
                    }`}
                  >
                    {reminder.completed && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${
                      reminder.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'
                    }`}>
                      {reminder.title}
                    </h3>
                        {isPredefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Automatique
                          </span>
                        )}
                      </div>
                    {reminder.description && (
                      <p className={`text-xs mb-2 ${
                        reminder.completed ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {reminder.description}
                      </p>
                    )}
                    {reminder.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span className={`text-xs ${
                          overdue && !reminder.completed ? 'text-red-600 font-semibold' : 'text-zinc-500'
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-100 text-red-600"
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
        <p className="text-zinc-500 text-sm text-center py-8">
          Aucun rappel disponible pour ce sujet.
        </p>
      )}
    </div>
  )
}

