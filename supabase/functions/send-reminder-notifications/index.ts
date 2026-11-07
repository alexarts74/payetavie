// Edge Function Supabase pour envoyer des notifications de rappels
// Déployer avec: supabase functions deploy send-reminder-notifications

// Déclarations de type pour Deno (disponible au runtime dans Supabase Edge Functions)
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

// @ts-ignore - Les imports Deno ne sont pas reconnus par TypeScript mais fonctionnent au runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const APP_URL = Deno.env.get('APP_URL') || 'https://payetavie.fr'

serve(async (req: Request): Promise<Response> => {
  try {
    // Vérifier l'authentification (optionnel, pour sécuriser l'endpoint)
    // Le cron job peut passer le secret dans le body ou les headers
    const cronSecret = Deno.env.get('CRON_SECRET') || ''
    const expectedSecret = cronSecret
    
    if (expectedSecret) {
      try {
        const body = await req.json().catch(() => ({}))
        const headerSecret = req.headers.get('x-cron-secret')
        const bodySecret = body?.cron_secret
        
        if (headerSecret !== expectedSecret && bodySecret !== expectedSecret) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - Invalid cron secret' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      } catch (e) {
        // Si pas de body, on continue (pour compatibilité)
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Appeler la fonction SQL pour obtenir les rappels à notifier
    const { data: reminders, error } = await supabase.rpc('get_reminders_to_notify')

    if (error) {
      console.error('Erreur lors de la récupération des rappels:', error)
      throw error
    }

    const emailsSent = []
    const errors = []

    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i]
      
      // Ajouter un délai entre les envois pour éviter le rate limit de Resend (2 req/s)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 600)) // 600ms = 1.67 req/s
      }
      
      try {
        // Préparer le message selon le nombre de jours restants
        let urgencyMessage = ''
        let urgencyColor = '#3b82f6'
        
        if (reminder.days_until === 0) {
          urgencyMessage = '⚠️ <strong style="color: #dc2626;">C\'est aujourd\'hui !</strong>'
          urgencyColor = '#dc2626'
        } else if (reminder.days_until === 1) {
          urgencyMessage = '⚠️ <strong style="color: #ea580c;">C\'est demain !</strong>'
          urgencyColor = '#ea580c'
        } else {
          urgencyMessage = `Il vous reste <strong>${reminder.days_until} jours</strong>.`
        }

        // Envoyer l'email via Resend
        const emailResult = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            // Pour le développement : utilisez le domaine par défaut de Resend
            // Pour la production : remplacez par votre domaine vérifié
            // Domaine par défaut : onboarding.resend.dev (pour les tests)
            from: Deno.env.get('RESEND_FROM_EMAIL') || 'PayeTaVie <onboarding@resend.dev>',
            to: reminder.user_email,
            subject: `🔔 Rappel : ${reminder.title}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Rappel PayeTaVie</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
                  <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">${reminder.title}</h2>
                  <p style="color: #6b7280; margin: 10px 0;">
                    <strong>Date d'échéance :</strong> 
                    <span style="color: ${urgencyColor}; font-weight: bold;">
                      ${new Date(reminder.due_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </p>
                  <p style="color: #374151; margin: 15px 0;">
                    ${urgencyMessage}
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${APP_URL}/topics" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Voir mes rappels
                  </a>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  Vous recevez cet email car vous avez activé un rappel sur PayeTaVie.<br>
                  <a href="${APP_URL}" style="color: #667eea;">PayeTaVie</a> - Votre assistant administratif personnel
                </p>
              </body>
              </html>
            `,
          }),
        })

        let emailData
        try {
          emailData = await emailResult.json()
        } catch (e) {
          emailData = { message: 'Erreur lors de la lecture de la réponse' }
        }

        if (emailResult.ok && emailData?.id) {
          // Enregistrer la notification dans la table
          const { error: insertError } = await supabase
            .from('reminder_notifications')
            .insert({
              reminder_id: reminder.reminder_id,
              user_id: reminder.user_id,
              notification_date: new Date().toISOString().split('T')[0],
              days_before: reminder.days_until,
            })

          if (insertError) {
            console.error('Erreur lors de l\'enregistrement de la notification:', insertError)
            errors.push({ reminder_id: reminder.reminder_id, error: insertError.message })
          } else {
            emailsSent.push({
              reminder_id: reminder.reminder_id,
              user_email: reminder.user_email,
              days_until: reminder.days_until,
            })
          }
        } else {
          console.error('Erreur lors de l\'envoi de l\'email:', emailData)
          errors.push({ reminder_id: reminder.reminder_id, error: emailData.message || 'Erreur inconnue' })
        }
      } catch (error) {
        console.error('Erreur pour le rappel:', reminder.reminder_id, error)
        errors.push({ reminder_id: reminder.reminder_id, error: error instanceof Error ? error.message : String(error) })
      }
    }

    // --- Factures en retard ---
    const { data: overdueInvoices, error: overdueError } = await supabase.rpc('get_overdue_invoices_to_notify')

    const invoicesSent = []
    const invoiceErrors = []

    if (!overdueError && overdueInvoices && overdueInvoices.length > 0) {
      for (let i = 0; i < overdueInvoices.length; i++) {
        const inv = overdueInvoices[i]

        await new Promise(resolve => setTimeout(resolve, 600))

        try {
          const invoiceEmailResult = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: Deno.env.get('RESEND_FROM_EMAIL') || 'PayeTaVie <onboarding@resend.dev>',
              to: inv.user_email,
              subject: `⚠️ Facture ${inv.document_number} en retard – ${inv.client_name}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Facture en retard</h1>
                  </div>

                  <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Facture ${inv.document_number}</h2>
                    <p style="color: #6b7280; margin: 10px 0;">
                      <strong>Client :</strong> ${inv.client_name}
                    </p>
                    <p style="color: #6b7280; margin: 10px 0;">
                      <strong>Montant TTC :</strong>
                      <span style="color: #dc2626; font-weight: bold;">
                        ${Number(inv.total_ttc).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </p>
                    <p style="color: #6b7280; margin: 10px 0;">
                      <strong>Échéance :</strong>
                      <span style="color: #dc2626; font-weight: bold;">
                        ${new Date(inv.due_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </p>
                    <p style="color: #374151; margin: 15px 0;">
                      Cette facture est en retard de <strong>${inv.days_overdue} jour${inv.days_overdue > 1 ? 's' : ''}</strong>.
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${APP_URL}/freelance/facturation/factures/${inv.invoice_id}"
                       style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                      Voir la facture
                    </a>
                  </div>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    <a href="${APP_URL}" style="color: #667eea;">PayeTaVie</a> - Votre assistant administratif personnel
                  </p>
                </body>
                </html>
              `,
            }),
          })

          let invoiceEmailData
          try {
            invoiceEmailData = await invoiceEmailResult.json()
          } catch (e) {
            invoiceEmailData = { message: 'Erreur lors de la lecture de la réponse' }
          }

          if (invoiceEmailResult.ok && invoiceEmailData?.id) {
            const { error: insertError } = await supabase
              .from('invoice_payment_notifications')
              .insert({
                invoice_id: inv.invoice_id,
                user_id: inv.user_id,
              })

            if (insertError) {
              console.error('Erreur lors de l\'enregistrement de la notification facture:', insertError)
              invoiceErrors.push({ invoice_id: inv.invoice_id, error: insertError.message })
            } else {
              invoicesSent.push({ invoice_id: inv.invoice_id, user_email: inv.user_email, days_overdue: inv.days_overdue })
            }
          } else {
            console.error('Erreur lors de l\'envoi de l\'email facture:', invoiceEmailData)
            invoiceErrors.push({ invoice_id: inv.invoice_id, error: invoiceEmailData.message || 'Erreur inconnue' })
          }
        } catch (invoiceError) {
          console.error('Erreur pour la facture:', inv.invoice_id, invoiceError)
          invoiceErrors.push({ invoice_id: inv.invoice_id, error: invoiceError instanceof Error ? invoiceError.message : String(invoiceError) })
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `${emailsSent.length} rappels et ${invoicesSent.length} relances factures envoyés`,
        sent: emailsSent.length,
        errors: errors.length,
        invoicesSent: invoicesSent.length,
        invoiceErrors: invoiceErrors.length,
        details: {
          emailsSent,
          invoicesSent,
          errors: errors.length > 0 ? errors : undefined,
          invoiceErrors: invoiceErrors.length > 0 ? invoiceErrors : undefined,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erreur générale:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

