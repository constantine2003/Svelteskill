<div align="center">

<br />

<img src="static/favicon.png" alt="SvelteSkill" width="72" />

<br />
<br />

# SvelteSkill

### Free Svelte certification for everyone.

Learn Svelte from the ground up. Pass quizzes and a final exam.  
Earn a certificate anyone can verify — at zero cost, forever.

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-FF3E00.svg)](LICENSE)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://vercel.com)

<br />

**[svelteskill.dev](https://svelteskill.dev)** &nbsp;·&nbsp; [Report a Bug](https://github.com/YOUR_USERNAME/svelteskill/issues/new?labels=bug&template=bug_report.md) &nbsp;·&nbsp; [Request a Feature](https://github.com/YOUR_USERNAME/svelteskill/issues/new?labels=enhancement) &nbsp;·&nbsp; [Curriculum Feedback](https://github.com/YOUR_USERNAME/svelteskill/issues/new?labels=curriculum)

<br />

</div>

---

## Why SvelteSkill?

The Svelte ecosystem is one of the fastest growing in web development. Developers consistently rank it as their most loved framework — yet there was no certification platform for it. No structured way to learn it end to end. No way to prove you know it.

SvelteSkill fills that gap.

Built by a developer who wanted it to exist, for a community that deserves it. No company, no investors, no paywall. Just an open source project built with the very framework it teaches.

---

## Features

- **4 certification tracks** — Svelte Fundamentals, SvelteKit, Svelte Advanced, Svelte + TypeScript
- **Structured curriculum** — 12 lessons per track, split into 4 parts
- **Part quizzes** — 15 questions at the end of each part, 80%+ to unlock the next
- **Final exam** — 20 questions, 30-minute timer, shuffled every attempt, unlimited retakes
- **Verifiable certificates** — unique UUID per cert, public `/verify/[id]` page, no login needed to verify
- **Sequential track unlocking** — complete Fundamentals to unlock SvelteKit, and so on
- **GitHub + Google OAuth** — no passwords, no email verification
- **Public profiles** — share your earned certificates at `/u/[username]`
- **Light + dark mode** — preference saved to localStorage, no flash on load
- **Fully open source** — MIT licensed, community contributions welcome

---

## Tracks

| # | Track | Lessons | Status |
|---|---|---|---|
| 01 | **Svelte Fundamentals** | 12 | ✅ Available |
| 02 | **SvelteKit** | 12 | ✅ Available |
| 03 | **Svelte Advanced** | 12 | 🔜 Coming soon |
| 04 | **Svelte + TypeScript** | 12 | 🔜 Coming soon |

---

## How Certification Works

```
Sign up with GitHub or Google
            ↓
Complete lessons 1–3  →  Pass Part 1 Quiz (15 questions, 80%+)
            ↓
Complete lessons 4–6  →  Pass Part 2 Quiz (15 questions, 80%+)
            ↓
Complete lessons 7–9  →  Pass Part 3 Quiz (15 questions, 80%+)
            ↓
Complete lessons 10–12 → Pass Part 4 Quiz (15 questions, 80%+)
            ↓
      Pass Final Exam (20 questions, 30 min, 80%+)
            ↓
  Certificate issued with a unique verifiable ID
            ↓
   Share at svelteskill.dev/verify/[id]
```

Every certificate is permanently accessible at a public URL. No login required to verify — share it on LinkedIn, a portfolio, or a resume and anyone can confirm it is real.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [SvelteKit](https://kit.svelte.dev) — Svelte 5 with runes mode |
| **Database** | [Supabase](https://supabase.com) — PostgreSQL with Row Level Security |
| **Auth** | Supabase Auth — GitHub OAuth + Google OAuth |
| **Styling** | Tailwind CSS v3 + CSS variables for theming |
| **Language** | TypeScript throughout |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js **v18 or higher**
- A [Supabase](https://supabase.com) project (free tier is enough)
- A GitHub OAuth app
- A Google OAuth app

---

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/svelteskill.git
cd svelteskill
npm install
```

---

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your values:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Never commit `.env`** — it contains secrets. The `.env.example` file is safe to commit.

---

### 3. Set up the database

Run the schema in your Supabase SQL Editor:

```
docs/schema.sql
```

Then seed the curriculum in order:

```
docs/seeds/01_svelte_fundamentals_modules.sql
docs/seeds/02_svelte_fundamentals_questions.sql
docs/seeds/03_sveltekit_modules.sql
docs/seeds/04_sveltekit_questions.sql
```

---

### 4. Set up OAuth

**GitHub:**
1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Copy Client ID + Secret → Supabase → Authentication → Providers → GitHub → Save

**Google:**
1. [console.cloud.google.com](https://console.cloud.google.com) → New project
2. APIs & Services → Credentials → OAuth Client ID → Web application
3. Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret → Supabase → Authentication → Providers → Google → Save

**URL config in Supabase:**
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/auth/callback`

---

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
svelteskill/
│
├── src/
│   ├── app.html                         # Root HTML — theme init script (no FOUC)
│   ├── app.css                          # Global styles + CSS variables for theming
│   ├── app.d.ts                         # Global TypeScript declarations
│   ├── hooks.server.ts                  # Supabase client + session on every request
│   │
│   ├── lib/
│   │   ├── components/layout/
│   │   │   └── Navbar.svelte            # Auth-aware navbar with theme toggle
│   │   ├── stores/
│   │   │   └── theme.ts                 # Dark/light mode store
│   │   └── supabase/
│   │       ├── client.ts                # Browser Supabase client
│   │       ├── server.ts                # Server Supabase client
│   │       └── types.ts                 # Generated DB types
│   │
│   └── routes/
│       ├── +page.svelte                 # Landing page  /
│       ├── +layout.svelte               # Root layout — Navbar + theme sync
│       ├── +layout.server.ts            # Session + profile passed to all pages
│       │
│       ├── auth/                        # Login, OAuth callback, logout
│       ├── onboarding/                  # First-login profile setup
│       ├── dashboard/                   # Progress overview
│       ├── settings/                    # Edit profile + theme toggle
│       │
│       ├── tracks/
│       │   └── [slug]/
│       │       ├── modules/[moduleSlug] # Lesson page
│       │       ├── part/[partIndex]/quiz # Part assessment
│       │       └── exam/result          # Certificate generation
│       │
│       ├── verify/[certId]              # Public certificate verification
│       └── u/[username]                 # Public user profile
│
├── docs/                                # Schema SQL + seed files
├── static/                              # Favicon, OG image
├── .env.example
├── svelte.config.js
├── tailwind.config.js
└── vite.config.ts
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Display name, full name, avatar — created on first login |
| `tracks` | The 4 certification tracks with prerequisite chain |
| `modules` | Lessons within each track, grouped by `part_index` (1–4) |
| `questions` | Quiz and exam questions with options, correct answer, explanation |
| `user_progress` | Which modules each user has completed |
| `part_assessments` | Part quiz results per user per track |
| `exam_attempts` | Final exam attempts with score and answer record |
| `certificates` | Issued certificates — UUID is the public verifiable ID |

All user tables have Row Level Security enabled. The verify page uses the service role key to read certificates publicly without exposing other user data.

---

## Theming

SvelteSkill supports dark and light mode with zero flash on load. The theme is applied via a synchronous script in `<head>` before the first paint.

Colors are defined as CSS variables in `app.css`:

```css
:root       { --bg: #1a1a1a; --text: #f0ede8; ... }  /* dark  */
:root.light { --bg: #f7f5f2; --text: #1a1a1a; ... }  /* light */
```

Use CSS variable syntax in Tailwind arbitrary values to support both modes:

```svelte
<!-- Supports both dark and light automatically -->
<div class="bg-[var(--bg)] text-[var(--text)] border-[var(--border)]">
```

---

## Contributing

SvelteSkill is community-driven. Every contribution — a typo fix, a better explanation, a bug report — makes the platform better for everyone learning Svelte.

### Ways to contribute

**Fix a curriculum mistake**
Found an error in a lesson or a wrong answer in a quiz? Open an issue with the `curriculum` label or submit a PR directly.

**Improve an explanation**
Think a concept could be explained better? Open a discussion or PR.

**Report a bug**
[Open a bug report](https://github.com/YOUR_USERNAME/svelteskill/issues/new?labels=bug) with steps to reproduce.

**Suggest a feature**
[Open a feature request](https://github.com/YOUR_USERNAME/svelteskill/issues/new?labels=enhancement) describing what you want and why.

**Add new track content**
Interested in contributing lessons for Track 3 or 4? Open an issue first to discuss scope, then submit a PR with the SQL inserts following the existing lesson format.

### Pull request guidelines

- Use TypeScript — avoid `any` where possible
- Use CSS variables for colors — `var(--bg)` not `#1a1a1a`
- Add `rel="external"` to all `<a>` tags (ESLint rule)
- Add `for` attributes to all `<label>` tags
- Test the full auth → lesson → quiz → exam flow if you changed anything in those paths

---

## Deployment

### Vercel (recommended)

```bash
npm install -D @sveltejs/adapter-vercel
```

Update `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-vercel';
export default { kit: { adapter: adapter() } };
```

1. Push to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

**After deploying — update your OAuth URLs:**
- Supabase → Authentication → URL Configuration → add your production domain
- GitHub OAuth app → update Homepage URL and callback URL
- Google OAuth app → add production redirect URI

### Regenerating Supabase types

After any schema change, regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

---

## Roadmap

- [x] Svelte Fundamentals track — 12 lessons, 60 quiz Qs, 20 exam Qs
- [x] SvelteKit track — 12 lessons, 60 quiz Qs, 20 exam Qs
- [x] Part-based quizzes with 80% pass threshold
- [x] Final exam with 30-minute countdown timer
- [x] Verifiable certificates with public UUID verify page
- [x] Sequential track unlocking
- [x] Public user profiles
- [x] Dark + light mode with no flash
- [ ] Svelte Advanced track
- [ ] Svelte + TypeScript track
- [ ] Per-lesson feedback integrated with GitHub Issues
- [ ] Code playground (StackBlitz embed)
- [ ] PDF certificate download
- [ ] Email notification on certificate issue

---

## License

The **platform code** is licensed under the [MIT License](LICENSE).

The **curriculum content** (lesson text, questions, and explanations) is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — free to use and share with attribution, non-commercial use only.

---

## Acknowledgements

- [Rich Harris](https://github.com/Rich-Harris) for creating Svelte and making web development genuinely enjoyable
- The [Svelte community](https://svelte.dev/community) for building something worth learning
- [Supabase](https://supabase.com) for making backend development accessible to everyone
- Every person who contributes to, uses, or shares SvelteSkill

---

<div align="center">

<br />

Built with care by [Daniel Montesclaros](https://github.com/YOUR_USERNAME) &nbsp;·&nbsp; Cebu, Philippines 🇵🇭

<br />

*No company. No paywall. Just Svelte.*

<br />

</div>
