// Mapping des slugs vers les titres et icônes des topics
export const topicMap: Record<string, { title: string; icon: string }> = {
  'impots': { title: 'Impôts', icon: '📊' },
  'urssaf': { title: 'URSSAF / Cotisations sociales', icon: '💼' },
  'fiches-de-paie': { title: 'Fiches de paie', icon: '💰' },
  'caf': { title: 'CAF / Aides', icon: '🤝' },
  'assurances': { title: 'Assurances', icon: '🛡️' },
  'mutuelle': { title: 'Mutuelle', icon: '🏥' },
  'medecin-generaliste': { title: 'Médecin généraliste', icon: '🏥' },
  'pharmacie': { title: 'Pharmacie', icon: '💊' },
  'analyses-medicales': { title: 'Analyses médicales', icon: '🧪' },
  'logement': { title: 'Logement', icon: '🏠' },
  'freelance-clients': { title: 'Clients', icon: '👥' },
  'freelance-facturation': { title: 'Facturation', icon: '🧾' },
}

export function getTopicTitle(slug: string): string {
  return topicMap[slug]?.title || slug
}

export function getTopicIcon(slug: string): string {
  return topicMap[slug]?.icon || '📄'
}
