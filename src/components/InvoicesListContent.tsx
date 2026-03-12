'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Filter } from 'lucide-react'
import type { BillingDocument, Client, InvoiceStatus } from '@/types'
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge'

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
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Factures
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {initialInvoices.length} facture{initialInvoices.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/freelance/facturation/factures/nouvelle"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
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
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
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
            <FileText className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Aucune facture</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {statusFilter ? 'Aucune facture avec ce statut' : 'Creez votre premiere facture'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {filtered.map((inv) => (
              <Link
                key={inv.id}
                href={`/freelance/facturation/factures/${inv.id}`}
                className="glass-card rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:block w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{inv.document_number}</span>
                      <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{inv.client?.company_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                    {new Date(inv.document_date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
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
