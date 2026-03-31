<script lang="ts">
  const { data } = $props();

  const track = $derived(data.track);
  const modules = $derived(data.modules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const certificate = $derived(data.certificate);
  const attempts = $derived(data.attempts);

  const completedCount = $derived(
    modules.filter((m: { id: number }) =>
      completedModuleIds.includes(m.id)
    ).length
  );

  const totalCount = $derived(modules.length);
  const percent = $derived(
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  );
  const allDone = $derived(completedCount === totalCount && totalCount > 0);

  function isCompleted(moduleId: number): boolean {
    return completedModuleIds.includes(moduleId);
  }

  // Find first incomplete module for "continue" button
  const nextModule = $derived(
    modules.find((m: { id: number }) => !completedModuleIds.includes(m.id))
  );
</script>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-[900px] mx-auto px-8 py-14">

    <!-- Back -->
    <a rel="external" href="/tracks"
      class="inline-flex items-center gap-2 text-[#f0ede8]/30 hover:text-[#f0ede8]/60 text-sm font-mono transition-colors mb-10">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      All tracks
    </a>

    <!-- Track header -->
    <div class="flex items-start justify-between gap-8 mb-12">
      <div class="flex-1">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Track {track.order_index} of 4
          </span>
        </div>
        <h1 class="font-serif italic text-[clamp(28px,4vw,44px)] font-normal tracking-[-1.5px] text-[#f0ede8] mb-3">
          {track.title}
        </h1>
        <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed max-w-lg">
          {track.description}
        </p>
      </div>

      <!-- Status card -->
      <div class="flex-shrink-0 bg-[#1c1c1c] border border-white/8 rounded-xl p-6 min-w-[200px]">
        {#if certificate}
          <div class="text-center">
            <div class="w-10 h-10 bg-[#FF3E00]/15 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-5 h-5 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
              </svg>
            </div>
            <div class="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase mb-1">Certified</div>
            <div class="font-serif italic text-sm text-[#f0ede8]/60">
              {new Date((certificate as unknown as { issued_at: string }).issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        {:else}
          <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-3">Progress</div>
          <div class="font-serif italic text-3xl text-[#f0ede8] mb-1">{percent}%</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 mb-3">
            {completedCount}/{totalCount} modules
          </div>
          <div class="w-full h-[3px] bg-white/6 rounded-full">
            <div
              class="h-full bg-[#FF3E00] rounded-full transition-all"
              style="width: {percent}%"
            ></div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Exam attempts -->
    {#if attempts.length > 0}
      <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5 mb-8">
        <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-3">
          Exam history
        </div>
        <div class="flex flex-col gap-2">
          {#each attempts as attempt (attempt.taken_at)}
            <div class="flex items-center justify-between">
              <span class="text-[#f0ede8]/40 text-xs font-light">
                {new Date((attempt as unknown as { taken_at: string }).taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div class="flex items-center gap-3">
                <span class="font-mono text-[11px] text-[#f0ede8]/50">{attempt.score}%</span>
                {#if attempt.passed}
                  <span class="font-mono text-[9px] bg-[#FF3E00]/12 text-[#FF3E00] px-2 py-0.5 rounded-full">Passed</span>
                {:else}
                  <span class="font-mono text-[9px] bg-white/5 text-[#f0ede8]/30 px-2 py-0.5 rounded-full">Failed</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Take exam CTA -->
    {#if allDone && !certificate}
      <div class="bg-[#FF3E00]/[0.06] border border-[#FF3E00]/20 rounded-xl p-6 mb-8 flex items-center justify-between gap-6">
        <div>
          <div class="font-mono text-[10px] text-[#FF3E00] tracking-widest uppercase mb-1">Ready to certify</div>
          <p class="text-[#f0ede8]/60 text-sm font-light">
            You have completed all {totalCount} modules. Take the final exam to earn your certificate.
          </p>
        </div>
        <a rel="external" href="/tracks/{track.slug}/exam"
          class="flex-shrink-0 inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
          Take exam →
        </a>
      </div>
    {:else if !certificate && nextModule}
      <div class="mb-8 flex items-center justify-between">
        <p class="text-[#f0ede8]/30 text-sm font-light">
          {completedCount === 0 ? 'Start with the first module below' : `Continue where you left off`}
        </p>
        <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all">
          {completedCount === 0 ? 'Start track' : 'Continue'} →
        </a>
      </div>
    {/if}

    <!-- Module list -->
    <div class="flex flex-col gap-2">
      {#each modules as module, i (module.id)}
        {@const completed = isCompleted(module.id)}
        {@const isNext = nextModule?.id === module.id}

        <a rel="external" href="/tracks/{track.slug}/modules/{module.slug}"
          class="flex items-center gap-5 p-5 rounded-xl border transition-all group
            {completed
              ? 'bg-[#1c1c1c] border-white/8 hover:border-white/12'
              : isNext
              ? 'bg-[#FF3E00]/[0.04] border-[#FF3E00]/20 hover:border-[#FF3E00]/30'
              : 'bg-[#1c1c1c] border-white/5 opacity-60 hover:opacity-80 hover:border-white/10'}"
        >
          <!-- Number / check -->
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            {completed ? 'bg-[#FF3E00]/15' : isNext ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
            {#if completed}
              <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            {:else}
              <span class="font-mono text-[10px] text-[#f0ede8]/30">{String(i + 1).padStart(2, '0')}</span>
            {/if}
          </div>

          <!-- Title -->
          <div class="flex-1 min-w-0">
            <div class="text-sm font-light text-[#f0ede8] {!completed && !isNext ? 'text-[#f0ede8]/40' : ''} group-hover:text-[#f0ede8] transition-colors">
              {module.title}
            </div>
            {#if isNext}
              <div class="font-mono text-[9px] text-[#FF3E00] mt-0.5">Up next</div>
            {:else if completed}
              <div class="font-mono text-[9px] text-[#f0ede8]/25 mt-0.5">Completed</div>
            {/if}
          </div>

          <!-- Arrow -->
          <svg class="w-4 h-4 text-[#f0ede8]/20 group-hover:text-[#f0ede8]/50 transition-colors flex-shrink-0"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>

        </a>
      {/each}
    </div>

  </main>
</div>