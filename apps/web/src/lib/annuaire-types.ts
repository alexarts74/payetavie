export interface Administration {
  nom: string
  adresse: string
  codePostal: string
  commune: string
  telephone: string | null
  email: string | null
  horaires: string | null
  url: string | null
}

export interface AnnuaireCategory {
  label: string
  icon: string
  results: Administration[]
}

export const ANNUAIRE_CATEGORIES: { label: string; icon: string; types: string[] }[] = [
  { label: 'Impôts', icon: '🏛️', types: ['sip', 'centre_impots_foncier'] },
  { label: 'CAF', icon: '👨‍👩‍👧‍👦', types: ['caf'] },
  { label: 'Santé (CPAM)', icon: '🏥', types: ['cpam'] },
  { label: 'Emploi', icon: '💼', types: ['pole_emploi'] },
  { label: 'URSSAF', icon: '📋', types: ['urssaf'] },
  { label: 'Logement (ADIL)', icon: '🏠', types: ['adil'] },
  { label: 'Préfecture', icon: '🏢', types: ['prefecture', 'sous_prefecture'] },
  { label: 'CROUS', icon: '🎓', types: ['crous'] },
]
