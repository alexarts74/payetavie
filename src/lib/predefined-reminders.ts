export interface PredefinedReminder {
  id: string // Identifiant unique pour ce rappel prédéfini
  title: string
  description: string | null
  dueDate: string // Date au format YYYY-MM-DD
  month: number // Mois (1-12) pour calculer la date chaque année
  day: number // Jour du mois
}

/**
 * Génère les rappels prédéfinis pour un topic donné
 * Les dates sont calculées pour l'année en cours ou l'année suivante si la date est passée
 */
export function getPredefinedReminders(topicSlug: string): PredefinedReminder[] {
  const currentYear = new Date().getFullYear()
  const currentDate = new Date()
  
  const reminders: PredefinedReminder[] = []

  if (topicSlug === 'impots') {
    // Calculer les dates pour l'année fiscale en cours
    // Les impôts sont déclarés pour l'année précédente
    // Ex: En 2024, on déclare les revenus de 2023
    
    // Rappel : Début de la période de déclaration (avril)
    const declarationStartDate = new Date(currentYear, 3, 1) // 1er avril
    if (declarationStartDate < currentDate) {
      declarationStartDate.setFullYear(currentYear + 1)
    }
    
    reminders.push({
      id: 'impots-declaration-start',
      title: 'Début de la période de déclaration',
      description: 'La déclaration des impôts est ouverte. Rassemblez vos justificatifs.',
      dueDate: formatDate(declarationStartDate),
      month: 4,
      day: 1
    })

    // Rappel : Date limite déclaration papier (31 mai)
    const paperDeadline = new Date(currentYear, 4, 31) // 31 mai
    if (paperDeadline < currentDate) {
      paperDeadline.setFullYear(currentYear + 1)
    }
    
    reminders.push({
      id: 'impots-paper-deadline',
      title: 'Date limite déclaration papier',
      description: 'Dernier jour pour envoyer votre déclaration par courrier (31 mai).',
      dueDate: formatDate(paperDeadline),
      month: 5,
      day: 31
    })

    // Rappel : Date limite déclaration en ligne (8 juin)
    const onlineDeadline = new Date(currentYear, 5, 8) // 8 juin
    if (onlineDeadline < currentDate) {
      onlineDeadline.setFullYear(currentYear + 1)
    }
    
    reminders.push({
      id: 'impots-online-deadline',
      title: 'Date limite déclaration en ligne',
      description: 'Dernier jour pour déclarer vos impôts en ligne (8 juin).',
      dueDate: formatDate(onlineDeadline),
      month: 6,
      day: 8
    })

    // Rappel : Réception de l'avis d'imposition (1er septembre)
    const avisDate = new Date(currentYear, 8, 1) // 1er septembre
    if (avisDate < currentDate) {
      avisDate.setFullYear(currentYear + 1)
    }
    
    reminders.push({
      id: 'impots-avis-reception',
      title: 'Réception de l\'avis d\'imposition',
      description: 'Vérifiez votre avis d\'imposition reçu en août/septembre.',
      dueDate: formatDate(avisDate),
      month: 9,
      day: 1
    })

    // Rappel : Vérification prélèvement à la source (décembre)
    const prelevementDate = new Date(currentYear, 11, 1) // 1er décembre
    if (prelevementDate < currentDate) {
      prelevementDate.setFullYear(currentYear + 1)
    }
    
    reminders.push({
      id: 'impots-prelevement-source',
      title: 'Vérifier le taux de prélèvement à la source',
      description: 'Vérifiez et ajustez si nécessaire votre taux de prélèvement à la source pour l\'année suivante.',
      dueDate: formatDate(prelevementDate),
      month: 12,
      day: 1
    })
  }

  return reminders
}

/**
 * Formate une date au format YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

