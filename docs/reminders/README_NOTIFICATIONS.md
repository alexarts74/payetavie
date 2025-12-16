# 📧 Système de Notifications - Résumé

## 🎯 Vue d'ensemble

Le système de notifications envoie automatiquement des emails aux utilisateurs pour leurs rappels :
- **7 jours avant** la date d'échéance
- **1 jour avant** la date d'échéance  
- **Le jour J** (jour de l'échéance)

## 📁 Fichiers créés

```
supabase/
├── functions/
│   └── send-reminder-notifications/
│       └── index.ts                    # Edge Function qui envoie les emails
├── migrations/
│   ├── 001_reminder_notifications.sql  # Table + fonction SQL
│   └── 002_setup_cron_job.sql         # Configuration du cron job
└── config.toml                         # Config Supabase CLI

Documentation:
├── DEPLOY_NOTIFICATIONS.md            # Guide de déploiement complet
└── REMINDERS_NOTIFICATIONS.md         # Documentation technique
```

## 🚀 Déploiement rapide

### 1. Activer pg_cron
Supabase Dashboard → Database → Extensions → Activer `pg_cron`

### 2. Exécuter les migrations SQL
Dans SQL Editor, exécutez dans l'ordre :
- `001_reminder_notifications.sql`
- `002_setup_cron_job.sql` (après avoir remplacé les valeurs)

### 3. Configurer Resend
1. Créer un compte sur [resend.com](https://resend.com)
2. Générer une API key
3. Ajouter dans Supabase : Settings → Edge Functions → Secrets → `RESEND_API_KEY`

### 4. Déployer l'Edge Function
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-reminder-notifications
```

### 5. Configurer les secrets
Dans Supabase Dashboard → Settings → Edge Functions → Secrets :
- `RESEND_API_KEY` : Votre clé Resend
- `APP_URL` : URL de votre app (ex: `https://payetavie.fr`)
- `CRON_SECRET` : Un secret aléatoire (optionnel)

## 📖 Documentation complète

Voir `DEPLOY_NOTIFICATIONS.md` pour le guide détaillé étape par étape.

## 🧪 Tester

### Test manuel de l'Edge Function

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"cron_secret": "YOUR_CRON_SECRET"}'
```

### Vérifier les rappels à notifier

```sql
SELECT * FROM get_reminders_to_notify();
```

### Vérifier les notifications envoyées

```sql
SELECT 
  rn.*,
  r.title,
  r.due_date,
  u.email
FROM reminder_notifications rn
JOIN reminders r ON rn.reminder_id = r.id
JOIN auth.users u ON rn.user_id = u.id
ORDER BY rn.sent_at DESC
LIMIT 10;
```

## ⚙️ Configuration

### Modifier l'heure d'exécution

Dans `002_setup_cron_job.sql`, modifiez le schedule :
- `'0 9 * * *'` = Tous les jours à 9h
- `'0 9,18 * * *'` = 9h et 18h
- `'0 */6 * * *'` = Toutes les 6h

### Modifier les jours de notification

Dans `001_reminder_notifications.sql`, ligne 56 :
```sql
AND (r.due_date - CURRENT_DATE)::INTEGER IN (7, 1, 0)
```
Changez pour : `(14, 7, 1, 0)` pour notifier aussi 14 jours avant.

## 🔍 Dépannage

### Les emails ne partent pas
1. Vérifier les logs : Edge Functions → send-reminder-notifications → Logs
2. Vérifier Resend Dashboard → Emails
3. Vérifier que `RESEND_API_KEY` est bien configuré

### Le cron ne s'exécute pas
```sql
-- Vérifier que le cron est actif
SELECT * FROM cron.job WHERE jobname = 'send-reminder-notifications';

-- Voir les dernières exécutions
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-reminder-notifications')
ORDER BY start_time DESC LIMIT 10;
```

## 📊 Architecture

```
┌─────────────┐
│  pg_cron    │  ← Exécute tous les jours à 9h
└──────┬──────┘
       │ Appelle
       ▼
┌──────────────────────────┐
│  Edge Function           │  ← Trouve les rappels via get_reminders_to_notify()
│  send-reminder-          │     Envoie les emails via Resend
│  notifications           │     Enregistre dans reminder_notifications
└──────┬───────────────────┘
       │
       ▼
┌─────────────┐
│   Resend     │  ← Service d'envoi d'emails
└─────────────┘
```

## ✅ Checklist de déploiement

- [ ] pg_cron activé dans Supabase
- [ ] Migration `001_reminder_notifications.sql` exécutée
- [ ] Compte Resend créé et API key générée
- [ ] Secrets configurés dans Supabase (RESEND_API_KEY, APP_URL, CRON_SECRET)
- [ ] Edge Function déployée
- [ ] Migration `002_setup_cron_job.sql` exécutée (avec valeurs remplacées)
- [ ] Test manuel de l'Edge Function réussi
- [ ] Vérification que le cron job est actif

## 🎉 C'est prêt !

Une fois tout configuré, les notifications seront envoyées automatiquement tous les jours à 9h pour les rappels à venir.

