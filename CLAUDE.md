# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayeTaVie is a French-language personal administrative assistant web application. It helps users manage various life administration aspects (taxes, insurance, healthcare, housing, etc.) through guides, checklists, document storage, reminders, and bookmarks.

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

## Architecture

### Route Structure

- **Public:** `/` (landing), `/auth/login`, `/auth/register` — redirect authenticated users away
- **Protected:** `/dashboard`, `/topics`, `/topics/[slug]` — redirect unauthenticated users to login
- All pages are **Server Components** that fetch data via Server Actions, then pass props to Client Components

### Authentication Flow

1. Middleware (`src/middleware.ts`) delegates to `src/lib/supabase/middleware.ts`
2. Session validated via `supabase.auth.getUser()` on every request
3. Unauthenticated users on protected routes are redirected to `/auth/login`
4. Cookie-based auth via `@supabase/ssr`: server client (`src/lib/supabase/server.ts`), browser client (`src/lib/supabase/client.ts`)
5. Auth error messages translated to French in `src/lib/auth-errors.ts`

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

Every action authenticates the user first, then returns `{ data, error }` or `{ success }` objects. Mutations call `revalidatePath()` to refresh cached data.

### Database Schema

Core tables with Row-Level Security (RLS) policies isolating data per user:

- **documents** — file metadata with `expires_at`, `employer_name`, `document_type`
- **reminders** — tasks with `due_date` and `completed` status
- **bookmarks** — saved resources per topic
- **checklist_progress** — tracks completed checklist items per user/topic/item_index (unique constraint)

All tables have auto-updating `updated_at` triggers. Schema files are in `migrations/` (ordered `000_` to `009_`). Storage policies: `docs/storage/STORAGE_POLICIES.sql`.

Shared types are in `src/types/index.ts` (Document, Reminder, Bookmark).

### Topic System

23 administrative categories defined in `src/lib/topic-utils.ts` (`topicMap` with slug → title + icon). Categories: Administration & Finances, Santé, Travail, Études, Logement, Transport, Autre.

Each topic page (`src/app/topics/[slug]/page.tsx`) includes:
- TL;DR summary with checklist (progress tracked in DB)
- FAQ modal (floating button)
- Predefined reminders from `src/lib/predefined-reminders.ts` (date-calculated, 7 topics covered)
- Document uploads and bookmark management

### Key Components

- **`TopicsShell`** — Layout wrapper for all protected pages. Fixed sidebar (desktop) with collapsible topic categories, hamburger menu (mobile), user info + sign out
- **`ChecklistSection`** — Checklist with progress bar, optimistic updates via `useTransition`
- **`CalendarView`** — Monthly calendar with event dots (orange=reminder, purple=expiring doc, red=overdue), French day/month names, click-to-view modal
- **`RemindersSection`** / **`DocumentsSection`** / **`BookmarksSection`** — CRUD UIs per topic
- **`FAQModal`** — Floating FAQ button per topic

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
```

## Code Conventions

- All UI text must be in **French**
- Server Actions handle all database operations — never call Supabase directly from client components
- Use `revalidatePath` after mutations to refresh cached data
- Always verify user authentication in Server Actions before database operations
- Custom Tailwind utilities in `globals.css`: `glass-card`, `gradient-text`, `hover-lift`, `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
