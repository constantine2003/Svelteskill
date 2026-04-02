<script lang="ts">
  const { data } = $props();

  const track = $derived(data.track);
  const modules = $derived(data.modules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const certificate = $derived(data.certificate);
  const attempts = $derived(data.attempts);
  const allPartsPassed = $derived(data.allPartsPassed);
  const allPartAssessments = $derived(data.allPartAssessments);

  const completedCount = $derived(
    modules.filter((m: { id: number }) => completedModuleIds.includes(m.id)).length
  );
  const totalCount = $derived(modules.length);

  // Progress counts modules + 4 part quizzes + exam = totalCount + 5 steps
  // Keep it simple: just show module progress, label it clearly
  const percent = $derived(
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  );

  const allModulesDone = $derived(completedCount === totalCount && totalCount > 0);

  // Only show "ready to certify" when ALL modules done AND all quizzes passed
  const readyForExam = $derived(allModulesDone && allPartsPassed && !certificate);

  function isCompleted(moduleId: number): boolean {
    return completedModuleIds.includes(moduleId);
  }

  function isPartQuizPassed(pi: number): boolean {
    return allPartAssessments.some(
      (pa: { part_index: number; passed: boolean }) => pa.part_index === pi && pa.passed
    );
  }

  const nextModule = $derived(
    modules.find((m: { id: number }) => !completedModuleIds.includes(m.id))
  );

  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  function getPartModules(pIdx: number) {
    return modules.filter((m: { order_index: number }) => {
      const oi = m.order_index;
      if (pIdx === 1) return oi <= 3;
      if (pIdx === 2) return oi <= 6 && oi > 3;
      if (pIdx === 3) return oi <= 9 && oi > 6;
      return oi > 9;
    });
  }
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
    <!-- Take exam CTA -->
    {#if readyForExam}
      <div class="bg-[#FF3E00]/[0.06] border border-[#FF3E00]/20 rounded-xl p-6 mb-8 flex items-center justify-between gap-6">
        <div>
          <div class="font-mono text-[10px] text-[#FF3E00] tracking-widest uppercase mb-1">Ready to certify</div>
          <p class="text-[#f0ede8]/60 text-sm font-light">
            All modules and quizzes complete. Take the final exam to earn your certificate.
          </p>
        </div>
        <a rel="external" href="/tracks/{track.slug}/exam"
          class="flex-shrink-0 inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
          Take exam →
        </a>
      </div>
    {:else if allModulesDone && !allPartsPassed && !certificate}
      <!-- Modules done but quizzes not all passed yet -->
      <div class="bg-white/[0.02] border border-white/8 rounded-xl p-6 mb-8 flex items-center justify-between gap-6">
        <div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 tracking-widest uppercase mb-1">Almost there</div>
          <p class="text-[#f0ede8]/40 text-sm font-light">
            All modules complete. Pass all 4 part quizzes to unlock the final exam.
          </p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          {#each [1, 2, 3, 4] as pi (pi)}
            <div class="w-6 h-6 rounded flex items-center justify-center
              {isPartQuizPassed(pi) ? 'bg-[#FF3E00]/20' : 'bg-white/6'}">
              {#if isPartQuizPassed(pi)}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else}
                <span class="font-mono text-[8px] text-[#f0ede8]/20">{pi}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {:else if !certificate && nextModule}
      <div class="mb-8 flex items-center justify-between">
        <p class="text-[#f0ede8]/30 text-sm font-light">
          {completedCount === 0 ? 'Start with the first module below' : 'Continue where you left off'}
        </p>
        <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all">
          {completedCount === 0 ? 'Start track' : 'Continue'} →
        </a>
      </div>
    {/if}

    <!-- Module list — grouped by part -->
    <div class="flex flex-col gap-6">
      {#each [1, 2, 3, 4] as pIdx (pIdx)}
        {@const pModules = getPartModules(pIdx)}
        {#if pModules.length > 0}
          {@const quizPassed = isPartQuizPassed(pIdx)}
          {@const partDoneCount = pModules.filter((m: { id: number }) => isCompleted(m.id)).length}

          <!-- Part header -->
          <div>
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[9px] text-[#FF3E00]/60 tracking-[2px] uppercase">Part {pIdx}</span>
                <span class="font-mono text-[9px] text-[#f0ede8]/20">— {partLabels[pIdx]}</span>
              </div>
              {#if quizPassed}
                <span class="font-mono text-[8px] text-[#FF3E00] bg-[#FF3E00]/10 px-1.5 py-0.5 rounded tracking-widest">✓ Quiz passed</span>
              {:else}
                <span class="font-mono text-[8px] text-[#f0ede8]/20">{partDoneCount}/{pModules.length}</span>
              {/if}
            </div>

            <!-- Modules -->
            <div class="flex flex-col gap-2">
              {#each pModules as module (module.id)}
                {@const completed = isCompleted(module.id)}
                {@const isNext = nextModule?.id === module.id}
                <a rel="external" href="/tracks/{track.slug}/modules/{module.slug}"
                  class="flex items-center gap-5 p-5 rounded-xl border transition-all group
                    {completed
                      ? 'bg-[#1c1c1c] border-white/8 hover:border-white/12'
                      : isNext
                      ? 'bg-[#FF3E00]/[0.04] border-[#FF3E00]/20 hover:border-[#FF3E00]/30'
                      : 'bg-[#1c1c1c] border-white/5 opacity-60 hover:opacity-80 hover:border-white/10'}">
                  <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    {completed ? 'bg-[#FF3E00]/15' : isNext ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
                    {#if completed}
                      <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    {:else}
                      <span class="font-mono text-[10px] text-[#f0ede8]/30">{String(module.order_index).padStart(2, '0')}</span>
                    {/if}
                  </div>
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
                  <svg class="w-4 h-4 text-[#f0ede8]/20 group-hover:text-[#f0ede8]/50 transition-colors flex-shrink-0"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </a>
              {/each}

              <!-- Quiz row -->
              <a rel="external"
                href={partDoneCount === pModules.length ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
                class="flex items-center gap-5 p-5 rounded-xl border transition-all group
                  {quizPassed
                    ? 'bg-[#1c1c1c] border-white/8 hover:border-white/12'
                    : partDoneCount === pModules.length
                    ? 'bg-[#FF3E00]/[0.04] border-[#FF3E00]/20 hover:border-[#FF3E00]/30'
                    : 'bg-[#1c1c1c] border-white/5 opacity-40 pointer-events-none'}">
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  {quizPassed ? 'bg-[#FF3E00]/15' : partDoneCount === pModules.length ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
                  {#if quizPassed}
                    <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 {partDoneCount === pModules.length ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-light {quizPassed ? 'text-[#f0ede8]/40' : partDoneCount === pModules.length ? 'text-[#f0ede8]' : 'text-[#f0ede8]/20'} group-hover:text-[#f0ede8] transition-colors">
                    Part {pIdx} Quiz
                  </div>
                  {#if quizPassed}
                    <div class="font-mono text-[9px] text-[#f0ede8]/25 mt-0.5">Completed</div>
                  {:else if partDoneCount === pModules.length}
                    <div class="font-mono text-[9px] text-[#FF3E00] mt-0.5">Ready to take</div>
                  {:else}
                    <div class="font-mono text-[9px] text-[#f0ede8]/20 mt-0.5">Complete all lessons first</div>
                  {/if}
                </div>
                <svg class="w-4 h-4 text-[#f0ede8]/20 group-hover:text-[#f0ede8]/50 transition-colors flex-shrink-0"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Bottom note -->
    <div class="mt-10 text-center">
      <p class="text-[#f0ede8]/20 text-xs font-mono">
        Complete all modules in a track + pass all quizzes + final exam to earn your certificate
      </p>
    </div>

  </main>
</div>