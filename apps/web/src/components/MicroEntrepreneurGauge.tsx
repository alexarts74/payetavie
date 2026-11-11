'use client'

import { AlertTriangle, Info, TrendingUp } from 'lucide-react'
import type { MicroEntrepreneurPlafondStats } from '@/types'

interface Props {
  stats: MicroEntrepreneurPlafondStats
  year: number
}

export default function MicroEntrepreneurGauge({ stats, year }: Props) {
  const { caEncaisse, caAttente, threshold, projectedYearEnd, activityType } = stats
  const totalFacture = caEncaisse + caAttente
  const percentageEncaisse = Math.min((caEncaisse / threshold) * 100, 100)
  const percentageTotal = Math.min((totalFacture / threshold) * 100, 100)

  const isWarning = percentageTotal >= 70 && percentageTotal < 90
  const isDanger = percentageTotal >= 90

  const barColor = isDanger ? '#EF4444' : isWarning ? '#D97706' : '#235037'

  const thresholdLabel =
    activityType === 'services'
      ? 'prestations de services'
      : activityType === 'commerce'
        ? 'vente de marchandises'
        : 'prestations de services (seuil le plus bas)'

  return (
    <div className="card rounded-2xl p-5 mb-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1a2e22]">
            Plafond micro-entrepreneur {year}
          </h3>
          <p className="text-xs text-[#5A6B61]">
            {thresholdLabel} — {threshold.toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          {/* CA facturé total (attente) — fond translucide */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${percentageTotal}%`, backgroundColor: barColor, opacity: 0.25 }}
          />
          {/* CA encaissé */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${percentageEncaisse}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#5A6B61] mt-1.5">
          <span>
            {caEncaisse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € encaissé
            {caAttente > 0 && (
              <span className="text-amber-600 ml-1">
                + {caAttente.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € en attente
              </span>
            )}
          </span>
          <span className="font-semibold" style={{ color: barColor }}>
            {percentageEncaisse.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-[#F5F9F6] p-3">
          <p className="text-xs text-[#5A6B61] mb-0.5">Encaissé</p>
          <p className="text-sm font-semibold text-[#1a2e22]">
            {caEncaisse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </p>
        </div>
        <div className="rounded-xl bg-[#F5F9F6] p-3">
          <p className="text-xs text-[#5A6B61] mb-0.5">En attente</p>
          <p className="text-sm font-semibold text-amber-600">
            {caAttente.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </p>
        </div>
        <div className="rounded-xl bg-[#F5F9F6] p-3">
          <p className="text-xs text-[#5A6B61] mb-0.5">Restant</p>
          <p className="text-sm font-semibold text-[#1a2e22]">
            {Math.max(0, threshold - totalFacture).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </p>
        </div>
      </div>

      {/* Projection fin d'année */}
      {projectedYearEnd !== null && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200/60 mb-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            À ce rythme, votre CA en fin d&apos;année sera d&apos;environ{' '}
            <strong>{projectedYearEnd.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong>
            {projectedYearEnd > threshold && (
              <span className="text-blue-900 font-medium"> — au-dessus du plafond.</span>
            )}
          </p>
        </div>
      )}

      {/* Alerte seuil */}
      {(isWarning || isDanger) && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl ${
            isDanger ? 'bg-red-50 border border-red-200/60' : 'bg-amber-50 border border-amber-200/60'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}
          />
          <p className={`text-xs ${isDanger ? 'text-red-700' : 'text-amber-700'}`}>
            {isDanger
              ? "Vous approchez ou dépassez le plafond. Anticipez votre passage en régime réel ou consultez un expert-comptable."
              : "Attention — vous approchez du plafond. Anticipez le changement de régime si vous comptez continuer à facturer."}
          </p>
        </div>
      )}

      {activityType === 'mixte' && (
        <p className="text-xs text-[#5A6B61] mt-2">
          * Activité mixte : seul le plafond services (77 700 €) est affiché. Vérifiez les plafonds de chaque activité séparément.
        </p>
      )}
    </div>
  )
}
