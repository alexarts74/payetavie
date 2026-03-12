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
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Devis
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {initialQuotations.length} devis
            </p>
          </div>
          <Link
            href="/freelance/facturation/devis/nouveau"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-md shadow-purple-500/30"
          >
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s.value
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm"
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
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
            <Receipt className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Aucun devis</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {statusFilter ? 'Aucun devis avec ce statut' : 'Creez votre premier devis'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {filtered.map((q) => (
              <Link
                key={q.id}
                href={`/freelance/facturation/devis/${q.id}`}
                className="glass-card rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:block w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{q.document_number}</span>
                      <QuotationStatusBadge status={q.status as QuotationStatus} />
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{q.client?.company_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                    {new Date(q.document_date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
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
