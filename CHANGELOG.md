# Changelog — PayeTaVie

Historique des features implémentées, par ordre antichronologique.

---

## 2026-11-09 — Stripe mobile : refresh + portail client

- `apps/web/src/app/api/stripe/portal/route.ts` (nouveau) : endpoint GET `GET /api/stripe/portal?token=<access_token>` — valide le JWT Supabase, récupère le `stripe_customer_id` via service role, crée une session portail Stripe et redirige
- `apps/mobile/app/(protected)/pricing.tsx` : refresh automatique de l'abonnement après fermeture du browser (`openBrowserAsync` await + `getUserSubscription()`) — alert "Bienvenue sur le plan X" si plan changé
- `apps/mobile/app/(protected)/pricing.tsx` : bouton "Gérer mon abonnement" (visible si `plan !== 'free' && isActive`) — ouvre le portail via l'endpoint web + refresh plan au retour
- `apps/mobile/app/(protected)/profile.tsx` : `useFocusEffect` pour re-fetch le plan à chaque activation d'écran — plan toujours à jour quand on revient depuis pricing

---

## 2026-11-09 — UX Premium : loaders, spinners, skeletons

- `nextjs-toploader` : barre de progression verte (#235037) en haut d'écran sur toutes les navigations Next.js
- `components/ui/Button.tsx` : nouveau composant `Button` avec `loading` prop (Loader2 animate-spin), variants `primary/secondary/ghost/danger`, sizes `sm/md/lg`
- `ProfilePageContent` : boutons "Passer à Essentiel/Pro" avec état `checkoutLoading` — spinner inline, `disabled` pendant l'appel, pas de reset si redirect Stripe
- `PricingCards` : spinner Loader2 sur le CTA au lieu du texte "Redirection..."
- `dashboard/loading.tsx` : squelette animé (4 stat cards + 2 colonnes + bottom row)
- `profile/loading.tsx` : squelette header + 4 sections
- `freelance/clients/loading.tsx` : squelette header + 6 cards
- `freelance/facturation/factures/loading.tsx` : squelette 4 stats + liste
- `GlobalSearch` : `useTransition` sur `navigate()` — Loader2 remplace l'icône Search pendant la navigation
- `ClientsPageContent` : spinner Loader2 sur la card client cliquée (remplace ChevronRight)
- `RemindersSection` : bouton "Ajouter" migré vers `<Button loading={addingReminder}>`
- `depenses/loading.tsx` : squelette header + 4 stat cards + table
- `topics/[slug]/loading.tsx` : squelette header + checklist + 2 colonnes + bookmarks

---

## 2026-11-09 — Fix Stripe : bouton portail + webhooks cancel_at

- Bouton "Gérer mon abonnement" : async avec loading state + affichage erreur Stripe
- `createPortalSession` : redirect `/pricing` si pas de customer, try/catch sur appel Stripe
- Webhook `customer.subscription.updated` : détecte `cancel_at !== null` pour "Annulation programmée" (Stripe Customer Portal utilise `cancel_at` pas `cancel_at_period_end`)
- DB : colonne `stripe_customer_id` rendue nullable (migration)
- Note dev : `stripe listen --forward-to http://127.0.0.1:3000/api/webhooks/stripe` sur macOS

---

## 2026-11-09 — Redesign web — identité visuelle nature (parité mobile)

Refonte visuelle complète du web pour adopter exactement la même identité que l'app mobile. Suppression totale du glass morphism, du dark mode et de la palette indigo/violet/purple. ~40 fichiers modifiés en 8 phases.

**Design system** : fond `#F5E9AF` (jaune), primary `#235037` (vert), accent `#EBA7CB` (rose), cartes blanches plates. Typographie Caprasimo (titres) + Jost (corps). Zéro glass morphism, zéro dark mode.

**Phases** : globals.css + layout.tsx → TopicsShell + NavLinks → auth x4 → composants partagés x11 → pages protégées → module freelance x17 → landing + légales + error/404 + PDFs → cleanup final (0 occurrences de `glass-`/`dark:`/`indigo`/`violet`/`purple` dans les .tsx).

---

## 2026-11-08 — Onboarding mobile (wizard 4 étapes)

### Mobile — Wizard d'onboarding (`app/onboarding.tsx`)

Wizard d'onboarding 4 étapes pour les nouveaux utilisateurs mobiles, avec design system 60/30/10 (Caprasimo/Jost, palette `#F5E9AF`/`#235037`/`#EBA7CB`).

- **Step 0 — Bienvenue** : présentation des 3 features clés (guides, documents, rappels) avec cartes illustrées
- **Step 1 — Profil** : sélection parmi 5 profils (Étudiant, Salarié, Indépendant, En recherche, Autre) + infos optionnelles collapsibles (date de naissance, code postal). Bouton "Passer" disponible
- **Step 2 — Topics** : topics du profil pré-sélectionnés (non décochez), topics additionnels toggleables par catégorie (Travail / Santé / Logement / Freelance)
- **Step 3 — Résumé** : récap profil + sujets sélectionnés + bouton "Lancer mon espace"
- Barre de progression en dots animés (4 points, actif vert foncé)
- `completeOnboarding()` : upsert `user_preferences` (profile_type, selected_topics, onboarding_completed: true, birth_date, postal_code)
- `skipOnboarding()` : profile `autre`, tous les slugs, onboarding_completed: true

### Mobile — Guard onboarding dans `(protected)/_layout.tsx`

Après vérification de session, query `user_preferences.onboarding_completed` :
- Si absent ou `false` → `router.replace('/onboarding')`
- État `checkingOnboarding` pour éviter le flash de contenu protégé
- Reconnexion d'un utilisateur déjà onboardé → pas de re-onboarding

---

## 2026-11-08 — Parité web ↔ mobile : reset password, annuaire, profil pro

### Mobile — Reset password (deep link)

Complétion du flow mot de passe oublié : écran `(auth)/reset-password.tsx` gérant le deep link Supabase PKCE (`payetavie://reset-password?code=...`).

- Échange du code PKCE via `supabase.auth.exchangeCodeForSession(code)` (extrait de `useLocalSearchParams`)
- États : chargement → erreur si lien invalide/expiré → formulaire nouveau mot de passe
- Validation (min 6 caractères, confirmation), appel `supabase.auth.updateUser({ password })`
- Déconnexion + redirection vers login après succès
- `forgot-password.tsx` mis à jour : ajout de `redirectTo: 'payetavie://reset-password'` dans `resetPasswordForEmail`

### Web — Page `/annuaire`

Nouvelle page dédiée à l'annuaire des administrations, accessible aux plans Essentiel et Pro.

- `apps/web/src/app/annuaire/layout.tsx` : layout avec vérification plan Essentiel + TopicsShell
- `apps/web/src/app/annuaire/page.tsx` : page serveur, récupère le code postal depuis les préférences
- Réutilise le composant `AnnuaireGlobal` existant
- Lien "Annuaire" ajouté dans la sidebar (`NavLinks`) pour les plans Essentiel+

### Web — Page `/freelance/profil`

Nouvelle page standalone pour le profil professionnel (précédemment uniquement accessible dans `/profile`).

- `apps/web/src/app/freelance/profil/page.tsx` : page serveur dans le layout freelance (Pro requis)
- `apps/web/src/components/ProfilProfessionnelContent.tsx` : composant client avec formulaire complet (infos générales, adresse, IBAN/BIC, préfixes facturation, taux horaire)
- Lien "Profil pro" ajouté dans la section Freelance de la sidebar

---

## 2026-11-08 — Typographie Caprasimo/Jost + Application règle 60/30/10 (mobile)

### Mobile — Refonte typographique

Remplacement de DMSans par un duo de polices Google Fonts plus expressif :

| Ancienne | Nouvelle | Usage |
|----------|----------|-------|
| `DMSans_700Bold` | `Caprasimo_400Regular` | Titres de page, valeurs stat, montants |
| `DMSans_500Medium` | `Jost_500Medium` | Labels, section headers, badges, boutons |
| `DMSans_400Regular` | `Jost_300Light` | Corps de texte, sous-titres, descriptions |
| `DMSans_600SemiBold` | `Jost_500Medium` | Badges, texte CTA |

**Packages installés :** `@expo-google-fonts/caprasimo`, `@expo-google-fonts/jost`

**Fichiers modifiés :** `_layout.tsx`, `(protected)/_layout.tsx`, `dashboard.tsx`, `depenses/index.tsx`, `topics/index.tsx`, `profile.tsx`

### Mobile — Application règle 60/30/10 (rose visible)

Le rose `#EBA7CB` (10% accent) est maintenant utilisé aux bons endroits :

- **Chips actifs** (catégories annuaire, fréquence dépenses récurrentes, récurrence rappels) : `bg-violet-600` → `bg-[#EBA7CB]`, texte `text-white` → `text-[#235037]`
- **Icônes "Favoris" et "Rappels complétés"** (stat cards dashboard) : fond `#EEF7F1` → `#FDEEF6`
- **Badge budget normal** (ni dépassé ni >80%) : fond `#EEF7F1` → `#FDEEF6`, couleur texte `#235037` → `#B05080`
- **CTA "Créer un rappel"** (empty state) : fond `#235037` → `#EBA7CB`, texte `#FFFFFF` → `#235037`
- **Icônes "Actions rapides"** et section icon : fond `#EEF7F1` → `#FDEEF6`

**Tokens ajoutés dans `tailwind.config.js` :** `accent: '#EBA7CB'`, `accent-light: '#FDEEF6'`

**Fichiers modifiés :** `tailwind.config.js`, `dashboard.tsx`, `annuaire.tsx`, `depenses/recurrents.tsx`, `topics/[slug].tsx`

---

## 2026-11-08 — Redesign palette mobile : Jaune · Rose · Vert

### Mobile — Nouvelle identité visuelle

Remplacement complet de la palette violette par une palette nature/warm à 3 couleurs sur toute l'app mobile.

**Tokens de couleur :**
- Fond de page : `#F3F3F1` (gris) → **`#F5E9AF`** (jaune pâle)
- Couleur primaire (CTA, icônes, boutons) : `#7C3AED` (violet) → **`#235037`** (vert foncé)
- Icon background (violet-50) : `#F5F3FF` → **`#EEF7F1`** (vert très clair)
- Accent sur fond foncé (violet-200/C4B5FD) : → **`#EBA7CB`** (rose)
- État désactivé (violet-400) : → **`#5E8A71`** (vert moyen)
- Tab bar background : → **`#1A2F21`** (vert très foncé)
- Muted text : → **`#5A6B61`** (gris-vert)

**Stratégie :** override du scale `violet` dans `tailwind.config.js` → tous les `bg-violet-*`, `text-violet-*` existants sont mis à jour automatiquement sans toucher aux TSX.

**Corrections bonus :**
- `annuaire.tsx` : bug `border-blue-600` → `border-violet-600` sur le chip actif
- `forgot-password.tsx` : bouton CTA `bg-blue-600` → `bg-violet-600` (désormais vert)

**Fichiers modifiés :**
`tailwind.config.js`, `_layout.tsx`, `dashboard.tsx`, `annuaire.tsx`, `forgot-password.tsx`, `pricing.tsx`, `profile.tsx`, `calendar.tsx`, `topics/index.tsx`, `topics/[slug].tsx`, `depenses/index.tsx`, `depenses/budgets.tsx`, `depenses/recurrents.tsx`, `freelance/**/*.tsx`

---

## 2026-11-08 — Remplacement des emojis UI par Ionicons (mobile)

### Mobile — Icônes UI remplacées dans 11 écrans

Tous les emojis utilisés comme chrome UI (hors données : emojis de catégories, topics, `getTopicIcon()`) remplacés par `Ionicons` de `@expo/vector-icons` pour un rendu cohérent et professionnel.

**Mappings appliqués :**
- `📂` → `folder-open-outline` (topics empty state)
- `🔒` → `lock-closed-outline` dans un cercle `bg-violet-50` (clients, facturation, profil pro, annuaire)
- `🔗` → `link-outline` (bookmark icon, topics/[slug])
- `📄` → `document-text-outline` (document icon + modal preview, topics/[slug])
- `📊` → `bar-chart-outline` (raccourci budgets, dépenses)
- `🔄` → `sync-outline` (raccourci récurrents, dépenses)
- `👥` → `people-outline` (avatar client, clients/[id])
- `🧾` → `receipt-outline` (factures nav + écran nouvelle)
- `📋` → `document-outline` / `document-text-outline` (devis nav + écran nouveau)
- `🏢` → `business-outline` (profil pro header + nav facturation)
- `›` text → `chevron-forward` (topics/index, facturation/index nav items)

**Fichiers modifiés :**
`topics/index.tsx`, `topics/[slug].tsx`, `depenses/index.tsx`, `freelance/clients/index.tsx`, `freelance/clients/[id].tsx`, `freelance/facturation/index.tsx`, `freelance/profil.tsx`, `annuaire.tsx`, `factures/nouvelle.tsx`, `devis/nouveau.tsx`

---

## 2026-11-08 — Harmonisation design system mobile (tous les écrans)

### Mobile — 16 écrans harmonisés sur le design system du dashboard

**Tokens appliqués globalement :**
- Fond : `bg-gray-50` → `bg-[#F3F3F1]` sur tous les écrans
- Couleur primaire : `bg-blue-600`/`bg-indigo-600` → `bg-violet-600` (boutons, accents)
- Cartes : `rounded-xl` → `rounded-2xl` sur tous les conteneurs blancs
- Scroll padding : `pb-28` ajouté partout (tab bar liquid glass)

**Écrans principaux (tabs sans header natif) — grand titre ajouté :**
- `profile.tsx` : header "Mon profil" + sous-titre, `useSafeAreaInsets`
- `calendar.tsx` : header "Calendrier" + sous-titre mois, `useSafeAreaInsets`
- `topics/index.tsx` : header "Mes topics" + sous-titre, `useSafeAreaInsets`
- `depenses/index.tsx` : header "Dépenses" + sous-titre mois, `useSafeAreaInsets`

**Sous-écrans (design tokens seulement) :**
- `annuaire.tsx`, `topics/[slug].tsx`
- `depenses/budgets.tsx`, `depenses/recurrents.tsx`
- `freelance/clients/index.tsx`, `freelance/clients/[id].tsx`
- `freelance/facturation/index.tsx`, `freelance/facturation/factures/index.tsx`
- `freelance/facturation/factures/[id].tsx`, `freelance/facturation/factures/nouvelle.tsx`
- `freelance/facturation/devis/index.tsx`, `freelance/facturation/devis/[id].tsx`
- `freelance/facturation/devis/nouveau.tsx`, `freelance/profil.tsx`
- `pricing.tsx`

---

## 2026-11-08 — Dashboard mobile redesign v2 (style référence, contenu toujours affiché)

### Mobile — `dashboard.tsx` (refonte complète)
- **Header** : grand titre "Tableau de bord" (36px bold) + "Bonjour {prénom}" + bouton cloche glassmorphique — plus de hero dark card
- **Grille 4 stat cards 2×2** : Rappels actifs, Documents, Favoris, % complétés — chacun avec icône colorée + badge (ex: "2 en retard", "1 expirant") si pertinent
- **Card dépenses plein largeur** : montant en grand (38px), barre de progression couleur adaptative (violet / ambre / rouge), badge "X% budget", sous-label du budget
- **Section "À traiter"** : fusionne overdues + docs expirant ≤30j — badge "En retard" / "J-X" coloré ; si vide : empty state avec bouton CTA "Créer un rappel"
- **Section "Prochains rappels"** : liste blanche avec icône violette, date complète
- **Section "Documents récents"** : 4 derniers docs uploadés (nouveau — absent avant)
- **Section "Actions rapides"** : 3 boutons toujours visibles (Topics, Documents, Calendrier) — dashboard jamais vide
- Styles extraits dans `StyleSheet.create()` — plus de styles inline en masse
- Chargement de 2 requêtes supplémentaires : `reminders` total + completed (pour % complétion), `documents` récents

---

## 2026-11-08 — Sprint 3 parité mobile — calendrier, annuaire, freelance mutations

### Mobile — `calendar.tsx` (nouveau)
- Calendrier mensuel avec navigation mois précédent/suivant
- Grille 7 colonnes (lundi en premier), offset de début de mois
- Dots colorés par jour : orange = rappel, violet = document expirant, rouge = rappel en retard
- Jour courant mis en évidence (fond indigo)
- Tap sur une cellule → liste des événements du jour dans une card
- Données : `reminders` (non complétés) + `documents` (expires_at non null) filtrés par mois

### Mobile — `annuaire.tsx` (nouveau)
- Plan check `requirePlan('essentiel')` — upgrade prompt si plan free
- 8 catégories : Impôts, CAF, Santé (CPAM), Emploi, Pôle Emploi, URSSAF, Logement (ADIL), Préfecture, CROUS
- Input code postal (5 chiffres) + chips catégorie (scroll horizontal)
- Appel direct API `api-lannuaire.service-public.fr` depuis React Native (pas de CORS mobile)
- Parsing JSON imbriqué pour adresse, téléphone, email, horaires
- État "Aucun résultat" si liste vide après recherche

### Mobile — `freelance/profil.tsx` (nouveau)
- Plan check `requirePlan('pro')`
- Affichage des sections : informations générales, adresse, paiement, facturation
- Badge "Micro-entrepreneur — TVA non applicable" si `is_micro_entrepreneur`
- Modal d'édition unique (tous les champs) avec `Switch` pour `is_micro_entrepreneur`
- Upsert Supabase avec `onConflict: 'user_id'`
- Lien depuis `freelance/facturation/index.tsx` (card "Profil professionnel")

### Mobile — `freelance/clients/index.tsx` (modifié)
- Bouton "+" dans le header → modal création client
- Champs : company_name (requis), contact_name, email, phone, address_line1, city, postal_code, siret, payment_terms_days (défaut 30), notes
- Après création : ajout local au state trié par company_name

### Mobile — `freelance/clients/[id].tsx` (modifié)
- Bouton "Modifier" dans le header → modal édition pré-remplie
- Bouton toggle actif/inactif en bas de page
- Mise à jour du state local après chaque mutation

### Mobile — `freelance/facturation/factures/[id].tsx` (modifié)
- Boutons de transition de statut après "Voir le PDF" :
  - `brouillon` → Marquer comme envoyée
  - `envoyee` → Marquer comme payée / Marquer en retard / Annuler ⚠️
  - `en_retard` → Marquer comme payée / Annuler ⚠️
- Confirmation `Alert.alert` avant annulation

### Mobile — `freelance/facturation/devis/[id].tsx` (modifié)
- Badge de statut ajouté dans le header (manquant)
- Boutons de transition :
  - `brouillon` → Marquer comme envoyé
  - `envoye` → Accepté ✓ / Refusé ✗ (avec confirmation)

### Mobile — `_layout.tsx` (modifié)
- Nouveaux écrans enregistrés : `calendar`, `annuaire` (dans le drawer), `freelance/profil` (hidden)

---

## 2026-11-08 — Sprint 2 parité mobile — catégories, récurrents, profil, dashboard, documents

### Mobile — `budgets.tsx` (réécriture CRUD)
- Lister les catégories de dépenses avec icône, couleur et budget mensuel
- Bouton "Initialiser les catégories par défaut" si aucune catégorie (10 catégories prédéfinies)
- Bouton "+" → modal création : nom, icône emoji, couleur (10 swatches hex), budget mensuel optionnel
- Tap → modal édition pré-rempli ; long-press → Alert suppression
- Helper `resolveColor()` : convertit les anciens noms Tailwind ('blue'…) vers hex (#3b82f6…)

### Mobile — `recurrents.tsx` (réécriture CRUD)
- Lister toutes les dépenses récurrentes (actives et inactives)
- Bouton "+" → modal création : titre, montant, fréquence (weekly/monthly/quarterly/yearly), date début, catégorie (picker horizontal), jour du mois (si mensuelle/trimestrielle)
- Tap → modal édition ; long-press → Alert suppression
- Bouton toggle actif/inactif inline (icône ⏸/▶) par dépense

### Mobile — `profile.tsx` (réécriture complète)
- **Nom d'affichage** : affichage + édition inline via `supabase.auth.updateUser({ data: { display_name } })`
- **Mot de passe** : section dédiée avec 2 champs (nouveau + confirmation) → `supabase.auth.updateUser({ password })`
- **Type de profil** : 5 chips (étudiant, salarié, indépendant, recherche emploi, autre) — sauvegarde immédiate
- **Topics** : modal liste complète avec toggles, limite 3 pour plan free, check plan avant ajout
- Lien abonnement et déconnexion conservés

### Mobile — `dashboard.tsx` (enrichissement)
- **Card dépenses du mois** : total calculé dynamiquement + barre de progression si budget global défini
- **Rappels en retard** : section rouge distincte (`due_date < aujourd'hui`) avant les rappels à venir
- **Documents à renouveler** : top-3 docs avec `expires_at`, badge urgent (rouge) si ≤ 30 jours, affichage J-X

### Mobile — `topics/[slug].tsx` (upload/delete documents)
- Bouton "+" dans la section Documents → `DocumentPicker.getDocumentAsync()`
- Modal après sélection : nom (pré-rempli), date d'expiration (optionnel), employeur/émetteur (optionnel)
- Upload : `fetch(uri)` → blob → `supabase.storage.from('Documents').upload(filePath, blob)`
- Insert dans `documents` avec tous les métadonnées (file_path, file_size, file_type, expires_at, employer_name)
- Bouton × sur chaque document → Alert confirmation → delete storage + delete DB

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
