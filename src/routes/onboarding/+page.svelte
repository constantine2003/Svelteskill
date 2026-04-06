<script lang="ts">
  /**
   * Onboarding / profile-setup page.
   *
   * Shown once after a user signs in for the first time via OAuth.
   * Collects a display name (required) and full name (required for certificates),
   * then inserts a row into the `profiles` table and redirects to /dashboard.
   *
   * Theming:
   *   All colors use CSS variables defined in app.css so the page responds
   *   correctly to both dark mode (:root) and light mode (:root.light).
   *
   * Data flow:
   *   `data` is passed in from the SvelteKit load() function and contains
   *   the authenticated user object (id, email, avatar_url, provider_name).
   */

  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';

  let { data } = $props();

  // $derived so Svelte 5 reactively tracks changes to data.user
  const user = $derived(data.user);

  /** Display name shown publicly on the platform — pre-filled from OAuth provider. */
  let displayName = $state('');

  /** Full name printed on certificate PDFs — required. */
  let fullName = $state('');

  /** True while the profile insert + redirect is in progress. */
  let loading = $state(false);

  /** Holds an error message string if the insert fails, otherwise empty. */
  let error = $state('');

  /**
   * Pre-fill displayName with the name returned by the OAuth provider
   * (e.g. GitHub username or Google display name) as a sensible default.
   * Runs reactively via $effect so it picks up the value once data loads.
   */
  $effect(() => {
    if (data.user?.provider_name) {
      displayName = data.user.provider_name as string;
    }
  });

  /**
   * Validates the form, inserts the profile row into Supabase,
   * invalidates the auth cache, and redirects to /dashboard.
   *
   * Both displayName and fullName are required — fullName is printed
   * on certificate PDFs so we enforce it here rather than at generation time.
   *
   * The `supabase` cast works around a known TypeScript inference
   * issue with the generated database types — safe to remove once
   * your supabase client is properly typed.
   */
  async function handleSubmit() {
    if (!displayName.trim() || !fullName.trim()) {
      error = 'Display name and full name are required';
      return;
    }

    loading = true;
    error = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as unknown as any)
      .from('profiles')
      .insert({
        id:           user?.id,
        display_name: displayName.trim(),
        full_name:    fullName.trim(),
        avatar_url:   (user?.avatar_url as string) || null
      });

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    // Invalidate the SvelteKit auth dependency so layout load() re-runs,
    // then hard-navigate to dashboard to ensure a fresh server render.
    await invalidate('supabase:auth');
    window.location.href = '/dashboard';
  }
</script>

<!--
  Root wrapper
  ────────────
  Uses var(--bg) so the background responds to both dark and light themes
  defined in app.css. Centered layout — onboarding has a single focal card.
-->
<div class="min-h-screen flex items-center justify-center px-4" style="background: var(--bg)">
  <div class="w-full max-w-md">

    <!-- ── Header ────────────────────────────────────────────────────────
         Avatar pulled from the OAuth provider (GitHub/Google profile pic).
         Falls back to a generic emoji placeholder if none is available.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="text-center mb-10">

      <!-- Avatar — border uses var(--border) to stay subtle in both themes -->
      <div
        class="w-16 h-16 rounded-full overflow-hidden mx-auto mb-6"
        style="border: 1px solid var(--border)"
      >
        {#if user?.avatar_url}
          <img
            src={user.avatar_url as string}
            alt="Your avatar"
            class="w-full h-full object-cover"
          />
        {:else}
          <!-- Fallback avatar — uses Svelte orange tint -->
          <div
            class="w-full h-full flex items-center justify-center text-2xl"
            style="background: rgba(255,62,0,0.1)"
          >
            👤
          </div>
        {/if}
      </div>

      <!-- Page heading -->
      <h1 class="text-2xl font-serif italic mb-2" style="color: var(--text)">
        One last step
      </h1>

      <!-- Subheading — secondary prominence -->
      <p class="text-sm font-light" style="color: var(--text-muted)">
        Set up your profile before we begin
      </p>
    </div>

    <!-- ── Form card ──────────────────────────────────────────────────────
         Uses var(--surface) / var(--border) so it lifts off the background
         in both themes without needing duplicate color definitions.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="rounded-xl p-8" style="background: var(--surface); border: 1px solid var(--border)">

      <!-- ── Error banner ──────────────────────────────────────────────
           Shown when the Supabase insert fails (e.g. duplicate profile,
           RLS policy rejection). The error string comes from Supabase directly.
      ────────────────────────────────────────────────────────────────── -->
      {#if error}
        <div
          class="mb-6 px-4 py-3 rounded-lg text-red-400 text-sm"
          style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2)"
        >
          {error}
        </div>
      {/if}

      <div class="flex flex-col gap-5">

        <!-- ── Display name ───────────────────────────────────────────
             Required. Shown publicly on the learner's profile page.
             Pre-filled with the OAuth provider name as a default.
        ────────────────────────────────────────────────────────────── -->
        <div>
          <label
            for="display_name"
            class="block text-xs font-medium mb-2 tracking-wide uppercase"
            style="color: var(--text-muted)"
          >
            Display name <span style="color: #FF3E00">*</span>
          </label>
          <input
            id="display_name"
            type="text"
            bind:value={displayName}
            placeholder="How you appear on the platform"
            class="w-full rounded-lg px-4 py-3 text-sm transition-colors focus:outline-none"
            style="
              background: var(--input-bg);
              border:     1px solid var(--border);
              color:      var(--text);
            "
          />
          <p class="text-xs mt-1.5 font-light" style="color: var(--text-faint)">
            Shown on your public profile
          </p>
        </div>

        <!-- ── Full name ──────────────────────────────────────────────
             Required. Printed on certificate PDFs so learners can have
             their legal name on certificates while using a shorter
             display name everywhere else on the platform.
        ────────────────────────────────────────────────────────────── -->
        <div>
          <label
            for="full_name"
            class="block text-xs font-medium mb-2 tracking-wide uppercase"
            style="color: var(--text-muted)"
          >
            Full name <span style="color: #FF3E00">*</span>
          </label>
          <input
            id="full_name"
            type="text"
            bind:value={fullName}
            placeholder="Printed on your certificates"
            class="w-full rounded-lg px-4 py-3 text-sm transition-colors focus:outline-none"
            style="
              background: var(--input-bg);
              border:     1px solid var(--border);
              color:      var(--text);
            "
          />
          <p class="text-xs mt-1.5 font-light" style="color: var(--text-faint)">
            This is what appears on your certificate PDF
          </p>
        </div>

        <!-- ── Email (read-only) ──────────────────────────────────────
             Pulled from the OAuth provider. Displayed for transparency
             but not editable here — users change email via their provider.
             opacity: 0.5 on a shared var gives a visible disabled look
             in both light and dark mode without needing a separate variable.
        ────────────────────────────────────────────────────────────── -->
        <div>
          <label
            for="email"
            class="block text-xs font-medium mb-2 tracking-wide uppercase"
            style="color: var(--text-muted)"
          >
            Email
          </label>
          <input
            id="email"
            type="text"
            value={user?.email ?? ''}
            disabled
            class="w-full rounded-lg px-4 py-3 text-sm cursor-not-allowed"
            style="
              background: var(--input-bg);
              border:     1px solid var(--border);
              color:      var(--text-muted);
              opacity:    0.5;
            "
          />
        </div>

        <!-- ── Submit button ──────────────────────────────────────────
             Disabled while loading or if either required field is empty.
             Uses Svelte's brand orange (#FF3E00) as the CTA color —
             this is intentionally hardcoded, not a CSS var, since it's
             part of the brand identity rather than the light/dark theme.
        ────────────────────────────────────────────────────────────── -->
        <button
          onclick={handleSubmit}
          disabled={loading || !displayName.trim() || !fullName.trim()}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 hover:brightness-110"
          style="background: #FF3E00; color: #ffffff"
        >
          {#if loading}
            <!-- Spinner — shown while the Supabase insert is in flight -->
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Setting up your profile...
          {:else}
            Let's start learning →
          {/if}
        </button>

      </div>
    </div>

    <!-- ── Footer note ───────────────────────────────────────────────────
         Reassurance copy — purely decorative, hence the faintest text color.
    ──────────────────────────────────────────────────────────────────── -->
    <p class="text-center text-xs mt-6 font-light" style="color: var(--text-faint)">
      You can change your name anytime in settings
    </p>

  </div>
</div>