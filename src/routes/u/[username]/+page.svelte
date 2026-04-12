<script lang="ts">
  /**
   * Public profile page — displays a learner's profile and earned certificates.
   *
   * Theming:
   *   All colors use CSS variables defined in app.css so the page responds
   *   correctly to both dark mode (:root) and light mode (:root.light).
   *
   * Data flow:
   *   `data` is passed in from the SvelteKit load() function and contains:
   *   - profile:      the learner's public profile row from Supabase
   *   - certificates: all certificates earned by this user, joined with track info
   *   - username:     the URL slug used to reach this page
   */

  interface Certificate {
    id: string;
    issued_at: string;
    full_name_on_cert: string;
    tracks: { title: string; slug: string; order_index: number } | null;
  }

  interface Profile {
    id: string;
    display_name: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  }

  interface Props {
    data: {
      profile: Profile;
      certificates: Certificate[];
      username: string;
    }
  }

  const { data }: Props = $props();

  // $derived so Svelte 5 reactively tracks changes to data
  const profile      = $derived(data.profile);
  const certificates = $derived(data.certificates);

  /** Formatted join date shown in the profile header (e.g. "April 2024"). */
  const joinedDate = $derived(
    new Date(profile.created_at).toLocaleDateString('en-US', {
      month: 'long', year: 'numeric'
    })
  );

  // Track ordering by slug — uncomment if you need to sort certificates
  // by curriculum order rather than issue date.
  // const trackOrder: Record<string, number> = {
  //   'svelte-fundamentals': 1,
  //   'sveltekit': 2,
  //   'svelte-advanced': 3,
  //   'svelte-typescript': 4
  // };
</script>

<svelte:head>
  <title>{profile.display_name} — SvelteSkill</title>
  <meta
    name="description"
    content="{profile.display_name} has earned {certificates.length} Svelte certificate{certificates.length !== 1 ? 's' : ''} on SvelteSkill."
  />
</svelte:head>

<!--
  Root wrapper
  ────────────
  Uses var(--bg) so the background responds to both dark and light themes
  defined in app.css.
-->
<div class="min-h-screen" style="background: var(--bg)">

  <!--
    Responsive container
    ────────────────────
    px-4 py-10 on mobile, px-8 py-14 on sm+ breakpoint.
  -->
  <main class="max-w-[760px] mx-auto px-4 py-10 sm:px-8 sm:py-14">

    <!-- ── Profile header ────────────────────────────────────────────────
         Shows the learner's avatar, display name, full name (if different),
         join date, and total certificate count.

         Layout: stacks vertically on mobile (flex-col), switches to a
         horizontal row on sm+ (sm:flex-row).
    ──────────────────────────────────────────────────────────────────── -->
    <div
      class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-10 sm:mb-14 pb-10 sm:pb-14"
      style="border-bottom: 1px solid var(--border)"
    >

      <!-- Avatar — falls back to a serif initial on an orange-tinted circle -->
      {#if profile.avatar_url}
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          class="w-20 h-20 rounded-full flex-shrink-0"
          style="border: 1px solid var(--border)"
        />
      {:else}
        <!-- Fallback avatar — first letter of display name, Svelte orange tint -->
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
          style="background: rgba(255,62,0,0.1); border: 1px solid rgba(255,62,0,0.2)"
        >
          <span class="font-serif italic text-3xl" style="color: #FF3E00">
            {profile.display_name[0].toUpperCase()}
          </span>
        </div>
      {/if}

      <!-- Name + metadata -->
      <div class="flex-1">

        <!-- Display name — clamps between 24px and 36px for responsive sizing -->
        <h1
          class="font-serif italic font-normal mb-1"
          style="font-size: clamp(24px,4vw,36px); letter-spacing: -1px; color: var(--text)"
        >
          {profile.display_name}
        </h1>

        <!-- Full name — only shown when it differs from the display name -->
        {#if profile.full_name && profile.full_name !== profile.display_name}
          <p class="text-sm font-light mb-3" style="color: var(--text-faint)">
            {profile.full_name}
          </p>
        {/if}

        <!-- Join date + certificate count
             flex-wrap + gap-y-2 ensures the row wraps gracefully on
             very narrow screens instead of overflowing. -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            class="font-mono text-[10px] uppercase tracking-widest"
            style="color: var(--text-faint)"
          >
            Joined {joinedDate}
          </span>
          <!-- Dot divider -->
          <span
            class="w-1 h-1 rounded-full"
            style="background: var(--border)"
          ></span>
          <span
            class="font-mono text-[10px] uppercase tracking-widest"
            style="color: var(--text-faint)"
          >
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
          </span>
        </div>

      </div>
    </div>

    <!-- ── Certificates section ───────────────────────────────────────────
         Lists all certificates earned by this learner, ordered by issue date.
         Each card shows the track name, issue date, a verified badge,
         and a link to the public verification page.
    ──────────────────────────────────────────────────────────────────── -->
    {#if certificates.length > 0}
      <div>

        <!-- Section label -->
        <div class="flex items-center gap-2.5 mb-8">
          <div class="w-4 h-px" style="background: #FF3E00"></div>
          <span
            class="font-mono text-[10px] tracking-[2px] uppercase"
            style="color: #FF3E00"
          >
            Certificates
          </span>
        </div>

        <!-- Certificate cards -->
        <div class="flex flex-col gap-4">
          {#each certificates as cert (cert.id)}
            <div
              class="rounded-xl overflow-hidden"
              style="background: var(--surface); border: 1px solid rgba(255,62,0,0.2)"
            >
              <!-- Orange accent bar at the top of each card -->
              <div
                class="h-[2px]"
                style="background: linear-gradient(to right, #FF3E00, rgba(255,62,0,0.1))"
              ></div>

              <!--
                Card body
                ─────────
                Stacks vertically on mobile (flex-col) so the track info
                and the action buttons don't get squeezed side-by-side.
                Switches to a horizontal space-between row on sm+.
                Padding is also reduced on mobile (p-4 → sm:p-6).
              -->
              <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">

                <div class="flex items-center gap-4">

                  <!-- Track order badge (e.g. "01", "02") -->
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style="background: rgba(255,62,0,0.1); border: 1px solid rgba(255,62,0,0.2)"
                  >
                    <span class="font-mono text-[11px]" style="color: #FF3E00">
                      0{cert.tracks?.order_index ?? '?'}
                    </span>
                  </div>

                  <div>
                    <!-- Track title -->
                    <div class="font-serif italic text-base mb-0.5" style="color: var(--text)">
                      {cert.tracks?.title ?? 'Unknown track'}
                    </div>
                    <!-- Issue date -->
                    <div class="font-mono text-[10px]" style="color: var(--text-faint)">
                      Issued {new Date(cert.issued_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  </div>

                </div>

                <!-- Verified badge + view link
                     flex-shrink-0 only applied on sm+ so the row doesn't
                     compress the badge text on narrow viewports. -->
                <div class="flex items-center gap-3 sm:flex-shrink-0">

                  <!-- Verified badge — pulsing dot signals the cert is live/checkable -->
                  <div class="flex items-center gap-1.5">
                    <div
                      class="w-1.5 h-1.5 rounded-full animate-pulse"
                      style="background: #FF3E00"
                    ></div>
                    <span
                      class="font-mono text-[9px] uppercase tracking-widest"
                      style="color: #FF3E00"
                    >
                      Verified
                    </span>
                  </div>

                  <!-- Link to public verification page -->
                  <a
                    rel="external"
                    href="/verify/{cert.id}"
                    class="font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style="color: var(--text-muted); border: 1px solid var(--border)"
                  >
                    View →
                  </a>

                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

    {:else}
      <!-- ── Empty state ─────────────────────────────────────────────────
           Shown when the learner hasn't earned any certificates yet.
      ──────────────────────────────────────────────────────────────────── -->
      <div class="text-center py-16">
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style="background: var(--surface); border: 1px solid var(--border)"
        >
          <svg
            class="w-6 h-6"
            style="color: var(--text-faint)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/>
            <circle cx="12" cy="8" r="5"/>
          </svg>
        </div>
        <p class="text-sm font-light mb-1" style="color: var(--text-muted)">
          No certificates yet
        </p>
        <p class="font-mono text-xs" style="color: var(--text-faint)">
          {profile.display_name} hasn't earned any certificates yet
        </p>
      </div>
    {/if}

    <!-- ── CTA for visitors ───────────────────────────────────────────────
         Shown at the bottom of every public profile to convert visitors
         into new learners. Links to the auth page to start sign-up.
         Top margin and padding reduced on mobile (mt-10 pt-8 → sm:mt-14 sm:pt-10).
    ──────────────────────────────────────────────────────────────────── -->
    <div
      class="mt-10 sm:mt-14 pt-8 sm:pt-10 text-center"
      style="border-top: 1px solid var(--border)"
    >
      <p class="text-sm font-light mb-4" style="color: var(--text-faint)">
        Want to earn your own Svelte certificate?
      </p>
      <a
        rel="external"
        href="/auth"
        class="inline-flex items-center gap-2 font-semibold text-sm px-6 py-2.5 rounded-lg transition-all hover:brightness-110"
        style="background: #FF3E00; color: #ffffff"
      >
        Start learning free →
      </a>
    </div>

  </main>
</div>