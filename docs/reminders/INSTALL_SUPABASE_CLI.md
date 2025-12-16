# 📦 Installation Supabase CLI

## ⚠️ Erreur courante

Si tu vois cette erreur :
```
Installing Supabase CLI as a global module is not supported.
```

C'est normal ! Supabase CLI ne peut plus être installé via `npm install -g`.

## ✅ Solution : Installation via Homebrew (macOS)

### Étape 1 : Vérifier que Homebrew est installé

```bash
brew --version
```

Si ça ne fonctionne pas, installe Homebrew :
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Étape 2 : Installer Supabase CLI

```bash
brew install supabase/tap/supabase
```

### Étape 3 : Vérifier l'installation

```bash
supabase --version
```

Tu devrais voir quelque chose comme : `supabase version 1.x.x`

## 🔄 Alternative : Installation locale (sans Homebrew)

Si tu ne veux pas utiliser Homebrew, tu peux installer Supabase CLI localement dans ton projet :

```bash
# Dans le dossier de ton projet
npm install supabase --save-dev
```

Puis utilise `npx` pour les commandes :
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-reminder-notifications
```

## 🚀 Une fois installé

Tu peux maintenant suivre le guide de déploiement normalement :

```bash
# 1. Se connecter
supabase login

# 2. Lier ton projet
supabase link --project-ref YOUR_PROJECT_REF

# 3. Déployer
supabase functions deploy send-reminder-notifications
```

## 📝 Trouver ton PROJECT_REF

1. Va dans Supabase Dashboard
2. Settings → API
3. L'URL est : `https://YOUR_PROJECT_REF.supabase.co`
4. Le PROJECT_REF est la partie avant `.supabase.co`

Exemple : Si l'URL est `https://abcdefghijklmnop.supabase.co`, alors `abcdefghijklmnop` est ton PROJECT_REF.

