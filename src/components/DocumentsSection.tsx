'use client'

import { useState, useRef } from 'react'
import { uploadDocument, deleteDocument, updateDocument } from '@/app/actions/documents'
import type { Document } from '@/types'
import { FileText, Upload, X, Download, Calendar, Edit2, Trash2, Check, X as XIcon } from 'lucide-react'

interface DocumentsSectionProps {
  topicSlug: string
  initialDocuments: (Document & { public_url: string })[]
}

export default function DocumentsSection({ topicSlug, initialDocuments }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<(Document & { public_url: string })[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', expiresAt: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 [CLIENT] Fichier sélectionné')
    const file = e.target.files?.[0]
    console.log('📁 [CLIENT] Fichier:', file ? { name: file.name, size: file.size, type: file.type } : 'null')
    
    if (!file) {
      console.log('📁 [CLIENT] ❌ Aucun fichier sélectionné')
      return
    }

    console.log('📁 [CLIENT] Début upload, topicSlug:', topicSlug)
    setIsUploading(true)
    
    try {
      const result = await uploadDocument(topicSlug, file, file.name)
      console.log('📁 [CLIENT] Résultat upload:', result)
      
      if (result.data) {
        console.log('📁 [CLIENT] ✅ Document ajouté avec succès')
        setDocuments([result.data, ...documents])
      } else if (result.error) {
        console.error('📁 [CLIENT] ❌ Erreur upload:', result.error)
        alert(`Erreur lors de l'upload: ${result.error}`)
      }
    } catch (error) {
      console.error('📁 [CLIENT] ❌ Exception lors de l\'upload:', error)
      alert(`Erreur: ${error}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Supprimer ce document ?')) return

    const result = await deleteDocument(documentId)
    if (result.success) {
      setDocuments(documents.filter(d => d.id !== documentId))
    }
  }

  const handleEdit = (doc: Document & { public_url: string }) => {
    setEditingId(doc.id)
    setEditForm({
      name: doc.name,
      description: doc.description || '',
      expiresAt: doc.expires_at ? doc.expires_at.split('T')[0] : ''
    })
  }

  const handleSaveEdit = async (documentId: string) => {
    const result = await updateDocument(documentId, {
      name: editForm.name,
      description: editForm.description || undefined,
      expiresAt: editForm.expiresAt || null
    })

    if (result.data) {
      setDocuments(documents.map(d => d.id === documentId ? { ...d, ...result.data } : d))
      setEditingId(null)
      setEditForm({ name: '', description: '', expiresAt: '' })
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Taille inconnue'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-5 h-5" />
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />
    if (fileType.includes('image')) return <FileText className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Documents & Pièces justificatives</h2>
        </div>
        <label className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {isUploading ? 'Upload...' : 'Ajouter'}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            Aucun document pour le moment. Ajoutez votre premier document !
          </p>
        ) : (
          documents.map((doc) => {
            const expired = isExpired(doc.expires_at)
            return (
              <div
                key={doc.id}
                className={`group relative p-4 rounded-[1.25rem] border transition-all duration-300 ${
                  expired
                    ? 'border-red-200 bg-red-50'
                    : 'border-indigo-100 hover:border-indigo-300 bg-white hover:bg-indigo-50'
                }`}
              >
                {editingId === doc.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nom du document"
                      className="w-full p-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description (optionnel)"
                      className="w-full p-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={2}
                    />
                    <input
                      type="date"
                      value={editForm.expiresAt}
                      onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                      placeholder="Date d'expiration (optionnel)"
                      className="w-full p-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium hover:shadow-md transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditForm({ name: '', description: '', expiresAt: '' })
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200 transition-all flex items-center gap-1"
                      >
                        <XIcon className="w-3 h-3" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-1 truncate">
                          {doc.name}
                        </h3>
                        {doc.description && (
                          <p className="text-xs text-zinc-600 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          {doc.expires_at && (
                            <div className={`flex items-center gap-1 ${
                              expired ? 'text-red-600 font-semibold' : ''
                            }`}>
                              <Calendar className="w-3 h-3" />
                              <span>
                                {expired ? 'Expiré le ' : 'Expire le '}
                                {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={doc.public_url}
                          download
                          className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-all"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

