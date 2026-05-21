# État du projet — PayeTaVie

> Dernière mise à jour : 2026-05-21

---

## Vue d'ensemble

PayeTaVie est un assistant administratif personnel en français. L'app aide les utilisateurs à gérer leur vie admin (impôts, assurances, santé, logement, etc.) + un module freelance (facturation, devis, clients) réservé au plan Pro.

**Stack :** Next.js 16 App Router · React 19 · Supabase (DB + Auth + Storage) · Tailwind CSS 4 · Stripe · shadcn/ui

---

## Plans & tarifs

| Plan | Prix | Limites |
|------|------|---------|
| Gratuit | 0€ | 3 topics, 5 docs, 10 rappels, 5 bookmarks/topic |
| Essentiel | 4,99€/mois | Illimité (tout sauf freelance) |
| Pro | 9,99€/mois | Illimité + module freelance |

---

## Statuts des features

### CORE — Authentification

| Feature | Statut | Notes |
|---------|--------|-------|
| Inscription email/password | DONE | `/auth/register` |
| Connexion | DONE | `/auth/login` |
| Déconnexion | DONE | Server Action `auth.ts` |
| Middleware de protection des routes | DONE | `src/middleware.ts` |
| Redirect si déjà connecté (landing/login/register) | DONE | |
| Messages d'erreur traduits en français | DONE | `src/lib/auth-errors.ts` |

---

### LANDING PAGE

| Feature | Statut | Notes |
|---------|--------|-------|
| Page publique `/` | DONE | Hero, features, topics, pricing, CTA, footer |
| Navbar sticky avec smooth scroll | DONE | `LandingNavbar.tsx` |
| Force light mode sur la landing | DONE | `ForceLightMode.tsx` — ajout récent |
| Section tarifs sur la landing | DONE | Affiche les 3 plans |
| Responsive mobile | DONE | Menu hamburger |

---

### TOPICS — Thématiques admin

| Topic | Page | Checklist | FAQ | Rappels prédéfinis | Statut |
|-------|------|-----------|-----|--------------------|--------|
| Impôts | DONE | DONE | DONE | DONE | DONE |
| URSSAF | DONE | DONE | DONE | DONE | DONE |
| Fiches de paie | DONE | DONE | DONE | DONE | DONE |
| CAF | DONE | DONE | DONE | DONE | DONE |
| Assurances | DONE | DONE | DONE | DONE | DONE |
| Mutuelle | DONE | DONE | DONE | DONE | DONE |
| Médecin généraliste | DONE | DONE | DONE | DONE | DONE |
| Pharmacie | DONE | DONE | DONE | DONE | DONE |
| Analyses médicales | DONE | DONE | DONE | DONE | DONE |
| Logement | DONE | DONE | DONE | DONE | DONE |

**Chaque page topic contient :**
- TL;DR résumé
- Checklist interactive avec barre de progression (optimistic updates)
- FAQ modale (bouton flottant)
- Rappels prédéfinis suggérés
- Upload/gestion de documents
- Gestion de bookmarks

---

### NAVIGATION & SÉLECTION DE TOPICS

| Feature | Statut | Notes |
|---------|--------|-------|
| Sidebar fixe desktop avec catégories collapsibles | DONE | `TopicsShell.tsx` |
| Menu hamburger mobile | DONE | |
| Sélection/désélection de topics (`ManageTopicsModal`) | DONE | Sauvegardé en DB |
| Filtrage nav par plan et topics sélectionnés | DONE | `NavLinks.tsx` |
| Catégorie Freelance visible uniquement pour Pro | DONE | |

---

### DASHBOARD

| Feature | Statut | Notes |
|---------|--------|-------|
| Stat cards (rappels, docs, bookmarks, complétion) | DONE | |
| Vue calendrier mensuelle | DONE | `CalendarView.tsx` |
| Rappels urgents / à venir | DONE | Top 10 |
| Documents récents / expirant bientôt | DONE | Top 10 |
| Liens d'action rapide | DONE | |

---

### RAPPELS

| Feature | Statut | Notes |
|---------|--------|-------|
| Créer / modifier / supprimer un rappel | DONE | `reminders.ts` |
| Marquer comme complété | DONE | |
| Rappels prédéfinis par topic | DONE | `predefined-reminders.ts` |
| Limite plan free (10 rappels) | DONE | `checkResourceLimit()` |
| Notifications email via cron | DONE | Edge Function + Resend API |
| Vérification `CRON_SECRET` sur l'edge function | DONE | |

---

### DOCUMENTS

| Feature | Statut | Notes |
|---------|--------|-------|
| Upload fichier (Supabase Storage) | DONE | Bucket "Documents" |
| Suppression fichier | DONE | |
| URL signée (60 min) pour téléchargement | DONE | |
| Métadonnées (nom employeur, type, date expiration) | DONE | |
| Documents expirant bientôt visibles sur dashboard | DONE | |
| Limite plan free (5 documents) | DONE | |

---

### BOOKMARKS

| Feature | Statut | Notes |
|---------|--------|-------|
| Ajouter / supprimer un bookmark par topic | DONE | |
| Détection des doublons URL | DONE | |
| Annuaire global de ressources officielles | DONE | `AnnuaireGlobal.tsx` |
| Limite plan free (5 bookmarks/topic) | DONE | |

---

### CALENDRIER

| Feature | Statut | Notes |
|---------|--------|-------|
| Vue calendrier mensuelle | DONE | Orange=rappel, Violet=doc expirant, Rouge=en retard |
| Export iCal (`/api/calendar`) | DONE | Plan Essentiel+ |
| Token de calendrier personnel | DONE | `calendar-tokens.ts` |
| Export manuel `.ics` | DONE | `calendar-export.ts` |

---

### DEPENSES

| Feature | Statut | Notes |
|---------|--------|-------|
| Liste dépenses par mois | DONE | Plan Essentiel+ |
| Ajouter / modifier / supprimer une dépense | DONE | |
| Catégories de dépenses avec icône et couleur | DONE | |
| Budget mensuel par catégorie | DONE | |
| Budget global mensuel | DONE | |
| Graphiques (camembert, barres) | DONE | `ExpenseCharts.tsx` |
| Barre de progression budget | DONE | `BudgetProgressSection.tsx` |
| Dépenses récurrentes (hebdo/mensuel/trimestriel/annuel) | DONE | `recurring-expenses.ts` |
| Page `/depenses/budgets` | DONE | |
| Page `/depenses/recurrents` | DONE | |

---

### MODULE FREELANCE (plan Pro)

#### Clients

| Feature | Statut | Notes |
|---------|--------|-------|
| Liste clients avec recherche | DONE | |
| Créer / modifier / supprimer un client | DONE | |
| Toggle actif / inactif | DONE | |
| Fiche client détaillée avec historique factures/devis | DONE | `ClientDetailContent.tsx` |
| Champs : raison sociale, email, SIRET, adresse, délai paiement | DONE | |

#### Facturation — Factures

| Feature | Statut | Notes |
|---------|--------|-------|
| Liste factures avec filtres (statut, client, année) | DONE | |
| Créer une facture | DONE | |
| Modifier une facture (brouillon seulement) | DONE | |
| Supprimer une facture (brouillon seulement) | DONE | |
| Éditeur de lignes (`LineItemsEditor`) | DONE | |
| Numérotation automatique (RPC Supabase) | DONE | |
| Machine à états : brouillon → envoyée → payée/en retard/annulée | DONE | |
| Duplication d'une facture | DONE | |
| Génération PDF | DONE | `/api/freelance/invoices/[id]/pdf` |
| Aperçu PDF dans le navigateur | DONE | `InvoicePreview.tsx` |
| Mention légale TVA micro-entrepreneur | DONE | |

#### Facturation — Devis

| Feature | Statut | Notes |
|---------|--------|-------|
| Liste devis | DONE | |
| Créer un devis | DONE | |
| Modifier un devis (brouillon seulement) | DONE | |
| Supprimer un devis (brouillon seulement) | DONE | |
| Machine à états : brouillon → envoyé → accepté → facturé / refusé | DONE | |
| Conversion devis → facture | DONE | Lien via `source_document_id` |
| Génération PDF | DONE | `/api/freelance/quotations/[id]/pdf` |

#### Profil professionnel

| Feature | Statut | Notes |
|---------|--------|-------|
| Upsert profil pro (SIRET, IBAN, BIC, préfixes) | DONE | `professional-profile.ts` |
| Upload logo | DONE | Supabase Storage |
| Flag micro-entrepreneur (mention TVA auto) | DONE | |
| Dashboard facturation (stats CA) | DONE | `FacturationDashboard.tsx` |

---

### ABONNEMENTS — Stripe

| Feature | Statut | Notes |
|---------|--------|-------|
| Checkout Stripe (upgrade vers Essentiel ou Pro) | DONE | |
| Portal client Stripe (gérer / résilier) | DONE | |
| Webhook Stripe (lifecycle abonnement) | DONE | `/api/webhooks/stripe` |
| Vérification du plan en Server Actions | DONE | `requirePlan()` |
| Limites plan free enforced | DONE | `checkResourceLimit()` |
| `UpgradePrompt` sur features bloquées | DONE | |
| Page `/pricing` | DONE | `PricingCards.tsx` |

---

### PROFIL UTILISATEUR

| Feature | Statut | Notes |
|---------|--------|-------|
| Modifier son profil | DONE | `profile.ts` |
| Préférences (topics sélectionnés, onboarding) | DONE | `preferences.ts` |
| Onboarding (sélection initiale de topics) | DONE | |
| Thème clair / sombre / système | DONE | `ThemeProvider.tsx` + `FloatingThemeToggle` |

---

## Infrastructure

| Élément | Statut | Notes |
|---------|--------|-------|
| RLS Supabase sur toutes les tables | DONE | Isolation par `user_id` |
| Triggers `updated_at` auto | DONE | |
| Edge Function cron rappels emails | DONE | Supabase Functions + Resend |
| Migrations versionnées | DONE | `migrations/` (`000_` → `009_`) |
| `revalidatePath` après chaque mutation | DONE | |
| TypeScript strict mode | DONE | |
| ESLint configuré | DONE | |

---

## Ce qui manque / pistes d'amélioration

| Idée | Priorité | Notes |
|------|----------|-------|
| Tests unitaires / integration | - | Aucun test configuré pour l'instant |
| Mentions légales / CGU / politique de confidentialité | MEDIUM | Pages légales absentes |
| Mot de passe oublié / reset password | MEDIUM | Flow non visible dans le code |
| OAuth (Google, etc.) | LOW | Non implémenté |
| Notifications push (web) | LOW | Seulement email pour l'instant |
| Topics supplémentaires (retraite, véhicule...) | LOW | 10 topics actuellement |
| Recherche globale cross-topics | LOW | |
| Import de données (CSV dépenses...) | LOW | |
| Mode hors-ligne / PWA | LOW | |
| Internationalisation (EN) | LOW | Tout en FR uniquement |

---

## Derniers changements notables (git récent)

- **Landing page** refaite avec `LandingNavbar` + `ForceLightMode` (forçage light mode sur `/`)
- **Fix `revalidatePath`** dans `toggleClientActive` : chemin corrigé `/clients/${id}` → `/freelance/clients/${id}`
- **Fix `requirePlan('pro')`** ajouté sur `getClient`, `getClientInvoices`, `getClientQuotations`
- **globals.css** retouché (variables CSS dark/light mode)
- Fichiers `supabase/.temp/*` mis à jour (versions gotrue/storage)
