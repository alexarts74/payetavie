'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, UserX, UserCheck, Mail, Phone, Building2, FileText, Receipt } from 'lucide-react'
import type { Client, BillingDocument, InvoiceStatus, QuotationStatus } from '@/types'
import { toggleClientActive } from '@/app/actions/clients'
import ClientForm from '@/components/ClientForm'
import { InvoiceStatusBadge, QuotationStatusBadge } from '@/components/InvoiceStatusBadge'

interface ClientDetailContentProps {
  client: Client
  invoices: BillingDocument[]
  quotations: BillingDocument[]
}

export default function ClientDetailContent({ client: initialClient, invoices, quotations }: ClientDetailContentProps) {
  const router = useRouter()
  const [client, setClient] = useState(initialClient)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState<'factures' | 'devis'>('factures')
  const [isToggling, startToggle] = useTransition()

  const handleToggleActive = () => {
    startToggle(async () => {
      const result = await toggleClientActive(client.id)
      if (result.success) {
        setClient(prev => ({ ...prev, is_active: !prev.is_active }))
      }
    })
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_ttc), 0)
  const totalPaid = invoices.filter(inv => inv.status === 'payee').reduce((sum, inv) => sum + Number(inv.total_ttc), 0)

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/freelance/clients')}
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </button>

        {/* Client header */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
              <span className="text-xl font-bold text-white">{client.company_name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {client.company_name}
                </h1>
                {!client.is_active && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Inactif
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {client.contact_name && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{client.contact_name}</span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={handleToggleActive}
                disabled={isToggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ${
                  client.is_active
                    ? 'border-zinc-200 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30'
                    : 'border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                }`}
              >
                {client.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {client.is_active ? 'Desactiver' : 'Reactiver'}
              </button>
            </div>
          </div>

          {/* Info cards */}
          {(client.address_line1 || client.siret) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-700/30">
              {client.address_line1 && (
                <div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Adresse</span>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                    {client.address_line1}
                    {client.address_line2 && <><br />{client.address_line2}</>}
                    {(client.postal_code || client.city) && <><br />{[client.postal_code, client.city].filter(Boolean).join(' ')}</>}
                  </p>
                </div>
              )}
              {client.siret && (
                <div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">SIRET</span>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 mt-1">{client.siret}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up">
          <div className="glass-card rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Factures</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{invoices.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Devis</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{quotations.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Total facture</span>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{totalInvoiced.toFixed(0)} €</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Total paye</span>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-1">{totalPaid.toFixed(0)} €</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
          <div className="flex border-b border-zinc-200/60 dark:border-zinc-700/30">
            <button
              onClick={() => setActiveTab('factures')}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all ${
                activeTab === 'factures'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Factures ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('devis')}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all ${
                activeTab === 'devis'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Devis ({quotations.length})
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'factures' ? (
              invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune facture pour ce client</p>
                  <Link
                    href={`/freelance/facturation/factures/nouvelle?client=${client.id}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
                  >
                    Creer une facture
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/freelance/facturation/factures/${inv.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{inv.document_number}</span>
                        <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {new Date(inv.document_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {Number(inv.total_ttc).toFixed(2)} €
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              quotations.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucun devis pour ce client</p>
                  <Link
                    href={`/freelance/facturation/devis/nouveau?client=${client.id}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
                  >
                    Creer un devis
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {quotations.map((q) => (
                    <Link
                      key={q.id}
                      href={`/freelance/facturation/devis/${q.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{q.document_number}</span>
                        <QuotationStatusBadge status={q.status as QuotationStatus} />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {new Date(q.document_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {Number(q.total_ttc).toFixed(2)} €
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Edit form modal */}
        {showEdit && (
          <ClientForm
            client={client}
            onClose={() => setShowEdit(false)}
            onSaved={(updated) => setClient(updated)}
          />
        )}
      </div>
    </div>
  )
}
