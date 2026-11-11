import type { ProfileType, UrssafFrequency } from './types'

export interface FiscalEventData {
  id: string
  title: string
  date: string // YYYY-MM-DD
  topicSlug: string
  description?: string
}

export const ME_THRESHOLDS = {
  services: 77700,
  commerce: 188700,
  mixte: 77700, // seuil services (le plus restrictif)
} as const

function lastDayOfMonthStr(year: number, month: number): string {
  const d = new Date(year, month, 0)
  return `${year}-${String(month).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/**
 * Génère les échéances fiscales pour un mois donné selon le profil utilisateur.
 * @param year  Année (ex: 2026)
 * @param month Mois 1-indexé (1=janvier, 12=décembre)
 */
export function generateFiscalEvents(
  year: number,
  month: number,
  profileType: ProfileType,
  isMicroEntrepreneur: boolean,
  urssafFrequency: UrssafFrequency = 'trimestriel'
): FiscalEventData[] {
  const events: FiscalEventData[] = []

  function addIfInMonth(id: string, date: string, title: string, topicSlug: string, description?: string) {
    if (parseInt(date.split('-')[1], 10) === month) {
      events.push({ id, title, date, topicSlug, description })
    }
  }

  // Déclaration d'impôts sur le revenu — tous les profils — mai (date indicative)
  addIfInMonth(
    `fiscal-impots-${year}`,
    `${year}-05-20`,
    "Déclaration d'impôts sur le revenu",
    'impots',
    'Date indicative — vérifiez la date exacte sur impots.gouv'
  )

  // Salarié : vérification acompte PAS en début d'année
  if (profileType === 'salarie') {
    addIfInMonth(
      `fiscal-pas-${year}`,
      `${year}-01-15`,
      'Vérification acompte Prélèvement à la Source',
      'impots',
      'Vérifiez et ajustez votre taux sur impots.gouv si nécessaire'
    )
  }

  // Micro-entrepreneur : déclarations URSSAF + CFE
  if (isMicroEntrepreneur) {
    if (urssafFrequency === 'trimestriel') {
      addIfInMonth(`fiscal-urssaf-t4-${year}`, `${year}-01-31`, `Déclaration URSSAF T4 ${year - 1}`, 'urssaf', `Trimestre oct–déc ${year - 1}`)
      addIfInMonth(`fiscal-urssaf-t1-${year}`, `${year}-04-30`, `Déclaration URSSAF T1 ${year}`, 'urssaf', 'Trimestre janv–mars')
      addIfInMonth(`fiscal-urssaf-t2-${year}`, `${year}-07-31`, `Déclaration URSSAF T2 ${year}`, 'urssaf', 'Trimestre avr–juin')
      addIfInMonth(`fiscal-urssaf-t3-${year}`, `${year}-10-31`, `Déclaration URSSAF T3 ${year}`, 'urssaf', 'Trimestre juil–sept')
    } else {
      events.push({
        id: `fiscal-urssaf-m${pad(month)}-${year}`,
        title: 'Déclaration URSSAF mensuelle',
        date: lastDayOfMonthStr(year, month),
        topicSlug: 'urssaf',
        description: "Chiffre d'affaires du mois précédent",
      })
    }
    addIfInMonth(
      `fiscal-cfe-${year}`,
      `${year}-12-15`,
      'Paiement CFE',
      'urssaf',
      'Cotisation Foncière des Entreprises — vérifiez votre avis sur impots.gouv'
    )
  }

  // Chercheur d'emploi : actualisation France Travail chaque fin de mois
  if (profileType === 'recherche_emploi') {
    events.push({
      id: `fiscal-francetravail-m${pad(month)}-${year}`,
      title: 'Actualisation France Travail',
      date: lastDayOfMonthStr(year, month),
      topicSlug: 'urssaf',
      description: 'Actualisez votre situation sur francetravail.fr',
    })
  }

  // Étudiant : renouvellement aides CROUS — septembre
  if (profileType === 'etudiant') {
    addIfInMonth(
      `fiscal-crous-${year}`,
      `${year}-09-15`,
      'Renouvellement aides CROUS / bourse',
      'impots',
      'Renouvellement sur messervices.etudiant.gouv.fr avant la date limite'
    )
  }

  return events
}
