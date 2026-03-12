'use client'

import { useState, useEffect, useTransition } from 'react'
import { MapPin, Search, Phone, Mail, Globe, Loader2, Save, Check } from 'lucide-react'
import { searchAllAdministrations } from '@/app/actions/annuaire'
import { type AnnuaireCategory } from '@/lib/annuaire-types'
import { updatePostalCode } from '@/app/actions/preferences'

interface AnnuaireGlobalProps {
  initialPostalCode: string | null
}

export default function AnnuaireGlobal({ initialPostalCode }: AnnuaireGlobalProps) {
  const [codePostal, setCodePostal] = useState(initialPostalCode ?? '')
  const [categories, setCategories] = useState<AnnuaireCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const postalCodeChanged = codePostal !== (initialPostalCode ?? '') && /^\d{5}$/.test(codePostal)

  const handleSearch = () => {
    if (!/^\d{5}$/.test(codePostal)) {
      setError('Veuillez entrer un code postal valide (5 chiffres).')
      return
    }

    setError(null)
    setCategories([])
    setHasSearched(true)

    startTransition(async () => {
      const result = await searchAllAdministrations(codePostal)
      if ('error' in result) {
        setError(result.error)
      } else {
        setCategories(result.data)
        if (result.data.length === 0) {
          setError('Aucun résultat trouvé pour ce code postal.')
        }
      }
    })
  }

  const handleSave = () => {
    if (!/^\d{5}$/.test(codePostal)) return

    startSaveTransition(async () => {
      const result = await updatePostalCode(codePostal)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  // Auto-search on mount if postal code exists
  useEffect(() => {
    if (initialPostalCode && /^\d{5}$/.test(initialPostalCode)) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Annuaire des administrations</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Trouvez toutes vos administrations proches</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          value={codePostal}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 5)
            setCodePostal(value)
            setSaved(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder="Code postal (ex: 75001)"
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={handleSearch}
          disabled={isPending || codePostal.length !== 5}
          className="px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Rechercher
        </button>
        {postalCodeChanged && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && !isPending && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Résultats par catégorie */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.label}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.icon}</span>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {category.label}
                </h3>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  ({category.results.length})
                </span>
              </div>

              <div className="space-y-2">
                {category.results.map((admin, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors"
                  >
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                      {admin.nom}
                    </h4>

                    <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {admin.adresse && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                          <span>{admin.adresse}, {admin.codePostal} {admin.commune}</span>
                        </div>
                      )}

                      {admin.telephone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                          <a
                            href={`tel:${admin.telephone.replace(/\s/g, '')}`}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                          >
                            {admin.telephone}
                          </a>
                        </div>
                      )}

                      {admin.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                          <a
                            href={`mailto:${admin.email}`}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            {admin.email}
                          </a>
                        </div>
                      )}

                      {admin.url && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                          <a
                            href={admin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Voir le site
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si pas de code postal */}
      {!hasSearched && !initialPostalCode && (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-4">
          Entrez votre code postal pour trouver les administrations proches de chez vous.
        </p>
      )}

      {/* Aucun résultat */}
      {hasSearched && !isPending && categories.length === 0 && !error && (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center py-4">
          Aucun résultat trouvé pour ce code postal.
        </p>
      )}
    </div>
  )
}
