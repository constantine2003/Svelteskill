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
   *   `form` is passed in from the SvelteKit form action and contains
   *   any error returned by the server on failed submission.
   */

  // enhance progressively enhances the native POST form — keeps loading
  // state in sync and re-renders the error banner without a full page reload.
  import { enhance } from '$app/forms';

  // form is the action response — holds { error } if the server returned fail()
  let { data, form }: {
    data: {
      user: {
        id:            string;
        email:         string | undefined;
        avatar_url:    string;
        provider_name: string;
      }
    };
    form: { error?: string } | null;
  } = $props();

  // $derived so Svelte 5 reactively tracks changes to data.user
  const user = $derived(data.user);

  /** Display name shown publicly on the platform — pre-filled from OAuth provider. */
  let displayName = $state('');

  /** Full name printed on certificate PDFs — required. */
  let fullName = $state('');

  /** True while the profile insert + redirect is in progress. */
  let loading = $state(false);

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
   * Checks that the avatar_url begins with https:// before rendering it.
   *
   * Why: OAuth providers (GitHub, Google) always return https URLs, so a
   * non-https value is unexpected and could be a javascript: URI injection
   * attempt if the auth pipeline is ever misconfigured or swapped out.
   * Cheap guard — falls back to the emoji avatar silently.
   */
  const safeAvatarUrl = $derived(
    user?.avatar_url?.startsWith('https://') ? user.avatar_url : ''
  );
  
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
         safeAvatarUrl (derived above) ensures only https:// URLs are rendered
         in the <img> src — anything else silently shows the emoji fallback.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="text-center mb-10">

      <!-- Avatar — border uses var(--border) to stay subtle in both themes -->
      <div
        class="w-16 h-16 rounded-full overflow-hidden mx-auto mb-6"
        style="border: 1px solid var(--border)"
      >
        {#if safeAvatarUrl}
          <img
            src={safeAvatarUrl}
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
         Switched from a plain <div> to a <form method="POST"> so the
         submission is handled by the SvelteKit server action in +page.server.ts.
         use:enhance adds progressive enhancement — no full page reload on submit.
    ──────────────────────────────────────────────────────────────────── -->
    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update, result }) => {
          // Only reset loading if the action did NOT redirect to /dashboard.
          // If result.type is 'redirect' the page is already navigating away —
          // resetting loading would cause a brief flicker back to the idle state.
          if (result.type !== 'redirect') {
            loading = false;
          }
          // update() re-runs the load function and re-renders form action data
          update();
        };
      }}
    >
      <div class="rounded-xl p-8" style="background: var(--surface); border: 1px solid var(--border)">

        <!-- ── Error banner ──────────────────────────────────────────────
             Shown when the Supabase insert fails (e.g. duplicate profile,
             RLS policy rejection). The error string comes from Supabase directly.
             Now reads from `form.error` (the server action response) instead
             of local state so it always reflects the true server-side result.
        ────────────────────────────────────────────────────────────────── -->
        {#if form?.error}
          <div
            class="mb-6 px-4 py-3 rounded-lg text-red-400 text-sm"
            style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2)"
          >
            {form.error}
          </div>
        {/if}

        <div class="flex flex-col gap-5">

          <!-- ── Display name ───────────────────────────────────────────
               Required. Shown publicly on the learner's profile page.
               Pre-filled with the OAuth provider name as a default.
               name="display_name" is required so the value is included
               in the native form POST sent to the server action.
               maxlength mirrors MAX_DISPLAY_NAME_LENGTH on the server (50)
               so the browser enforces the same limit before a request is
               even sent — consistent client/server validation.
               required adds native browser validation and tells screen
               readers this field must be filled before submitting.
               autocomplete="nickname" hints to browsers/password managers
               that this is a display name, enabling smarter autofill.
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
              name="display_name"
              type="text"
              bind:value={displayName}
              placeholder="How you appear on the platform"
              required
              maxlength={50}
              autocomplete="nickname"
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
               name="full_name" is required so the value is included
               in the native form POST sent to the server action.
               maxlength mirrors MAX_FULL_NAME_LENGTH on the server (100)
               so the browser enforces the same limit before a request is
               even sent — consistent client/server validation.
               required adds native browser validation and tells screen
               readers this field must be filled before submitting.
               autocomplete="name" hints to browsers/password managers
               that this is a legal full name, enabling smarter autofill.
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
              name="full_name"
              type="text"
              bind:value={fullName}
              placeholder="Printed on your certificates"
              required
              maxlength={100}
              autocomplete="name"
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
               Note: this is a UX convenience only — it does not replace
               server-side validation. A user could bypass this via DevTools.
               The server action in +page.server.ts is the true enforcement layer.
               Uses Svelte's brand orange (#FF3E00) as the CTA color —
               this is intentionally hardcoded, not a CSS var, since it's
               part of the brand identity rather than the light/dark theme.
               type="submit" replaces onclick={handleSubmit} — submission
               is now handled natively by the form and server action.
          ────────────────────────────────────────────────────────────── -->
          <button
            type="submit"
            disabled={loading || !displayName.trim() || !fullName.trim()}
            class="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 hover:brightness-110"
            style="background: #FF3E00; color: #ffffff"
          >
            {#if loading}
              <!-- Spinner — shown while the server action is in flight -->
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
    </form>

    <!-- ── Footer note ───────────────────────────────────────────────────
         Reassurance copy — purely decorative, hence the faintest text color.
    ──────────────────────────────────────────────────────────────────── -->
    <p class="text-center text-xs mt-6 font-light" style="color: var(--text-faint)">
      You can change your name anytime in settings
    </p>

  </div>
</div>