'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Receipt } from 'lucide-react'
import type { Client, ProfessionalProfile } from '@/types'
import LineItemsEditor, { type LineItemData } from '@/components/LineItemsEditor'
import { createInvoice } from '@/app/actions/invoices'
import { createQuotation } from '@/app/actions/quotations'

interface InvoiceFormProps {
  clients: Client[]
  profile: ProfessionalProfile | null
  type: 'invoice' | 'quotation'
}

export default function InvoiceForm({ clients, profile, type }: InvoiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get('client') || ''
  const isInvoice = type === 'invoice'

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const defaultDue = new Date()
  defaultDue.setDate(defaultDue.getDate() + (profile?.default_payment_terms_days || 30))

  const [clientId, setClientId] = useState(preselectedClient)
  const [docDate, setDocDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [tvaRate, setTvaRate] = useState(profile?.is_micro_entrepreneur ? 0 : 20)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItemData[]>([
    { description: '', quantity: 1, unit_price: profile?.hourly_rate || 0, tva_rate: tvaRate },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!clientId) {
      setError('Veuillez selectionner un client')
      return
    }
    if (items.some(item => !item.description.trim())) {
      setError('Toutes les lignes doivent avoir une description')
      return
    }

    startTransition(async () => {
      const result = isInvoice
        ? await createInvoice({
            clientId,
            items,
            invoiceDate: docDate,
            dueDate,
            tvaRate,
            notes: notes || undefined,
          })
        : await createQuotation({
            clientId,
            items,
            quotationDate: docDate,
            expiryDate: expiryDate || undefined,
            tvaRate,
            notes: notes || undefined,
          })

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        router.push(isInvoice ? `/freelance/facturation/factures/${result.data.id}` : `/freelance/facturation/devis/${result.data.id}`)
      }
    })
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
            isInvoice
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
              : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30'
          }`}>
            {isInvoice ? <FileText className="w-5 h-5 text-white" /> : <Receipt className="w-5 h-5 text-white" />}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {isInvoice ? 'Nouvelle facture' : 'Nouveau devis'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* Client selection */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Client</h2>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Selectionner un client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Aucun client actif.{' '}
                <button
                  type="button"
                  onClick={() => router.push('/freelance/clients')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Creer un client
                </button>
              </p>
            )}
          </div>

          {/* Dates & TVA */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Informations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  {isInvoice ? 'Date de facture' : 'Date du devis'}
                </label>
                <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className={inputClass} required />
              </div>
              {isInvoice ? (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Date d&apos;echeance
                  </label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} required />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Date d&apos;expiration
                  </label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Taux TVA (%)
                </label>
                <select value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className={inputClass}>
                  <option value={0}>0% (Exonere)</option>
                  <option value={5.5}>5,5%</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                </select>
                {profile?.is_micro_entrepreneur && tvaRate === 0 && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    TVA non applicable, art. 293 B du CGI
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Prestations</h2>
            <LineItemsEditor items={items} onChange={setItems} globalTvaRate={tvaRate} />
          </div>

          {/* Notes */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conditions de paiement, notes additionnelles..."
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Error & submit */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30 disabled:opacity-50"
            >
              {isPending ? 'Creation...' : isInvoice ? 'Creer la facture' : 'Creer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
