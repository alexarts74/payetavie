'use client'

import type { InvoiceStatus, QuotationStatus } from '@/types'

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  envoyee: { label: 'Envoyee', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  payee: { label: 'Payee', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  en_retard: { label: 'En retard', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  annulee: { label: 'Annulee', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
}

const quotationStatusConfig: Record<QuotationStatus, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  envoye: { label: 'Envoye', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  accepte: { label: 'Accepte', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  refuse: { label: 'Refuse', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  facture: { label: 'Facture', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = invoiceStatusConfig[status] || invoiceStatusConfig.brouillon
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  const config = quotationStatusConfig[status] || quotationStatusConfig.brouillon
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
