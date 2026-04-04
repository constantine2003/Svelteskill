<script lang="ts">
  /**
   * Dashboard page — shows the authenticated user's learning progress,
   * certificate count, and all available tracks with their current status.
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  import { Zap, Grid2x2, Lightbulb, Code2, BookOpen, type Icon } from 'lucide-svelte';

  const { data } = $props();

  // Destructure server data into reactive derived values so the UI
  // automatically updates if the parent data store ever changes.
  const profile      = $derived(data.profile);
  const tracks       = $derived(data.tracks);
  const certificates = $derived(data.certificates);
  const attempts     = $derived(data.attempts);

  /**
   * Returns true if the track is available for the user to take.
   * A track is unlocked when it has no prerequisite, or when the user
   * already holds a certificate for the prerequisite track.
   */
  function isTrackUnlocked(track: { id: number; prerequisite_track_id: number | null }): boolean {
    if (!track.prerequisite_track_id) return true;
    return certificates.some((c: { track_id: number | null }) => c.track_id === track.prerequisite_track_id);
  }

  /**
   * Returns the most recent attempt object for a given track, or undefined
   * if the user has never attempted it. Used to determine "In progress" state.
   */
  function getTrackAttempt(trackId: number) {
    return attempts.find((a: { track_id: number | null }) => a.track_id === trackId);
  }

  /**
   * Returns the certificate object for a given track, or undefined if the
   * user has not yet passed it. Certificates include an `issued_at` timestamp
   * used to display the completion date on the card footer.
   */
  function getCert(trackId: number) {
    return certificates.find((c: { track_id: number | null }) => c.track_id === trackId);
  }

  /**
   * Returns the total number of exam attempts the user has made for a track.
   * `track_id` is typed as `number | null` in the DB schema (nullable FK),
   * so we can't narrow to `number` in the filter callback — this helper
   * keeps that null-safe type explicit rather than casting in the template.
   */
  function getAttemptCount(trackId: number): number {
    return attempts.filter((a: { track_id: number | null }) => a.track_id === trackId).length;
  }

  /**
   * Formats an ISO date string into a short human-readable form, e.g. "Mar 12".
   * Returns an empty string for null/undefined inputs so callers don't need
   * to guard against rendering "undefined" in the DOM.
   */
  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Maps each track slug to its lucide-svelte icon and brand color.
   * Falls back to `fallbackIcon` for any slug not listed here, so adding
   * new tracks to the DB won't break the UI before this map is updated.
   */
  const trackIcons: Record<string, { icon: typeof Icon; color: string }> = {
    'svelte-fundamentals': { icon: Zap,       color: '#FF3E00' },
    'sveltekit':           { icon: Grid2x2,   color: '#FF3E00' },
    'svelte-advanced':     { icon: Lightbulb, color: '#FF3E00' },
    'svelte-typescript':   { icon: Code2,     color: '#FF3E00' },
  };

  // Used when a track slug has no entry in trackIcons above.
  const fallbackIcon = { icon: BookOpen, color: '#FF3E00' };

  // Formatted once at render time — no need to make this reactive.
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });
</script>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

    <!--
      Header
      Two-column on sm+: name/date on the left, overall progress fraction on the right.
      Stacks vertically on mobile.
    -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/[0.07]">
      <div>
        <!-- Orange dot + "Dashboard" label -->
        <p class="text-[#FF3E00] font-mono text-[10px] tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3E00]"></span>
          Dashboard
        </p>
        <h1 class="text-[#f0ede8] font-serif italic text-2xl sm:text-3xl mb-1 leading-tight">
          Welcome back, {profile.display_name}
        </h1>
        <p class="text-[#f0ede8]/30 text-xs font-mono">{today}</p>
      </div>

      <!-- Overall certificate progress shown as a large fraction -->
      <div class="sm:text-right">
        <p class="text-[#FF3E00] font-serif italic text-3xl sm:text-4xl leading-none">{certificates.length} / {tracks.length}</p>
        <p class="text-[#f0ede8]/30 text-xs font-mono mt-1">certificates earned</p>
      </div>
    </div>

    <!--
      Stats row
      Inline array keeps the three cards DRY. The key (stat.label) satisfies
      the svelte/require-each-key lint rule for stable DOM diffing.
    -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
      {#each [
        { label: 'Certificates', value: certificates.length, sub: 'earned so far' },
        { label: 'Tracks',       value: tracks.length,       sub: 'total available' },
        { label: 'Attempts',     value: attempts.length,     sub: 'exam attempts' },
      ] as stat (stat.label)}
        <div class="bg-[#212121] border border-white/[0.08] rounded-xl p-4 sm:p-6 group relative overflow-hidden">
          <!-- Accent bar slides in on hover via Tailwind group-hover -->
          <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FF3E00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <p class="text-[#FF3E00] font-mono text-[10px] tracking-widest uppercase mb-2 sm:mb-3">{stat.label}</p>
          <p class="text-[#f0ede8] font-serif italic text-3xl sm:text-4xl leading-none">{stat.value}</p>
          <p class="text-[#f0ede8]/25 text-[10px] sm:text-xs font-mono mt-1">{stat.sub}</p>
        </div>
      {/each}
    </div>

    <!-- Tracks section heading + "View all" link -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-[#f0ede8] font-serif italic text-lg sm:text-xl">Your tracks</h2>
      <a rel="external" href="/tracks" class="text-[#FF3E00] text-[11px] font-mono hover:underline">
        View all →
      </a>
    </div>

    <!--
      Track grid
      Single column on mobile, two columns on sm+.
      Each card derives its visual state from three flags: unlocked / cert / attempt.
    -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {#each tracks as track (track.id)}
        <!-- Resolve state for this track once, reused throughout the card -->
        {@const unlocked = isTrackUnlocked(track)}
        {@const cert     = getCert(track.id)}
        {@const attempt  = getTrackAttempt(track.id)}
        {@const { icon: IconComponent, color } = trackIcons[track.slug] ?? fallbackIcon}

        <div
          class="bg-[#212121] border rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all duration-200 group"
          class:opacity-40={!unlocked}
          class:hover:translate-y-[-1px]={unlocked}
          style={cert
            ? 'border-color: rgba(255,62,0,0.28)'    /* certified  → orange tint  */
            : unlocked
            ? 'border-color: rgba(255,255,255,0.08)' /* available  → subtle white */
            : 'border-color: rgba(255,255,255,0.04)'} /* locked     → near-hidden */
        >
          <!-- Thin orange gradient bar across the top for certified tracks -->
          {#if cert}
            <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
          {/if}

          <!-- Top row: icon on the left, status badge on the right -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-[#FF3E00]/10 shrink-0">
              <IconComponent size={18} {color} strokeWidth={1.75} />
            </div>

            <!--
              Status badge — four mutually exclusive states:
              certified > locked > in-progress > not started
            -->
            {#if cert}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-[#FF3E00]/12 text-[#FF3E00] rounded-full flex items-center gap-1">
                <span class="w-1 h-1 rounded-full bg-[#FF3E00] inline-block"></span>
                Certified
              </span>
            {:else if !unlocked}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/5 text-[#f0ede8]/25 rounded-full">
                Locked
              </span>
            {:else if attempt}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/5 text-[#f0ede8]/45 rounded-full">
                In progress
              </span>
            {:else}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/5 text-[#f0ede8]/25 rounded-full">
                Not started
              </span>
            {/if}
          </div>

          <!-- Track title and description -->
          <h3 class="text-[#f0ede8] font-serif italic text-base sm:text-lg mb-1.5 leading-snug">{track.title}</h3>
          <p class="text-[#f0ede8]/35 text-xs font-mono leading-relaxed mb-5">{track.description}</p>

          <!--
            Card footer — separated by a hairline border.
            Left: context-aware CTA link (or locked message).
            Right: completion date for certified tracks, attempt count for in-progress.
          -->
          <div class="flex items-center justify-between pt-3.5 border-t border-white/[0.06]">
            {#if unlocked}
              <a
                rel="external"
                href="/tracks/{track.slug}"
                class="inline-flex items-center gap-1 text-[11px] font-mono text-[#FF3E00] hover:underline"
              >
                {cert ? 'View certificate' : attempt ? 'Continue track' : 'Start track'} →
              </a>

              <!-- Right-side footer metadata -->
              {#if cert && cert.issued_at}
                <span class="text-[10px] font-mono text-[#f0ede8]/20">
                  Completed {formatDate(cert.issued_at)}
                </span>
              {:else if attempt}
                <span class="text-[10px] font-mono text-[#f0ede8]/20">
                  {getAttemptCount(track.id)} attempt{getAttemptCount(track.id) === 1 ? '' : 's'}
                </span>
              {/if}
            {:else}
              <span class="text-[11px] font-mono text-[#f0ede8]/18">Complete previous track to unlock</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

  </main>
</div>