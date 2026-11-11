import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { requirePlan } from '@/lib/subscription'

export const runtime = 'nodejs'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const AI_QUOTA_LIMIT = 10

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse de documents administratifs français.
Tu analyses des documents et fournis une synthèse claire et actionnable en français.

Structure ta réponse avec exactement ces 4 sections :

## Type de document
Identifie précisément le type de document (fiche de paie, avis d'imposition, contrat de bail, relevé bancaire, attestation, etc.)

## Points clés
Liste les informations importantes extraites du document (dates, montants, noms, références, etc.)

## Alertes
Signale tout point d'attention : dates d'expiration proches, montants inhabituels, clauses importantes, etc.
Si aucune alerte, indique "Aucune alerte particulière."

## Actions recommandées
Maximum 3 actions concrètes à effectuer suite à ce document.
Si aucune action requise, indique "Aucune action requise."

Sois concis, précis et utile. Utilise un langage simple et accessible.`

async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer)
  return (data.text as string)?.slice(0, 8000) ?? ''
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Auth : cookies (web) ou Bearer token (mobile)
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data } = await supabase.auth.getUser(token)
      user = data.user
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const planCheck = await requirePlan('pro')
  if (!planCheck.allowed) {
    return NextResponse.json(
      { error: 'Cette fonctionnalité est réservée au plan Pro', upgradeRequired: planCheck.upgradeRequired },
      { status: 403 }
    )
  }

  const { documentId } = await request.json()
  if (!documentId) {
    return NextResponse.json({ error: 'documentId manquant' }, { status: 400 })
  }

  // Vérification + incrément atomique du quota via RPC
  const { data: quotaResult, error: quotaError } = await supabase
    .rpc('check_and_increment_ai_quota', {
      p_user_id: user.id,
      p_limit: AI_QUOTA_LIMIT as unknown as never,
    })
    .single()

  if (quotaError || !quotaResult) {
    return NextResponse.json({ error: 'Erreur vérification quota' }, { status: 500 })
  }

  const { allowed, used } = quotaResult as { allowed: boolean; used: number }

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Quota mensuel atteint (${AI_QUOTA_LIMIT} analyses/mois). Renouvellement le 1er du mois prochain.`,
        quotaUsed: used,
        quotaLimit: AI_QUOTA_LIMIT,
      },
      { status: 429 }
    )
  }

  // Vérifier ownership du document (RLS)
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, name, file_path, file_type')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (docError || !doc) {
    // Rembourser le quota si doc introuvable
    await supabase
      .from('user_preferences')
      .update({ ai_analyses_used: used - 1 })
      .eq('user_id', user.id)
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  // URL signée 60 min
  const { data: signedData, error: signedError } = await supabase.storage
    .from('Documents')
    .createSignedUrl(doc.file_path, 3600)

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: "Impossible d'accéder au fichier" }, { status: 500 })
  }

  const fileResponse = await fetch(signedData.signedUrl)
  if (!fileResponse.ok) {
    return NextResponse.json({ error: 'Erreur lors du téléchargement du fichier' }, { status: 500 })
  }

  const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
  const mimeType = doc.file_type || 'application/pdf'
  const isImage = mimeType.startsWith('image/')

  let messages: Groq.Chat.ChatCompletionMessageParam[]

  if (isImage) {
    const base64Data = fileBuffer.toString('base64')
    messages = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          { type: 'text', text: `Analyse ce document administratif intitulé "${doc.name}".` },
        ],
      },
    ]
  } else {
    let text = ''
    try {
      text = await extractPdfText(fileBuffer)
    } catch {
      text = '[Extraction impossible — analyse basée sur le nom du fichier uniquement]'
    }
    messages = [
      {
        role: 'user',
        content: `Analyse ce document administratif intitulé "${doc.name}".\n\nContenu extrait :\n${text}`,
      },
    ]
  }

  const model = isImage ? 'llama-3.2-11b-vision-preview' : 'llama-3.1-8b-instant'

  const completion = await groq.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
  })

  const analysis = completion.choices[0]?.message?.content ?? ''

  // Mettre à jour last_analyzed_at sur le document
  await supabase
    .from('documents')
    .update({ last_analyzed_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('user_id', user.id)

  return NextResponse.json({
    analysis,
    quotaUsed: used,
    quotaLimit: AI_QUOTA_LIMIT,
  })
}
