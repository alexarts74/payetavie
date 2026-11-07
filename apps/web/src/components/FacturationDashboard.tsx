'use client'

import Link from 'next/link'
import { Receipt, FileText, TrendingUp, AlertCircle, Clock, Plus, ArrowRight, AlertTriangle } from 'lucide-react'
import type { InvoicingStats, BillingDocument, Client, InvoiceStatus, QuotationStatus, MonthlyRevenueStat, ClientRevenueStat } from '@/types'
import { InvoiceStatusBadge, QuotationStatusBadge } from '@/components/InvoiceStatusBadge'

interface FacturationDashboardProps {
  stats: InvoicingStats
  recentInvoices: (BillingDocument & { client: Client })[]
  recentQuotations: (BillingDocument & { client: Client })[]
  hasProfile: boolean
  year: number
  monthlyStats: MonthlyRevenueStat[]
  clientStats: ClientRevenueStat[]
}

export default function FacturationDashboard({ stats, recentInvoices, recentQuotations, hasProfile, year, monthlyStats, clientStats }: FacturationDashboardProps) {
  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Facturation
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Apercu de votre activite {year}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/freelance/facturation/devis/nouveau"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau devis
            </Link>
            <Link
              href="/freelance/facturation/factures/nouvelle"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
            >
              <Plus className="w-4 h-4" />
              Nouvelle facture
            </Link>
          </div>
        </div>

        {/* Profile warning */}
        {!hasProfile && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Profil professionnel incomplet
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Configurez vos informations professionnelles pour qu&apos;elles apparaissent sur vos factures et devis.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                >
                  Configurer mon profil <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">CA encaisse</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalRevenue.toFixed(0)} €</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">En attente</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalPending.toFixed(0)} €</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Impayes</span>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-1">{stats.totalUnpaid.toFixed(0)} €</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Documents</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.invoiceCount + stats.quotationCount}
            </p>
          </div>
        </div>

        {/* Monthly revenue chart */}
        {monthlyStats.some((m) => m.revenue > 0 || m.pending > 0) && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-slide-up">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-5">
              CA mensuel {year}
            </h2>
            <MonthlyRevenueChart stats={monthlyStats} />
          </div>
        )}

        {/* Top clients */}
        {clientStats.length > 0 && clientStats.some((c) => c.totalRevenue > 0 || c.totalPending > 0) && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-slide-up">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-5">
              Top clients {year}
            </h2>
            <TopClientsChart clients={clientStats} />
          </div>
        )}

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Recent invoices */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200/60 dark:border-zinc-700/30">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dernieres factures</h2>
              </div>
              <Link
                href="/freelance/facturation/factures"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-2">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune facture</p>
                </div>
              ) : (
                recentInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/freelance/facturation/factures/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{inv.document_number}</span>
                        <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{inv.client?.company_name}</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex-shrink-0 ml-4">
                      {Number(inv.total_ttc).toFixed(2)} €
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent quotations */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200/60 dark:border-zinc-700/30">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Derniers devis</h2>
              </div>
              <Link
                href="/freelance/facturation/devis"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-2">
              {recentQuotations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucun devis</p>
                </div>
              ) : (
                recentQuotations.map((q) => (
                  <Link
                    key={q.id}
                    href={`/freelance/facturation/devis/${q.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{q.document_number}</span>
                        <QuotationStatusBadge status={q.status as QuotationStatus} />
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{q.client?.company_name}</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex-shrink-0 ml-4">
                      {Number(q.total_ttc).toFixed(2)} €
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopClientsChart({ clients }: { clients: ClientRevenueStat[] }) {
  const maxRevenue = Math.max(...clients.map((c) => c.totalRevenue), 1)

  return (
    <div className="flex flex-col gap-3">
      {clients.map((client) => {
        const initials = client.clientName
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? '')
          .join('')
        const barWidth = Math.max(Math.round((client.totalRevenue / maxRevenue) * 100), client.totalRevenue > 0 ? 2 : 0)

        return (
          <Link
            key={client.clientId}
            href={`/freelance/clients/${client.clientId}`}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate block">
                    {client.clientName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {client.invoiceCount} facture{client.invoiceCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
                    {client.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                  {client.totalPending > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      +{client.totalPending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} en attente
                    </span>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function MonthlyRevenueChart({ stats }: { stats: MonthlyRevenueStat[] }) {
  const maxRevenue = Math.max(...stats.map((m) => m.revenue), 1)
  const BAR_MAX_HEIGHT = 80

  return (
    <div className="flex items-end justify-between gap-1">
      {stats.map((m) => {
        const revenueHeight = Math.round((m.revenue / maxRevenue) * BAR_MAX_HEIGHT)
        const pendingHeight = Math.round((m.pending / maxRevenue) * BAR_MAX_HEIGHT)
        const totalLabel = (m.revenue + m.pending).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
        return (
          <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              className="w-full relative flex flex-col justify-end gap-0.5"
              style={{ height: `${BAR_MAX_HEIGHT}px` }}
            >
              {m.pending > 0 && (
                <div
                  title={`En attente : ${m.pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}
                  className="w-full rounded-t bg-blue-400/70 dark:bg-blue-500/50 transition-all"
                  style={{ height: `${pendingHeight}px` }}
                />
              )}
              {m.revenue > 0 && (
                <div
                  title={`Encaissé : ${m.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}
                  className="w-full rounded-t bg-indigo-500 dark:bg-indigo-400 transition-all"
                  style={{ height: `${revenueHeight}px` }}
                />
              )}
              {m.revenue === 0 && m.pending === 0 && (
                <div className="w-full rounded-t bg-zinc-200 dark:bg-zinc-700/40" style={{ height: '4px' }} />
              )}
              {(m.revenue > 0 || m.pending > 0) && (
                <div className="absolute -top-5 left-0 right-0 text-center">
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-none" title={totalLabel} />
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none truncate">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
}
