<script lang="ts">
  import { Zap, Grid2x2, Lightbulb, Code2, BookOpen, type Icon } from 'lucide-svelte';

  const { data } = $props();

  const profile = $derived(data.profile);
  const tracks = $derived(data.tracks);
  const certificates = $derived(data.certificates);
  const attempts = $derived(data.attempts);

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

  const trackIcons: Record<string, { icon: typeof Icon; color: string }> = {
    'svelte-fundamentals': { icon: Zap,       color: '#FF3E00' },
    'sveltekit':           { icon: Grid2x2,   color: '#FF3E00' },
    'svelte-advanced':     { icon: Lightbulb, color: '#FF3E00' },
    'svelte-typescript':   { icon: Code2,     color: '#FF3E00' },
  };

  const fallbackIcon = { icon: BookOpen, color: '#FF3E00' };
</script>

<div class="min-h-screen bg-[#1c1c1c]">
  <main class="max-w-5xl mx-auto px-6 py-12">

    <!-- Welcome -->
    <div class="mb-12">
      <p class="text-[#FF3E00] font-mono text-xs tracking-widest uppercase mb-2">Dashboard</p>
      <h1 class="text-[#f0ede8] font-serif italic text-3xl mb-1">
        Welcome back, {profile.display_name}
      </h1>
      <p class="text-[#f0ede8]/40 text-sm font-light">
        {certificates.length} of {tracks.length} certificates earned
      </p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4 mb-12">
      <div class="bg-[#242424] border border-white/10 rounded-xl p-6">
        <div class="text-[#FF3E00] font-mono text-xs tracking-widest uppercase mb-3">Certificates</div>
        <div class="text-[#f0ede8] font-serif italic text-4xl">{certificates.length}</div>
        <div class="text-[#f0ede8]/30 text-xs mt-1 font-light">earned so far</div>
      </div>
      <div class="bg-[#242424] border border-white/10 rounded-xl p-6">
        <div class="text-[#FF3E00] font-mono text-xs tracking-widest uppercase mb-3">Tracks</div>
        <div class="text-[#f0ede8] font-serif italic text-4xl">{tracks.length}</div>
        <div class="text-[#f0ede8]/30 text-xs mt-1 font-light">total available</div>
      </div>
      <div class="bg-[#242424] border border-white/10 rounded-xl p-6">
        <div class="text-[#FF3E00] font-mono text-xs tracking-widest uppercase mb-3">Attempts</div>
        <div class="text-[#f0ede8] font-serif italic text-4xl">{attempts.length}</div>
        <div class="text-[#f0ede8]/30 text-xs mt-1 font-light">exam attempts</div>
      </div>
    </div>

    <!-- Tracks -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-[#f0ede8] font-serif italic text-xl">Your tracks</h2>
      <a rel="external" href="/tracks" class="text-[#FF3E00] text-xs font-mono hover:underline">
        View all →
      </a>
    </div>

    <div class="grid grid-cols-2 gap-4">
      {#each tracks as track (track.id)}
        {@const unlocked = isTrackUnlocked(track)}
        {@const cert = getCert(track.id)}
        {@const attempt = getTrackAttempt(track.id)}
        {@const { icon: IconComponent, color } = trackIcons[track.slug] ?? fallbackIcon}

        <div
          class="bg-[#242424] border rounded-xl p-6 relative overflow-hidden transition-all duration-200"
          class:opacity-50={!unlocked}
          style={cert
            ? 'border-color: rgba(255,62,0,0.3)'
            : unlocked
            ? 'border-color: rgba(255,255,255,0.1)'
            : 'border-color: rgba(255,255,255,0.05)'}
        >
          {#if cert}
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/20"></div>
          {/if}

          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FF3E00]/10">
              <IconComponent size={20} color={color} strokeWidth={1.75} />
            </div>
            {#if cert}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-[#FF3E00]/15 text-[#FF3E00] rounded-full">● Certified</span>
            {:else if !unlocked}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-white/5 text-[#f0ede8]/30 rounded-full">🔒 Locked</span>
            {:else if attempt}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-white/5 text-[#f0ede8]/50 rounded-full">In progress</span>
            {:else}
              <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-white/5 text-[#f0ede8]/30 rounded-full">Not started</span>
            {/if}
          </div>

          <h3 class="text-[#f0ede8] font-serif italic text-lg mb-2">{track.title}</h3>
          <p class="text-[#f0ede8]/40 text-xs font-light leading-relaxed mb-6">{track.description}</p>

          <div>
            {#if unlocked}
              <a
                rel="external"
                href="/tracks/{track.slug}"
                class="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF3E00] hover:underline"
              >{cert ? 'View certificate' : 'Start track'} →</a>
            {:else}
              <span class="text-xs font-mono text-[#f0ede8]/20">Complete previous track to unlock</span>
            {/if}
          </div>

        </div>
      {/each}
    </div>

  </main>
</div>