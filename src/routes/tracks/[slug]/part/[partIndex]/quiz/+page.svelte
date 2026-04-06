<script lang="ts">
  /**
   * Part quiz page — presents shuffled multiple-choice questions for a track part,
   * grades the submission, saves the result to Supabase, and shows next-step CTAs.
   *
   * Features:
   *   - Fisher-Yates shuffle on options (correct_index remapped after shuffle)
   *   - Optimistic pass state update so sidebar reflects result immediately
   *   - Unlimited retakes (score is upserted, not inserted)
   *   - 80% threshold to pass
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';

  // ── Types ────────────────────────────────────────────────────────────────

  interface Track { id: number; slug: string; title: string }
  interface Module { id: number; slug: string; title: string; order_index: number }
  interface Question { id: number; question: string; options: string[] | string; correct_index: number; explanation: string | null; part_index: number }
  interface Assessment { passed: boolean; score: number }

  /** Question shape after shuffling — correct_index is remapped to match new option order. */
  interface ShuffledQuestion extends Omit<Question, 'correct_index'> {
    options: string[];
    correct_index: number;
  }

  interface Props {
    data: {
      track: Track;
      partIndex: number;
      partLabel: string;
      questions: Question[];
      existingAssessment: Assessment | null;
      nextPartFirstModule: { slug: string } | null;
      isLastPart: boolean;
      userId: string;
      allModules: Module[];
      completedModuleIds: (number | null)[];
      allPartsPassed: boolean;
      allPartAssessments: { part_index: number; passed: boolean }[];
    }
  }

  const { data }: Props = $props();

  // ── Derived state ────────────────────────────────────────────────────────

  const allPartAssessments  = $derived(data.allPartAssessments);
  const track               = $derived(data.track);
  const partIndex           = $derived(data.partIndex);
  const partLabel           = $derived(data.partLabel);
  const nextPartFirstModule = $derived(data.nextPartFirstModule);
  const isLastPart          = $derived(data.isLastPart);
  const allModules          = $derived(data.allModules);
  const completedModuleIds  = $derived(data.completedModuleIds);
  const allPartsPassed      = $derived(data.allPartsPassed);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Fisher-Yates shuffle — returns a new shuffled array without mutating the original.
   * Used once per question on page load so options are randomized each visit.
   */
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Shuffle each question's options on load.
   * After shuffling we remap correct_index to follow the correct answer
   * so grading still works regardless of option order.
   */
  const questions = $derived<ShuffledQuestion[]>(
    data.questions.map(q => {
      const options = (Array.isArray(q.options)
        ? q.options
        : JSON.parse(q.options as string)) as string[];

      const correctAnswer   = options[q.correct_index];
      const shuffledOptions = shuffle(options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

      return { ...q, options: shuffledOptions, correct_index: newCorrectIndex };
    })
  );

  /**
   * Maps order_index to part number using the same ranges as the module page:
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

  // ── Quiz state ───────────────────────────────────────────────────────────

  // Synced from server on mount — updated optimistically after a passing submission
  let alreadyPassed = $state(false);
  let alreadyScore  = $state<number | null>(null);

  $effect(() => {
    alreadyPassed = data.existingAssessment?.passed ?? false;
    alreadyScore  = data.existingAssessment?.score ?? null;
  });

  // Per-session quiz state — reset on retry
  let selectedAnswers = $state<Record<number, number>>({});
  let submitted       = $state(false);
  let submitting      = $state(false);
  let score           = $state(0);
  let passed          = $state(false);
  let correctCount    = $state(0);

  /** Record the user's selected option index for a question. */
  function selectAnswer(questionId: number, index: number) {
    if (submitted) return;
    selectedAnswers[questionId] = index;
  }

  function isAnswered(questionId: number): boolean {
    return selectedAnswers[questionId] !== undefined;
  }

  const answeredCount = $derived(Object.keys(selectedAnswers).length);

  /** True only when every question has a selected answer. */
  const allAnswered = $derived(
    questions.length > 0 &&
    questions.every((q: ShuffledQuestion) => isAnswered(q.id))
  );

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Grades the quiz client-side, saves the result via Supabase upsert,
   * and updates local pass state optimistically if the user passed.
   */
  async function submitQuiz() {
    if (!allAnswered || submitting) return;
    submitting = true;

    let correct = 0;
    for (const q of questions) {
      // correct_index was remapped after shuffle so this comparison is safe
      if (selectedAnswers[q.id] === q.correct_index) correct++;
    }

    correctCount = correct;
    score        = Math.round((correct / questions.length) * 100);
    passed       = score >= 80;
    submitted    = true;
    submitting   = false;

    // Upsert so retakes overwrite the previous score
    const { data: upsertData, error: upsertError } = await (supabase as unknown as {
      from: (t: string) => {
        upsert: (v: unknown, o: unknown) => Promise<{ data: unknown; error: unknown }>;
      };
    })
      .from('part_assessments')
      .upsert(
        { user_id: data.userId, track_id: track.id, part_index: partIndex, score, passed },
        { onConflict: 'user_id,track_id,part_index' }
      );

    console.log('[quiz] upsert result:', upsertData, '| error:', upsertError);

    if (passed) {
      // Optimistically update the sidebar pass state and sync server state
      alreadyPassed = true;
      alreadyScore  = score;
      await invalidate('supabase:auth');
    }
  }

  /**
   * Resets all quiz state so the user can retake.
   * Options stay in their current shuffled order on retry — if you want
   * fresh shuffles on each retry, move the shuffle logic into this function.
   */
  function retryQuiz() {
    selectedAnswers = {};
    submitted       = false;
    score           = 0;
    passed          = false;
    correctCount    = 0;
  }
</script>

<svelte:head>
  <title>{track.title} - Part {partIndex} Quiz | SvelteSkill</title>
</svelte:head>

<div class="flex min-h-screen" style="background: var(--bg)">

  <!-- ── Sidebar ───────────────────────────────────────────────────────────
       Same structure as the module page sidebar. The active quiz row is
       highlighted with an orange tint instead of a plain module row.
  ──────────────────────────────────────────────────────────────────────── -->
  <aside class="w-[260px] flex-shrink-0 flex flex-col fixed top-14 bottom-0 overflow-y-auto z-20"
    style="background: var(--bg); border-right: 1px solid var(--border)">

    <!-- Back link + track title -->
    <div class="p-5" style="border-bottom: 1px solid var(--border)">
      <a rel="external" href="/tracks/{track.slug}"
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
        {@const pModules     = allModules.filter(m => getPartIdx(m.order_index) === pIdx)}
        {#if pModules.length > 0}
          {@const doneCount    = pModules.filter(m => completedModuleIds.includes(m.id)).length}
          {@const allDone      = doneCount === pModules.length}
          {@const isActivePart = pIdx === partIndex}
          {@const quizPassed   = isActivePart
            ? alreadyPassed
            : allPartAssessments.some(pa => pa.part_index === pIdx && pa.passed)}

          <!-- Part label row -->
          <div class="flex items-center justify-between px-3 pt-4 pb-1.5 {pIdx > 1 ? 'mt-2' : ''}">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[9px] text-[#FF3E00]/60 tracking-[2px] uppercase">Part {pIdx}</span>
              <span class="font-mono text-[9px] tracking-wide" style="color: var(--text-muted)">— {partLabels[pIdx]}</span>
            </div>
            <span class="font-mono text-[8px]" style="color: var(--text-muted)">{doneCount}/{pModules.length}</span>
          </div>

          <!-- Module rows — no active state on this page, all are links back to modules -->
          {#each pModules as m (m.id)}
            {@const done = completedModuleIds.includes(m.id)}
            <a rel="external" href="/tracks/{track.slug}/modules/{m.slug}"
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
              <span class="text-[12px] leading-snug transition-colors"
                style="color: {done ? 'var(--text-muted)' : 'var(--text)'}; font-weight: 400">
                {m.title}
              </span>
            </a>
          {/each}

          <!-- Part quiz row — highlighted when this is the active quiz -->
          <a rel="external" href={allDone ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group"
            class:opacity-40={!isActivePart && !quizPassed && !allDone}
            class:pointer-events-none={!isActivePart && !quizPassed && !allDone}
            style="
              background: {isActivePart ? 'var(--orange-faint)' : !quizPassed && allDone ? 'var(--orange-faint)' : 'transparent'};
              border: 1px solid {isActivePart ? 'rgba(255,62,0,0.2)' : !quizPassed && allDone ? 'rgba(255,62,0,0.15)' : 'transparent'};
            ">

            <!-- Quiz icon: checkmark / plus-circle / lock -->
            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
              style="background: {quizPassed ? 'var(--orange-muted)' : isActivePart || allDone ? 'var(--orange-faint)' : 'var(--surface2)'}">
              {#if quizPassed}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else if isActivePart || allDone}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {:else}
                <svg class="w-3 h-3" style="color: var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              {/if}
            </div>

            <!-- Quiz label -->
            <span class="text-[12px] leading-snug transition-colors"
              style="color: {quizPassed ? 'rgba(255,62,0,0.7)' : isActivePart ? 'var(--text)' : allDone ? '#FF3E00' : 'var(--text-muted)'}">
              Part {pIdx} Quiz
            </span>

            <!-- Right-side status tag -->
            {#if isActivePart}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/60 tracking-widest">
                {quizPassed ? '✓ PASSED' : 'ACTIVE'}
              </span>
            {:else if quizPassed}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00] tracking-widest">✓</span>
            {:else if allDone}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/50 tracking-widest">START</span>
            {/if}
          </a>

          <!-- Divider between parts (skip after the last one) -->
          {#if pIdx < 4}
            <div class="mx-3 mt-3" style="border-top: 1px solid var(--border)"></div>
          {/if}
        {/if}
      {/each}

      <!-- Final exam entry — unlocked when all 4 part quizzes are passed -->
      <div class="mx-3 mt-3 mb-3" style="border-top: 1px solid var(--border)"></div>
      {#if allPartsPassed}
        <a rel="external" href="/tracks/{track.slug}/exam"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
          style="border: 1px solid transparent">
          <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
            style="background: var(--orange-faint)">
            <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
            </svg>
          </div>
          <span class="text-[12px] transition-colors" style="color: var(--text)">Final Exam</span>
        </a>
      {:else}
        <!-- Locked — not a link, dimmed via opacity -->
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-30">
          <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
            style="background: var(--surface2)">
            <svg class="w-3 h-3" style="color: var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <span class="text-[12px]" style="color: var(--text-muted)">Final Exam</span>
        </div>
      {/if}
    </nav>
  </aside>

  <!-- ── Main content ──────────────────────────────────────────────────────
       Contains the quiz header, optional already-passed banner,
       score result card (after submission), and the question list.
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="flex-1 min-w-0 ml-[260px]">
    <main class="max-w-[760px] mx-auto px-8 py-14">

      <!-- Quiz header -->
      <div class="mb-12">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Part {partIndex} of 4
          </span>
        </div>
        <h1 class="font-serif italic text-[clamp(28px,4vw,44px)] font-normal tracking-[-1.5px] mb-3"
          style="color: var(--text)">
          {partLabel}
        </h1>
        <p class="text-sm font-light" style="color: var(--text-muted)">
          {questions.length} questions · Score 80% or above to pass · Unlimited retakes
        </p>
      </div>

      <!-- Already-passed banner — shown on load if the user passed previously -->
      {#if alreadyPassed && !submitted}
        <div class="rounded-xl p-6 mb-10 flex items-center justify-between gap-6"
          style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
          <div>
            <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-1">
              Already passed — {alreadyScore}%
            </div>
            <p class="text-sm font-light" style="color: var(--text-muted)">
              You passed this quiz. You can retake it anytime or continue to the next part.
            </p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button
              onclick={retryQuiz}
              class="font-mono text-[11px] px-4 py-2 rounded-lg transition-all"
              style="color: var(--text-faint); border: 1px solid var(--border2)">
              Retake
            </button>
            {#if !isLastPart && nextPartFirstModule}
              <a rel="external" href="/tracks/{track.slug}/modules/{nextPartFirstModule.slug}"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                Continue →
              </a>
            {:else if isLastPart}
              <a rel="external" href="/tracks/{track.slug}/exam"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                Final Exam →
              </a>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Score result card — shown after submission -->
      {#if submitted}
        <div class="mb-10 p-8 rounded-xl"
          style="
            background: {passed ? 'var(--orange-faint)' : 'var(--surface)'};
            border: 1px solid {passed ? 'rgba(255,62,0,0.2)' : 'var(--border)'};
          ">
          <div class="flex items-start justify-between gap-6">
            <div>
              <!-- Pass / fail label -->
              <div class="font-mono text-[10px] uppercase tracking-widest mb-2"
                style="color: {passed ? '#FF3E00' : 'var(--text-faint)'}">
                {passed ? 'Passed!' : 'Not quite'}
              </div>
              <!-- Large score percentage -->
              <div class="font-serif italic text-[52px] leading-none tracking-[-2px] mb-2"
                style="color: var(--text)">
                {score}%
              </div>
              <div class="font-mono text-[11px]" style="color: var(--text-muted)">
                {correctCount} of {questions.length} correct
                {#if !passed}
                  · need {Math.ceil(questions.length * 0.8) - correctCount} more correct to pass
                {/if}
              </div>
            </div>

            <!-- Next-step CTA buttons -->
            <div class="flex flex-col gap-2 flex-shrink-0 pt-1">
              {#if passed}
                {#if !isLastPart && nextPartFirstModule}
                  <a rel="external" href="/tracks/{track.slug}/modules/{nextPartFirstModule.slug}"
                    class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                    Start Part {partIndex + 1} →
                  </a>
                {:else if isLastPart}
                  <a rel="external" href="/tracks/{track.slug}/exam"
                    class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                    Take Final Exam →
                  </a>
                {/if}
              {:else}
                <!-- Failed — retry or go back to review lessons -->
                <button onclick={retryQuiz}
                  class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                  Try again
                </button>
                <a rel="external" href="/tracks/{track.slug}"
                  class="font-mono text-[11px] text-center transition-colors"
                  style="color: var(--text-muted)">
                  Review lessons
                </a>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- ── Question list ────────────────────────────────────────────────
           Hidden after a passing submission (user sees result + next CTA).
           Still shown after a failed submission so the user can review answers.
      ──────────────────────────────────────────────────────────────────── -->
      {#if !submitted || !passed}
        <div class="flex flex-col gap-10">
          {#each questions as question, qi (question.id)}
            {@const options         = (Array.isArray(question.options) ? question.options : JSON.parse(question.options as string)) as string[]}
            {@const isCorrectOption = (oi: number) => submitted && oi === question.correct_index}
            {@const isWrongSelected = (oi: number) => submitted && selectedAnswers[question.id] === oi && oi !== question.correct_index}
            {@const isSelected      = (oi: number) => selectedAnswers[question.id] === oi}

            <div class="flex flex-col gap-4">

              <!-- Question text -->
              <div class="flex items-start gap-4">
                <!-- Zero-padded question index -->
                <span class="flex-shrink-0 font-mono text-[11px] rounded-md px-2 py-1 mt-0.5"
                  style="color: var(--text-faint); background: var(--surface2)">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                <p class="text-[15px] font-light leading-relaxed pt-0.5" style="color: var(--text)">
                  {question.question}
                </p>
              </div>

              <!-- Answer options -->
              <div class="flex flex-col gap-2 pl-10">
                {#each options as option, oi (oi)}
                  <!--
                    Option button — four visual states after submission:
                      correct     → orange tint
                      wrongSelected → red tint
                      selected (pre-submit) → white tint
                      default     → transparent, hover highlight
                  -->
                  <button
                    onclick={() => selectAnswer(question.id, oi)}
                    disabled={submitted}
                    class="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all {submitted ? 'cursor-default' : 'cursor-pointer'}"
                    style="
                      background: {isCorrectOption(oi)
                        ? 'var(--orange-faint)'
                        : isWrongSelected(oi)
                        ? 'rgba(239,68,68,0.06)'
                        : isSelected(oi)
                        ? 'var(--surface2)'
                        : 'transparent'};
                      border: 1px solid {isCorrectOption(oi)
                        ? 'rgba(255,62,0,0.3)'
                        : isWrongSelected(oi)
                        ? 'rgba(239,68,68,0.2)'
                        : isSelected(oi)
                        ? 'var(--border2)'
                        : 'var(--border)'};
                      color: {isCorrectOption(oi)
                        ? 'var(--text)'
                        : isWrongSelected(oi)
                        ? 'var(--text-faint)'
                        : 'var(--text)'};
                    ">

                    <!-- Radio dot -->
                    <div class="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center"
                      style="border-color: {isCorrectOption(oi)
                        ? '#FF3E00'
                        : isWrongSelected(oi)
                        ? 'rgba(239,68,68,0.6)'
                        : isSelected(oi)
                        ? 'var(--text-muted)'
                        : 'var(--border2)'}">
                      {#if isCorrectOption(oi)}
                        <div class="w-2 h-2 rounded-full bg-[#FF3E00]"></div>
                      {:else if isSelected(oi) && !submitted}
                        <div class="w-2 h-2 rounded-full" style="background: var(--text-muted)"></div>
                      {/if}
                    </div>

                    <span class="text-[13px] font-light leading-snug">{option}</span>
                  </button>
                {/each}
              </div>

              <!-- Explanation — shown after submission if available -->
              {#if submitted && question.explanation}
                <div class="pl-10">
                  <div class="rounded-xl px-5 py-4" style="background: var(--surface); border: 1px solid var(--border)">
                    <div class="font-mono text-[9px] uppercase tracking-widest mb-2" style="color: var(--text-muted)">
                      Explanation
                    </div>
                    <p class="text-[13px] font-light leading-relaxed" style="color: var(--text-muted)">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- ── Sticky submit bar ─────────────────────────────────────────
             Fixed to the bottom of the viewport while the quiz is active.
             Progress dots fill orange as questions are answered.
        ──────────────────────────────────────────────────────────────── -->
        {#if !submitted}
          <div class="sticky bottom-0 mt-12 py-5 flex items-center justify-between gap-4"
            style="background: var(--bg); border-top: 1px solid var(--border)">

            <!-- Answer progress dots + count -->
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                {#each questions as q (q.id)}
                  <div class="w-1.5 h-1.5 rounded-full transition-colors"
                    style="background: {isAnswered(q.id) ? '#FF3E00' : 'var(--border2)'}">
                  </div>
                {/each}
              </div>
              <span class="font-mono text-[10px]" style="color: var(--text-muted)">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            <!-- Submit button — disabled until all questions answered -->
            <button
              onclick={submitQuiz}
              disabled={!allAnswered || submitting}
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-8 py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {submitting ? 'Checking...' : 'Submit quiz'}
            </button>
          </div>
        {/if}
      {/if}

    </main>
  </div>

</div>