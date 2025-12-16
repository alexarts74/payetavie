# 🚀 Guide de Déploiement - Système de Notifications

Guide étape par étape pour déployer le système de notifications de rappels.

## 📋 Prérequis

- Un projet Supabase (gratuit ou payant)
- Un compte Resend (gratuit jusqu'à 3000 emails/mois)
- Supabase CLI installé (optionnel mais recommandé)

---

## Étape 1 : Activer pg_cron dans Supabase

1. Connectez-vous à votre [Dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Database** → **Extensions**
4. Cherchez `pg_cron` dans la liste
5. Cliquez sur **Activer** (Enable)

✅ **Vérification** : L'extension doit apparaître comme "Enabled"

---

## Étape 2 : Exécuter la migration SQL

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase/migrations/001_reminder_notifications.sql`
4. Copiez-collez tout le contenu dans l'éditeur SQL
5. Cliquez sur **Run** (ou `Cmd/Ctrl + Enter`)

✅ **Vérification** : Vous devriez voir "Success. No rows returned"

Cette migration crée :
- La table `reminder_notifications` pour tracker les emails envoyés
- La fonction `get_reminders_to_notify()` pour trouver les rappels à notifier

---

## Étape 3 : Configurer Resend (Service d'emails)

### 3.1 Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte (gratuit)
3. Vérifiez votre email

### 3.2 Configurer le domaine d'envoi

#### Option A : Utiliser le domaine par défaut (pour développement/test) ✅

**Pas besoin de configurer de DNS !** Resend fournit un domaine par défaut pour tester :
- Domaine : `onboarding.resend.dev`
- Email : `onboarding@resend.dev`

C'est parfait pour le développement local et les tests. Les emails partiront de `onboarding@resend.dev`.

**Limitations** :
- Les emails peuvent aller en spam
- Pas de personnalisation du domaine
- Limité à 100 emails/jour avec le domaine par défaut

#### Option B : Utiliser votre propre domaine (pour production)

Pour la production, configurez votre propre domaine :
1. Dans Resend Dashboard, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Suivez les instructions pour configurer les DNS (ajouter les enregistrements dans votre registrar)
4. Une fois vérifié, utilisez : `notifications@votre-domaine.com`

**Avantages** :
- Meilleure délivrabilité (moins de spam)
- Professionnel
- Pas de limite avec le domaine vérifié

### 3.3 Générer une API Key

1. Dans Resend Dashboard, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez-lui un nom (ex: "PayeTaVie Notifications")
4. **Copiez la clé** (vous ne pourrez plus la voir après)

---

## Étape 4 : Configurer les secrets Supabase

1. Dans Supabase Dashboard, allez dans **Settings** → **Edge Functions** → **Secrets**
2. Cliquez sur **Add new secret** pour chaque secret
3. Ajoutez les secrets suivants :

| Nom | Valeur (sans backticks !) | Description |
|-----|--------|------------|
| `RESEND_API_KEY` | `re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3` | Votre clé Resend (copiez-collez directement) |
| `APP_URL` | `http://localhost:3000` | URL de votre application (sans les backticks) |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Email expéditeur (optionnel, par défaut utilisé si absent) |
| `CRON_SECRET` | (optionnel) Un secret aléatoire | Pour sécuriser l'endpoint |

**⚠️ IMPORTANT** : 
- Ne mettez **PAS** les backticks (\`) dans les valeurs
- Copiez-collez directement les valeurs
- Exemple : Pour `RESEND_API_KEY`, mettez juste `re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3` (sans les backticks)

**Exemple visuel** :
```
Nom: RESEND_API_KEY
Valeur: re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3  ← Pas de backticks ici !
```

**Générer un CRON_SECRET** :
```bash
# Sur Mac/Linux
openssl rand -hex 32

# Ou utilisez un générateur en ligne
```

✅ **Vérification** : Les 3 secrets doivent apparaître dans la liste

---

## Étape 5 : Déployer l'Edge Function

### Option A : Avec Supabase CLI (Recommandé)

#### Installation de Supabase CLI

**Sur macOS (avec Homebrew)** :
```bash
brew install supabase/tap/supabase
```

**Sur Linux** :
```bash
# Via npm (localement dans le projet)
npm install supabase --save-dev

# Ou via le script d'installation
curl -fsSL https://supabase.com/install.sh | sh
```

**Sur Windows** :
```bash
# Via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Alternative : Via npm (localement)** :
```bash
# Dans votre projet
npm install supabase --save-dev
# Puis utilisez : npx supabase ...
```

#### Déploiement

```bash
# 1. Se connecter à Supabase
supabase login

# 2. Lier votre projet (remplacez YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Déployer la fonction
supabase functions deploy send-reminder-notifications
```

**Si installé localement avec npm** :
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-reminder-notifications
```

**Trouver votre PROJECT_REF** :
- Dans Supabase Dashboard → Settings → API
- L'URL est : `https://YOUR_PROJECT_REF.supabase.co`
- Le PROJECT_REF est la partie avant `.supabase.co`

### Option B : Via l'interface Supabase

1. Dans Supabase Dashboard, allez dans **Edge Functions**
2. Cliquez sur **Create a new function**
3. Nommez-la `send-reminder-notifications`
4. Copiez le contenu de `supabase/functions/send-reminder-notifications/index.ts`
5. Collez-le dans l'éditeur
6. Cliquez sur **Deploy**

✅ **Vérification** : La fonction doit apparaître dans la liste avec le statut "Active"

---

## Étape 6 : Configurer le Cron Job

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Ouvrez le fichier `supabase/migrations/002_setup_cron_job.sql`
3. **IMPORTANT** : Remplacez les valeurs suivantes :

```sql
-- Remplacez YOUR_PROJECT_REF
'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications'

-- Remplacez YOUR_SERVICE_ROLE_KEY
-- Trouvez-le dans : Settings → API → service_role key (secret)
'Bearer YOUR_SERVICE_ROLE_KEY'

-- Remplacez CRON_SECRET (le même que dans les secrets)
'X-Cron-Secret', 'CRON_SECRET'
```

4. Copiez-collez le script modifié dans l'éditeur SQL
5. Cliquez sur **Run**

✅ **Vérification** : Exécutez cette requête pour vérifier :

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'send-reminder-notifications';
```

Vous devriez voir une ligne avec `active = true` et `schedule = '0 9 * * *'`

---

## Étape 7 : Tester le système

### Test manuel de l'Edge Function

1. Créez un rappel de test dans l'application avec une date dans 7 jours
2. Dans Supabase Dashboard, allez dans **Edge Functions** → **send-reminder-notifications**
3. Cliquez sur **Invoke function**
4. Vérifiez les logs pour voir si l'email a été envoyé

### Test avec curl

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

---

## 🔍 Vérifications finales

### Vérifier que tout fonctionne

1. **pg_cron activé** : Database → Extensions → `pg_cron` = Enabled ✅
2. **Table créée** : SQL Editor → `SELECT * FROM reminder_notifications LIMIT 1;` ✅
3. **Fonction SQL** : SQL Editor → `SELECT * FROM get_reminders_to_notify();` ✅
4. **Edge Function déployée** : Edge Functions → `send-reminder-notifications` = Active ✅
5. **Cron job configuré** : SQL Editor → Vérification du cron job ✅
6. **Secrets configurés** : Settings → Edge Functions → Secrets ✅

---

## 📧 Quand les emails sont envoyés

Les notifications sont envoyées automatiquement :
- **7 jours avant** la date d'échéance
- **1 jour avant** la date d'échéance
- **Le jour J** (jour de l'échéance)

Le cron job s'exécute **tous les jours à 9h00** (heure UTC).

---

## 🛠️ Dépannage

### Les emails ne sont pas envoyés

1. **Vérifier les logs de l'Edge Function** :
   - Edge Functions → send-reminder-notifications → Logs
   - Cherchez les erreurs

2. **Vérifier Resend** :
   - Dashboard Resend → Emails
   - Vérifiez si les emails sont envoyés ou bloqués

3. **Vérifier les rappels** :
   ```sql
   SELECT * FROM reminders 
   WHERE completed = FALSE 
   AND due_date IS NOT NULL
   ORDER BY due_date;
   ```

4. **Tester la fonction SQL** :
   ```sql
   SELECT * FROM get_reminders_to_notify();
   ```

### Le cron job ne s'exécute pas

1. Vérifiez que pg_cron est activé
2. Vérifiez que le cron job est actif :
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-reminder-notifications';
   ```
3. Vérifiez les logs du cron :
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-reminder-notifications')
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

### Erreur "Unauthorized"

- Vérifiez que `CRON_SECRET` dans les secrets correspond à celui dans le script SQL
- Ou supprimez la vérification d'authentification dans l'Edge Function (ligne 13-24)

---

## 🔐 Sécurité

- Ne partagez **jamais** votre `SERVICE_ROLE_KEY`
- Utilisez un `CRON_SECRET` fort et unique
- Limitez l'accès à l'Edge Function (seulement depuis pg_cron)

---

## 📊 Monitoring

Pour voir les notifications envoyées :

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
LIMIT 50;
```

---

## ✅ C'est tout !

Votre système de notifications est maintenant opérationnel. Les emails seront envoyés automatiquement tous les jours à 9h pour les rappels à venir.

Pour modifier l'heure d'exécution, modifiez le schedule dans le cron job :
- `'0 9 * * *'` = Tous les jours à 9h
- `'0 9,18 * * *'` = Tous les jours à 9h et 18h
- `'0 */6 * * *'` = Toutes les 6 heures

