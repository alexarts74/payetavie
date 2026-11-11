'use client'

import { useState, useTransition } from 'react'
import { Building2, CreditCard, FileText, MapPin, Save, Check } from 'lucide-react'
import type { ProfessionalProfile } from '@/types'
import { upsertProfessionalProfile } from '@/app/actions/professional-profile'

interface ProfilProfessionnelContentProps {
  initialProfile: ProfessionalProfile | null
}

export default function ProfilProfessionnelContent({ initialProfile }: ProfilProfessionnelContentProps) {
  const [form, setForm] = useState({
    business_name: initialProfile?.business_name ?? '',
    siret: initialProfile?.siret ?? '',
    tva_number: initialProfile?.tva_number ?? '',
    is_micro_entrepreneur: initialProfile?.is_micro_entrepreneur ?? false,
    activity_type: initialProfile?.activity_type ?? 'services' as 'services' | 'commerce' | 'mixte',
    urssaf_frequency: initialProfile?.urssaf_frequency ?? 'trimestriel' as 'mensuel' | 'trimestriel',
    address_line1: initialProfile?.address_line1 ?? '',
    address_line2: initialProfile?.address_line2 ?? '',
    postal_code: initialProfile?.postal_code ?? '',
    city: initialProfile?.city ?? '',
    iban: initialProfile?.iban ?? '',
    bic: initialProfile?.bic ?? '',
    default_payment_terms_days: initialProfile?.default_payment_terms_days ?? 30,
    invoice_prefix: initialProfile?.invoice_prefix ?? 'F',
    quotation_prefix: initialProfile?.quotation_prefix ?? 'D',
    hourly_rate: initialProfile?.hourly_rate?.toString() ?? '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(key: keyof typeof form, value: string | boolean | number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await upsertProfessionalProfile({
        business_name: form.business_name.trim() || null,
        siret: form.siret.trim() || null,
        tva_number: form.tva_number.trim() || null,
        is_micro_entrepreneur: form.is_micro_entrepreneur,
        activity_type: form.activity_type,
        urssaf_frequency: form.urssaf_frequency,
        address_line1: form.address_line1.trim() || null,
        address_line2: form.address_line2.trim() || null,
        postal_code: form.postal_code.trim() || null,
        city: form.city.trim() || null,
        iban: form.iban.trim() || null,
        bic: form.bic.trim() || null,
        default_payment_terms_days: Number(form.default_payment_terms_days) || 30,
        invoice_prefix: form.invoice_prefix.trim() || 'F',
        quotation_prefix: form.quotation_prefix.trim() || 'D',
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      })
      if ('error' in result && result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profil professionnel mis à jour avec succès' })
      }
    })
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a2e22]  mb-2">
            Profil professionnel
          </h1>
          <p className="text-[#5A6B61]  text-sm">
            Ces informations apparaissent sur vos factures et devis générés en PDF.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section — Informations générales */}
          <section className="card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#235037] flex items-center justify-center shadow-md ">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-[#1a2e22] ">
                Informations générales
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Nom commercial
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={e => set('business_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="Mon Entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  SIRET
                </label>
                <input
                  type="text"
                  value={form.siret}
                  onChange={e => set('siret', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="123 456 789 00012"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  N° TVA intracommunautaire
                </label>
                <input
                  type="text"
                  value={form.tva_number}
                  onChange={e => set('tva_number', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="FR 00 123456789"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200/60">
                <input
                  id="micro"
                  type="checkbox"
                  checked={form.is_micro_entrepreneur}
                  onChange={e => set('is_micro_entrepreneur', e.target.checked)}
                  className="w-4 h-4 rounded text-[#235037] focus:ring-[#235037]/20"
                />
                <label htmlFor="micro" className="text-sm text-[#5A6B61]  cursor-pointer select-none">
                  <span className="font-medium">Micro-entrepreneur</span>
                  <span className="text-[#5A6B61]  ml-2">
                    — TVA non applicable, mention légale ajoutée automatiquement
                  </span>
                </label>
              </div>

              {form.is_micro_entrepreneur && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#5A6B61] mb-2">
                      Type d&apos;activité
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['services', 'commerce', 'mixte'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => set('activity_type', type)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            form.activity_type === type
                              ? 'bg-[#235037] text-white'
                              : 'bg-white border border-[#E8E8E8] text-[#5A6B61] hover:bg-[#EEF7F1]'
                          }`}
                        >
                          {type === 'services' ? 'Services (77 700 €)' : type === 'commerce' ? 'Commerce (188 700 €)' : 'Mixte'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#5A6B61] mb-2">
                      Fréquence déclarations URSSAF
                    </label>
                    <div className="flex gap-2">
                      {(['trimestriel', 'mensuel'] as const).map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => set('urssaf_frequency', freq)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            form.urssaf_frequency === freq
                              ? 'bg-[#235037] text-white'
                              : 'bg-white border border-[#E8E8E8] text-[#5A6B61] hover:bg-[#EEF7F1]'
                          }`}
                        >
                          {freq === 'trimestriel' ? 'Trimestriel' : 'Mensuel'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section — Adresse */}
          <section className="card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-[#1a2e22] ">
                Adresse
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Adresse ligne 1
                </label>
                <input
                  type="text"
                  value={form.address_line1}
                  onChange={e => set('address_line1', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="12 rue de la Paix"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Adresse ligne 2 <span className="text-[#5A6B61]/60  font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={form.address_line2}
                  onChange={e => set('address_line2', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="Bâtiment B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Code postal
                </label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={e => set('postal_code', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Ville
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="Paris"
                />
              </div>
            </div>
          </section>

          {/* Section — Paiement */}
          <section className="card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#235037] flex items-center justify-center shadow-md ">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-[#1a2e22] ">
                Coordonnées bancaires
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  IBAN
                </label>
                <input
                  type="text"
                  value={form.iban}
                  onChange={e => set('iban', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm font-mono"
                  placeholder="FR76 3000 1007 9412 3456 7890 185"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  BIC / SWIFT
                </label>
                <input
                  type="text"
                  value={form.bic}
                  onChange={e => set('bic', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm font-mono"
                  placeholder="BNPAFRPP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={form.default_payment_terms_days}
                  onChange={e => set('default_payment_terms_days', parseInt(e.target.value) || 30)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                />
              </div>
            </div>
          </section>

          {/* Section — Facturation */}
          <section className="card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-[#1a2e22] ">
                Paramètres de facturation
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Préfixe factures
                </label>
                <input
                  type="text"
                  value={form.invoice_prefix}
                  onChange={e => set('invoice_prefix', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="FAC-"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Préfixe devis
                </label>
                <input
                  type="text"
                  value={form.quotation_prefix}
                  onChange={e => set('quotation_prefix', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="DEV-"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A6B61]  mb-1.5">
                  Taux horaire (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.hourly_rate}
                  onChange={e => set('hourly_rate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8]  text-[#1a2e22]  placeholder-[#5A6B61]/60 focus:outline-none focus:ring-2 focus:ring-[#235037]/20 focus:border-[#235037]/40 transition-all text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </section>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200/60 text-emerald-700'
                  : 'bg-red-50 border border-red-200/60 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer le profil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
