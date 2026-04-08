<script lang="ts">
  /**
   * Final exam page — presents timed multiple-choice questions for the full track.
   *
   * Features:
   *   - 30-minute countdown timer (auto-submits on expiry)
   *   - Pre-exam info screen with previous attempt history
   *   - Post-exam result: redirects to /exam/result on pass, shows review on fail
   *   - Answers saved to exam_attempts via Supabase insert
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';

  // ── Types ────────────────────────────────────────────────────────────────

  interface Track { id: number; slug: string; title: string }
  interface Module { id: number; slug: string; title: string; order_index: number }
  interface Question {
    id: number; question: string; options: string[] | string;
    correct_index: number; explanation: string | null;
  }
  interface Attempt { score: number; passed: boolean; taken_at: string }
  interface PartAssessment { part_index: number; passed: boolean }

  interface Props {
    data: {
      track: Track;
      questions: Question[];
      attempts: Attempt[];
      userId: string;
      allModules: Module[];
      completedModuleIds: (number | null)[];
      partAssessments: PartAssessment[];
    }
  }

  const { data }: Props = $props();

  // ── Derived state ────────────────────────────────────────────────────────

  const track              = $derived(data.track);
  const questions          = $derived(data.questions);
  const attempts           = $derived(data.attempts);
  const allModules         = $derived(data.allModules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const partAssessments    = $derived(data.partAssessments);

  // ── Exam state ───────────────────────────────────────────────────────────

  let started         = $state(false);
  let submitted       = $state(false);
  let submitting      = $state(false);
  let selectedAnswers = $state<Record<number, number>>({});
  let score           = $state(0);
  let passed          = $state(false);
  let correctCount    = $state(0);

  // ── Mobile sidebar state ─────────────────────────────────────────────────
  let sidebarOpen = $state(false);

  // ── Timer ────────────────────────────────────────────────────────────────

  /** 30-minute countdown in seconds. Auto-submits when it hits 0. */
  let timeLeft = $state(30 * 60);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  function startExam() {
    started = true;
    sidebarOpen = false;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval!);
        submitExam();
      }
    }, 1000);
  }

  /** Formats seconds into MM:SS display string. */
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /** True when under 5 minutes remain — triggers red timer color. */
  const timeWarning = $derived(timeLeft <= 300);

  // ── Quiz interactions ────────────────────────────────────────────────────

  function selectAnswer(questionId: number, index: number) {
    if (submitted) return;
    selectedAnswers[questionId] = index;
  }

  function isAnswered(questionId: number): boolean {
    return selectedAnswers[questionId] !== undefined;
  }

  const answeredCount = $derived(Object.keys(selectedAnswers).length);
  const allAnswered   = $derived(
    questions.length > 0 &&
    questions.every((q: Question) => isAnswered(q.id))
  );

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Grades the exam, saves the attempt to Supabase, then either redirects
   * to the result page (pass) or shows the failed screen with review (fail).
   * Guards against double-submission via the `submitted` flag.
   */
  async function submitExam() {
    if (submitting || submitted) return;
    if (timerInterval) clearInterval(timerInterval);
    submitting = true;

    let correct = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correct_index) correct++;
    }

    correctCount = correct;
    score        = Math.round((correct / questions.length) * 100);
    passed       = score >= 80;

    await (supabase as unknown as {
      from: (t: string) => { insert: (v: unknown) => Promise<unknown> };
    })
      .from('exam_attempts')
      .insert({ user_id: data.userId, track_id: track.id, score, passed, answers: selectedAnswers });

    submitted  = true;
    submitting = false;

    if (passed) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      await goto(`/tracks/${track.slug}/exam/result`);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Maps order_index to part number:
   *   Part 1 → 1–3 | Part 2 → 4–6 | Part 3 → 7–9 | Part 4 → 10+
   */
  function getPartIdx(orderIndex: number): number {
    if (orderIndex <= 3) return 1;
    if (orderIndex <= 6) return 2;
    if (orderIndex <= 9) return 3;
    return 4;
  }

  /** Human-readable names for each of the four track parts. */
  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  /** Returns true if the user has passed the quiz for a given part. */
  function isPartPassed(pi: number): boolean {
    return partAssessments.some(pa => pa.part_index === pi && pa.passed);
  }
</script>

<svelte:head>
  <title>{track.title} - Final Exam | SvelteSkill</title>
</svelte:head>

<div class="flex min-h-screen" style="background: var(--bg)">

  <!-- ── Mobile backdrop ───────────────────────────────────────────────────
       Dimmed overlay behind the drawer on mobile — tap to close.
  ──────────────────────────────────────────────────────────────────────── -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-black/40 z-30 md:hidden"
      role="button"
      tabindex="0"
      aria-label="Close sidebar"
      onclick={() => sidebarOpen = false}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') sidebarOpen = false; }}
    ></div>
  {/if}

  <!-- ── Mobile top bar ────────────────────────────────────────────────────
       Shown only on mobile. Displays "Final Exam" label and hamburger.
       Hidden during the exam itself to avoid obscuring the sticky header.
  ──────────────────────────────────────────────────────────────────────── -->
  {#if !started || submitted}
    <div class="fixed top-14 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
      style="background: var(--bg); border-bottom: 1px solid var(--border)">
      <span class="font-mono text-[11px] tracking-[2px] text-[#FF3E00] uppercase truncate pr-4">
        Final Exam · {track.title}
      </span>
      <button
        onclick={() => sidebarOpen = !sidebarOpen}
        class="flex-shrink-0 flex flex-col gap-[5px] p-2 rounded-lg transition-colors"
        style="color: var(--text)"
        aria-label="Toggle navigation">
        <span class="block w-5 h-px" style="background: currentColor"></span>
        <span class="block w-5 h-px" style="background: currentColor"></span>
        <span class="block w-5 h-px" style="background: currentColor"></span>
      </button>
    </div>
  {/if}

  <!-- ── Sidebar ───────────────────────────────────────────────────────────
       Fixed below the navbar (top-14). Same structure as module/quiz sidebars.
       The Final Exam entry is always shown as "ACTIVE" on this page.
       On mobile: hidden off-canvas by default, slides in as a drawer.
  ──────────────────────────────────────────────────────────────────────── -->
  <aside class="w-[260px] flex-shrink-0 flex flex-col fixed top-14 bottom-0 overflow-y-auto z-40
                transition-transform duration-200
                -translate-x-full md:translate-x-0
                {sidebarOpen ? '!translate-x-0' : ''}"
    style="background: var(--bg); border-right: 1px solid var(--border)">

    <!-- Back link + track title -->
    <div class="p-5" style="border-bottom: 1px solid var(--border)">
      <a rel="external" href="/tracks/{track.slug}"
        onclick={() => sidebarOpen = false}
        class="inline-flex items-center gap-2 font-mono text-[10px] tracking-wide transition-colors mb-3"
        style="color: var(--text-muted)">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        {track.title}
      </a>
      <div class="font-serif italic text-sm" style="color: var(--text)">{track.title}</div>
    </div>

    <nav class="flex-1 p-3">
      {#each [1, 2, 3, 4] as pIdx (pIdx)}
        {@const pModules  = allModules.filter(m => getPartIdx(m.order_index) === pIdx)}
        {#if pModules.length > 0}
          {@const doneCount  = pModules.filter(m => completedModuleIds.includes(m.id)).length}
          {@const allDone    = doneCount === pModules.length}
          {@const partPassed = isPartPassed(pIdx)}

          <!-- Part label row -->
          <div class="flex items-center justify-between px-3 pt-4 pb-1.5 {pIdx > 1 ? 'mt-2' : ''}">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[9px] text-[#FF3E00]/60 tracking-[2px] uppercase">Part {pIdx}</span>
              <span class="font-mono text-[9px] tracking-wide" style="color: var(--text-muted)">— {partLabels[pIdx]}</span>
            </div>
            {#if partPassed}
              <span class="font-mono text-[8px] text-[#FF3E00] px-1.5 py-0.5 rounded tracking-widest"
                style="background: var(--orange-faint)">✓</span>
            {:else}
              <span class="font-mono text-[8px]" style="color: var(--text-muted)">{doneCount}/{pModules.length}</span>
            {/if}
          </div>

          <!-- Module rows -->
          {#each pModules as m (m.id)}
            {@const done = completedModuleIds.includes(m.id)}
            <a rel="external" href="/tracks/{track.slug}/modules/{m.slug}"
              onclick={() => sidebarOpen = false}
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group"
              style="border: 1px solid transparent">
              <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                style="background: {done ? 'var(--orange-muted)' : 'var(--surface2)'}">
                {#if done}
                  <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {:else}
                  <span class="font-mono text-[8px]" style="color: var(--text-muted)">
                    {String(m.order_index).padStart(2, '0')}
                  </span>
                {/if}
              </div>
              <span class="text-[12px] font-light leading-snug transition-colors"
                style="color: {done ? 'var(--text-muted)' : 'var(--text)'}">
                {m.title}
              </span>
            </a>
          {/each}

          <!-- Part quiz link -->
          <a rel="external" href="/tracks/{track.slug}/part/{pIdx}/quiz"
            onclick={() => sidebarOpen = false}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group"
            class:opacity-30={!allDone}
            class:pointer-events-none={!allDone}
            style="border: 1px solid transparent">
            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
              style="background: {partPassed ? 'var(--orange-muted)' : 'var(--surface2)'}">
              {#if partPassed}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else}
                <svg class="w-3 h-3" style="color: var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {/if}
            </div>
            <span class="text-[12px] font-light transition-colors" style="color: var(--text-muted)">
              Part {pIdx} Quiz
            </span>
          </a>

          {#if pIdx < 4}
            <div class="mx-3 mt-3" style="border-top: 1px solid var(--border)"></div>
          {/if}
        {/if}
      {/each}

      <!-- Final exam — always active on this page -->
      <div class="mx-3 mt-3 mb-3" style="border-top: 1px solid var(--border)"></div>
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg"
        style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
        <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
          style="background: var(--orange-muted)">
          <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
          </svg>
        </div>
        <span class="text-[12px] font-light" style="color: var(--text)">Final Exam</span>
        <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/60 tracking-widest">ACTIVE</span>
      </div>
    </nav>
  </aside>

  <!-- ── Main content ──────────────────────────────────────────────────────
       Offset by sidebar width on desktop, full width on mobile.
       Three screens: pre-exam info → exam in progress → failed result.
       Passing redirects to /exam/result via goto().
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="flex-1 min-w-0 ml-0 md:ml-[260px]">

    {#if !started}
      <!-- ── Pre-exam screen ───────────────────────────────────────────── -->
      <main class="max-w-[640px] mx-auto px-6 md:px-8 pt-36 md:pt-20 pb-20 text-center">

        <div class="flex items-center justify-center gap-2.5 mb-8">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Final Exam</span>
          <div class="w-4 h-px bg-[#FF3E00]"></div>
        </div>

        <h1 class="font-serif italic text-[clamp(32px,5vw,52px)] font-normal tracking-[-2px] mb-3 leading-tight"
          style="color: var(--text)">
          {track.title}
        </h1>
        <p class="font-serif italic text-lg mb-12" style="color: var(--text-faint)">
          Final Certification Exam
        </p>

        <!-- Info cards: question count / pass threshold / time limit -->
        <div class="grid grid-cols-3 gap-3 mb-10">
          {#each [
            { value: String(questions.length), label: 'Questions' },
            { value: '80%',                    label: 'To pass'   },
            { value: '30m',                    label: 'Time limit'},
          ] as card (card.label)}
            <div class="rounded-xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
              <div class="font-serif italic text-3xl mb-1" style="color: var(--text)">{card.value}</div>
              <div class="font-mono text-[9px] uppercase tracking-widest" style="color: var(--text-faint)">{card.label}</div>
            </div>
          {/each}
        </div>

        <!-- Previous attempts — shown only if the user has attempted before -->
        {#if attempts.length > 0}
          <div class="rounded-xl p-5 mb-8 text-left" style="background: var(--surface); border: 1px solid var(--border)">
            <div class="font-mono text-[10px] uppercase tracking-widest mb-3" style="color: var(--text-faint)">
              Previous attempts
            </div>
            <div class="flex flex-col gap-2">
              {#each attempts.slice(0, 3) as attempt (attempt.taken_at)}
                <div class="flex items-center justify-between">
                  <span class="text-xs font-light" style="color: var(--text-muted)">
                    {new Date(attempt.taken_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <div class="flex items-center gap-3">
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

        <!-- Rules list -->
        <div class="text-left rounded-xl p-6 mb-10"
          style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.15)">
          <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-4">Before you begin</div>
          <ul class="space-y-2.5">
            {#each [
              'You have 30 minutes — the exam auto-submits when time runs out',
              'You need 80% or above to earn your certificate',
              'Questions are shuffled on every attempt',
              'You can retake the exam as many times as you need',
              'Make sure you have a stable internet connection'
            ] as rule, index (index)}
              <li class="flex items-baseline gap-3 text-[13px] font-light" style="color: var(--text-muted)">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>
                {rule}
              </li>
            {/each}
          </ul>
        </div>

        <button
          onclick={startExam}
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-base px-10 py-3.5 rounded-xl transition-all">
          Begin exam →
        </button>
        <p class="font-mono text-[10px] mt-4" style="color: var(--text-faint)">
          Timer starts when you click Begin
        </p>

      </main>

    {:else if submitted && !passed}
      <!-- ── Failed result screen ──────────────────────────────────────── -->
      <main class="max-w-[640px] mx-auto px-6 md:px-8 pt-36 md:pt-20 pb-20 text-center">

        <div class="flex items-center justify-center gap-2.5 mb-8">
          <div class="w-4 h-px" style="background: var(--border2)"></div>
          <span class="font-mono text-[10px] tracking-[2px] uppercase" style="color: var(--text-faint)">Result</span>
          <div class="w-4 h-px" style="background: var(--border2)"></div>
        </div>

        <!-- Large score display -->
        <div class="font-serif italic text-[80px] leading-none tracking-[-4px] mb-2" style="color: var(--text)">
          {score}%
        </div>
        <div class="font-mono text-[11px] mb-1" style="color: var(--text-faint)">
          {correctCount} of {questions.length} correct
        </div>
        <div class="font-mono text-[11px] mb-12" style="color: var(--text-faint)">
          Need {Math.ceil(questions.length * 0.8) - correctCount} more correct to pass
        </div>

        <!-- Missed questions review -->
        <div class="text-left mb-12">
          <div class="font-mono text-[10px] uppercase tracking-widest mb-4" style="color: var(--text-faint)">
            Questions you missed
          </div>
          <div class="flex flex-col gap-4">
            {#each questions as question, qi (question.id)}
              {@const options    = (Array.isArray(question.options)
                ? question.options
                : JSON.parse(question.options as string)) as string[]}
              {@const userAnswer = selectedAnswers[question.id]}
              {#if userAnswer !== question.correct_index}
                <div class="rounded-xl p-5 text-left" style="background: var(--surface); border: 1px solid var(--border)">
                  <p class="text-[13px] font-light mb-3" style="color: var(--text)">
                    <span class="font-mono text-[10px] mr-2" style="color: var(--text-faint)">Q{qi + 1}</span>
                    {question.question}
                  </p>
                  <div class="space-y-1.5">
                    {#if userAnswer !== undefined}
                      <div class="flex items-baseline gap-2 text-[12px] font-light" style="color: rgba(239,68,68,0.7)">
                        <span class="font-mono text-[9px] flex-shrink-0">✗ Your answer:</span>
                        {options[userAnswer]}
                      </div>
                    {/if}
                    <div class="flex items-baseline gap-2 text-[12px] font-light text-[#FF3E00]/80">
                      <span class="font-mono text-[9px] flex-shrink-0">✓ Correct:</span>
                      {options[question.correct_index]}
                    </div>
                    {#if question.explanation}
                      <p class="text-[12px] font-light pt-2 mt-2" style="color: var(--text-muted); border-top: 1px solid var(--border)">
                        {question.explanation}
                      </p>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Retry button -->
        <button
          onclick={() => {
            selectedAnswers = {};
            submitted  = false;
            score      = 0;
            passed     = false;
            correctCount = 0;
            timeLeft   = 30 * 60;
            started    = false;
          }}
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all">
          Try again →
        </button>

      </main>

    {:else}
      <!-- ── Exam in progress ──────────────────────────────────────────── -->
      <div class="max-w-[760px] mx-auto px-4 md:px-8 py-10">

        <!-- Sticky exam header — track title + answer count + timer + submit
             Uses top-14 on desktop (global navbar only).
             On mobile the mobile top bar is hidden during the exam, so top-14
             is still correct here — the sticky header itself takes that role. -->
        <div class="sticky top-14 z-30 py-4 mb-10"
          style="background: var(--bg); border-bottom: 1px solid var(--border)">
          <div class="flex items-center justify-between gap-3">
            <!-- Left: track info (hidden on very small screens to save space) -->
            <div class="hidden sm:block">
              <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-0.5">Final Exam</div>
              <div class="font-serif italic text-sm" style="color: var(--text-muted)">{track.title}</div>
            </div>
            <!-- Right: answer count + timer + submit -->
            <div class="flex items-center gap-3 sm:gap-5 ml-auto">
              <span class="font-mono text-[11px]" style="color: var(--text-faint)">
                {answeredCount}/{questions.length}
              </span>
              <!-- Timer — turns red under 5 minutes -->
              <div class="flex items-center gap-1.5"
                style="color: {timeWarning ? 'rgb(248,113,113)' : 'var(--text-muted)'}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <span class="font-mono text-[13px] font-medium">{formatTime(timeLeft)}</span>
              </div>
              <button
                onclick={submitExam}
                disabled={!allAnswered || submitting}
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-4 md:px-5 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Submit exam'}
              </button>
            </div>
          </div>
        </div>

        <!-- Progress dots — fill orange as questions are answered -->
        <div class="flex flex-wrap gap-1.5 mb-10">
          {#each questions as q, qi (q.id)}
            <div class="w-2 h-2 rounded-full transition-colors"
              style="background: {isAnswered(q.id) ? '#FF3E00' : 'var(--border2)'}"
              title="Question {qi + 1}">
            </div>
          {/each}
        </div>

        <!-- Question list -->
        <div class="flex flex-col gap-12">
          {#each questions as question, qi (question.id)}
            {@const options  = (Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options as string)) as string[]}
            {@const selected = (oi: number) => selectedAnswers[question.id] === oi}

            <div class="flex flex-col gap-4">

              <!-- Question text -->
              <div class="flex items-start gap-3 md:gap-4">
                <span class="flex-shrink-0 font-mono text-[11px] rounded-md px-2 py-1 mt-0.5"
                  style="color: var(--text-faint); background: var(--surface2)">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                <p class="text-[15px] font-light leading-relaxed pt-0.5" style="color: var(--text)">
                  {question.question}
                </p>
              </div>

              <!-- Answer options -->
              <div class="flex flex-col gap-2 pl-8 md:pl-10">
                {#each options as option, oi (oi)}
                  <button
                    onclick={() => selectAnswer(question.id, oi)}
                    class="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer"
                    style="
                      background: {selected(oi) ? 'var(--surface2)' : 'transparent'};
                      border: 1px solid {selected(oi) ? 'var(--border2)' : 'var(--border)'};
                      color: {selected(oi) ? 'var(--text)' : 'var(--text-muted)'};
                    ">
                    <!-- Radio dot -->
                    <div class="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center"
                      style="border-color: {selected(oi) ? 'var(--text-muted)' : 'var(--border2)'}">
                      {#if selected(oi)}
                        <div class="w-2 h-2 rounded-full" style="background: var(--text-muted)"></div>
                      {/if}
                    </div>
                    <span class="text-[13px] font-light leading-snug">{option}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Bottom submit bar -->
        <div class="mt-16 pb-10 flex items-center justify-between pt-6"
          style="border-top: 1px solid var(--border)">
          <span class="font-mono text-[10px]" style="color: var(--text-faint)">
            {answeredCount} of {questions.length} answered
          </span>
          <button
            onclick={submitExam}
            disabled={!allAnswered || submitting}
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {submitting ? 'Submitting...' : 'Submit exam →'}
          </button>
        </div>

      </div>
    {/if}

  </div>
</div>