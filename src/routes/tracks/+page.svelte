<script lang="ts">
  /**
   * Tracks page — displays all learning tracks with their current status,
   * progress, and certificate state for the authenticated user.
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  const { data } = $props();

  // ── Types ────────────────────────────────────────────────────────────────

  type Cert = {
    id: string;
    track_id: number | null;
    issued_at: string | null;
    full_name_on_cert: string;
  };

  type Attempt = {
    track_id: number | null;
    passed: boolean;
    score: number;
    taken_at: string | null;
  };

  type Module = {
    id: number;
    track_id: number | null;
    order_index: number;
  };

  type Progress = {
    module_id: number | null;
    completed_at: string | null;
    modules: { track_id: number | null } | null;
  };

  // ── Derived state ────────────────────────────────────────────────────────

  const tracks       = $derived(data.tracks);
  const certificates = $derived(data.certificates as Cert[]);
  $inspect(data.certificates);
  const attempts = $derived(data.attempts as Attempt[]);
  const modules  = $derived(data.modules as Module[]);
  const progress = $derived(data.progress as Progress[]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * A track is unlocked when it has no prerequisite, or when the user
   * already holds a certificate for the prerequisite track.
   */
  function isUnlocked(track: { id: number; prerequisite_track_id: number | null }): boolean {
    if (!track.prerequisite_track_id) return true;
    return certificates.some(c => c.track_id === track.prerequisite_track_id);
  }

  /** Returns the certificate for a given track, or undefined if not earned. */
  function getCert(trackId: number): Cert | undefined {
    return certificates.find(c => c.track_id === trackId);
  }

  /** Returns all exam attempts for a given track. */
  function getAttempts(trackId: number): Attempt[] {
    return attempts.filter(a => a.track_id === trackId);
  }

  /** Returns the total number of modules in a track. */
  function getModuleCount(trackId: number): number {
    return modules.filter(m => m.track_id === trackId).length;
  }

  /** Returns how many modules the user has completed in a track. */
  function getCompletedCount(trackId: number): number {
    return progress.filter(p => p.modules?.track_id === trackId).length;
  }

  /** Returns 0–100 percent completion for the progress bar. */
  function getProgressPercent(trackId: number): number {
    const total = getModuleCount(trackId);
    if (total === 0) return 0;
    return Math.round((getCompletedCount(trackId) / total) * 100);
  }

  /**
   * Formats an ISO date string into "Issued Month Day, Year".
   * Strips the time component before parsing to avoid timezone
   * shifting the displayed day.
   */
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Recently issued';
    const date = new Date(dateStr.split('T')[0] + 'T00:00:00');
    return `Issued ${date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })}`;
  }

  /**
   * Maps each track slug to an icon key and brand color.
   * Falls back to 'bolt' for any slug not listed here, so new tracks
   * added to the DB won't break the UI before this map is updated.
   */
  const trackMeta: Record<string, { icon: string; color: string }> = {
    'svelte-fundamentals': { icon: 'bolt',  color: '#FF3E00' },
    'sveltekit':           { icon: 'grid',  color: '#FF3E00' },
    'svelte-advanced':     { icon: 'bulb',  color: '#FF3E00' },
    'svelte-typescript':   { icon: 'code',  color: '#FF3E00' }
  };
</script>

<svelte:head>
  <title>Tracks</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg)">
  <main class="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

    <!-- ── Page header ──────────────────────────────────────────────────── -->
    <div class="mb-10 sm:mb-14">
      <div class="flex items-center gap-2.5 mb-4">
        <div class="w-4 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Curriculum</span>
      </div>
      <!-- clamp() keeps the heading readable on both small phones and wide desktop -->
      <h1
        class="font-serif italic font-normal tracking-[-1.5px] mb-3"
        style="font-size: clamp(26px, 5vw, 48px); color: var(--text)"
      >
        Your learning path
      </h1>
      <p class="text-sm font-light max-w-md" style="color: var(--text-muted)">
        Four tracks from zero to advanced. Complete each one in order — every cert earned unlocks the next.
      </p>
    </div>

    <!-- ── Track list ───────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-4">
      {#each tracks as track, i (track.id)}

        <!-- Resolve all state for this track once, reused throughout the card -->
        {@const unlocked       = isUnlocked(track)}
        {@const cert           = getCert(track.id)}
        {@const trackAttempts  = getAttempts(track.id)}
        {@const moduleCount    = getModuleCount(track.id)}
        {@const completedCount = getCompletedCount(track.id)}
        {@const percent        = getProgressPercent(track.id)}
        {@const meta           = trackMeta[track.slug] ?? { icon: 'bolt', color: '#FF3E00' }}

        <!--
          Track card
          Three visual states:
            certified  → orange-tinted border + subtle orange bg
            unlocked   → normal surface, hover lifts border opacity
            locked     → dimmed to 50% opacity

          Mobile layout note: the original horizontal three-column layout
          (number/icon | content | CTA) is replaced with a stacked vertical
          layout. The number/icon shares a row with the title/badge; stats,
          progress, and CTA each live in their own row below, indented to
          align with the title column (pl-14 sm:pl-16).
        -->
        <div
          class="rounded-xl overflow-hidden transition-all duration-200"
          class:opacity-50={!unlocked}
          style="
            background: var(--surface);
            border: 1px solid {cert
              ? 'rgba(255,62,0,0.25)'
              : 'var(--border)'};
          "
        >
          <!-- Orange top bar — only shown for certified tracks -->
          {#if cert}
            <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
          {/if}

          <!-- Reduced padding on mobile (p-5), roomier on sm+ (p-8) -->
          <div class="p-5 sm:p-8">

            <!-- ── Top row: number + icon + title + badge ──────────────── -->
            <div class="flex items-start gap-4 mb-4">

              <!-- Track number + icon -->
              <div class="flex-shrink-0 flex flex-col items-center gap-2 pt-0.5">
                <!-- Zero-padded track index -->
                <div class="font-mono text-[10px] tracking-widest" style="color: var(--text-faint)">
                  0{i + 1}
                </div>

                <!-- Icon container — slightly smaller on mobile (w-10/h-10) -->
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                  style="background: {cert ? 'var(--orange-muted)' : 'var(--surface2)'}"
                >
                  {#if meta.icon === 'bolt'}
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" style="color: {unlocked ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  {:else if meta.icon === 'grid'}
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" style="color: {unlocked ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  {:else if meta.icon === 'bulb'}
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" style="color: {unlocked ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" style="color: {unlocked ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                  {/if}
                </div>
              </div>

              <!-- Title + badge -->
              <div class="flex-1 min-w-0">
                <!--
                  flex-wrap lets the badge drop below the title on very narrow
                  screens rather than squishing both into one line
                -->
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <!-- clamp() scales the title smoothly across breakpoints -->
                  <h2
                    class="font-serif italic font-normal leading-snug"
                    style="font-size: clamp(16px, 3vw, 20px); color: {unlocked ? 'var(--text)' : 'var(--text-faint)'}"
                  >
                    {track.title}
                  </h2>

                  <!--
                    Status badge — four mutually exclusive states:
                    certified > locked > in-progress > not started
                  -->
                  {#if cert}
                    <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full text-[#FF3E00]"
                      style="background: var(--orange-muted)">
                      ● Certified
                    </span>
                  {:else if !unlocked}
                    <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style="background: var(--surface2); color: var(--text-faint)">
                      Locked
                    </span>
                  {:else if completedCount > 0}
                    <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style="background: var(--surface2); color: var(--text-muted)">
                      In progress
                    </span>
                  {:else}
                    <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style="background: var(--surface2); color: var(--text-faint)">
                      Not started
                    </span>
                  {/if}
                </div>

                <!-- Track description -->
                <p class="text-sm font-light leading-relaxed mt-1.5" style="color: var(--text-muted)">
                  {track.description}
                </p>
              </div>
            </div>

            <!-- Stats row: module count, attempt count, cert date -->
            <!-- pl-14/pl-16 keeps stats visually aligned under the title -->
            <div class="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 pl-14 sm:pl-16">
              <span class="font-mono text-[10px]" style="color: var(--text-faint)">
                {moduleCount > 0 ? `${completedCount}/${moduleCount} modules` : 'No modules yet'}
              </span>
              {#if trackAttempts.length > 0}
                <span class="font-mono text-[10px]" style="color: var(--text-faint)">
                  {trackAttempts.length} exam attempt{trackAttempts.length > 1 ? 's' : ''}
                </span>
              {/if}
              {#if cert}
                <span class="font-mono text-[10px] text-[#FF3E00]/70">
                  {formatDate(cert.issued_at)}
                </span>
              {/if}
            </div>

            <!-- Progress bar — only shown for unlocked, incomplete tracks -->
            {#if unlocked && moduleCount > 0 && !cert}
              <div class="flex items-center gap-3 pl-14 sm:pl-16 max-w-sm mb-4">
                <div class="flex-1 h-[3px] rounded-full" style="background: var(--surface2)">
                  <div
                    class="h-full bg-[#FF3E00] rounded-full transition-all"
                    style="width: {percent}%"
                  ></div>
                </div>
                <span class="font-mono text-[10px]" style="color: var(--text-faint)">{percent}%</span>
              </div>
            {/if}

            <!-- ── CTA button ───────────────────────────────────────────── -->
            <!--
              On mobile the Start/Continue button stretches full width (w-full)
              for a larger tap target; sm:w-auto restores inline sizing on
              larger screens. active:scale-[0.98] gives tactile tap feedback.
            -->
            <div class="pl-14 sm:pl-16">
              {#if cert}
                <!-- Certified: text link to view the track -->
                <a rel="external" href="/tracks/{track.slug}"
                  class="inline-flex items-center gap-2 font-mono text-[11px] text-[#FF3E00] hover:underline">
                  View track →
                </a>
              {:else if unlocked}
                <!-- Unlocked: solid orange CTA, full-width on mobile -->
                <a rel="external" href="/tracks/{track.slug}"
                  class="
                    inline-flex items-center justify-center gap-2
                    w-full sm:w-auto
                    bg-[#FF3E00] hover:brightness-110
                    text-white font-semibold text-[13px]
                    px-5 py-2.5 sm:py-2
                    rounded-lg transition-all
                    active:scale-[0.98]
                  "
                >
                  {completedCount > 0 ? 'Continue' : 'Start'} →
                </a>
              {:else}
                <!-- Locked: padlock indicator, not a link -->
                <div class="flex items-center gap-2" style="color: var(--text-faint)">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <span class="font-mono text-[10px]">Locked</span>
                </div>
              {/if}
            </div>

          </div>
        </div>
      {/each}
    </div>

    <!-- ── Footer note ──────────────────────────────────────────────────── -->
    <div class="mt-10 text-center px-4">
      <p class="text-xs font-mono leading-relaxed" style="color: var(--text-faint)">
        Complete all modules in a track + pass the final exam to earn your certificate
      </p>
    </div>

  </main>
</div>