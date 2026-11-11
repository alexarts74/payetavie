export interface PredefinedReminder {
  id: string
  title: string
  description: string | null
  dueDate: string // YYYY-MM-DD
  month: number  // 1-12
  day: number
}

export function getPredefinedReminders(topicSlug: string): PredefinedReminder[] {
  const currentYear = new Date().getFullYear()
  const currentDate = new Date()

  const reminders: PredefinedReminder[] = []

  if (topicSlug === 'impots') {
    const declarationStartDate = new Date(currentYear, 3, 1)
    if (declarationStartDate < currentDate) declarationStartDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'impots-declaration-start', title: 'Début de la période de déclaration', description: 'La déclaration des impôts est ouverte. Rassemblez vos justificatifs.', dueDate: formatDate(declarationStartDate), month: 4, day: 1 })

    const paperDeadline = new Date(currentYear, 4, 31)
    if (paperDeadline < currentDate) paperDeadline.setFullYear(currentYear + 1)
    reminders.push({ id: 'impots-paper-deadline', title: 'Date limite déclaration papier', description: 'Dernier jour pour envoyer votre déclaration par courrier (31 mai).', dueDate: formatDate(paperDeadline), month: 5, day: 31 })

    const onlineDeadline = new Date(currentYear, 5, 8)
    if (onlineDeadline < currentDate) onlineDeadline.setFullYear(currentYear + 1)
    reminders.push({ id: 'impots-online-deadline', title: 'Date limite déclaration en ligne', description: 'Dernier jour pour déclarer vos impôts en ligne (8 juin).', dueDate: formatDate(onlineDeadline), month: 6, day: 8 })

    const avisDate = new Date(currentYear, 8, 1)
    if (avisDate < currentDate) avisDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'impots-avis-reception', title: "Réception de l'avis d'imposition", description: "Vérifiez votre avis d'imposition reçu en août/septembre.", dueDate: formatDate(avisDate), month: 9, day: 1 })

    const prelevementDate = new Date(currentYear, 11, 1)
    if (prelevementDate < currentDate) prelevementDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'impots-prelevement-source', title: 'Vérifier le taux de prélèvement à la source', description: "Vérifiez et ajustez si nécessaire votre taux de prélèvement à la source pour l'année suivante.", dueDate: formatDate(prelevementDate), month: 12, day: 1 })

  } else if (topicSlug === 'urssaf') {
    const caReviewDate = new Date(currentYear, 0, 31)
    if (caReviewDate < currentDate) caReviewDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'urssaf-ca-review', title: "Faire le point sur vos déclarations de chiffre d'affaires", description: "Vérifiez que toutes vos déclarations URSSAF de l'année précédente ont bien été faites et payées.", dueDate: formatDate(caReviewDate), month: 1, day: 31 })

    const regularisationDate = new Date(currentYear, 3, 30)
    if (regularisationDate < currentDate) regularisationDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'urssaf-regularisation-annuelle', title: 'Régularisation annuelle des cotisations', description: "Contrôlez les appels de cotisations définitives envoyés par l'URSSAF.", dueDate: formatDate(regularisationDate), month: 4, day: 30 })

    const exonDate = new Date(currentYear, 6, 1)
    if (exonDate < currentDate) exonDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'urssaf-exonerations-fin', title: 'Fin des exonérations et taux réduits', description: "Vérifiez si vos exonérations (ACRE, début d'activité…) arrivent à terme.", dueDate: formatDate(exonDate), month: 7, day: 1 })

    const thresholdDate = new Date(currentYear, 9, 1)
    if (thresholdDate < currentDate) thresholdDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'urssaf-seuils-micro', title: 'Vérifier les plafonds de chiffre d\'affaires micro-entreprise', description: 'Comparez votre chiffre d\'affaires cumulé avec les plafonds micro-entreprise.', dueDate: formatDate(thresholdDate), month: 10, day: 1 })

  } else if (topicSlug === 'sante') {
    const medecinDate = new Date(currentYear, 0, 15)
    if (medecinDate < currentDate) medecinDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'sante-bilan-annuel', title: 'Bilan de santé annuel', description: 'Prenez rendez-vous avec votre médecin traitant pour votre bilan annuel.', dueDate: formatDate(medecinDate), month: 1, day: 15 })

    const ordoDate = new Date(currentYear, 2, 1)
    if (ordoDate < currentDate) ordoDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'sante-renouvellement-ordo', title: 'Renouveler vos ordonnances', description: 'Vérifiez les ordonnances arrivant à expiration (validité 3 mois).', dueDate: formatDate(ordoDate), month: 3, day: 1 })

    const ameliDate = new Date(currentYear, 5, 1)
    if (ameliDate < currentDate) ameliDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'sante-verifier-ameli', title: 'Vérifier vos remboursements Ameli', description: 'Consultez votre espace Ameli pour vérifier vos remboursements et votre dossier médical.', dueDate: formatDate(ameliDate), month: 6, day: 1 })

  } else if (topicSlug === 'mutuelle') {
    const carteDate = new Date(currentYear, 0, 10)
    if (carteDate < currentDate) carteDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'mutuelle-carte-tiers-payant', title: 'Vérifier votre carte de mutuelle et attestation', description: "Assurez-vous d'avoir reçu votre nouvelle carte de tiers payant.", dueDate: formatDate(carteDate), month: 1, day: 10 })

    const garantiesDate = new Date(currentYear, 3, 1)
    if (garantiesDate < currentDate) garantiesDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'mutuelle-verifier-garanties', title: 'Vérifier les garanties de votre mutuelle', description: 'Contrôlez si vos garanties correspondent toujours à vos besoins réels.', dueDate: formatDate(garantiesDate), month: 4, day: 1 })

    const comparaisonDate = new Date(currentYear, 9, 1)
    if (comparaisonDate < currentDate) comparaisonDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'mutuelle-comparer-offres', title: 'Comparer les offres de mutuelle', description: "Faites un point sur le prix et les garanties de votre mutuelle.", dueDate: formatDate(comparaisonDate), month: 10, day: 1 })

    const bilanDate = new Date(currentYear, 11, 15)
    if (bilanDate < currentDate) bilanDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'mutuelle-bilan-remboursements', title: 'Faire le bilan de vos remboursements santé', description: "Passez en revue vos dépenses et remboursements de santé de l'année.", dueDate: formatDate(bilanDate), month: 12, day: 15 })

  } else if (topicSlug === 'caf') {
    const currentMonth = currentDate.getMonth()
    let nextQuarterMonth = 2
    let nextQuarterYear = currentYear
    if (currentMonth < 2) nextQuarterMonth = 2
    else if (currentMonth < 5) nextQuarterMonth = 5
    else if (currentMonth < 8) nextQuarterMonth = 8
    else if (currentMonth < 11) nextQuarterMonth = 11
    else { nextQuarterMonth = 2; nextQuarterYear = currentYear + 1 }

    const quarterlyDate = new Date(nextQuarterYear, nextQuarterMonth, 15)
    reminders.push({ id: 'caf-verification-trimestrielle', title: 'Vérifier votre espace CAF et déclarer vos ressources', description: 'Consultez votre espace caf.fr : déclaration trimestrielle des ressources.', dueDate: formatDate(quarterlyDate), month: nextQuarterMonth + 1, day: 15 })

    const reviewRightsDate = new Date(currentYear, 6, 1)
    if (reviewRightsDate < currentDate) reviewRightsDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'caf-point-droits', title: 'Faire le point sur vos droits aux aides', description: "Vérifiez si votre situation a changé et si vous êtes éligible à de nouvelles aides.", dueDate: formatDate(reviewRightsDate), month: 7, day: 1 })

  } else if (topicSlug === 'fiches-de-paie') {
    const annualBackupDate = new Date(currentYear, 0, 15)
    if (annualBackupDate < currentDate) annualBackupDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'fiches-de-paie-backup-annuel', title: "Sauvegarder toutes vos fiches de paie de l'année précédente", description: "Téléchargez et stockez en lieu sûr toutes vos fiches de paie de l'année écoulée.", dueDate: formatDate(annualBackupDate), month: 1, day: 15 })

    const monthlyDate = new Date(currentYear, currentDate.getMonth(), 5)
    if (monthlyDate < currentDate) monthlyDate.setMonth(monthlyDate.getMonth() + 1)
    reminders.push({ id: 'fiches-de-paie-check-mensuel', title: 'Vérifier votre fiche de paie chaque mois', description: 'Une fois par mois, contrôlez votre fiche de paie et ajoutez-la dans PayeTaVie.', dueDate: formatDate(monthlyDate), month: monthlyDate.getMonth() + 1, day: monthlyDate.getDate() })

  } else if (topicSlug === 'logement') {
    const assuranceDate = new Date(currentYear, 0, 15)
    if (assuranceDate < currentDate) assuranceDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'logement-renouvellement-assurance', title: 'Renouveler votre assurance habitation', description: "Vérifiez la date d'expiration de votre assurance habitation.", dueDate: formatDate(assuranceDate), month: 1, day: 15 })

    const chargesDate = new Date(currentYear, 11, 1)
    if (chargesDate < currentDate) chargesDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'logement-verification-charges', title: 'Vérifier et régulariser les charges', description: 'Vérifiez la régularisation annuelle des charges avec votre propriétaire.', dueDate: formatDate(chargesDate), month: 12, day: 1 })

  } else if (topicSlug === 'assurances') {
    const compareDate = new Date(currentYear, 11, 1)
    if (compareDate < currentDate) compareDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'assurances-comparer-offres', title: "Comparer les offres d'assurance avant renouvellement", description: 'Avant le renouvellement de vos assurances, comparez les offres du marché.', dueDate: formatDate(compareDate), month: 12, day: 1 })

    const reviewDate = new Date(currentYear, 5, 1)
    if (reviewDate < currentDate) reviewDate.setFullYear(currentYear + 1)
    reminders.push({ id: 'assurances-verifier-garanties', title: 'Faire le point sur vos assurances et garanties', description: 'Vérifiez que vos garanties correspondent toujours à vos besoins.', dueDate: formatDate(reviewDate), month: 7, day: 1 })
  }

  return reminders
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
