<script lang="ts">
  /**
   * Track detail page — shows all modules grouped by part, progress,
   * certificate status, exam history, and the CTA for the final exam.
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  const { data } = $props();

  // ── Types ────────────────────────────────────────────────────────────────

  type TrackModule = {
    id: number;
    order_index: number;
    slug: string;
    title: string;
  };

  // ── Derived state ────────────────────────────────────────────────────────

  const track              = $derived(data.track);
  const modules            = $derived((data as typeof data & { modules: TrackModule[] }).modules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const certificate        = $derived(data.certificate);
  const attempts           = $derived(data.attempts);
  const allPartsPassed     = $derived(data.allPartsPassed);
  const allPartAssessments = $derived(data.allPartAssessments);

  const completedCount = $derived(
    modules.filter((m: { id: number }) => completedModuleIds.includes(m.id)).length
  );
  const totalCount = $derived(modules.length);

  /** 0–100 integer shown in the progress card. */
  const percent = $derived(
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  );

  const allModulesDone = $derived(completedCount === totalCount && totalCount > 0);

  /** True if the user has at least one passing attempt (cert may not exist yet). */
  const examPassed = $derived(attempts.some((a: { passed: boolean }) => a.passed));

  /**
   * The "Take exam" CTA is shown only when:
   *   - all modules are done
   *   - all 4 part quizzes are passed
   *   - no certificate has been issued yet
   *   - user hasn't already passed the exam (race-condition guard)
   */
  const readyForExam = $derived(allModulesDone && allPartsPassed && !certificate && !examPassed);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Returns true if the given module has been marked complete. */
  function isCompleted(moduleId: number): boolean {
    return completedModuleIds.includes(moduleId);
  }

  /** Returns true if the part quiz for the given part index has been passed. */
  function isPartQuizPassed(pi: number): boolean {
    return allPartAssessments.some(
      (pa: { part_index: number; passed: boolean }) => pa.part_index === pi && pa.passed
    );
  }

  /** The first incomplete module — used to drive the "Continue" CTA. */
  const nextModule = $derived(
    modules.find((m: { id: number }) => !completedModuleIds.includes(m.id))
  );

  /** Human-readable names for each of the four track parts. */
  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  /**
   * Returns the modules that belong to a given part index.
   * Partitioning is based on order_index ranges:
   *   Part 1 → 1–3 | Part 2 → 4–6 | Part 3 → 7–9 | Part 4 → 10+
   */
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

<svelte:head>
  <title>{track.title}</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg)">
  <main class="max-w-[900px] mx-auto px-4 sm:px-8 py-10 sm:py-14">

    <!-- ── Back link ────────────────────────────────────────────────────── -->
    <a rel="external" href="/tracks"
      class="inline-flex items-center gap-2 text-sm font-mono transition-colors mb-8 sm:mb-10"
      style="color: var(--text-faint)">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      All tracks
    </a>

    <!-- ── Track header ─────────────────────────────────────────────────── -->
    <!-- Mobile: always column. Desktop (sm+): row with status card on the right. -->
    <div class="flex flex-col gap-6 mb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:mb-12">
      <div class="flex-1">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Track {track.order_index} of 4
          </span>
        </div>
        <h1 class="font-serif italic text-[clamp(26px,6vw,44px)] font-normal tracking-[-1.5px] mb-3"
          style="color: var(--text)">
          {track.title}
        </h1>
        <p class="text-sm font-light leading-relaxed max-w-lg" style="color: var(--text-muted)">
          {track.description}
        </p>
      </div>

      <!-- Status card — full width on mobile, fixed-width sidebar on desktop -->
      <div class="w-full sm:w-auto sm:flex-shrink-0 sm:min-w-[200px] rounded-xl p-4 sm:p-6"
        style="background: var(--surface); border: 1px solid var(--border)">
        {#if certificate}
          <!-- Certified state -->
          <div class="flex items-center gap-4 sm:block sm:text-center">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3"
              style="background: var(--orange-muted)">
              <svg class="w-5 h-5 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
              </svg>
            </div>
            <div class="flex-1 sm:flex-none">
              <div class="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase mb-1">Certified</div>
              <div class="font-serif italic text-sm sm:mb-4" style="color: var(--text-muted)">
                {new Date((certificate as unknown as { issued_at: string }).issued_at)
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <a rel="external" href="/verify/{(certificate as unknown as { id: string }).id}"
              class="font-mono text-[10px] text-[#FF3E00] hover:underline transition-colors flex-shrink-0 sm:hidden">
              View →
            </a>
          </div>
          <!-- Desktop-only "View certificate" link -->
          <a rel="external" href="/verify/{(certificate as unknown as { id: string }).id}"
            class="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] text-[#FF3E00] hover:underline transition-colors">
            View certificate →
          </a>
        {:else}
          <!-- In-progress state — horizontal on mobile, vertical on desktop -->
          <div class="flex items-center justify-between gap-4 sm:block">
            <div>
              <div class="font-mono text-[10px] uppercase tracking-widest mb-1 sm:mb-3" style="color: var(--text-faint)">
                Progress
              </div>
              <div class="font-serif italic text-2xl sm:text-3xl mb-0.5 sm:mb-1" style="color: var(--text)">
                {percent}%
              </div>
              <div class="font-mono text-[10px] sm:mb-3" style="color: var(--text-faint)">
                {completedCount}/{totalCount} modules
              </div>
            </div>
            <!-- Circular progress ring — visible on mobile, hidden on desktop -->
            <svg class="flex-shrink-0 sm:hidden" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" fill="none" stroke="var(--surface2)" stroke-width="4"/>
              <circle cx="24" cy="24" r="18" fill="none" stroke="#FF3E00" stroke-width="4"
                stroke-dasharray="{(percent / 100) * 113} 113"
                stroke-linecap="round"
                transform="rotate(-90 24 24)"
                style="transition: stroke-dasharray 0.4s ease"/>
            </svg>
          </div>
          <!-- Progress bar — hidden on mobile (ring takes its place), shown on desktop -->
          <div class="hidden sm:block w-full h-[3px] rounded-full" style="background: var(--surface2)">
            <div class="h-full bg-[#FF3E00] rounded-full transition-all" style="width: {percent}%"></div>
          </div>
          <!-- Mobile: slim bar below the row -->
          <div class="mt-3 sm:hidden w-full h-[3px] rounded-full" style="background: var(--surface2)">
            <div class="h-full bg-[#FF3E00] rounded-full transition-all" style="width: {percent}%"></div>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── Exam history ──────────────────────────────────────────────────── -->
    {#if attempts.length > 0}
      <div class="rounded-xl p-4 sm:p-5 mb-6 sm:mb-8" style="background: var(--surface); border: 1px solid var(--border)">
        <div class="font-mono text-[10px] uppercase tracking-widest mb-3" style="color: var(--text-faint)">
          Exam history
        </div>
        <div class="flex flex-col gap-2">
          {#each attempts as attempt (attempt.taken_at)}
            <div class="flex items-center justify-between">
              <span class="text-xs font-light" style="color: var(--text-muted)">
                {new Date((attempt as unknown as { taken_at: string }).taken_at)
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="font-mono text-[11px]" style="color: var(--text-muted)">{attempt.score}%</span>
                {#if attempt.passed}
                  <span class="font-mono text-[9px] text-[#FF3E00] px-2 py-0.5 rounded-full"
                    style="background: var(--orange-muted)">Passed</span>
                {:else}
                  <span class="font-mono text-[9px] px-2 py-0.5 rounded-full"
                    style="background: var(--surface2); color: var(--text-faint)">Failed</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ── Action banners ────────────────────────────────────────────────── -->

    {#if certificate}
      <!-- Certificate earned banner -->
      <div class="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
        <div>
          <div class="font-mono text-[10px] text-[#FF3E00] tracking-widest uppercase mb-1">Certificate earned</div>
          <p class="text-sm font-light" style="color: var(--text-muted)">
            You completed this track on {new Date((certificate as unknown as { issued_at: string }).issued_at)
              .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>
        <a rel="external" href="/verify/{(certificate as unknown as { id: string }).id}"
          class="inline-flex items-center justify-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all w-full sm:w-auto sm:flex-shrink-0">
          View certificate →
        </a>
      </div>

    {:else if readyForExam}
      <!-- Ready for final exam banner -->
      <div class="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
        <div>
          <div class="font-mono text-[10px] text-[#FF3E00] tracking-widest uppercase mb-1">Ready to certify</div>
          <p class="text-sm font-light" style="color: var(--text-muted)">
            All modules and quizzes complete. Take the final exam to earn your certificate.
          </p>
        </div>
        <a rel="external" href="/tracks/{track.slug}/exam"
          class="inline-flex items-center justify-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all w-full sm:w-auto sm:flex-shrink-0">
          Take exam →
        </a>
      </div>

    {:else if allModulesDone && !allPartsPassed}
      <!-- All modules done but some part quizzes still pending -->
      <div class="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        style="background: var(--surface); border: 1px solid var(--border)">
        <div>
          <div class="font-mono text-[10px] uppercase tracking-widest mb-1" style="color: var(--text-faint)">
            Almost there
          </div>
          <p class="text-sm font-light" style="color: var(--text-muted)">
            All modules complete. Pass all 4 part quizzes to unlock the final exam.
          </p>
        </div>
        <!-- Part quiz progress indicators -->
        <div class="flex gap-2 sm:flex-shrink-0">
          {#each [1, 2, 3, 4] as pi (pi)}
            <div class="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center"
              style="background: {isPartQuizPassed(pi) ? 'var(--orange-muted)' : 'var(--surface2)'}">
              {#if isPartQuizPassed(pi)}
                <svg class="w-3.5 h-3.5 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else}
                <span class="font-mono text-[9px]" style="color: var(--text-faint)">{pi}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>

    {:else if nextModule}
      <!-- Default: continue / start CTA -->
      <div class="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-light" style="color: var(--text-faint)">
          {completedCount === 0 ? 'Start with the first module below' : 'Continue where you left off'}
        </p>
        <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
          class="inline-flex items-center justify-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all w-full sm:w-auto">
          {completedCount === 0 ? 'Start track' : 'Continue'} →
        </a>
      </div>
    {/if}

    <!-- ── Module list grouped by part ──────────────────────────────────── -->
    <div class="flex flex-col gap-5 sm:gap-6">
      {#each [1, 2, 3, 4] as pIdx (pIdx)}
        {@const pModules      = getPartModules(pIdx)}
        {#if pModules.length > 0}
          {@const quizPassed    = isPartQuizPassed(pIdx)}
          {@const partDoneCount = pModules.filter((m: { id: number }) => isCompleted(m.id)).length}

          <div>
            <!-- Part header row -->
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-mono text-[9px] text-[#FF3E00]/60 tracking-[2px] uppercase flex-shrink-0">
                  Part {pIdx}
                </span>
                <!-- Part label truncates on very narrow screens -->
                <span class="font-mono text-[9px] truncate" style="color: var(--text-faint)">
                  — {partLabels[pIdx]}
                </span>
              </div>
              {#if quizPassed}
                <span class="font-mono text-[8px] text-[#FF3E00] px-1.5 py-0.5 rounded tracking-widest flex-shrink-0 ml-2"
                  style="background: var(--orange-faint)">✓ Quiz passed</span>
              {:else}
                <span class="font-mono text-[8px] flex-shrink-0 ml-2" style="color: var(--text-faint)">
                  {partDoneCount}/{pModules.length}
                </span>
              {/if}
            </div>

            <!-- Module rows -->
            <div class="flex flex-col gap-2">
              {#each pModules as module (module.id)}
                {@const completed = isCompleted(module.id)}
                {@const isNext    = nextModule?.id === module.id}

                <a rel="external" href="/tracks/{track.slug}/modules/{module.slug}"
                  class="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-xl transition-all group"
                  class:opacity-60={!completed && !isNext}
                  style="
                    background: {isNext ? 'var(--orange-faint)' : 'var(--surface)'};
                    border: 1px solid {completed
                      ? 'var(--border)'
                      : isNext
                      ? 'rgba(255,62,0,0.2)'
                      : 'var(--border)'};
                  "
                >
                  <!-- Module icon -->
                  <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style="background: {completed ? 'var(--orange-muted)' : isNext ? 'var(--orange-faint)' : 'var(--surface2)'}">
                    {#if completed}
                      <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    {:else}
                      <span class="font-mono text-[10px]" style="color: var(--text-faint)">
                        {String(module.order_index).padStart(2, '0')}
                      </span>
                    {/if}
                  </div>

                  <!-- Module title + subtitle -->
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-light transition-colors leading-snug" style="color: var(--text)">
                      {module.title}
                    </div>
                    {#if isNext}
                      <div class="font-mono text-[9px] text-[#FF3E00] mt-0.5">Up next</div>
                    {:else if completed}
                      <div class="font-mono text-[9px] mt-0.5" style="color: var(--text-faint)">Completed</div>
                    {/if}
                  </div>

                  <!-- Chevron -->
                  <svg class="w-4 h-4 flex-shrink-0 transition-colors" style="color: var(--text-faint)"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </a>
              {/each}

              <!-- Part quiz row — locked until all modules in part are done -->
              <a rel="external"
                href={partDoneCount === pModules.length ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
                class="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-xl transition-all group"
                class:opacity-40={partDoneCount < pModules.length}
                class:pointer-events-none={partDoneCount < pModules.length}
                style="
                  background: {quizPassed ? 'var(--surface)' : partDoneCount === pModules.length ? 'var(--orange-faint)' : 'var(--surface)'};
                  border: 1px solid {quizPassed
                    ? 'var(--border)'
                    : partDoneCount === pModules.length
                    ? 'rgba(255,62,0,0.2)'
                    : 'var(--border)'};
                "
              >
                <!-- Quiz icon -->
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style="background: {quizPassed ? 'var(--orange-muted)' : partDoneCount === pModules.length ? 'var(--orange-faint)' : 'var(--surface2)'}">
                  {#if quizPassed}
                    <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4" style="color: {partDoneCount === pModules.length ? '#FF3E00' : 'var(--text-faint)'}"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  {/if}
                </div>

                <!-- Quiz label + subtitle -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-light transition-colors leading-snug"
                    style="color: {quizPassed ? 'var(--text-faint)' : partDoneCount === pModules.length ? 'var(--text)' : 'var(--text-faint)'}">
                    Part {pIdx} Quiz
                  </div>
                  {#if quizPassed}
                    <div class="font-mono text-[9px] mt-0.5" style="color: var(--text-faint)">Completed</div>
                  {:else if partDoneCount === pModules.length}
                    <div class="font-mono text-[9px] text-[#FF3E00] mt-0.5">Ready to take</div>
                  {:else}
                    <div class="font-mono text-[9px] mt-0.5" style="color: var(--text-faint)">Complete all lessons first</div>
                  {/if}
                </div>

                <!-- Chevron -->
                <svg class="w-4 h-4 flex-shrink-0 transition-colors" style="color: var(--text-faint)"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <!-- ── Footer note ──────────────────────────────────────────────────── -->
    <div class="mt-10 text-center px-4">
      <p class="text-xs font-mono leading-relaxed" style="color: var(--text-faint)">
        Complete all modules in a track + pass all quizzes + final exam to earn your certificate
      </p>
    </div>

  </main>
</div>