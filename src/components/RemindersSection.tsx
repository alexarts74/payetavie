'use client'

import { useState } from 'react'
import { createReminder, updateReminder, deleteReminder } from '@/app/actions/reminders'
import type { Reminder } from '@/types'
import { Clock, Check, Calendar, Trash2, Plus } from 'lucide-react'

interface RemindersSectionProps {
  topicSlug: string
  initialReminders: Reminder[]
}

export default function RemindersSection({ topicSlug, initialReminders }: RemindersSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [isAdding, setIsAdding] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
  })

  const handleAddReminder = async () => {
    if (!newReminder.title.trim()) return

    const result = await createReminder(
      topicSlug,
      newReminder.title,
      newReminder.description || undefined,
      newReminder.dueDate || undefined
    )
    if (result.data) {
      setReminders([...reminders, result.data].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }))
      setNewReminder({ title: '', description: '', dueDate: '' })
      setIsAdding(false)
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

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && !reminders.find(r => r.due_date === dueDate)?.completed
  }

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Rappels</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 rounded-[1.25rem] border border-orange-200 bg-orange-50">
          <input
            type="text"
            value={newReminder.title}
            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
            placeholder="Titre du rappel"
            className="w-full p-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
            autoFocus
          />
          <textarea
            value={newReminder.description}
            onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
            placeholder="Description (optionnel)"
            className="w-full p-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-2"
            rows={2}
          />
          <input
            type="date"
            value={newReminder.dueDate}
            onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
            className="w-full p-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddReminder}
              className="px-4 py-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm font-medium hover:shadow-md transition-all"
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewReminder({ title: '', description: '', dueDate: '' })
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {reminders.length === 0 && !isAdding ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            Aucun rappel pour le moment. Ajoutez votre premier rappel !
          </p>
        ) : (
          reminders.map((reminder) => {
            const overdue = isOverdue(reminder.due_date)
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
                    <h3 className={`text-sm font-semibold mb-1 ${
                      reminder.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'
                    }`}>
                      {reminder.title}
                    </h3>
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
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

