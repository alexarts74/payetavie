import type { BillingDocumentWithItems, ProfessionalProfile } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function generateInvoiceHtml(invoice: BillingDocumentWithItems, profile: ProfessionalProfile | null): string {
  const itemsRows = invoice.items.map(item => `
    <tr class="border-b border-zinc-100">
      <td class="px-4 py-3 text-zinc-700">${item.description}</td>
      <td class="px-4 py-3 text-right text-zinc-600">${Number(item.quantity)}</td>
      <td class="px-4 py-3 text-right text-zinc-600">${Number(item.unit_price).toFixed(2)} &euro;</td>
      <td class="px-4 py-3 text-right font-semibold text-zinc-900">${Number(item.line_total).toFixed(2)} &euro;</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.document_number}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    @page { size: A4; margin: 20mm; }
  </style>
</head>
<body class="bg-white text-zinc-900 font-sans text-sm">
  <!-- Print button -->
  <div class="no-print fixed top-4 right-4 z-50">
    <button onclick="window.print()" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all shadow-lg">
      Imprimer / Sauvegarder en PDF
    </button>
  </div>

  <div class="max-w-[210mm] mx-auto p-8">
    <!-- Header -->
    <div class="flex justify-between items-start mb-10">
      <div>
        <h1 class="text-3xl font-bold text-indigo-600">FACTURE</h1>
        <p class="text-base text-zinc-500 mt-1">${invoice.document_number}</p>
      </div>
      <div class="text-right text-sm">
        <p class="text-zinc-500">Date de facture</p>
        <p class="font-medium">${formatDate(invoice.document_date)}</p>
        ${invoice.due_date ? `<p class="text-zinc-500 mt-2">Date d'echeance</p>
        <p class="font-medium">${formatDate(invoice.due_date)}</p>` : ''}
      </div>
    </div>

    <!-- Parties -->
    <div class="grid grid-cols-2 gap-8 mb-10 pb-6 border-b border-zinc-200">
      <div>
        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Emetteur</p>
        ${profile ? `
          ${profile.business_name ? `<p class="font-bold text-base">${profile.business_name}</p>` : ''}
          ${profile.address_line1 ? `<p class="text-zinc-600">${profile.address_line1}</p>` : ''}
          ${profile.postal_code || profile.city ? `<p class="text-zinc-600">${[profile.postal_code, profile.city].filter(Boolean).join(' ')}</p>` : ''}
          ${profile.siret ? `<p class="text-xs text-zinc-500 mt-2">SIRET : ${profile.siret}</p>` : ''}
          ${profile.tva_number ? `<p class="text-xs text-zinc-500">TVA : ${profile.tva_number}</p>` : ''}
        ` : '<p class="text-zinc-400 italic">Profil non configure</p>'}
      </div>
      <div>
        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Client</p>
        ${invoice.client ? `
          <p class="font-bold text-base">${invoice.client.company_name}</p>
          ${invoice.client.contact_name ? `<p class="text-zinc-600">${invoice.client.contact_name}</p>` : ''}
          ${invoice.client.address_line1 ? `<p class="text-zinc-600">${invoice.client.address_line1}</p>` : ''}
          ${invoice.client.postal_code || invoice.client.city ? `<p class="text-zinc-600">${[invoice.client.postal_code, invoice.client.city].filter(Boolean).join(' ')}</p>` : ''}
          ${invoice.client.siret ? `<p class="text-xs text-zinc-500 mt-2">SIRET : ${invoice.client.siret}</p>` : ''}
        ` : ''}
      </div>
    </div>

    <!-- Table -->
    <table class="w-full mb-8">
      <thead>
        <tr class="bg-zinc-50">
          <th class="text-left px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Description</th>
          <th class="text-right px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Qte</th>
          <th class="text-right px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">P.U. HT</th>
          <th class="text-right px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total HT</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <!-- Totals -->
    <div class="flex justify-end mb-8">
      <div class="w-64 space-y-1">
        <div class="flex justify-between py-1">
          <span class="text-zinc-500">Total HT</span>
          <span class="font-semibold">${Number(invoice.total_ht).toFixed(2)} &euro;</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-zinc-500">TVA (${Number(invoice.tva_rate)}%)</span>
          <span class="font-semibold">${Number(invoice.tva_amount).toFixed(2)} &euro;</span>
        </div>
        <div class="flex justify-between py-2 border-t-2 border-zinc-200 mt-2">
          <span class="text-lg font-bold">Total TTC</span>
          <span class="text-lg font-bold text-indigo-600">${Number(invoice.total_ttc).toFixed(2)} &euro;</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
    <div class="mb-8 p-4 bg-zinc-50 rounded-lg">
      <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Notes</p>
      <p class="text-zinc-600 whitespace-pre-wrap">${invoice.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="border-t border-zinc-200 pt-4 text-[10px] text-zinc-400 text-center space-y-1">
      ${profile?.is_micro_entrepreneur && Number(invoice.tva_rate) === 0 ? '<p class="font-semibold">TVA non applicable, art. 293 B du CGI</p>' : ''}
      <p>En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee, ainsi qu'une indemnite forfaitaire de 40&euro; pour frais de recouvrement.</p>
      <p>Pas d'escompte en cas de paiement anticipe.</p>
      ${profile?.iban ? `<p>IBAN : ${profile.iban}${profile.bic ? ` — BIC : ${profile.bic}` : ''}</p>` : ''}
    </div>
  </div>
</body>
</html>`
}
