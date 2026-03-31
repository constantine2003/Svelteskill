<script lang="ts">
  const { data } = $props();

  const tracks = $derived(data.tracks);
  const certificates = $derived(data.certificates);
  const attempts = $derived(data.attempts);
  const modules = $derived(data.modules);
  const progress = $derived(data.progress);

  function isUnlocked(track: { id: number; prerequisite_track_id: number | null }): boolean {
    if (!track.prerequisite_track_id) return true;
    return certificates.some((c: { track_id: number | null }) => c.track_id === track.prerequisite_track_id);
  }

  function getCert(trackId: number) {
    return certificates.find((c: { track_id: number | null }) => c.track_id === trackId);
  }

  function getAttempts(trackId: number) {
    return attempts.filter((a: { track_id: number | null }) => a.track_id === trackId);
  }

  function getModuleCount(trackId: number) {
    return modules.filter((m: { track_id: number | null }) => m.track_id === trackId).length;
  }

  function getCompletedCount(trackId: number) {
    return progress.filter((p: { module_id: number | null; modules: { track_id: number | null } | null }) =>
      p.modules?.track_id === trackId
    ).length;
  }

  function getProgressPercent(trackId: number) {
    const total = getModuleCount(trackId);
    if (total === 0) return 0;
    return Math.round((getCompletedCount(trackId) / total) * 100);
  }

  const trackMeta: Record<string, { icon: string; color: string }> = {
    'svelte-fundamentals': { icon: 'bolt', color: '#FF3E00' },
    'sveltekit':           { icon: 'grid', color: '#FF3E00' },
    'svelte-advanced':     { icon: 'bulb', color: '#FF3E00' },
    'svelte-typescript':   { icon: 'code', color: '#FF3E00' }
  };
</script>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-[1100px] mx-auto px-8 py-14">

    <!-- Header -->
    <div class="mb-14">
      <div class="flex items-center gap-2.5 mb-4">
        <div class="w-4 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Curriculum</span>
      </div>
      <h1 class="font-serif italic text-[clamp(32px,4vw,48px)] font-normal tracking-[-1.5px] text-[#f0ede8] mb-3">
        Your learning path
      </h1>
      <p class="text-[#f0ede8]/40 text-sm font-light max-w-md">
        Four tracks from zero to advanced. Complete each one in order — every cert earned unlocks the next.
      </p>
    </div>

    <!-- Tracks -->
    <div class="flex flex-col gap-4">
      {#each tracks as track, i (track.id)}
        {@const unlocked = isUnlocked(track)}
        {@const cert = getCert(track.id)}
        {@const trackAttempts = getAttempts(track.id)}
        {@const moduleCount = getModuleCount(track.id)}
        {@const completedCount = getCompletedCount(track.id)}
        {@const percent = getProgressPercent(track.id)}
        {@const meta = trackMeta[track.slug] ?? { icon: 'bolt', color: '#FF3E00' }}

        <div class="border rounded-xl overflow-hidden transition-all duration-200
          {cert ? 'border-[#FF3E00]/25 bg-[#FF3E00]/[0.02]' : unlocked ? 'border-white/8 bg-[#1c1c1c] hover:border-white/12' : 'border-white/5 bg-[#1c1c1c] opacity-50'}">

          <!-- Top bar for certified -->
          {#if cert}
            <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
          {/if}

          <div class="p-8 flex items-center gap-8">

            <!-- Number + icon -->
            <div class="flex-shrink-0 flex flex-col items-center gap-3">
              <div class="font-mono text-[11px] text-[#f0ede8]/20 tracking-widest">0{i + 1}</div>
              <div class="w-12 h-12 rounded-xl flex items-center justify-center
                {cert ? 'bg-[#FF3E00]/15' : unlocked ? 'bg-white/6' : 'bg-white/3'}">
                {#if meta.icon === 'bolt'}
                  <svg class="w-5 h-5 {unlocked ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                {:else if meta.icon === 'grid'}
                  <svg class="w-5 h-5 {unlocked ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                {:else if meta.icon === 'bulb'}
                  <svg class="w-5 h-5 {unlocked ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                {:else}
                  <svg class="w-5 h-5 {unlocked ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                {/if}
              </div>
            </div>

            <!-- Main content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h2 class="font-serif italic text-xl font-normal text-[#f0ede8] {!unlocked ? 'text-[#f0ede8]/40' : ''}">
                  {track.title}
                </h2>
                {#if cert}
                  <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-[#FF3E00]/12 text-[#FF3E00] rounded-full">
                    ● Certified
                  </span>
                {:else if !unlocked}
                  <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/4 text-[#f0ede8]/25 rounded-full">
                    Locked
                  </span>
                {:else if completedCount > 0}
                  <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/6 text-[#f0ede8]/50 rounded-full">
                    In progress
                  </span>
                {:else}
                  <span class="flex-shrink-0 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 bg-white/4 text-[#f0ede8]/30 rounded-full">
                    Not started
                  </span>
                {/if}
              </div>

              <p class="text-[#f0ede8]/35 text-sm font-light leading-relaxed mb-4 max-w-xl">
                {track.description}
              </p>

              <!-- Stats row -->
              <div class="flex items-center gap-6 mb-4">
                <span class="font-mono text-[10px] text-[#f0ede8]/25">
                  {moduleCount > 0 ? `${completedCount}/${moduleCount} modules` : 'No modules yet'}
                </span>
                {#if trackAttempts.length > 0}
                  <span class="font-mono text-[10px] text-[#f0ede8]/25">
                    {trackAttempts.length} exam attempt{trackAttempts.length > 1 ? 's' : ''}
                  </span>
                {/if}
                {#if cert}
                  <span class="font-mono text-[10px] text-[#FF3E00]/60">
                    Issued {new Date((cert as unknown as { issued_at: string }).issued_at ?? '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                {/if}
              </div>

              <!-- Progress bar (only if in progress) -->
              {#if unlocked && moduleCount > 0 && !cert}
                <div class="flex items-center gap-3 max-w-xs">
                  <div class="flex-1 h-[3px] bg-white/6 rounded-full">
                    <div
                      class="h-full bg-[#FF3E00] rounded-full transition-all"
                      style="width: {percent}%"
                    ></div>
                  </div>
                  <span class="font-mono text-[10px] text-[#f0ede8]/30">{percent}%</span>
                </div>
              {/if}
            </div>

            <!-- CTA -->
            <div class="flex-shrink-0">
              {#if cert}
                <a rel="external" href="/tracks/{track.slug}"
                  class="inline-flex items-center gap-2 font-mono text-[11px] text-[#FF3E00] hover:underline">
                  View track →
                </a>
              {:else if unlocked}
                <a rel="external" href="/tracks/{track.slug}"
                  class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-[13px] px-4 py-2 rounded-lg transition-all">
                  {completedCount > 0 ? 'Continue' : 'Start'} →
                </a>
              {:else}
                <div class="flex items-center gap-2 text-[#f0ede8]/20">
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

    <!-- Bottom note -->
    <div class="mt-10 text-center">
      <p class="text-[#f0ede8]/20 text-xs font-mono">
        Complete all modules in a track + pass the final exam to earn your certificate
      </p>
    </div>

  </main>
</div>