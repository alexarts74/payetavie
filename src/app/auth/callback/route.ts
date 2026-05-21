import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Valider next pour éviter les open redirects (ex: //evil.com)
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const type = searchParams.get('type')
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      // Confirmation d'email signup → ajouter le paramètre pour afficher la bannière
      if (!type) {
        const separator = next.includes('?') ? '&' : '?'
        return NextResponse.redirect(`${origin}${next}${separator}email_confirmed=true`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation`)
}
