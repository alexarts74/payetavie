import Constants from 'expo-constants'
import { supabase } from './supabase'

const APP_URL = (Constants.expoConfig?.extra?.appUrl as string | undefined) ?? 'https://payetavie.fr'

export async function analyzeDocument(documentId: string): Promise<{ analysis: string | null; error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { analysis: null, error: 'Non authentifié' }
  }

  try {
    const res = await fetch(`${APP_URL}/api/documents/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ documentId }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { analysis: null, error: data.error || 'Erreur lors de l\'analyse' }
    }
    return { analysis: data.analysis, error: null }
  } catch {
    return { analysis: null, error: 'Erreur réseau. Vérifiez votre connexion.' }
  }
}
