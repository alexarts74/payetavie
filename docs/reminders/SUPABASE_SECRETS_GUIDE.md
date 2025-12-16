# 🔐 Guide : Configurer les Secrets dans Supabase

## 📍 Où configurer

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️ en bas à gauche)
4. Cliquez sur **Edge Functions** dans le menu de gauche
5. Cliquez sur l'onglet **Secrets**

## ✅ Configuration correcte

### Secret 1 : RESEND_API_KEY

```
Nom: RESEND_API_KEY
Valeur: re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3
```

**⚠️ Ne mettez PAS les backticks !** Juste la clé directement.

### Secret 2 : APP_URL

```
Nom: APP_URL
Valeur: http://localhost:3000
```

Pour la production, changez en : `https://votre-domaine.com`

### Secret 3 : RESEND_FROM_EMAIL (optionnel)

```
Nom: RESEND_FROM_EMAIL
Valeur: onboarding@resend.dev
```

Si vous ne mettez pas ce secret, l'Edge Function utilisera `onboarding@resend.dev` par défaut.

### Secret 4 : CRON_SECRET (optionnel)

```
Nom: CRON_SECRET
Valeur: [générez un secret aléatoire]
```

Pour générer un secret :
```bash
# Mac/Linux
openssl rand -hex 32

# Ou utilisez un générateur en ligne
```

## 🎯 Résumé pour votre cas

Dans Supabase Edge Functions → Secrets, ajoutez :

1. **RESEND_API_KEY** = `re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3`
2. **APP_URL** = `http://localhost:3000`
3. **RESEND_FROM_EMAIL** = `onboarding@resend.dev` (optionnel)

## ❌ Erreurs courantes

### ❌ FAUX
```
RESEND_API_KEY = `re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3`
```
(avec les backticks)

### ✅ CORRECT
```
RESEND_API_KEY = re_4gRKVfRK_KGPeGavv3bLwJgbeHmJfpyc3
```
(sans les backticks)

## 🔍 Vérifier que c'est bien configuré

1. Les secrets doivent apparaître dans la liste
2. Le nom doit être exactement : `RESEND_API_KEY`, `APP_URL`, etc. (sensible à la casse)
3. La valeur ne doit pas avoir d'espaces avant/après

## 🧪 Tester

Une fois les secrets configurés, testez l'Edge Function :

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

Si ça fonctionne, vous verrez dans les logs que l'email a été envoyé.

