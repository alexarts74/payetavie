'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Copy, Send, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import type { BillingDocumentWithItems, ProfessionalProfile, InvoiceStatus } from '@/types'
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge'
import InvoicePreview from '@/components/InvoicePreview'
import { updateInvoiceStatus, deleteInvoice, duplicateInvoice } from '@/app/actions/invoices'

interface InvoiceDetailContentProps {
  invoice: BillingDocumentWithItems
  profile: ProfessionalProfile | null
}

const statusActions: Record<InvoiceStatus, { label: string; next: InvoiceStatus; icon: typeof Send; color: string }[]> = {
  brouillon: [
    { label: 'Marquer envoyee', next: 'envoyee', icon: Send, color: 'from-blue-600 to-indigo-600' },
    { label: 'Annuler', next: 'annulee', icon: XCircle, color: 'from-zinc-600 to-zinc-700' },
  ],
  envoyee: [
    { label: 'Marquer payee', next: 'payee', icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Marquer en retard', next: 'en_retard', icon: AlertCircle, color: 'from-red-600 to-orange-600' },
    { label: 'Annuler', next: 'annulee', icon: XCircle, color: 'from-zinc-600 to-zinc-700' },
  ],
  en_retard: [
    { label: 'Marquer payee', next: 'payee', icon: CheckCircle, color: 'from-green-600 to-emerald-600' },
    { label: 'Annuler', next: 'annulee', icon: XCircle, color: 'from-zinc-600 to-zinc-700' },
  ],
  payee: [],
  annulee: [],
}

export default function InvoiceDetailContent({ invoice: initial, profile }: InvoiceDetailContentProps) {
  const router = useRouter()
  const [invoice, setInvoice] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, newStatus)
      if (result.success) {
        setInvoice(prev => ({ ...prev, status: newStatus }))
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Supprimer cette facture brouillon ?')) return
    startTransition(async () => {
      const result = await deleteInvoice(invoice.id)
      if (result.success) {
        router.push('/freelance/facturation/factures')
      }
    })
  }

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateInvoice(invoice.id)
      if (result.data) {
        router.push(`/freelance/facturation/factures/${result.data.id}`)
      }
    })
  }

  const actions = statusActions[invoice.status as InvoiceStatus] || []

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push('/freelance/facturation/factures')}
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux factures
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {invoice.document_number}
            </h1>
            <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
          </div>
          <div className="flex flex-wrap gap-2">
            {invoice.status === 'brouillon' && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
            <button
              onClick={handleDuplicate}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Dupliquer
            </button>
            <Link
              href={`/api/freelance/invoices/${invoice.id}/pdf`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </Link>
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

        {/* Quotation link */}
        {invoice.source_document_id && (
          <div className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Issue du devis{' '}
            <Link href={`/freelance/facturation/devis/${invoice.source_document_id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              voir le devis
            </Link>
          </div>
        )}

        {/* Preview */}
        <div className="animate-slide-up">
          <InvoicePreview document={invoice} profile={profile} type="invoice" />
        </div>
      </div>
    </div>
  )
}
