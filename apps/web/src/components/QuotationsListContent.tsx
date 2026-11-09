'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Receipt, Filter } from 'lucide-react'
import type { BillingDocument, Client, QuotationStatus } from '@/types'
import { QuotationStatusBadge } from '@/components/InvoiceStatusBadge'

interface QuotationsListContentProps {
  initialQuotations: (BillingDocument & { client: Client })[]
  clients: Client[]
}

const statusFilters: { value: QuotationStatus | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'envoye', label: 'Envoyes' },
  { value: 'accepte', label: 'Acceptes' },
  { value: 'refuse', label: 'Refuses' },
  { value: 'facture', label: 'Factures' },
]

export default function QuotationsListContent({ initialQuotations, clients }: QuotationsListContentProps) {
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('')
  const [clientFilter, setClientFilter] = useState('')

  const filtered = initialQuotations.filter(q => {
    if (statusFilter && q.status !== statusFilter) return false
    if (clientFilter && q.client_id !== clientFilter) return false
    return true
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a2e22] mb-1">
              Devis
            </h1>
            <p className="text-[#5A6B61] text-sm">
              {initialQuotations.length} devis
            </p>
          </div>
          <Link
            href="/freelance/facturation/devis/nouveau"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#235037] hover:bg-[#1a3d2a] text-white rounded-xl font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau devis
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
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card rounded-2xl p-12 text-center animate-fade-in">
            <Receipt className="w-12 h-12 mx-auto text-[#E8E8E8] mb-4" />
            <h3 className="text-lg font-medium text-[#1a2e22] mb-2">Aucun devis</h3>
            <p className="text-[#5A6B61] text-sm">
              {statusFilter ? 'Aucun devis avec ce statut' : 'Creez votre premier devis'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {filtered.map((q) => (
              <Link
                key={q.id}
                href={`/freelance/facturation/devis/${q.id}`}
                className="card rounded-xl p-4 flex items-center justify-between hover:border-[#235037]/20 transition-all block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-[#EEF7F1] items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-[#235037]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1a2e22]">{q.document_number}</span>
                      <QuotationStatusBadge status={q.status as QuotationStatus} />
                    </div>
                    <span className="text-xs text-[#5A6B61]">{q.client?.company_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span className="text-xs text-[#5A6B61] hidden sm:block">
                    {new Date(q.document_date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-sm font-semibold text-[#1a2e22]">
                    {Number(q.total_ttc).toFixed(2)} €
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
