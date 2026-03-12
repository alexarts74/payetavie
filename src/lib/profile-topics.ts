import type { ProfileType } from '@/types'

const profileTopicsMap: Record<ProfileType, string[]> = {
  etudiant: [
    'impots', 'caf', 'mutuelle', 'medecin-generaliste', 'pharmacie',
    'analyses-medicales',
  ],
  salarie: [
    'impots', 'fiches-de-paie', 'assurances', 'mutuelle', 'medecin-generaliste',
    'pharmacie', 'analyses-medicales',
  ],
  independant: [
    'impots', 'urssaf', 'assurances', 'mutuelle', 'medecin-generaliste',
    'pharmacie', 'analyses-medicales', 'freelance-clients', 'freelance-facturation',
  ],
  recherche_emploi: [
    'impots', 'caf', 'mutuelle', 'medecin-generaliste', 'pharmacie',
    'analyses-medicales',
  ],
  autre: [
    'impots', 'mutuelle', 'medecin-generaliste', 'pharmacie', 'assurances',
  ],
}

export function getTopicsForProfile(profileType: ProfileType): string[] {
  return profileTopicsMap[profileType] ?? profileTopicsMap.autre
}

export const OPTIONAL_TOPIC_GROUPS = [
  { label: 'Logement', slugs: ['logement'] },
  { label: 'Freelance', slugs: ['freelance-clients', 'freelance-facturation'] },
] as const

export const ALL_TOPIC_SLUGS = [
  'fiches-de-paie', 'caf',
  'mutuelle', 'medecin-generaliste', 'pharmacie', 'analyses-medicales',
  'logement',
  'freelance-clients', 'freelance-facturation', 'impots', 'urssaf', 'assurances',
]
