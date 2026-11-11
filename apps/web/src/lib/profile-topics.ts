import type { ProfileType } from '@/types'

const profileTopicsMap: Record<ProfileType, string[]> = {
  etudiant: [
    'impots', 'mutuelle', 'sante',
  ],
  salarie: [
    'impots', 'fiches-de-paie', 'assurances', 'mutuelle', 'sante',
  ],
  independant: [
    'impots', 'urssaf', 'assurances', 'mutuelle', 'sante',
    'freelance-clients', 'freelance-facturation',
  ],
  recherche_emploi: [
    'impots', 'mutuelle', 'sante',
  ],
  autre: [
    'impots', 'mutuelle', 'sante', 'assurances',
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
  'fiches-de-paie',
  'mutuelle', 'sante',
  'logement',
  'freelance-clients', 'freelance-facturation', 'impots', 'urssaf', 'assurances',
]
