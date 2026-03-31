# SvelteSkill — Full Project Structure & Documentation

> SvelteKit + Supabase | Free Community Svelte Certification Platform
> Built by: Daniel Montesclaros (constantine2003)

---

## Table of Contents
1. [Project Root](#project-root)
2. [src/lib](#srclib)
3. [src/routes](#srcroutes)
4. [Database Types](#database-types)
5. [Environment Variables](#environment-variables)
6. [File Naming Conventions](#file-naming-conventions)

---

## Project Root

```
svelteskill/
├── .env                          # Secret keys (never commit)
├── .env.example                  # Template for .env (commit this)
├── .gitignore
├── package.json
├── svelte.config.js              # SvelteKit config (adapter, mdsvex)
├── vite.config.ts                # Vite config
├── tsconfig.json                 # TypeScript config
├── app.d.ts                      # Global type declarations (Supabase session types)
│
├── static/
│   ├── favicon.png
│   ├── logo.svg                  # SvelteSkill logo
│   └── og-image.png              # Open Graph image for social sharing
│
└── src/
    ├── app.html                  # Root HTML shell (fonts, meta)
    ├── app.css                   # Global CSS (CSS variables, resets, typography)
    ├── lib/                      # Shared code (components, utils, stores)
    └── routes/                   # All pages and API endpoints
```

---

## src/lib

Everything inside `$lib` is importable from anywhere via `$lib/...`

```
src/lib/
│
├── index.ts                      # Barrel export (re-exports commonly used things)
│
├── supabase/
│   ├── client.ts                 # Supabase browser client (used in components)
│   ├── server.ts                 # Supabase server client (used in +page.server.ts)
│   └── types.ts                  # Auto-generated DB types (via supabase gen types)
│
├── stores/
│   ├── user.ts                   # Writable store: current user session + profile
│   ├── progress.ts               # Writable store: user's module completion state
│   └── toast.ts                  # Writable store: toast/notification messages
│
├── utils/
│   ├── cert.ts                   # Cert ID generation, PDF generation logic
│   ├── progress.ts               # Helper: check if track is unlocked for user
│   ├── exam.ts                   # Helper: calculate exam score, determine pass/fail
│   ├── date.ts                   # Format dates for certs (e.g. "March 22, 2026")
│   └── slugify.ts                # Convert track/module titles to URL slugs
│
├── constants/
│   ├── tracks.ts                 # Track metadata (slugs, order, prerequisite map)
│   ├── exam.ts                   # Passing score threshold (e.g. 80%)
│   └── routes.ts                 # Named route constants (avoid hardcoded strings)
│
└── components/
    │
    ├── ui/                       # Generic reusable UI (no business logic)
    │   ├── Button.svelte
    │   ├── Badge.svelte           # e.g. "Completed", "Locked", "In Progress"
    │   ├── Card.svelte
    │   ├── Modal.svelte           # Base modal wrapper
    │   ├── Toast.svelte           # Notification popup
    │   ├── Spinner.svelte         # Loading indicator
    │   ├── ProgressBar.svelte     # Module completion progress
    │   └── Tooltip.svelte
    │
    ├── layout/                   # Layout-level components
    │   ├── Navbar.svelte          # Top nav (logo, login/logout, profile link)
    │   ├── Footer.svelte
    │   ├── Sidebar.svelte         # Course sidebar (module list + progress)
    │   └── MobileMenu.svelte      # Hamburger menu for mobile
    │
    ├── auth/                     # Auth-specific components
    │   ├── LoginButtons.svelte    # GitHub + Google OAuth buttons
    │   └── OnboardingModal.svelte # First-login modal: set display name + full name
    │
    ├── landing/                  # Landing page sections
    │   ├── Hero.svelte
    │   ├── TracksOverview.svelte  # 4 track cards with lock/unlock state
    │   ├── HowItWorks.svelte      # 3-step explainer
    │   ├── SvelteVsKit.svelte     # "What's the difference?" explainer section
    │   └── CertPreview.svelte     # Mock cert image to show what they'll earn
    │
    ├── course/                   # Course + lesson components
    │   ├── ModuleList.svelte      # Sidebar list of modules with completion badges
    │   ├── ModuleCard.svelte      # Single module card (title, duration, status)
    │   ├── LessonContent.svelte   # Renders MDsveX markdown lesson content
    │   ├── QuizBlock.svelte       # Per-module quiz (MCQ, shows result inline)
    │   └── TrackHeader.svelte     # Track title, description, progress bar
    │
    ├── exam/                     # Final exam components
    │   ├── ExamQuestion.svelte    # Single MCQ question with options
    │   ├── ExamProgress.svelte    # "Question 3 of 20" indicator
    │   ├── ExamResult.svelte      # Pass/fail screen with score + next action
    │   └── ExamTimer.svelte       # Optional countdown timer
    │
    ├── cert/                     # Certificate components
    │   ├── CertCard.svelte        # Small cert preview card (for dashboard/profile)
    │   ├── CertFull.svelte        # Full certificate display (for verify page)
    │   └── CertDownloadBtn.svelte # Triggers PDF download
    │
    └── profile/                  # User profile components
        ├── ProfileHeader.svelte   # Avatar, display name, join date
        ├── CertGrid.svelte        # Grid of earned certs
        └── EditProfileForm.svelte # Change display name / full name
```

---

## src/routes

SvelteKit uses file-based routing. Every folder = a URL segment.

```
src/routes/
│
├── +layout.svelte                # Root layout: Navbar + Footer wrapping all pages
├── +layout.server.ts             # Load session from Supabase on every request
├── +layout.ts                    # Pass session to all child pages
├── +page.svelte                  # Landing page (/)
│
├── auth/
│   ├── +page.svelte              # Login page (/auth) — shows LoginButtons.svelte
│   ├── callback/
│   │   └── +server.ts            # /auth/callback — Supabase OAuth redirect handler
│   └── logout/
│       └── +server.ts            # /auth/logout — clears session, redirects to /
│
├── onboarding/
│   └── +page.svelte              # /onboarding — first-login setup (display name, full name)
│                                 # Protected: redirect to /dashboard if already onboarded
│
├── dashboard/
│   ├── +page.svelte              # /dashboard — user's progress, earned certs
│   ├── +page.server.ts           # Load: fetch user progress + certs from Supabase
│   └── +layout.svelte            # Dashboard layout (optional sidebar)
│
├── tracks/
│   ├── +page.svelte              # /tracks — all 4 tracks overview with lock state
│   ├── +page.server.ts           # Load: fetch tracks + user's completed tracks
│   │
│   └── [slug]/                   # Dynamic route: /tracks/svelte-fundamentals
│       ├── +page.svelte          # Track overview page (module list, progress)
│       ├── +page.server.ts       # Load: fetch track, modules, user progress
│       │                         # Guard: redirect if prerequisite not completed
│       │
│       ├── modules/
│       │   └── [moduleSlug]/     # /tracks/[slug]/modules/[moduleSlug]
│       │       ├── +page.svelte  # Lesson page (content + quiz)
│       │       └── +page.server.ts # Load: fetch module content + questions
│       │                         # Guard: redirect if not logged in
│       │
│       └── exam/
│           ├── +page.svelte      # /tracks/[slug]/exam — final exam
│           ├── +page.server.ts   # Load: fetch exam questions
│           │                     # Guard: redirect if not all modules completed
│           └── result/
│               ├── +page.svelte  # /tracks/[slug]/exam/result — pass/fail screen
│               └── +page.server.ts # Load: fetch latest attempt result
│
├── verify/
│   └── [certId]/
│       ├── +page.svelte          # /verify/[certId] — public cert verification page
│       └── +page.server.ts       # Load: fetch cert by ID (public, no auth needed)
│
├── u/
│   └── [username]/
│       ├── +page.svelte          # /u/[username] — public profile page
│       └── +page.server.ts       # Load: fetch profile + earned certs by username
│
├── settings/
│   ├── +page.svelte              # /settings — edit display name, full name
│   ├── +page.server.ts           # Load: current profile data
│   │                             # Guard: redirect to /auth if not logged in
│   └── actions.ts                # Form actions: update profile in Supabase
│
└── api/
    ├── cert/
    │   └── generate/
    │       └── +server.ts        # POST /api/cert/generate
    │                             # Called after passing exam
    │                             # Creates cert row in DB, returns cert ID
    │
    ├── progress/
    │   └── complete/
    │       └── +server.ts        # POST /api/progress/complete
    │                             # Marks a module as completed for current user
    │
    └── exam/
        └── submit/
            └── +server.ts        # POST /api/exam/submit
                                  # Scores the exam, saves attempt, triggers cert if passed
```

---

## Database Types

Run this command to auto-generate TypeScript types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

This gives you full type safety across the entire app. Run it every time you change the schema.

---

## Environment Variables

### `.env` (never commit)
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # only used server-side
```

### `.env.example` (commit this)
```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> `PUBLIC_` prefix = exposed to browser (safe for anon key + URL)
> No prefix = server only (never exposed to client)

---

## File Naming Conventions

| Pattern | Purpose |
|---|---|
| `+page.svelte` | The UI for a route |
| `+page.server.ts` | Server-only logic for a route (load data, guards) |
| `+layout.svelte` | Wraps all child routes with shared UI |
| `+layout.server.ts` | Server logic shared across all child routes |
| `+server.ts` | API endpoint (GET, POST, etc.) |
| `PascalCase.svelte` | Svelte components |
| `camelCase.ts` | Utility files, stores, helpers |

---

## Route Guards Pattern

Every protected page uses this pattern in `+page.server.ts`:

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.supabase.auth.getSession();

  if (!session.data.session) {
    throw redirect(303, '/auth');
  }

  // fetch and return data...
};
```

---

## Key Data Flow

```
Browser Request
      ↓
+layout.server.ts       ← loads session from Supabase on EVERY request
      ↓
+page.server.ts         ← loads page-specific data + runs guards
      ↓
+layout.svelte          ← injects Navbar, Footer, session into context
      ↓
+page.svelte            ← renders the page UI with loaded data
      ↓
$lib/components/...     ← reusable components used inside pages
      ↓
$lib/stores/...         ← reactive state shared across components
```

---

*SvelteSkill — Built with SvelteKit + Supabase*
*Phase 1: Auth + Svelte Fundamentals track + Cert generation*
