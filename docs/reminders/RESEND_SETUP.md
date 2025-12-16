# 📧 Configuration Resend - Guide Rapide

## 🚀 Pour le développement local (sans DNS)

**Vous n'avez PAS besoin de configurer de DNS !**

Resend fournit un domaine par défaut pour tester : `onboarding.resend.dev`

### Étapes rapides :

1. **Créer un compte Resend**
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte (gratuit)
   - Vérifiez votre email

2. **Générer une API Key**
   - Dashboard → **API Keys** → **Create API Key**
   - Donnez-lui un nom (ex: "PayeTaVie Dev")
   - **Copiez la clé** (vous ne pourrez plus la voir après)

3. **Configurer dans Supabase**
   - Supabase Dashboard → **Settings** → **Edge Functions** → **Secrets**
   - Ajoutez : `RESEND_API_KEY` = votre clé Resend
   - (Optionnel) Ajoutez : `RESEND_FROM_EMAIL` = `onboarding@resend.dev`

4. **C'est tout !** ✅

Les emails partiront automatiquement de `onboarding@resend.dev`.

### ⚠️ Limitations du domaine par défaut

- **Limite** : 100 emails/jour
- **Délivrabilité** : Les emails peuvent aller en spam
- **Domaine** : Toujours `onboarding.resend.dev` (pas personnalisable)

**Mais c'est parfait pour le développement et les tests !**

---

## 🌐 Pour la production (avec votre propre domaine)

Quand vous serez prêt pour la production :

### 1. Ajouter votre domaine dans Resend

1. Resend Dashboard → **Domains** → **Add Domain**
2. Entrez votre domaine (ex: `payetavie.fr`)
3. Resend vous donnera des enregistrements DNS à ajouter

### 2. Configurer les DNS

Dans votre registrar (ex: OVH, Gandi, Cloudflare) :

**Ajoutez ces enregistrements DNS** :

```
Type: TXT
Name: @ (ou votre-domaine.com)
Value: [la valeur fournie par Resend pour la vérification]

Type: MX
Name: @ (ou votre-domaine.com)
Priority: 10
Value: feedback-smtp.resend.com

Type: TXT
Name: _resend
Value: [la valeur fournie par Resend]
```

### 3. Vérifier le domaine

1. Dans Resend Dashboard, cliquez sur **Verify**
2. Attendez quelques minutes (peut prendre jusqu'à 48h)
3. Une fois vérifié ✅, vous pouvez utiliser : `notifications@votre-domaine.com`

### 4. Mettre à jour les secrets

Dans Supabase, mettez à jour :
- `RESEND_FROM_EMAIL` = `notifications@votre-domaine.com`

---

## 📊 Comparaison

| | Domaine par défaut | Domaine personnalisé |
|---|---|---|
| **Configuration DNS** | ❌ Pas besoin | ✅ Requis |
| **Limite emails/jour** | 100 | Illimité (selon plan) |
| **Délivrabilité** | ⚠️ Peut aller en spam | ✅ Meilleure |
| **Personnalisation** | ❌ Non | ✅ Oui |
| **Idéal pour** | Dev/Test | Production |

---

## 🧪 Tester l'envoi d'email

### Via l'interface Resend

1. Resend Dashboard → **Emails** → **Send Test Email**
2. Entrez votre email
3. Cliquez sur **Send**

### Via l'Edge Function

Une fois déployée, testez avec :

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-notifications' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

Vérifiez dans Resend Dashboard → **Emails** que l'email a bien été envoyé.

---

## 💡 Astuce

Pour le développement local, vous pouvez aussi utiliser **Inbucket** (inclus avec Supabase local) pour capturer les emails sans les envoyer vraiment. Mais Resend avec le domaine par défaut est plus simple pour tester le flux complet.

---

## ❓ FAQ

**Q: Puis-je utiliser le domaine par défaut en production ?**
R: Techniquement oui, mais ce n'est pas recommandé. Les emails risquent d'aller en spam et la limite de 100/jour est restrictive.

**Q: Combien ça coûte d'ajouter un domaine ?**
R: C'est gratuit ! Seuls les emails envoyés sont facturés (gratuit jusqu'à 3000/mois).

**Q: Les DNS sont compliqués, je peux rester sur le domaine par défaut ?**
R: Oui, pour le développement c'est parfait. Pour la production, c'est mieux d'avoir votre propre domaine pour la crédibilité et la délivrabilité.

