<script lang="ts">
  /**
   * Dashboard page — shows the authenticated user's learning progress,
   * certificate count, and all available tracks with their current status.
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  import { Zap, Grid2x2, Lightbulb, Code2, BookOpen, type Icon } from 'lucide-svelte';

  const { data } = $props();

  const profile      = $derived(data.profile);
  const tracks       = $derived(data.tracks);
  const certificates = $derived(data.certificates);
  const attempts     = $derived(data.attempts);

  function isTrackUnlocked(track: { id: number; prerequisite_track_id: number | null }): boolean {
    if (!track.prerequisite_track_id) return true;
    return certificates.some((c: { track_id: number | null }) => c.track_id === track.prerequisite_track_id);
  }

  function getTrackAttempt(trackId: number) {
    return attempts.find((a: { track_id: number | null }) => a.track_id === trackId);
  }

  function getCert(trackId: number) {
    return certificates.find((c: { track_id: number | null }) => c.track_id === trackId);
  }

  function getAttemptCount(trackId: number): number {
    return attempts.filter((a: { track_id: number | null }) => a.track_id === trackId).length;
  }

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const trackIcons: Record<string, { icon: typeof Icon; color: string }> = {
    'svelte-fundamentals': { icon: Zap,       color: '#FF3E00' },
    'sveltekit':           { icon: Grid2x2,   color: '#FF3E00' },
    'svelte-advanced':     { icon: Lightbulb, color: '#FF3E00' },
    'svelte-typescript':   { icon: Code2,     color: '#FF3E00' },
  };

  const fallbackIcon = { icon: BookOpen, color: '#FF3E00' };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg)">
  <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10 pb-6"
      style="border-bottom: 1px solid var(--border)">
      <div>
        <p class="text-[#FF3E00] font-mono text-[10px] tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3E00]"></span>
          Dashboard
        </p>
        <h1 class="font-serif italic text-2xl sm:text-3xl mb-1 leading-tight" style="color: var(--text)">
          Welcome back, {profile.display_name}
        </h1>
        <p class="text-xs font-mono" style="color: var(--text-faint)">{today}</p>
      </div>

      <div class="sm:text-right">
        <p class="text-[#FF3E00] font-serif italic text-3xl sm:text-4xl leading-none">
          {certificates.length} / {tracks.length}
        </p>
        <p class="text-xs font-mono mt-1" style="color: var(--text-faint)">certificates earned</p>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
      {#each [
        { label: 'Certificates', value: certificates.length, sub: 'earned so far' },
        { label: 'Tracks',       value: tracks.length,       sub: 'total available' },
        { label: 'Attempts',     value: attempts.length,     sub: 'exam attempts' },
      ] as stat (stat.label)}
        <div class="rounded-xl p-4 sm:p-6 group relative overflow-hidden transition-all duration-200"
          style="background: var(--surface); border: 1px solid var(--border)">
          <!-- Accent bar on hover -->
          <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FF3E00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <p class="text-[#FF3E00] font-mono text-[10px] tracking-widest uppercase mb-2 sm:mb-3">{stat.label}</p>
          <p class="font-serif italic text-3xl sm:text-4xl leading-none" style="color: var(--text)">{stat.value}</p>
          <p class="text-[10px] sm:text-xs font-mono mt-1" style="color: var(--text-faint)">{stat.sub}</p>
        </div>
      {/each}
    </div>

    <!-- Tracks heading -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-serif italic text-lg sm:text-xl" style="color: var(--text)">Your tracks</h2>
      <a rel="external" href="/tracks" class="text-[#FF3E00] text-[11px] font-mono hover:underline">
        View all →
      </a>
    </div>

    <!-- Track grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {#each tracks as track (track.id)}
        {@const unlocked = isTrackUnlocked(track)}
        {@const cert     = getCert(track.id)}
        {@const attempt  = getTrackAttempt(track.id)}
        {@const { icon: IconComponent, color } = trackIcons[track.slug] ?? fallbackIcon}

        <div
          class="rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all duration-200 group"
          class:opacity-40={!unlocked}
          class:hover:translate-y-[-1px]={unlocked}
          style="
            background: var(--surface);
            border: 1px solid {cert
              ? 'rgba(255,62,0,0.28)'
              : unlocked
              ? 'var(--border)'
              : 'var(--border)'};
          "
        >
          <!-- Orange top bar for certified tracks -->
          {#if cert}
            <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
          {/if}

          <!-- Top row: icon + status badge -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
              style="background: var(--orange-faint)">
              <IconComponent size={18} {color} strokeWidth={1.75} />
            </div>

            <!-- Status badge -->
            {#if cert}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 text-[#FF3E00]"
                style="background: var(--orange-muted)">
                <span class="w-1 h-1 rounded-full bg-[#FF3E00] inline-block"></span>
                Certified
              </span>
            {:else if !unlocked}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                style="background: var(--surface2); color: var(--text-faint)">
                Locked
              </span>
            {:else if attempt}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                style="background: var(--surface2); color: var(--text-muted)">
                In progress
              </span>
            {:else}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                style="background: var(--surface2); color: var(--text-faint)">
                Not started
              </span>
            {/if}
          </div>

          <!-- Title + description -->
          <h3 class="font-serif italic text-base sm:text-lg mb-1.5 leading-snug" style="color: var(--text)">
            {track.title}
          </h3>
          <p class="text-xs font-mono leading-relaxed mb-5" style="color: var(--text-muted)">
            {track.description}
          </p>

          <!-- Card footer -->
          <div class="flex items-center justify-between pt-3.5"
            style="border-top: 1px solid var(--border)">
            {#if unlocked}
              <a
                rel="external"
                href="/tracks/{track.slug}"
                class="inline-flex items-center gap-1 text-[11px] font-mono text-[#FF3E00] hover:underline"
              >
                {cert ? 'View certificate' : attempt ? 'Continue track' : 'Start track'} →
              </a>

              {#if cert && cert.issued_at}
                <span class="text-[10px] font-mono" style="color: var(--text-faint)">
                  Completed {formatDate(cert.issued_at)}
                </span>
              {:else if attempt}
                <span class="text-[10px] font-mono" style="color: var(--text-faint)">
                  {getAttemptCount(track.id)} attempt{getAttemptCount(track.id) === 1 ? '' : 's'}
                </span>
              {/if}
            {:else}
              <span class="text-[11px] font-mono" style="color: var(--text-faint)">
                Complete previous track to unlock
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

  </main>
</div>