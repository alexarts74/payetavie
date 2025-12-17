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
  } else if (topicSlug === 'urssaf') {
    // Rappels URSSAF / cotisations sociales (vision annuelle)

    // 1) Faire le point sur les déclarations de chiffre d'affaires de l'année précédente
    const caReviewDate = new Date(currentYear, 0, 31) // 31 janvier
    if (caReviewDate < currentDate) {
      caReviewDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'urssaf-ca-review',
      title: 'Faire le point sur vos déclarations de chiffre d\'affaires',
      description: 'Vérifiez que toutes vos déclarations URSSAF de l\'année précédente ont bien été faites et payées.',
      dueDate: formatDate(caReviewDate),
      month: 1,
      day: 31
    })

    // 2) Régularisation annuelle des cotisations
    const regularisationDate = new Date(currentYear, 3, 30) // 30 avril
    if (regularisationDate < currentDate) {
      regularisationDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'urssaf-regularisation-annuelle',
      title: 'Régularisation annuelle des cotisations',
      description: 'Contrôlez les appels de cotisations définitives envoyés par l\'URSSAF et leur cohérence avec votre chiffre d\'affaires réel.',
      dueDate: formatDate(regularisationDate),
      month: 4,
      day: 30
    })

    // 3) Vérifier la fin d\'éventuelles exonérations (ACRE, début d\'activité, etc.)
    const exonDate = new Date(currentYear, 6, 1) // 1er juillet
    if (exonDate < currentDate) {
      exonDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'urssaf-exonerations-fin',
      title: 'Fin des exonérations et taux réduits',
      description: 'Vérifiez si vos exonérations (ACRE, début d\'activité, zones spécifiques…) arrivent à terme et anticipez l\'augmentation de vos cotisations.',
      dueDate: formatDate(exonDate),
      month: 7,
      day: 1
    })

    // 4) Vérifier les plafonds de chiffre d\'affaires micro-entreprise
    const thresholdDate = new Date(currentYear, 9, 1) // 1er octobre
    if (thresholdDate < currentDate) {
      thresholdDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'urssaf-seuils-micro',
      title: 'Vérifier les plafonds de chiffre d\'affaires micro-entreprise',
      description: 'Comparez votre chiffre d\'affaires cumulé avec les plafonds micro-entreprise pour anticiper un éventuel changement de régime.',
      dueDate: formatDate(thresholdDate),
      month: 10,
      day: 1
    })
  } else if (topicSlug === 'mutuelle') {
    // Rappels Mutuelle / Santé

    // 1) Nouvelle année : vérifier carte de tiers payant et attestation
    const carteDate = new Date(currentYear, 0, 10) // 10 janvier
    if (carteDate < currentDate) {
      carteDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'mutuelle-carte-tiers-payant',
      title: 'Vérifier votre carte de mutuelle et attestation',
      description: 'Assurez-vous d\'avoir reçu votre nouvelle carte de tiers payant et l\'attestation de mutuelle pour l\'année en cours.',
      dueDate: formatDate(carteDate),
      month: 1,
      day: 10
    })

    // 2) Vérifier l'adéquation des garanties avec vos besoins
    const garantiesDate = new Date(currentYear, 3, 1) // 1er avril
    if (garantiesDate < currentDate) {
      garantiesDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'mutuelle-verifier-garanties',
      title: 'Vérifier les garanties de votre mutuelle',
      description: 'Contrôlez si vos garanties (optique, dentaire, hospitalisation) correspondent toujours à vos besoins réels.',
      dueDate: formatDate(garantiesDate),
      month: 4,
      day: 1
    })

    // 3) Comparer les offres et renégocier si besoin
    const comparaisonDate = new Date(currentYear, 9, 1) // 1er octobre
    if (comparaisonDate < currentDate) {
      comparaisonDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'mutuelle-comparer-offres',
      title: 'Comparer les offres de mutuelle',
      description: 'Faites un point sur le prix et les garanties de votre mutuelle, comparez avec d\'autres offres et renégociez si nécessaire.',
      dueDate: formatDate(comparaisonDate),
      month: 10,
      day: 1
    })

    // 4) Bilan de fin d'année sur les remboursements
    const bilanDate = new Date(currentYear, 11, 15) // 15 décembre
    if (bilanDate < currentDate) {
      bilanDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'mutuelle-bilan-remboursements',
      title: 'Faire le bilan de vos remboursements santé',
      description: 'Passez en revue vos dépenses et remboursements de santé de l\'année pour ajuster éventuellement votre niveau de couverture.',
      dueDate: formatDate(bilanDate),
      month: 12,
      day: 15
    })
  } else if (topicSlug === 'caf') {
    // Rappels CAF / Aides (limités à 2 rappels essentiels)

    // 1) Rappel trimestriel : déclaration des ressources et vérification
    // Calcule le prochain trimestre (mars, juin, septembre, décembre)
    const currentMonth = currentDate.getMonth() // 0-11
    let nextQuarterMonth = 2 // mars (mois 2)
    let nextQuarterYear = currentYear
    
    if (currentMonth < 2) {
      nextQuarterMonth = 2 // mars
    } else if (currentMonth < 5) {
      nextQuarterMonth = 5 // juin
    } else if (currentMonth < 8) {
      nextQuarterMonth = 8 // septembre
    } else if (currentMonth < 11) {
      nextQuarterMonth = 11 // décembre
    } else {
      nextQuarterMonth = 2 // mars de l'année suivante
      nextQuarterYear = currentYear + 1
    }
    
    const quarterlyDate = new Date(nextQuarterYear, nextQuarterMonth, 15)
    reminders.push({
      id: 'caf-verification-trimestrielle',
      title: 'Vérifier votre espace CAF et déclarer vos ressources',
      description: 'Consultez votre espace caf.fr : déclaration trimestrielle des ressources (obligatoire), vérification des paiements, réponse aux demandes de justificatifs.',
      dueDate: formatDate(quarterlyDate),
      month: nextQuarterMonth + 1,
      day: 15
    })

    // 2) Faire le point sur vos droits (annuel)
    const reviewRightsDate = new Date(currentYear, 6, 1) // 1er juillet
    if (reviewRightsDate < currentDate) {
      reviewRightsDate.setFullYear(currentYear + 1)
    }
    reminders.push({
      id: 'caf-point-droits',
      title: 'Faire le point sur vos droits aux aides',
      description: 'Vérifiez si votre situation a changé et si vous êtes éligible à de nouvelles aides (changement de revenus, naissance, déménagement, etc.).',
      dueDate: formatDate(reviewRightsDate),
      month: 7,
      day: 1
    })
  } else if (topicSlug === 'fiches-de-paie') {
    // Rappels Fiches de paie : un rappel annuel + un rappel mensuel générique

    // 1) Rappel annuel : sauvegarder toutes les fiches de l'année précédente
    const annualBackupDate = new Date(currentYear, 0, 15) // 15 janvier
    if (annualBackupDate < currentDate) {
      annualBackupDate.setFullYear(currentYear + 1)
    }

    reminders.push({
      id: 'fiches-de-paie-backup-annuel',
      title: 'Sauvegarder toutes vos fiches de paie de l\'année précédente',
      description: 'Téléchargez et stockez en lieu sûr toutes vos fiches de paie de l\'année écoulée (cloud, disque externe, etc.).',
      dueDate: formatDate(annualBackupDate),
      month: 1,
      day: 15
    })

    // 2) Rappel mensuel générique : vérifier la fiche de paie du mois
    // On positionne la date sur le 5 du mois en cours (ou du mois suivant si déjà passé)
    const monthlyDate = new Date(currentYear, currentDate.getMonth(), 5)
    if (monthlyDate < currentDate) {
      monthlyDate.setMonth(monthlyDate.getMonth() + 1)
    }

    reminders.push({
      id: 'fiches-de-paie-check-mensuel',
      title: 'Vérifier votre fiche de paie chaque mois',
      description: 'Une fois par mois, contrôlez votre fiche de paie (montants, heures, cotisations) et ajoutez-la dans PayeTaVie.',
      dueDate: formatDate(monthlyDate),
      month: monthlyDate.getMonth() + 1,
      day: monthlyDate.getDate()
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

