'use client'

import type { InvoiceStatus, QuotationStatus } from '@/types'

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-[#E8E8E8] text-[#5A6B61]' },
  envoyee: { label: 'Envoyee', className: 'bg-blue-100 text-blue-700' },
  payee: { label: 'Payee', className: 'bg-green-100 text-green-700' },
  en_retard: { label: 'En retard', className: 'bg-red-100 text-red-700' },
  annulee: { label: 'Annulee', className: 'bg-orange-100 text-orange-700' },
}

const quotationStatusConfig: Record<QuotationStatus, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-[#E8E8E8] text-[#5A6B61]' },
  envoye: { label: 'Envoye', className: 'bg-blue-100 text-blue-700' },
  accepte: { label: 'Accepte', className: 'bg-green-100 text-green-700' },
  refuse: { label: 'Refuse', className: 'bg-red-100 text-red-700' },
  facture: { label: 'Facture', className: 'bg-[#EEF7F1] text-[#235037]' },
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
