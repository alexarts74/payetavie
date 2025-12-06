'use client'

import { useState } from 'react'
import { createNote, updateNote, deleteNote } from '@/app/actions/notes'
import type { Note } from '@/types'
import { PenSquare, Edit, Trash2, Plus } from 'lucide-react'

interface NotesSectionProps {
  topicSlug: string
  initialNotes: Note[]
}

export default function NotesSection({ topicSlug, initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isAdding, setIsAdding] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    const result = await createNote(topicSlug, newNoteContent)
    console.log(result)
    if (result.data) {
      setNotes([result.data, ...notes])
      setNewNoteContent('')
      setIsAdding(false)
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return

    const result = await updateNote(noteId, editingContent)
    if (result.data) {
      setNotes(notes.map(n => n.id === noteId ? result.data : n))
      setEditingId(null)
      setEditingContent('')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return

    const result = await deleteNote(noteId)
    if (result.success) {
      setNotes(notes.filter(n => n.id !== noteId))
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <PenSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Notes personnelles</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 rounded-[1.25rem] border border-green-200 bg-green-50">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Écrivez votre note..."
            className="w-full p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddNote}
              className="px-4 py-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium hover:shadow-md transition-all"
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewNoteContent('')
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.length === 0 && !isAdding ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            Aucune note pour le moment. Ajoutez votre première note !
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group relative p-4 rounded-[1.25rem] border border-green-100 hover:border-green-300 bg-white hover:bg-green-50 transition-all duration-300"
            >
              {editingId === note.id ? (
                <>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-medium hover:shadow-md transition-all"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingContent('')
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-100">
                    <span className="text-xs text-zinc-500">
                      {new Date(note.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(note.id)
                          setEditingContent(note.content)
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

