'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Filter, Download } from 'lucide-react'
import type { BillingDocument, Client, InvoiceStatus } from '@/types'
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge'
import { exportInvoicesCsv } from '@/app/actions/invoices'

interface InvoicesListContentProps {
  initialInvoices: (BillingDocument & { client: Client })[]
  clients: Client[]
}

const statusFilters: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'envoyee', label: 'Envoyees' },
  { value: 'payee', label: 'Payees' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'annulee', label: 'Annulees' },
]

export default function InvoicesListContent({ initialInvoices, clients }: InvoicesListContentProps) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const [clientFilter, setClientFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCsv = async () => {
    setIsExporting(true)
    try {
      const year = new Date().getFullYear()
      const result = await exportInvoicesCsv(year, {
        status: statusFilter || undefined,
        clientId: clientFilter || undefined,
      })
      if ('data' in result && result.data) {
        const blob = new Blob(['\uFEFF' + result.data], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `factures-${year}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } finally {
      setIsExporting(false)
    }
  }

  const filtered = initialInvoices.filter(inv => {
    if (statusFilter && inv.status !== statusFilter) return false
    if (clientFilter && inv.client_id !== clientFilter) return false
    return true
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a2e22] mb-1">
              Factures
            </h1>
            <p className="text-[#5A6B61] text-sm">
              {initialInvoices.length} facture{initialInvoices.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/freelance/facturation/factures/nouvelle"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-xl font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-[#5A6B61] flex-shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s.value
                      ? 'bg-[#EEF7F1] text-[#235037]'
                      : 'bg-white border border-[#E8E8E8] text-[#5A6B61] hover:bg-[#EEF7F1]/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {clients.length > 0 && (
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-[#1a2e22] text-sm focus:outline-none focus:ring-2 focus:ring-[#235037]/20"
            >
              <option value="">Tous les clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          )}
          {initialInvoices.length > 0 && (
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#5A6B61] hover:bg-[#EEF7F1] transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card rounded-2xl p-12 text-center animate-fade-in">
            <FileText className="w-12 h-12 mx-auto text-[#E8E8E8] mb-4" />
            <h3 className="text-lg font-medium text-[#1a2e22] mb-2">Aucune facture</h3>
            <p className="text-[#5A6B61] text-sm">
              {statusFilter ? 'Aucune facture avec ce statut' : 'Creez votre premiere facture'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {filtered.map((inv) => (
              <Link
                key={inv.id}
                href={`/freelance/facturation/factures/${inv.id}`}
                className="card rounded-xl p-4 flex items-center justify-between hover:border-[#235037]/20 transition-all block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-[#EEF7F1] items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#235037]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1a2e22]">{inv.document_number}</span>
                      <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
                    </div>
                    <span className="text-xs text-[#5A6B61]">{inv.client?.company_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span className="text-xs text-[#5A6B61] hidden sm:block">
                    {new Date(inv.document_date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-sm font-semibold text-[#1a2e22]">
                    {Number(inv.total_ttc).toFixed(2)} €
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
