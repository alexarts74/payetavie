# 🔍 Comment trouver votre PROJECT_REF

## 📍 C'est quoi le PROJECT_REF ?

Le **PROJECT_REF** est un **identifiant unique** (ID) de votre projet Supabase. C'est **PAS** le nom de votre projet.

C'est une chaîne de caractères aléatoire qui ressemble à : `abcdefghijklmnop`

## 🎯 Comment le trouver

### Méthode 1 : Dans l'URL de votre projet (le plus simple)

1. Va dans [Supabase Dashboard](https://app.supabase.com)
2. Sélectionne ton projet
3. Regarde l'URL dans la barre d'adresse

L'URL ressemble à ça :
```
https://app.supabase.com/project/abcdefghijklmnop
```

ou

```
https://abcdefghijklmnop.supabase.co
```

**Le PROJECT_REF est la partie `abcdefghijklmnop`** (la chaîne de caractères après `/project/` ou avant `.supabase.co`)

### Méthode 2 : Dans les Settings → API

1. Va dans Supabase Dashboard
2. Clique sur **Settings** (⚙️ en bas à gauche)
3. Clique sur **API** dans le menu
4. Regarde la section **Project URL**

Tu verras quelque chose comme :
```
Project URL
https://abcdefghijklmnop.supabase.co
```

**Le PROJECT_REF est `abcdefghijklmnop`** (la partie avant `.supabase.co`)

### Méthode 3 : Dans Project Settings

1. Va dans Supabase Dashboard
2. Clique sur **Settings** → **General**
3. Regarde la section **Reference ID**

Tu verras directement le PROJECT_REF affiché.

## 📝 Exemple concret

Si ton URL est :
```
https://xyzabc123456789.supabase.co
```

Alors ton PROJECT_REF est : `xyzabc123456789`

## ✅ Vérification

Une fois que tu as ton PROJECT_REF, tu peux l'utiliser comme ça :

```bash
supabase link --project-ref xyzabc123456789
```

ou dans le script SQL du cron job :
```sql
url := 'https://xyzabc123456789.supabase.co/functions/v1/send-reminder-notifications'
```

## 💡 Astuce

Le PROJECT_REF est toujours :
- Une chaîne de caractères aléatoire
- Environ 20 caractères
- Contient des lettres minuscules et des chiffres
- C'est **unique** pour chaque projet

