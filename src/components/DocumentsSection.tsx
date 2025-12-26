'use client'

import { useState, useRef } from 'react'
import { uploadDocument, deleteDocument, updateDocument } from '@/app/actions/documents'
import type { Document } from '@/types'
import { FileText, Upload, X, Download, Calendar, Edit2, Trash2, Check, X as XIcon } from 'lucide-react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, categoryName: string, expiresAt?: string) => Promise<void>
  isUploading: boolean
  title: string
  categoryLabel: string
  categoryPlaceholder: string
  showExpiresAt?: boolean
  categoryOptions?: { value: string; label: string }[]
  useSelect?: boolean
}

interface DocumentsSectionProps {
  topicSlug: string
  initialDocuments: (Document & { public_url: string })[]
}

function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading, 
  title, 
  categoryLabel, 
  categoryPlaceholder,
  showExpiresAt = false,
  categoryOptions,
  useSelect = false
}: UploadModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      alert(`Merci de renseigner ${categoryLabel.toLowerCase()}.`)
      return
    }
    if (!selectedFile) {
      alert('Merci de sélectionner un fichier.')
      return
    }
    await onUpload(selectedFile, categoryName.trim(), showExpiresAt ? expiresAt : undefined)
    setCategoryName('')
    setExpiresAt('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setCategoryName('')
    setExpiresAt('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-all"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              {categoryLabel} <span className="text-red-500">*</span>
            </label>
            {useSelect && categoryOptions ? (
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isUploading}
              >
                <option value="">Sélectionner un type</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={categoryPlaceholder}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isUploading}
              />
            )}
          </div>

          {showExpiresAt && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Date d'expiration (optionnel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isUploading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Fichier <span className="text-red-500">*</span>
            </label>
            <label className="block w-full p-4 rounded-xl border-2 border-dashed border-zinc-300 hover:border-indigo-400 transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-600">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Cliquez pour sélectionner un fichier</span>
                    <span className="text-xs">PDF, PNG, JPG</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-200 transition-all"
              disabled={isUploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isUploading || !categoryName.trim() || !selectedFile}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DocumentsSection({ topicSlug, initialDocuments }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<(Document & { public_url: string })[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', expiresAt: '', employerName: '', documentType: '' })
  const isPayslipTopic = topicSlug === 'fiches-de-paie'
  const isLogementTopic = topicSlug === 'logement'
  const isAssurancesTopic = topicSlug === 'assurances'
  const needsCategory = isPayslipTopic || isLogementTopic || isAssurancesTopic
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (needsCategory) {
      setShowUploadModal(true)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadDocument(topicSlug, file, file.name)
      if (result.data) {
        setDocuments([result.data, ...documents])
      } else if (result.error) {
        alert(`Erreur lors de l'upload: ${result.error}`)
      }
    } catch (error) {
      alert(`Erreur: ${error}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadFromModal = async (file: File, categoryName: string, expiresAt?: string) => {
    setIsUploading(true)
    try {
      if (isPayslipTopic) {
        const result = await uploadDocument(topicSlug, file, file.name, undefined, undefined, categoryName)
        if (result.data) {
          setDocuments([result.data, ...documents])
          setShowUploadModal(false)
        } else if (result.error) {
          alert(`Erreur lors de l'upload: ${result.error}`)
        }
      } else if (isLogementTopic) {
        const result = await uploadDocument(topicSlug, file, file.name, undefined, expiresAt, undefined, categoryName)
        if (result.data) {
          setDocuments([result.data, ...documents])
          setShowUploadModal(false)
        } else if (result.error) {
          alert(`Erreur lors de l'upload: ${result.error}`)
        }
      } else if (isAssurancesTopic) {
        const result = await uploadDocument(topicSlug, file, file.name, undefined, expiresAt, undefined, categoryName)
        if (result.data) {
          setDocuments([result.data, ...documents])
          setShowUploadModal(false)
        } else if (result.error) {
          alert(`Erreur lors de l'upload: ${result.error}`)
        }
      }
    } catch (error) {
      alert(`Erreur: ${error}`)
    } finally {
      setIsUploading(false)
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
      expiresAt: doc.expires_at ? doc.expires_at.split('T')[0] : '',
      employerName: (doc as any).employer_name || '',
      documentType: (doc as any).document_type || ''
    })
  }

  const handleSaveEdit = async (documentId: string) => {
    const result = await updateDocument(documentId, {
      name: editForm.name,
      description: editForm.description || undefined,
      expiresAt: editForm.expiresAt || null,
      employerName: isPayslipTopic ? (editForm.employerName || null) : undefined,
      documentType: (isLogementTopic || isAssurancesTopic) ? (editForm.documentType || null) : undefined
    })

    if (result.data) {
      setDocuments(documents.map(d => d.id === documentId ? { ...d, ...result.data } : d))
      setEditingId(null)
      setEditForm({ name: '', description: '', expiresAt: '', employerName: '', documentType: '' })
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const categories = isPayslipTopic
    ? Array.from(new Set(documents.map(d => (d as any).employer_name).filter(Boolean))) as string[]
    : (isLogementTopic || isAssurancesTopic)
    ? Array.from(new Set(documents.map(d => (d as any).document_type).filter(Boolean))) as string[]
    : []

  const filteredDocuments = needsCategory && selectedCategory !== 'all'
    ? documents.filter(d => 
        isPayslipTopic 
          ? (d as any).employer_name === selectedCategory
          : (isLogementTopic || isAssurancesTopic)
          ? (d as any).document_type === selectedCategory
          : true
      )
    : documents

  const documentTypesLogement = [
    { value: 'bail', label: 'Bail / Contrat de location' },
    { value: 'assurance', label: 'Assurance habitation' },
    { value: 'charges', label: 'Charges / Quittances' },
    { value: 'etat-des-lieux', label: 'État des lieux' },
    { value: 'depot-garantie', label: 'Dépôt de garantie' },
    { value: 'autre', label: 'Autre' }
  ]

  const documentTypesAssurances = [
    { value: 'contrat-auto', label: 'Contrat assurance auto' },
    { value: 'contrat-habitation', label: 'Contrat assurance habitation' },
    { value: 'contrat-sante', label: 'Contrat assurance santé' },
    { value: 'attestation', label: 'Attestation d\'assurance' },
    { value: 'avis-echeance', label: 'Avis d\'échéance' },
    { value: 'sinistre', label: 'Sinistre / Déclaration' },
    { value: 'autre', label: 'Autre' }
  ]

  const documentTypes = isLogementTopic ? documentTypesLogement : documentTypesAssurances

  const getModalConfig = () => {
    if (isPayslipTopic) {
      return {
        title: 'Ajouter une fiche de paie',
        categoryLabel: 'Nom de l\'entreprise',
        categoryPlaceholder: 'Ex: Acme Corp',
        showExpiresAt: false,
        categoryOptions: undefined,
        useSelect: false
      }
    }
    if (isLogementTopic) {
      return {
        title: 'Ajouter un document logement',
        categoryLabel: 'Type de document',
        categoryPlaceholder: 'Sélectionner un type',
        showExpiresAt: true,
        categoryOptions: documentTypesLogement,
        useSelect: true
      }
    }
    if (isAssurancesTopic) {
      return {
        title: 'Ajouter un document assurance',
        categoryLabel: 'Type de document',
        categoryPlaceholder: 'Sélectionner un type',
        showExpiresAt: true,
        categoryOptions: documentTypesAssurances,
        useSelect: true
      }
    }
    return {
      title: 'Ajouter un document',
      categoryLabel: 'Catégorie',
      categoryPlaceholder: 'Catégorie',
      showExpiresAt: false,
      categoryOptions: undefined,
      useSelect: false
    }
  }

  const getFilterLabel = () => {
    if (isPayslipTopic) return 'Filtrer par entreprise'
    if (isLogementTopic) return 'Filtrer par type'
    if (isAssurancesTopic) return 'Filtrer par type'
    return 'Filtrer'
  }

  const getTypeLabel = (type: string | null) => {
    if (!type) return null
    const allTypes = [...documentTypesLogement, ...documentTypesAssurances]
    const found = allTypes.find(t => t.value === type)
    return found ? found.label : type
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
        <button
          onClick={() => needsCategory ? setShowUploadModal(true) : fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          disabled={isUploading}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Upload...' : 'Ajouter'}
        </button>
        {!needsCategory && (
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        )}
      </div>

      {needsCategory && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="font-medium">{getFilterLabel()} :</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full border text-xs transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full border text-xs transition-all max-w-[120px] truncate ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
                title={(isLogementTopic || isAssurancesTopic) ? getTypeLabel(cat) || cat : cat}
              >
                {(isLogementTopic || isAssurancesTopic) ? (getTypeLabel(cat) || cat) : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            Aucun document pour le moment. Ajoutez votre premier document !
          </p>
        ) : (
          filteredDocuments.map((doc) => {
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
                    {isPayslipTopic && (
                      <input
                        type="text"
                        value={editForm.employerName}
                        onChange={(e) => setEditForm({ ...editForm, employerName: e.target.value })}
                        placeholder="Nom de l'entreprise"
                        className="w-full p-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    {(isLogementTopic || isAssurancesTopic) && (
                      <select
                        value={editForm.documentType}
                        onChange={(e) => setEditForm({ ...editForm, documentType: e.target.value })}
                        className="w-full p-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Sélectionner un type</option>
                        {(isLogementTopic ? documentTypesLogement : documentTypesAssurances).map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    )}
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
                          setEditForm({ name: '', description: '', expiresAt: '', employerName: '' })
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
                        {isPayslipTopic && (doc as any).employer_name && (
                          <p className="text-[11px] text-indigo-700 font-medium mb-1">
                            {(doc as any).employer_name}
                          </p>
                        )}
                        {(isLogementTopic || isAssurancesTopic) && (doc as any).document_type && (
                          <p className="text-[11px] text-indigo-700 font-medium mb-1">
                            {getTypeLabel((doc as any).document_type)}
                          </p>
                        )}
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

      {needsCategory && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFromModal}
          isUploading={isUploading}
          {...getModalConfig()}
        />
      )}
    </div>
  )
}

