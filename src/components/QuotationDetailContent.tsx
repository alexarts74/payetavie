'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Send, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react'
import type { BillingDocumentWithItems, ProfessionalProfile, QuotationStatus } from '@/types'
import { QuotationStatusBadge } from '@/components/InvoiceStatusBadge'
import InvoicePreview from '@/components/InvoicePreview'
import { updateQuotationStatus, deleteQuotation, convertQuotationToInvoice } from '@/app/actions/quotations'

interface QuotationDetailContentProps {
  quotation: BillingDocumentWithItems
  profile: ProfessionalProfile | null
}

const statusActions: Record<QuotationStatus, { label: string; next: QuotationStatus; icon: typeof Send; color: string }[]> = {
  brouillon: [
    { label: 'Marquer envoye', next: 'envoye', icon: Send, color: 'from-blue-600 to-indigo-600' },
    { label: 'Refuser', next: 'refuse', icon: XCircle, color: 'from-zinc-600 to-zinc-700' },
  ],
  envoye: [
    { label: 'Accepter', next: 'accepte', icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Refuser', next: 'refuse', icon: XCircle, color: 'from-red-600 to-orange-600' },
  ],
  accepte: [],
  refuse: [],
  facture: [],
}

export default function QuotationDetailContent({ quotation: initial, profile }: QuotationDetailContentProps) {
  const router = useRouter()
  const [quotation, setQuotation] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: QuotationStatus) => {
    startTransition(async () => {
      const result = await updateQuotationStatus(quotation.id, newStatus)
      if (result.success) {
        setQuotation(prev => ({ ...prev, status: newStatus }))
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Supprimer ce devis brouillon ?')) return
    startTransition(async () => {
      const result = await deleteQuotation(quotation.id)
      if (result.success) {
        router.push('/freelance/facturation/devis')
      }
    })
  }

  const handleConvert = () => {
    startTransition(async () => {
      const result = await convertQuotationToInvoice(quotation.id)
      if (result.data) {
        router.push(`/freelance/facturation/factures/${result.data.id}`)
      }
    })
  }

  const actions = statusActions[quotation.status as QuotationStatus] || []

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push('/freelance/facturation/devis')}
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux devis
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {quotation.document_number}
            </h1>
            <QuotationStatusBadge status={quotation.status as QuotationStatus} />
          </div>
          <div className="flex flex-wrap gap-2">
            {quotation.status === 'brouillon' && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
            <Link
              href={`/api/freelance/quotations/${quotation.id}/pdf`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </Link>
            {quotation.status === 'accepte' && (
              <button
                onClick={handleConvert}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 transition-all shadow-sm disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Convertir en facture
              </button>
            )}
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.next}
                  onClick={() => handleStatusChange(action.next)}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${action.color} transition-all shadow-sm disabled:opacity-50`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Invoice link */}
        {quotation.source_document_id && (
          <div className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Converti en facture{' '}
            <Link href={`/freelance/facturation/factures/${quotation.source_document_id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              voir la facture
            </Link>
          </div>
        )}

        {/* Preview */}
        <div className="animate-slide-up">
          <InvoicePreview document={quotation} profile={profile} type="quotation" />
        </div>
      </div>
    </div>
  )
}
