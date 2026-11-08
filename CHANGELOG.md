# Changelog — PayeTaVie

Historique des features implémentées, par ordre antichronologique.

---

## 2026-11-08 — Sprint 1 parité mobile — CRUD topics, dépenses, auth

### Mobile — Auth
- Écran "Mot de passe oublié" (`app/(auth)/forgot-password.tsx`) : envoi d'un email de réinitialisation via `supabase.auth.resetPasswordForEmail()`
- Lien "Mot de passe oublié ?" ajouté sur l'écran de connexion

### Mobile — Topics `[slug].tsx` (réécriture complète)
- **Checklist** : affichage de la checklist par topic (items depuis `@payetavie/shared`), barre de progression, toggle persisté dans `checklist_progress`
- **Rappels CRUD** : créer (modal), modifier (long press → modal pré-rempli), supprimer (bouton ×), avec champs titre / description / date / récurrence (aucune, mensuelle, annuelle)
- **Favoris CRUD** : lister, ajouter (modal nom + URL), supprimer
- Pull-to-refresh sur toutes les sections

### Mobile — Dépenses `index.tsx` (CRUD)
- Créer une dépense : modal avec titre, montant, date, catégorie (picker horizontal), notes
- Modifier une dépense : tap sur un item ouvre le modal pré-rempli
- Supprimer une dépense : long-press → Alert, ou bouton "Supprimer" dans le modal d'édition
- Total du mois mis à jour optimistement après chaque mutation

### Shared — `@payetavie/shared`
- Ajout de `getTopicChecklist(slug: string): string[]` dans `topic-utils.ts` : retourne les items de checklist pour chaque topic (impots, urssaf, fiches-de-paie, caf, assurances, mutuelle, medecin-generaliste, pharmacie, analyses-medicales, logement)

---

## 2026-11-07 — Monorepo Turborepo + App Mobile Expo React Native

### Migration vers un monorepo Turborepo

**Structure :**
- `apps/web/` — Next.js déplacé depuis la racine
- `apps/mobile/` — Expo React Native (nouveau)
- `packages/shared/` — `@payetavie/shared` : types + utilitaires partagés
- `packages/supabase/` — `@payetavie/supabase` : factory client Supabase
- `turbo.json` — pipelines build/dev/lint
- `package.json` racine — npm workspaces root

**App mobile (`apps/mobile`) :**
- Expo SDK 52, Expo Router 4 (file-based routing)
- React Native 0.76 avec New Architecture
- NativeWind v4 (Tailwind CSS v3 syntax)
- Auth via `@supabase/supabase-js` + `expo-secure-store`
- Toutes les routes implémentées avec parité fonctionnelle :
  - `(auth)/login`, `(auth)/register`
  - `(protected)/dashboard`, `profile`, `pricing`
  - `(protected)/topics/index`, `topics/[slug]`
  - `(protected)/depenses/index`, `budgets`, `recurrents`
  - `(protected)/freelance/clients/index`, `clients/[id]`
  - `(protected)/freelance/facturation/index`
  - `factures/index`, `factures/[id]`, `factures/nouvelle`
  - `devis/index`, `devis/[id]`, `devis/nouveau`
- Plan checks pro via `src/lib/subscription.ts`
- PDF via `expo-web-browser` → API web
- Stripe Checkout via `expo-web-browser`
- EAS Build configuré (`eas.json`)

---

## 2026-11-07

### Dashboard facturation — Stats par client

**Fichiers modifiés :**
- `src/types/index.ts` — ajout interface `ClientRevenueStat`
- `src/app/actions/invoices.ts` — ajout `getClientRevenueStats(year)`
- `src/app/freelance/facturation/page.tsx` — ajout dans le `Promise.all`, prop `clientStats`
- `src/components/FacturationDashboard.tsx` — section "Top clients {year}" + composant `TopClientsChart`

**Description :**
Section "Top clients" dans le dashboard facturation, affichée après le graphique mensuel.
- Liste les 5 clients avec le plus gros CA encaissé sur l'année
- Avatar initiales (fond indigo/purple), barre de progression proportionnelle au max CA
- Montant encaissé en gras + montant en attente en bleu si > 0
- Lien vers `/freelance/clients/{id}`
- Section masquée si aucun client avec CA ou montant en attente

---

### Dashboard facturation — Graphique CA mensuel

**Fichiers modifiés :**
- `src/types/index.ts` — ajout interface `MonthlyRevenueStat`
- `src/app/actions/invoices.ts` — ajout `getMonthlyRevenueStats(year)`
- `src/app/freelance/facturation/page.tsx` — ajout dans le `Promise.all`, prop `monthlyStats`
- `src/components/FacturationDashboard.tsx` — section "CA mensuel {year}" + composant `MonthlyRevenueChart`

**Description :**
Graphique à barres SVG natif dans le dashboard facturation, entre les stat cards et les listes récentes.
- 12 barres (Jan–Déc), hauteur proportionnelle au max CA encaissé
- Barres indigo pour le CA encaissé (`payee`), barres bleu clair pour l'en attente (`envoyee`)
- Section masquée si toutes les valeurs sont à 0

---

### Export CSV comptable des factures

**Fichiers modifiés :**
- `src/app/actions/invoices.ts` — ajout `exportInvoicesCsv(year, filters)`
- `src/components/` — bouton export dans la liste des factures

**Description :**
Export CSV des factures avec colonnes : Numéro, Date, Échéance, Client, Statut, Montant HT, Taux TVA, Montant TVA, Total TTC, Notes. Filtrable par année, statut et client.
