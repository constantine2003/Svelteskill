<script lang="ts">
  /**
   * Login page — presents OAuth sign-in options (GitHub, GitLab, Google, and Discord).
   *
   * Theming:
   *   All colors use CSS variables defined in app.css so the page responds
   *   correctly to both dark mode (:root) and light mode (:root.light).
   *
   * Auth flow:
   *   Clicking any button calls Supabase's signInWithOAuth, which
   *   redirects the browser to the provider. After the user authorises,
   *   the provider redirects back to /auth/callback where the session
   *   is established before forwarding to /dashboard.
   *
   * Discord setup notes:
   *   To enable Discord login you must:
   *     1. Create an application at https://discord.com/developers/applications
   *     2. Under OAuth2 → Redirects, add your Supabase callback URL:
   *        https://<your-project>.supabase.co/auth/v1/callback
   *     3. Copy the Client ID and Client Secret into Supabase:
   *        Dashboard → Authentication → Providers → Discord
   *     4. Ensure the `identify` and `email` scopes are requested
   *        (Supabase does this by default).
   *
   * GitLab setup notes:
   *   To enable GitLab login you must:
   *     1. Go to https://gitlab.com/-/profile/applications (or your self-managed instance)
   *     2. Add your Supabase callback URL as a redirect URI:
   *        https://<your-project>.supabase.co/auth/v1/callback
   *     3. Enable the `read_user` and `email` scopes
   *     4. Copy the Application ID and Secret into Supabase:
   *        Dashboard → Authentication → Providers → GitLab
   *
   * Redirect guard (commented out):
   *   The onMount block below can redirect already-authenticated users
   *   away from this page client-side. It is currently disabled because
   *   the server-side load() guard in the dashboard handles this more
   *   reliably. Re-enable if you need to prevent a flash of the login UI.
   */

  import { supabase } from '$lib/supabase/client';
  // import { goto } from '$app/navigation';
  // import { onMount } from 'svelte';

  // ── State ────────────────────────────────────────────────────────────────

  /** True while an OAuth redirect is in progress — disables all buttons. */
  let loading = $state(false);

  /** Holds the error message string if the OAuth call fails, otherwise empty. */
  let error = $state('');

  // Redirect already-authenticated users away from this page.
  // This runs client-side on mount — the server-side guard lives in the
  // dashboard's load() function. Both are needed: the server guard protects
  // the data, this guard protects the UX (no flash of the login page).
  // onMount(async () => {
  //   const { data: { session } } = await supabase.auth.getSession();
  //   if (session) await goto('/dashboard', { replaceState: true });
  // });

  // ── Auth actions ─────────────────────────────────────────────────────────

  /**
   * Initiates the GitHub OAuth flow.
   * Supabase redirects the browser to GitHub; after authorisation GitHub
   * redirects to /auth/callback with a code that Supabase exchanges for
   * a session. The `redirectTo` must be listed as an allowed callback URL
   * in both Supabase and the GitHub OAuth app settings.
   */
  async function signInWithGitHub() {
    loading = true;
    error   = '';
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options:  { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (err) error = err.message;
    loading = false;
  }

  /**
   * Initiates the GitLab OAuth flow.
   * Same flow as GitHub — Supabase redirects the browser to GitLab; after
   * authorisation GitLab redirects to /auth/callback with a code that
   * Supabase exchanges for a session.
   *
   * Prerequisites (see top-of-file notes for full setup steps):
   *   - GitLab application configured at gitlab.com/-/profile/applications
   *   - Application ID + Secret entered in Supabase → Auth → Providers → GitLab
   *   - Supabase callback URL whitelisted in the GitLab app's redirect list
   *
   * Scopes requested: `read_user` + `email`.
   */
  async function signInWithGitLab() {
    loading = true;
    error   = '';
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'gitlab',
      options:  { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (err) error = err.message;
    loading = false;
  }

  /**
   * Initiates the Google OAuth flow.
   * Same flow as GitHub — see signInWithGitHub above.
   * The `redirectTo` must be listed as an authorised redirect URI in the
   * Google Cloud Console OAuth credentials for this project.
   */
  async function signInWithGoogle() {
    loading = true;
    error   = '';
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (err) error = err.message;
    loading = false;
  }

  /**
   * Initiates the Discord OAuth flow.
   * Same flow as GitHub and Google — Supabase redirects the browser to
   * Discord; after the user authorises, Discord redirects to /auth/callback
   * where Supabase exchanges the code for a session.
   *
   * Prerequisites (see top-of-file notes for full setup steps):
   *   - Discord OAuth2 app configured at discord.com/developers/applications
   *   - Client ID + Secret entered in Supabase → Auth → Providers → Discord
   *   - Supabase callback URL whitelisted in the Discord app's redirect list
   *
   * Scopes requested: `identify` + `email` (Supabase defaults — no override needed).
   */
  // async function signInWithDiscord() {
  //   loading = true;
  //   error   = '';
  //   const { error: err } = await supabase.auth.signInWithOAuth({
  //     provider: 'discord',
  //     options:  { redirectTo: `${window.location.origin}/auth/callback` }
  //   });
  //   if (err) error = err.message;
  //   loading = false;
  // }
</script>

<svelte:head>
  <title>Login | SvelteSkill</title>
</svelte:head>

<!--
  Root wrapper
  ────────────
  Uses var(--bg) instead of a hardcoded color so this page respects both
  dark mode (:root) and light mode (:root.light) defined in app.css.
  Centered layout — login pages have a single focal card.
-->
<div class="min-h-screen flex items-center justify-center px-4" style="background: var(--bg)">
  <div class="w-full max-w-sm">

    <!-- ── Logo + heading ────────────────────────────────────────────────
         Brand lockup above the card. The logo links back to the landing
         page so users who arrived here by mistake can navigate away easily.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="text-center mb-10">

      <!-- Brand logo + wordmark -->
      <a href="/" rel="external" class="inline-flex items-center gap-2 mb-6">
        <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
        </div>
        <span class="font-serif italic text-xl" style="color: var(--text)">SvelteSkill</span>
      </a>

      <!-- Page heading -->
      <h1 class="text-2xl font-serif italic mb-2" style="color: var(--text)">Welcome back</h1>

      <!-- Subheading — secondary prominence using text-muted -->
      <p class="text-sm font-light" style="color: var(--text-muted)">
        Sign in to continue your Svelte journey
      </p>
    </div>

    <!-- ── Auth card ──────────────────────────────────────────────────────
         Contains the OAuth buttons and any error feedback.
         Uses var(--surface) / var(--border) so it lifts off the background
         in both themes without needing two separate color definitions.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="rounded-xl p-8" style="background: var(--surface); border: 1px solid var(--border)">

      <!-- ── Error banner ────────────────────────────────────────────────
           Shown when an OAuth call fails (e.g. provider misconfiguration,
           network error). The error string comes from Supabase directly.
      ────────────────────────────────────────────────────────────────── -->
      {#if error}
        <div
          class="mb-4 px-4 py-3 rounded-lg text-red-400 text-sm"
          style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2)"
        >
          {error}
        </div>
      {/if}

      <div class="flex flex-col gap-3">

        <!-- ── GitHub button ────────────────────────────────────────────
             Filled style — primary action. Uses var(--text) as background
             and var(--bg) as text color so it inverts correctly in both
             themes (white-on-dark in dark mode, dark-on-light in light mode).
        ────────────────────────────────────────────────────────────── -->
        <button
          onclick={signInWithGitHub}
          disabled={loading}
          class="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
          style="background: var(--text); color: var(--bg)"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <!-- ── GitLab button ────────────────────────────────────────────
             Filled style — matches GitHub's visual weight as a primary
             action. Uses var(--text) / var(--bg) for theme-aware inversion.
             GitLab's brand color (#FC6D26) is used only for the icon fill;
             it is a fixed brand color and must NOT be replaced with a CSS var.
        ────────────────────────────────────────────────────────────── -->
       <button
  onclick={signInWithGitLab}
  disabled={loading}
  class="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
  style="background: #FC6D26; color: #fff"
>
          <!-- GitLab's brand orange is fixed — do not substitute with CSS vars -->
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
          </svg>
          Continue with GitLab
        </button>

        <!-- ── Google button ────────────────────────────────────────────
             Outlined style — secondary action. Uses a transparent background
             with a subtle border so it sits behind GitHub/GitLab visually
             without disappearing against the card surface in either theme.
        ────────────────────────────────────────────────────────────── -->
        <button
          onclick={signInWithGoogle}
          disabled={loading}
          class="w-full flex items-center justify-center gap-3 px-4 py-3 font-medium text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style="
            background: transparent;
            color:      var(--text);
            border:     1px solid var(--border2);
          "
        >
          <!-- Google's brand colors are fixed — do not substitute with CSS vars -->
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <!-- ── Discord button ───────────────────────────────────────────
             Outlined style — tertiary action, matching the Google button's
             visual weight. Discord's brand color (#5865F2) is used for the
             icon fill; it is a fixed brand color and must NOT be replaced
             with a CSS variable.
             See signInWithDiscord() and the top-of-file notes for the
             required Discord developer portal + Supabase configuration.
        ────────────────────────────────────────────────────────────── -->
        <!-- <button
          onclick={signInWithDiscord}
          disabled={loading}
          class="w-full flex items-center justify-center gap-3 px-4 py-3 font-medium text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style="
            background: transparent;
            color:      var(--text);
            border:     1px solid var(--border2);
          "
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Continue with Discord
        </button> -->

      </div>

      <!-- Terms note — faint since it's legal boilerplate, not a CTA -->
      <p class="text-center text-xs mt-6 font-light" style="color: var(--text-faint)">
        By signing in you agree to learn Svelte for free.
      </p>
    </div>

    <!-- ── Footer tagline ────────────────────────────────────────────────
         Below the card — even fainter than the terms note since it is
         purely decorative reassurance copy.
    ──────────────────────────────────────────────────────────────────── -->
    <p class="text-center text-xs mt-6 font-light" style="color: var(--text-faint)">
      Free forever · No credit card · No company
    </p>

  </div>
</div>