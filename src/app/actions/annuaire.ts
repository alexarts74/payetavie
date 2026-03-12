'use server'

import { type Administration, type AnnuaireCategory, ANNUAIRE_CATEGORIES } from '@/lib/annuaire-types'
import { requirePlan } from '@/lib/subscription'

function parseJsonField(value: string | null | undefined): any[] {
  if (!value) return []
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

export async function searchAdministration(
  typeOrganisme: string,
  codePostal: string
): Promise<{ data: Administration[] } | { error: string }> {
  const planCheck = await requirePlan('essentiel')
  if (!planCheck.allowed) {
    return { error: planCheck.error }
  }

  // Validation du code postal
  if (!/^\d{5}$/.test(codePostal)) {
    return { error: 'Le code postal doit contenir exactement 5 chiffres.' }
  }

  try {
    const whereClause = `pivot LIKE "${typeOrganisme}" AND adresse LIKE "${codePostal}"`
    const params = new URLSearchParams({
      where: whereClause,
      limit: '10',
    })

    const response = await fetch(
      `https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?${params}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      return { error: 'Erreur lors de la recherche. Veuillez réessayer.' }
    }

    const json = await response.json()

    const administrations: Administration[] = (json.results || []).map((record: any) => {
      // Parse les champs JSON stringifiés
      const adresses = parseJsonField(record.adresse)
      const telephones = parseJsonField(record.telephone)
      const sites = parseJsonField(record.site_internet)
      const addr = adresses[0] || {}

      return {
        nom: record.nom || 'Nom inconnu',
        adresse: [addr.complement2, addr.numero_voie].filter(Boolean).join(', '),
        codePostal: addr.code_postal || codePostal,
        commune: addr.nom_commune || '',
        telephone: telephones[0]?.valeur || null,
        email: record.adresse_courriel || null,
        horaires: record.plage_ouverture || null,
        url: sites[0]?.valeur || null,
      }
    })

    return { data: administrations }
  } catch {
    return { error: 'Impossible de contacter le service. Vérifiez votre connexion.' }
  }
}

export async function searchAllAdministrations(
  codePostal: string
): Promise<{ data: AnnuaireCategory[] } | { error: string }> {
  const planCheck = await requirePlan('essentiel')
  if (!planCheck.allowed) {
    return { error: planCheck.error }
  }

  if (!/^\d{5}$/.test(codePostal)) {
    return { error: 'Le code postal doit contenir exactement 5 chiffres.' }
  }

  const results = await Promise.allSettled(
    ANNUAIRE_CATEGORIES.map(async (category) => {
      const allResults: Administration[] = []
      for (const type of category.types) {
        const result = await searchAdministration(type, codePostal)
        if ('data' in result) {
          allResults.push(...result.data)
        }
      }
      return {
        label: category.label,
        icon: category.icon,
        results: allResults,
      } satisfies AnnuaireCategory
    })
  )

  const categories: AnnuaireCategory[] = results
    .filter((r): r is PromiseFulfilledResult<AnnuaireCategory> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((c) => c.results.length > 0)

  return { data: categories }
}
