<script lang="ts">
  /**
   * Profile settings page — lets the authenticated user update their
   * display name and full name, copy their public profile link, and sign out.
   *
   * Theming:
   *   All colors use CSS variables defined in app.css so the page responds
   *   correctly to both dark mode (:root) and light mode (:root.light).
   *   Never use hardcoded hex values or Tailwind opacity shortcuts like
   *   text-[#f0ede8]/50 here — those ignore the theme class entirely.
   *
   * Form handling:
   *   Uses SvelteKit's `enhance` action for progressive enhancement.
   *   The form submits to the `updateProfile` server action in +page.server.ts
   *   and works with or without JavaScript enabled.
   */

  import { enhance } from '$app/forms';

  // ── Types ────────────────────────────────────────────────────────────────

  interface Props {
    data: {
      profile: {
        display_name: string;
        full_name: string | null;
        avatar_url: string | null;
      };
    };
    /**
     * `form` is populated by SvelteKit after a form action returns data.
     * It is null on the initial page load and after a successful navigation.
     */
    form: {
      error?: string;
      success?: boolean;
      display_name?: string;
      full_name?: string;
    } | null;
  }

  // ── Props ────────────────────────────────────────────────────────────────

  const { data, form }: Props = $props();

  const profile = $derived(data.profile);

  // ── Local form state ─────────────────────────────────────────────────────

  /**
   * Local copies of the profile fields, kept in sync with server data via
   * $effect. Using local state instead of binding directly to `data.profile`
   * allows us to track unsaved changes and reset cleanly on cancel.
   */
  let displayName = $state('');
  let fullName    = $state('');

  $effect(() => {
    displayName = data.profile.display_name ?? '';
    fullName    = data.profile.full_name    ?? '';
  });

  /** True while the form action is in flight — disables the save button. */
  let saving = $state(false);

  /**
   * Dirty check — true when either field differs from the last saved value.
   * Prevents unnecessary server round-trips if the user hasn't changed anything.
   */
  const hasChanges = $derived(
    displayName.trim() !== (data.profile.display_name ?? '') ||
    fullName.trim()    !== (data.profile.full_name    ?? '')
  );

  // ── Copy-link state ──────────────────────────────────────────────────────

  /**
   * `copied` flips to true for 2 seconds after the user clicks "Copy",
   * providing visual feedback without needing a toast library.
   */
  let copied = $state(false);

  function copyLink() {
    navigator.clipboard.writeText(
      `http://localhost:5173/u/${profile.display_name.toLowerCase().replace(/\s+/g, '-')}`
    );
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  /**
   * URL-safe version of the display name used to construct the public
   * profile link. Spaces become hyphens; everything is lowercased.
   */
  const profileSlug = $derived(
    profile.display_name.toLowerCase().replace(/\s+/g, '-')
  );
</script>

<svelte:head>
  <title>Profile Settings</title>
</svelte:head>

<!--
  Root wrapper
  ────────────
  Uses var(--bg) instead of a hardcoded color so this page respects both
  dark mode (:root) and light mode (:root.light) defined in app.css.
-->
<div class="min-h-screen" style="background: var(--bg)">
  <main class="max-w-[640px] mx-auto px-4 sm:px-8 py-8">

    <!-- ── Page header ───────────────────────────────────────────────────
         Back link + orange section label + serif page title.
         The back link uses var(--text-faint) so it stays readable but
         clearly subordinate to the main heading in both themes.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="mb-8">

      <!-- Back link — navigates to /dashboard -->
      <a
        rel="external"
        href="/dashboard"
        class="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide transition-colors mb-5 hover:text-[#FF3E00]"
        style="color: var(--text-faint)"
      >
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Dashboard
      </a>

      <!-- Orange eyebrow label — consistent with the rest of the app -->
      <div class="flex items-center gap-2.5 mb-4">
        <div class="w-4 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Account</span>
      </div>

      <!-- Main page title — uses the brand serif italic style -->
      <h1
        class="font-serif italic text-[clamp(28px,4vw,40px)] font-normal tracking-[-1.5px]"
        style="color: var(--text)"
      >
        Settings
      </h1>
    </div>

    <!-- ── Avatar row ────────────────────────────────────────────────────
         Shows the user's OAuth avatar if one exists, otherwise falls back
         to a monogram initial styled with the orange brand accent.
         Avatar uploads are not supported — the image is always pulled from
         the OAuth provider (GitHub or Google) at sign-in time.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-5 mb-8 pb-8" style="border-bottom: 1px solid var(--border)">

      {#if profile.avatar_url}
        <!-- OAuth avatar image -->
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          class="w-16 h-16 rounded-full"
          style="border: 1px solid var(--border2)"
        />
      {:else}
        <!-- Monogram fallback — first character of the display name -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center"
          style="background: var(--orange-faint); border: 1px solid var(--orange-muted)"
        >
          <span class="font-serif italic text-2xl text-[#FF3E00]">
            {profile.display_name[0].toUpperCase()}
          </span>
        </div>
      {/if}

      <div>
        <!-- Current display name shown as static text -->
        <div class="text-sm font-light mb-0.5" style="color: var(--text)">
          {profile.display_name}
        </div>
        <!-- Explains why there is no avatar upload control -->
        <div class="font-mono text-[10px]" style="color: var(--text-faint)">
          Avatar synced from GitHub or Google
        </div>
      </div>
    </div>

    <!-- ── Public profile link ───────────────────────────────────────────
         Displays the user's public profile URL and a copy-to-clipboard
         button. The URL is derived from the display name at render time;
         it updates live as they type in the display name field below.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="mb-8 pb-8" style="border-bottom: 1px solid var(--border)">

      <div class="flex items-center justify-between mb-2.5">
        <!-- Section label -->
        <div class="font-mono text-[10px] uppercase tracking-widest" style="color: var(--text-faint)">
          Your public profile
        </div>

        <!-- Opens the public profile page -->
        <a
          rel="external"
          href="/u/{profileSlug}"
          class="inline-flex items-center gap-1.5 font-mono text-[10px] transition-colors hover:text-[#FF3E00]"
          style="color: var(--text-faint)"
        >
          View profile
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

        <!-- Read-only URL display — truncates on small screens -->
        <div
          class="flex-1 rounded-xl px-5 py-3.5 font-mono text-[12px] truncate"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text-faint)"
        >
          http://localhost:5173/u/{profileSlug}
        </div>

        <!--
          Copy button
          ───────────
          Switches to an orange tint for 2 seconds after clicking to confirm
          the copy succeeded. The inline style ternary is necessary because
          Tailwind cannot dynamically reference CSS variables in class strings.
        -->
        <button
          type="button"
          onclick={copyLink}
          class="sm:flex-shrink-0 font-mono text-[11px] px-4 py-3.5 rounded-xl transition-all"
          style="
            color:      {copied ? '#FF3E00'             : 'var(--text-faint)'};
            border:     1px solid {copied ? 'rgba(255,62,0,0.3)' : 'var(--border)'};
            background: {copied ? 'var(--orange-faint)' : 'transparent'};
          "
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>

    <!-- ── Success banner ────────────────────────────────────────────────
         Rendered when the `updateProfile` server action returns { success: true }.
         SvelteKit re-populates `form` after every action response, so this
         appears immediately after a successful save without a full page reload.
    ──────────────────────────────────────────────────────────────────── -->
    {#if form?.success}
      <div
        class="mb-8 flex items-center gap-3 rounded-xl px-5 py-4"
        style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)"
      >
        <svg class="w-4 h-4 text-[#FF3E00] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span class="text-[#FF3E00] text-sm font-light">Profile updated successfully.</span>
      </div>
    {/if}

    <!-- ── Error banner ──────────────────────────────────────────────────
         Rendered when the `updateProfile` server action returns an error string.
         Common causes: display name already taken, validation failure, DB error.
    ──────────────────────────────────────────────────────────────────── -->
    {#if form?.error}
      <div
        class="mb-8 flex items-center gap-3 rounded-xl px-5 py-4"
        style="background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2)"
      >
        <svg class="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
        <span class="text-red-400 text-sm font-light">{form.error}</span>
      </div>
    {/if}

    <!-- ── Profile edit form ─────────────────────────────────────────────
         Submits to the `updateProfile` action in +page.server.ts.

         `use:enhance` upgrades the form to a fetch-based submission while
         keeping it functional without JavaScript. The callback sets `saving`
         to true during the request so the button shows a loading state, then
         calls `update()` to merge the action's response back into `form`.
    ──────────────────────────────────────────────────────────────────── -->
    <form
      method="POST"
      action="?/updateProfile"
      use:enhance={() => {
        saving = true;
        return async ({ update }) => {
          await update();
          saving = false;
        };
      }}
    >
      <div class="flex flex-col gap-5">

        <!-- ── Display name field ──────────────────────────────────────
             Required. Shown publicly on the user's profile page and
             used to build their profile URL slug.
             Max 50 characters — enforced both here and in the server action.
        ────────────────────────────────────────────────────────────── -->
        <div>
          <label
            for="display_name"
            class="block font-mono text-[10px] uppercase tracking-widest mb-2.5"
            style="color: var(--text-faint)"
          >
            Display name <span class="text-[#FF3E00]">*</span>
          </label>

          <input
            id="display_name"
            name="display_name"
            type="text"
            bind:value={displayName}
            placeholder="How you appear on the platform"
            maxlength="50"
            required
            class="w-full rounded-xl px-5 py-3.5 text-sm font-light focus:outline-none transition-colors"
            style="
              background: var(--surface);
              border:     1px solid var(--border2);
              color:      var(--text);
            "
          />

          <!-- Live character count + context hint -->
          <p class="text-xs font-mono mt-2" style="color: var(--text-faint)">
            Shown on your public profile and the platform · {displayName.length}/50
          </p>
        </div>

        <!-- ── Full name field ────────────────────────────────────────
             Optional. This value is printed verbatim on certificates,
             so users should enter it exactly as they want it to appear.
             Max 100 characters — enforced both here and server-side.
        ────────────────────────────────────────────────────────────── -->
        <div>
          <label
            for="full_name"
            class="block font-mono text-[10px] uppercase tracking-widest mb-2.5"
            style="color: var(--text-faint)"
          >
            Full name
            <!-- "(optional)" tag — overrides mono uppercase for readability -->
            <span class="font-light normal-case tracking-normal ml-1" style="color: var(--text-faint)">
              (optional)
            </span>
          </label>

          <input
            id="full_name"
            name="full_name"
            type="text"
            bind:value={fullName}
            placeholder="Your real name for certificates"
            maxlength="100"
            class="w-full rounded-xl px-5 py-3.5 text-sm font-light focus:outline-none transition-colors"
            style="
              background: var(--surface);
              border:     1px solid var(--border2);
              color:      var(--text);
            "
          />

          <!-- Live character count -->
          <p class="text-xs font-mono mt-2" style="color: var(--text-faint)">
            {fullName.length}/100
          </p>

          <!--
            Certificate name warning
            ────────────────────────
            Certificates are generated as static PDFs at exam-pass time and
            are not retroactively updated if the user changes their name later.
            This warning ensures users set their name correctly beforehand.
          -->
          <div
            class="mt-3 flex items-start gap-3 rounded-lg px-4 py-3"
            style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.15)"
          >
            <!-- Warning icon — slightly dimmed so it doesn't compete with the text -->
            <svg
              class="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF3E00]"
              style="opacity: 0.6"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            >
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>

            <p class="text-[12px] font-light leading-relaxed" style="color: var(--text-muted)">
              <!-- Orange lead-in draws attention to the key fact -->
              <span class="text-[#FF3E00]">This name is printed on your certificates.</span>
              Make sure it is correct before taking the final exam.
              Changing it after a cert is issued will not update existing certificates.
            </p>
          </div>
        </div>

        <!-- ── Save button row ────────────────────────────────────────
             Shows a dirty-state label on the left and the submit button
             on the right. The button is disabled in three cases:
               1. A save is already in flight (`saving`)
               2. No fields have changed (`!hasChanges`)
               3. The required display name field is blank (`!displayName.trim()`)
        ────────────────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between pt-1 gap-4">

          <!-- Dirty state indicator — subtle cue that changes are pending -->
          <span class="font-mono text-[10px]" style="color: var(--text-faint)">
            {#if hasChanges}
              Unsaved changes
            {:else}
              Up to date
            {/if}
          </span>

          <button
            type="submit"
            disabled={saving || !hasChanges || !displayName.trim()}
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {#if saving}
              <!-- Animated spinner shown while the action is in flight -->
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            {:else}
              Save changes
            {/if}
          </button>
        </div>

      </div>
    </form>

    <!-- ── Account / sign-out section ───────────────────────────────────
         Separated from the profile form by a top border.
         Sign-out is a standalone POST form so it works without JavaScript
         and never shares submit state with the profile form above.
    ──────────────────────────────────────────────────────────────────── -->
    <div class="mt-10 pt-8" style="border-top: 1px solid var(--border)">

      <!-- Section label -->
      <div class="font-mono text-[10px] uppercase tracking-widest mb-4" style="color: var(--text-faint)">
        Account
      </div>

      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-light mb-0.5" style="color: var(--text-muted)">Sign out</div>
          <!-- Clarifies that OAuth re-auth will be required -->
          <div class="font-mono text-[10px]" style="color: var(--text-faint)">
            You will need to sign in again with GitHub or Google
          </div>
        </div>

        <!--
          Sign-out form
          ─────────────
          Posts to /auth/logout which clears the Supabase session cookie
          and redirects to the landing page. A separate <form> element is
          used so submitting it never interferes with the profile form above.
        -->
        <form method="POST" action="/auth/logout">
          <button
            type="submit"
            class="font-mono text-[11px] px-4 py-2 rounded-lg transition-all hover:text-[#FF3E00] hover:border-[#FF3E00]/30"
            style="
              color:      var(--text-muted);
              border:     1px solid var(--border);
              background: transparent;
            "
          >
            Sign out
          </button>
        </form>
      </div>
    </div>

  </main>
</div>