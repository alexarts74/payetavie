/**
 * Traduit les messages d'erreur de Supabase en français
 */
export function translateAuthError(errorMessage: string): string {
  const errorLower = errorMessage.toLowerCase()

  // Erreurs de connexion
  if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect'
  }
  if (errorLower.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter'
  }
  if (errorLower.includes('too many requests')) {
    return 'Trop de tentatives. Veuillez réessayer dans quelques instants'
  }

  // Erreurs d'inscription
  if (errorLower.includes('user already registered') || errorLower.includes('already registered')) {
    return 'Cet email est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe'
  }
  if (errorLower.includes('password should be at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères'
  }
  if (errorLower.includes('signup is disabled')) {
    return "L'inscription est temporairement désactivée"
  }

  // Erreurs de format
  if (errorLower.includes('invalid email')) {
    return "Format d'email invalide"
  }
  if (errorLower.includes('email address is not authorized')) {
    return "Cette adresse email n'est pas autorisée"
  }

  // Erreurs réseau
  if (errorLower.includes('network') || errorLower.includes('fetch')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet'
  }

  // Erreurs de session
  if (errorLower.includes('session not found') || errorLower.includes('jwt')) {
    return 'Session expirée. Veuillez vous reconnecter'
  }

  // Erreurs de réinitialisation de mot de passe
  if (errorLower.includes('same password') || errorLower.includes('new password should be different')) {
    return 'Le nouveau mot de passe doit être différent de l\'ancien'
  }
  if (errorLower.includes('recovery token not found') || errorLower.includes('token has expired') || errorLower.includes('otp expired')) {
    return 'Ce lien de réinitialisation est expiré ou invalide. Veuillez en demander un nouveau'
  }
  if (errorLower.includes('user not found')) {
    return 'Aucun compte associé à cette adresse email'
  }

  // Erreur générique si aucune correspondance
  return errorMessage
}
