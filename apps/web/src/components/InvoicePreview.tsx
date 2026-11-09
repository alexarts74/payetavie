'use client'

import type { BillingDocumentWithItems, ProfessionalProfile } from '@/types'

interface InvoicePreviewProps {
  document: BillingDocumentWithItems
  profile: ProfessionalProfile | null
  type: 'invoice' | 'quotation'
}

export default function InvoicePreview({ document: doc, profile, type }: InvoicePreviewProps) {
  const isInvoice = type === 'invoice'

  const docNumber = doc.document_number
  const docDate = doc.document_date

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8]  shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#1a2e22] ">
              {isInvoice ? 'FACTURE' : 'DEVIS'}
            </h2>
            <p className="text-sm font-medium text-[#235037] mt-1">{docNumber}</p>
          </div>
          <div className="text-right text-sm text-[#5A6B61] ">
            <p>Date : {new Date(docDate).toLocaleDateString('fr-FR')}</p>
            {isInvoice && doc.due_date && (
              <p>Echeance : {new Date(doc.due_date).toLocaleDateString('fr-FR')}</p>
            )}
            {!isInvoice && doc.expiry_date && (
              <p>Valide jusqu&apos;au : {new Date(doc.expiry_date).toLocaleDateString('fr-FR')}</p>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
          <div>
            <p className="text-[10px] font-semibold text-[#5A6B61]/60  uppercase tracking-wider mb-2">Emetteur</p>
            {profile ? (
              <div className="text-sm text-[#5A6B61]  space-y-0.5">
                {profile.business_name && <p className="font-semibold">{profile.business_name}</p>}
                {profile.address_line1 && <p>{profile.address_line1}</p>}
                {(profile.postal_code || profile.city) && (
                  <p>{[profile.postal_code, profile.city].filter(Boolean).join(' ')}</p>
                )}
                {profile.siret && <p className="text-xs text-[#5A6B61] mt-1">SIRET : {profile.siret}</p>}
                {profile.tva_number && <p className="text-xs text-[#5A6B61]">TVA : {profile.tva_number}</p>}
              </div>
            ) : (
              <p className="text-xs text-[#5A6B61]/60 italic">Profil non configure</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#5A6B61]/60  uppercase tracking-wider mb-2">Client</p>
            {doc.client && (
              <div className="text-sm text-[#5A6B61]  space-y-0.5">
                <p className="font-semibold">{doc.client.company_name}</p>
                {doc.client.contact_name && <p>{doc.client.contact_name}</p>}
                {doc.client.address_line1 && <p>{doc.client.address_line1}</p>}
                {(doc.client.postal_code || doc.client.city) && (
                  <p>{[doc.client.postal_code, doc.client.city].filter(Boolean).join(' ')}</p>
                )}
                {doc.client.siret && <p className="text-xs text-[#5A6B61] mt-1">SIRET : {doc.client.siret}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        <div className="border border-zinc-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF7F1]/50 ">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#5A6B61]  uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#5A6B61]  uppercase tracking-wide">Qte</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#5A6B61]  uppercase tracking-wide">P.U. HT</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#5A6B61]  uppercase tracking-wide">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, i) => (
                <tr key={item.id || i} className="border-t border-zinc-100">
                  <td className="px-4 py-3 text-[#5A6B61] ">{item.description}</td>
                  <td className="px-4 py-3 text-right text-[#5A6B61] ">{Number(item.quantity)}</td>
                  <td className="px-4 py-3 text-right text-[#5A6B61] ">{Number(item.unit_price).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-medium text-[#1a2e22] ">{Number(item.line_total).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#5A6B61] ">Total HT</span>
              <span className="font-medium text-[#1a2e22] ">{Number(doc.total_ht).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#5A6B61] ">TVA ({Number(doc.tva_rate)}%)</span>
              <span className="font-medium text-[#1a2e22] ">{Number(doc.tva_amount).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-[#E8E8E8]  pt-2">
              <span className="text-[#1a2e22] ">Total TTC</span>
              <span className="text-[#235037]">{Number(doc.total_ttc).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className="pt-4 border-t border-zinc-100">
            <p className="text-[10px] font-semibold text-[#5A6B61]/60  uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-[#5A6B61]  whitespace-pre-wrap">{doc.notes}</p>
          </div>
        )}

        {/* Legal mentions */}
        <div className="pt-4 border-t border-zinc-100">
          <div className="text-[10px] text-[#5A6B61]/60  space-y-1">
            {profile?.is_micro_entrepreneur && Number(doc.tva_rate) === 0 && (
              <p className="font-medium">TVA non applicable, art. 293 B du CGI</p>
            )}
            {isInvoice && (
              <>
                <p>En cas de retard de paiement, une penalite de 3 fois le taux d&apos;interet legal sera appliquee, ainsi qu&apos;une indemnite forfaitaire de 40€ pour frais de recouvrement.</p>
                <p>Pas d&apos;escompte en cas de paiement anticipe.</p>
              </>
            )}
            {!isInvoice && (
              <p>Ce devis est valable pour une duree de 30 jours a compter de sa date d&apos;emission, sauf indication contraire.</p>
            )}
            {profile?.iban && (
              <p>IBAN : {profile.iban}{profile.bic ? ` — BIC : ${profile.bic}` : ''}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
