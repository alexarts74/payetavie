# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayeTaVie is a French-language personal administrative assistant web application. It helps users manage various life administration aspects (taxes, insurance, healthcare, housing, etc.) through guides, checklists, document storage, reminders, and bookmarks. It also includes a freelance module (invoicing, quotations, clients) gated behind the Pro plan.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run supabase:deploy  # Deploy Supabase edge function (send-reminder-notifications)
npm run supabase:test    # Serve Supabase function locally
```

No test framework is configured — there are no unit or integration tests.

## Tech Stack

- **Next.js 16** with App Router and React 19 (React Compiler enabled via babel-plugin-react-compiler)
- **Supabase** for database (PostgreSQL), authentication, and file storage
- **Tailwind CSS 4** for styling (configured via `@tailwindcss/postcss`)
- **TypeScript 5** with strict mode, path alias `@/*` → `./src/*`
- **shadcn/ui** + **Lucide React** for UI components
- **Stripe** for subscriptions (plans: free, essentiel €4.99/mois, pro €9.99/mois)

## Architecture

### Route Structure

- **Public:** `/` (landing), `/auth/login`, `/auth/register` — redirect authenticated users away
- **Protected (all plans):** `/dashboard`, `/topics`, `/topics/[slug]`, `/profile`, `/pricing`, `/depenses`, `/depenses/budgets`, `/depenses/recurrents`
- **Protected (pro plan only):** `/freelance/clients`, `/freelance/clients/[id]`, `/freelance/facturation`, `/freelance/facturation/factures`, `/freelance/facturation/factures/nouvelle`, `/freelance/facturation/factures/[id]`, `/freelance/facturation/devis`, `/freelance/facturation/devis/nouveau`, `/freelance/facturation/devis/[id]`
- All pages are **Server Components** that fetch data via Server Actions, then pass props to Client Components

### Authentication Flow

1. Middleware (`src/middleware.ts`) delegates to `src/lib/supabase/middleware.ts`
2. Session validated via `supabase.auth.getUser()` on every request
3. Unauthenticated users on protected routes are redirected to `/auth/login`
4. Cookie-based auth via `@supabase/ssr`: server client (`src/lib/supabase/server.ts`), browser client (`src/lib/supabase/client.ts`)
5. Auth error messages translated to French in `src/lib/auth-errors.ts`

### Subscription / Plan System

Plans and limits defined in `src/lib/stripe.ts`:
- **free:** 3 topics, 5 documents, 10 rappels, 5 bookmarks/topic
- **essentiel (€4.99/mois):** illimité (admin uniquement)
- **pro (€9.99/mois):** illimité + module freelance

Key helpers in `src/lib/subscription.ts`:
- `getUserSubscription()` — returns `{ plan, isActive, subscription }`
- `canAccess(userPlan, requiredPlan)` — checks plan hierarchy
- `requirePlan(requiredPlan)` — returns `{ allowed, error, upgradeRequired }` or `{ allowed, plan }`
- `checkResourceLimit(resource, userId, topicSlug?)` — checks free-plan limits

Stripe webhook at `src/app/api/webhooks/stripe/route.ts` handles subscription lifecycle.

### Server Actions Pattern

All database operations are in `src/app/actions/` using `'use server'` directive:

| File | Responsibilities |
|------|-----------------|
| `auth.ts` | Sign out |
| `dashboard.ts` | Stats aggregation, top-10 reminders/documents |
| `reminders.ts` | CRUD for reminders |
| `documents.ts` | Upload/delete files (Storage + metadata), signed URLs |
| `bookmarks.ts` | CRUD for bookmarks, duplicate checking |
| `checklists.ts` | Toggle checklist items, progress queries per topic |
| `calendar.ts` | Fetch reminders + expiring docs for a month as `CalendarEvent[]` |
| `calendar-export.ts` / `calendar-tokens.ts` | iCal export |
| `expenses.ts` | CRUD dépenses |
| `expense-categories.ts` | Catégories de dépenses avec budget mensuel |
| `budgets.ts` | Gestion budgets globaux |
| `recurring-expenses.ts` | Dépenses récurrentes (weekly/monthly/quarterly/yearly) |
| `clients.ts` | CRUD clients freelance, toggle actif/inactif |
| `invoices.ts` | CRUD factures, transitions de statut, stats, duplication |
| `quotations.ts` | CRUD devis, transitions de statut, conversion devis→facture |
| `professional-profile.ts` | Upsert profil pro (SIRET, IBAN, logo, prefixes) |
| `subscription.ts` | Stripe checkout / portal |
| `profile.ts` | Profil utilisateur |
| `preferences.ts` | Préférences (selected_topics, onboarding) |
| `annuaire.ts` | Annuaire global |

Every action authenticates the user first, then returns `{ data, error }` or `{ success }` objects. Mutations call `revalidatePath()` to refresh cached data.

### Database Schema

Core tables with Row-Level Security (RLS) policies isolating data per user:

**Topics / Admin:**
- **documents** — file metadata with `expires_at`, `employer_name`, `document_type`
- **reminders** — tasks with `due_date` and `completed` status
- **bookmarks** — saved resources per topic
- **checklist_progress** — tracks completed checklist items per user/topic/item_index (unique constraint)
- **user_preferences** — profile_type, selected_topics, onboarding_completed, global_monthly_budget, calendar_token

**Dépenses:**
- **expenses** — dépenses avec category_id, amount, expense_date, is_recurring
- **expense_categories** — catégories avec icon, color, monthly_budget
- **recurring_expenses** — dépenses récurrentes avec frequency, day_of_month

**Freelance (plan pro):**
- **clients** — company_name, email, SIRET, address, payment_terms_days, is_active
- **billing_documents** — factures ET devis (discriminé par `type`: 'invoice'|'quotation'), document_number auto-généré via RPC `get_next_document_number`, status, total_ht, tva_rate, total_ttc, source_document_id (lien devis↔facture)
- **billing_document_items** — lignes (description, quantity, unit_price, tva_rate, line_total, sort_order)
- **professional_profiles** — business_name, SIRET, IBAN, BIC, logo_path, invoice_prefix, quotation_prefix, is_micro_entrepreneur

**Abonnements:**
- **subscriptions** — stripe_customer_id, plan, status, current_period_start/end

All tables have auto-updating `updated_at` triggers. Schema files are in `migrations/` (ordered `000_` to `009_`).

Shared types are in `src/types/index.ts`.

### Invoice / Quotation Status Machine

Invoice statuses: `brouillon → envoyee → payee | en_retard | annulee`
Quotation statuses: `brouillon → envoye → accepte → facture | refuse`

Only `brouillon` documents can be edited or deleted. Conversion devis→facture via `convertQuotationToInvoice()` crée une facture et lie les deux via `source_document_id`.

### PDF Generation

API routes generate PDFs:
- `src/app/api/freelance/invoices/[id]/pdf/route.ts`
- `src/app/api/freelance/quotations/[id]/pdf/route.ts`

Templates: `src/lib/pdf/invoice-template.tsx`, `src/lib/pdf/quotation-template.tsx`. Les PDFs incluent le profil professionnel (logo, SIRET, IBAN) et la mention légale TVA pour micro-entrepreneurs.

### Topic System

Slugs définis dans `src/lib/topic-utils.ts` (`topicMap`): impots, urssaf, fiches-de-paie, caf, assurances, mutuelle, medecin-generaliste, pharmacie, analyses-medicales, logement, **freelance-clients**, **freelance-facturation**.

Les slugs `freelance-*` sont routés vers `/freelance/{slug sans préfixe}` dans `NavLinks.tsx` et `ManageTopicsModal.tsx`. La catégorie Freelance dans la nav n'est visible que pour les utilisateurs pro.

Each topic page (`src/app/topics/[slug]/page.tsx`) includes:
- TL;DR summary with checklist (progress tracked in DB)
- FAQ modal (floating button)
- Predefined reminders from `src/lib/predefined-reminders.ts`
- Document uploads and bookmark management

### Key Components

- **`TopicsShell`** — Layout wrapper for all protected pages. Fixed sidebar (desktop) with collapsible topic categories, hamburger menu (mobile), user info + sign out
- **`NavLinks`** — Sidebar navigation with topic categories, filtré par plan et selected_topics
- **`ChecklistSection`** — Checklist with progress bar, optimistic updates via `useTransition`
- **`CalendarView`** — Monthly calendar with event dots (orange=reminder, purple=expiring doc, red=overdue)
- **`FacturationDashboard`** — Vue d'ensemble facturation (stats CA, factures/devis récents)
- **`InvoiceForm`** / **`InvoiceDetailContent`** — Création/détail facture avec transitions de statut
- **`QuotationsListContent`** / **`QuotationDetailContent`** — Liste/détail devis
- **`ClientsPageContent`** / **`ClientDetailContent`** — Gestion clients
- **`InvoicePreview`** — Aperçu PDF dans le navigateur
- **`PricingCards`** / **`UpgradePrompt`** — Pages et prompts d'upgrade
- **`RemindersSection`** / **`DocumentsSection`** / **`BookmarksSection`** — CRUD UIs per topic

### Dashboard (`/dashboard`)

Aggregates cross-topic data: stat cards (reminders, documents, bookmarks, completion %), calendar view, urgent/upcoming reminders, recent/expiring documents, quick action links.

### Theme System

- `ThemeProvider` — React context with `'light'`/`'dark'`/`'system'` modes, persisted to `localStorage` key `payetavie-theme`
- Inline script in `layout.tsx` sets `<html>` class before hydration to prevent flash
- `FloatingThemeToggle` — fixed bottom-right toggle button

### File Storage

Documents stored in Supabase Storage bucket "Documents" at path `documents/{userId}/{topicSlug}/{timestamp}.ext`. Server actions generate 60-minute signed URLs for downloads.

### Edge Function

`supabase/functions/send-reminder-notifications/index.ts` — cron-triggered function that sends email reminders via Resend API. Requires `RESEND_API_KEY`, `CRON_SECRET`, `APP_URL` env vars.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_ESSENTIEL_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

## Code Conventions

- All UI text must be in **French**
- Server Actions handle all database operations — never call Supabase directly from client components
- Use `revalidatePath` after mutations to refresh cached data (always use the full path including `/freelance/` prefix)
- Always verify user authentication in Server Actions before database operations
- Always check plan access with `requirePlan()` in Server Actions for pro-only features
- Custom Tailwind utilities in `globals.css`: `glass-card`, `gradient-text`, `hover-lift`, `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
