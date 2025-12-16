# Système de Notifications pour les Rappels

## 📧 Comment ça fonctionne

Actuellement, les rappels sont **uniquement affichés** dans l'interface. Pour envoyer des emails automatiques, il faut :

1. **Un cron job** qui vérifie quotidiennement les rappels à venir
2. **Un service d'envoi d'emails** (via Supabase Edge Functions)
3. **Une table pour tracker les notifications envoyées** (éviter les doublons)

## 🚀 Installation rapide (5 étapes)

### Étape 1 : Créer la table et la fonction SQL

Exécutez le fichier `supabase/migrations/001_reminder_notifications.sql` dans le SQL Editor de Supabase.

### Étape 2 : Activer pg_cron

1. Allez dans **Supabase Dashboard** → **Database** → **Extensions**
2. Cherchez `pg_cron` et **activez-le**

### Étape 3 : Configurer Resend (service d'emails)

1. Créez un compte sur [resend.com](https://resend.com) (gratuit jusqu'à 3000 emails/mois)
2. Générez une API key
3. Dans Supabase : **Settings** → **Edge Functions** → **Secrets**
4. Ajoutez : `RESEND_API_KEY` = votre clé Resend

### Étape 4 : Déployer l'Edge Function

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Déployer la fonction
supabase functions deploy send-reminder-notifications
```

### Étape 5 : Configurer le cron job

1. Ouvrez `supabase/migrations/002_setup_cron_job.sql`
2. **Remplacez** :
   - `YOUR_PROJECT_REF` par votre référence de projet
   - `YOUR_SERVICE_ROLE_KEY` par votre service_role key (Settings → API)
   - `CRON_SECRET` par un secret aléatoire (optionnel)
3. Exécutez le script dans le SQL Editor

✅ **C'est tout !** Les notifications seront envoyées automatiquement tous les jours à 9h.

---

## 📋 Détails techniques

## 🚀 Solution recommandée : Supabase Edge Functions + pg_cron

### Option 1 : pg_cron (Cron natif PostgreSQL)

Supabase utilise PostgreSQL qui supporte `pg_cron`. C'est la solution la plus simple.

#### Étape 1 : Activer pg_cron dans Supabase

1. Allez dans votre projet Supabase
2. **Database** → **Extensions**
3. Cherchez `pg_cron` et activez-le

#### Étape 2 : Créer une fonction SQL pour trouver les rappels à notifier

```sql
-- Fonction pour trouver les rappels à notifier (7 jours avant, 1 jour avant, jour J)
CREATE OR REPLACE FUNCTION get_reminders_to_notify()
RETURNS TABLE (
  reminder_id UUID,
  user_id UUID,
  user_email TEXT,
  title TEXT,
  due_date DATE,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as reminder_id,
    r.user_id,
    u.email as user_email,
    r.title,
    r.due_date,
    (r.due_date - CURRENT_DATE)::INTEGER as days_until
  FROM reminders r
  JOIN auth.users u ON r.user_id = u.id
  WHERE 
    r.completed = FALSE
    AND r.due_date IS NOT NULL
    AND r.due_date >= CURRENT_DATE
    AND (r.due_date - CURRENT_DATE)::INTEGER IN (7, 1, 0) -- 7 jours avant, 1 jour avant, jour J
    AND NOT EXISTS (
      SELECT 1 FROM reminder_notifications n
      WHERE n.reminder_id = r.id
      AND n.notification_date = CURRENT_DATE
      AND n.days_before = (r.due_date - CURRENT_DATE)::INTEGER
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Étape 3 : Créer une table pour tracker les notifications

```sql
-- Table pour tracker les notifications envoyées
CREATE TABLE IF NOT EXISTS reminder_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_before INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_reminder_notifications_reminder ON reminder_notifications(reminder_id, notification_date, days_before);
```

#### Étape 4 : Créer un Edge Function Supabase

Créez un dossier `supabase/functions/send-reminder-notifications/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Appeler la fonction SQL pour obtenir les rappels à notifier
    const { data: reminders, error } = await supabase.rpc('get_reminders_to_notify')

    if (error) {
      throw error
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'Aucun rappel à notifier' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const emailsSent = []

    for (const reminder of reminders) {
      // Envoyer l'email via Resend (ou autre service)
      const emailResult = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'PayeTaVie <notifications@payetavie.fr>',
          to: reminder.user_email,
          subject: `🔔 Rappel : ${reminder.title}`,
          html: `
            <h2>Bonjour,</h2>
            <p>Vous avez un rappel qui approche :</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${reminder.title}</h3>
              <p><strong>Date d'échéance :</strong> ${new Date(reminder.due_date).toLocaleDateString('fr-FR')}</p>
              ${reminder.days_until === 0 
                ? '<p style="color: #dc2626; font-weight: bold;">⚠️ C\'est aujourd\'hui !</p>'
                : reminder.days_until === 1
                ? '<p style="color: #ea580c; font-weight: bold;">⚠️ C\'est demain !</p>'
                : `<p>Il vous reste ${reminder.days_until} jours.</p>`
              }
            </div>
            <p><a href="https://payetavie.fr/topics">Voir mes rappels</a></p>
          `,
        }),
      })

      if (emailResult.ok) {
        // Enregistrer la notification dans la table
        await supabase.from('reminder_notifications').insert({
          reminder_id: reminder.reminder_id,
          user_id: reminder.user_id,
          notification_date: new Date().toISOString().split('T')[0],
          days_before: reminder.days_until,
        })

        emailsSent.push(reminder.reminder_id)
      }
    }

    return new Response(
      JSON.stringify({
        message: `${emailsSent.length} emails envoyés`,
        reminders: emailsSent,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
```

#### Étape 5 : Configurer le cron job dans Supabase

```sql
-- Planifier l'exécution quotidienne à 9h du matin
SELECT cron.schedule(
  'send-reminder-notifications',
  '0 9 * * *', -- Tous les jours à 9h
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### Option 2 : Vercel Cron (si déployé sur Vercel)

Si votre app est déployée sur Vercel, vous pouvez utiliser Vercel Cron.

#### Créer `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Créer `src/app/api/cron/reminders/route.ts` :

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Vérifier que la requête vient de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Même logique que l'Edge Function ci-dessus
  // ...
}
```

## 📝 Services d'email recommandés

1. **Resend** (recommandé) : Simple, moderne, bon pour les transactions
2. **SendGrid** : Plus de fonctionnalités, plus complexe
3. **Mailgun** : Alternative solide
4. **Supabase Email** : Si disponible dans votre plan

## 🔧 Configuration Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Générez une API key
3. Ajoutez-la dans Supabase : **Settings** → **Edge Functions** → **Secrets** → `RESEND_API_KEY`

## ⚠️ Notes importantes

- Les Edge Functions Supabase nécessitent un plan payant ou Pro
- pg_cron nécessite l'extension activée (gratuite)
- Pour le développement local, vous pouvez tester manuellement en appelant l'Edge Function
- Les emails peuvent être limités selon votre plan Resend (gratuit : 3000/mois)

## 🧪 Tester localement

```bash
# Installer Supabase CLI
npm install -g supabase

# Tester l'Edge Function
supabase functions serve send-reminder-notifications
```

