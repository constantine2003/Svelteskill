<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import { goto } from '$app/navigation';

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

  const track = $derived(data.track);
  const questions = $derived(data.questions);
  const attempts = $derived(data.attempts);
  const allModules = $derived(data.allModules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const partAssessments = $derived(data.partAssessments);

  // Exam state
  let started = $state(false);
  let submitted = $state(false);
  let submitting = $state(false);
  let selectedAnswers = $state<Record<number, number>>({});
  let score = $state(0);
  let passed = $state(false);
  let correctCount = $state(0);

  // Timer — 30 minutes
  let timeLeft = $state(30 * 60);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  function startExam() {
    started = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval!);
        submitExam();
      }
    }, 1000);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const timeWarning = $derived(timeLeft <= 300);

  function selectAnswer(questionId: number, index: number) {
    if (submitted) return;
    selectedAnswers[questionId] = index;
  }

  function isAnswered(questionId: number): boolean {
    return selectedAnswers[questionId] !== undefined;
  }

  const answeredCount = $derived(Object.keys(selectedAnswers).length);
  const allAnswered = $derived(
    questions.length > 0 &&
    questions.every((q: Question) => isAnswered(q.id))
  );

  async function submitExam() {
    if (submitting || submitted) return;  // ← also guard against submitted
    if (timerInterval) clearInterval(timerInterval);
    submitting = true;

    let correct = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correct_index) correct++;
    }

    correctCount = correct;
    score = Math.round((correct / questions.length) * 100);
    passed = score >= 80;

    await (supabase as unknown as {
      from: (t: string) => { insert: (v: unknown) => Promise<unknown> };
    })
      .from('exam_attempts')
      .insert({
        user_id: data.userId,
        track_id: track.id,
        score,
        passed,
        answers: selectedAnswers
      });

    submitted = true;   // ← set AFTER the save
    submitting = false;

    if (passed) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      await goto(`/tracks/${track.slug}/exam/result`);
    }
  }

  function getPartIdx(orderIndex: number): number {
    if (orderIndex <= 3) return 1;
    if (orderIndex <= 6) return 2;
    if (orderIndex <= 9) return 3;
    return 4;
  }

  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  function isPartPassed(pi: number): boolean {
    return partAssessments.some(pa => pa.part_index === pi && pa.passed);
  }
</script>

<div class="bg-[#1a1a1a] flex min-h-screen">

  <!-- SIDEBAR -->
  <aside class="w-[260px] flex-shrink-0 border-r border-white/8 flex flex-col fixed top-14 bottom-0 overflow-y-auto z-20 bg-[#1a1a1a]">
    <div class="p-5 border-b border-white/8">
      <a rel="external" href="/tracks/{track.slug}"
        class="inline-flex items-center gap-2 text-[#f0ede8]/30 hover:text-[#f0ede8]/60 font-mono text-[10px] tracking-wide transition-colors mb-3">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        {track.title}
      </a>
      <div class="font-serif italic text-sm text-[#f0ede8]/60">{track.title}</div>
    </div>

    <nav class="flex-1 p-3">
      {#each [1, 2, 3, 4] as pIdx (pIdx)}
        {@const pModules = allModules.filter(m => getPartIdx(m.order_index) === pIdx)}
        {#if pModules.length > 0}
          {@const doneCount = pModules.filter(m => completedModuleIds.includes(m.id)).length}
          {@const allDone = doneCount === pModules.length}
          {@const partPassed = isPartPassed(pIdx)}

          <!-- Part header -->
          <div class="flex items-center justify-between px-3 pt-4 pb-1.5 {pIdx > 1 ? 'mt-2' : ''}">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[9px] text-[#FF3E00]/60 tracking-[2px] uppercase">
                Part {pIdx}
              </span>
              <span class="font-mono text-[9px] text-[#f0ede8]/20 tracking-wide">
                — {partLabels[pIdx]}
              </span>
            </div>
            {#if partPassed}
              <span class="font-mono text-[8px] text-[#FF3E00] bg-[#FF3E00]/10 px-1.5 py-0.5 rounded tracking-widest">✓</span>
            {:else}
              <span class="font-mono text-[8px] text-[#f0ede8]/20">{doneCount}/{pModules.length}</span>
            {/if}
          </div>

          <!-- Modules -->
          {#each pModules as m (m.id)}
            {@const done = completedModuleIds.includes(m.id)}
            <a rel="external" href="/tracks/{track.slug}/modules/{m.slug}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group hover:bg-white/4 border border-transparent">
              <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
                {done ? 'bg-[#FF3E00]/20' : 'bg-white/4'}">
                {#if done}
                  <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {:else}
                  <span class="font-mono text-[8px] text-[#f0ede8]/20">
                    {String(m.order_index).padStart(2, '0')}
                  </span>
                {/if}
              </div>
              <span class="text-[12px] font-light leading-snug
                {done ? 'text-[#f0ede8]/40' : 'text-[#f0ede8]/35'}
                group-hover:text-[#f0ede8]/70 transition-colors">
                {m.title}
              </span>
            </a>
          {/each}

          <!-- Quiz link -->
          <a rel="external" href="/tracks/{track.slug}/part/{pIdx}/quiz"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group
              {allDone ? 'hover:bg-white/4 border border-transparent' : 'border border-transparent opacity-30 pointer-events-none'}">
            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
              {partPassed ? 'bg-[#FF3E00]/20' : 'bg-white/4'}">
              {#if partPassed}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else}
                <svg class="w-3 h-3 text-[#f0ede8]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {/if}
            </div>
            <span class="text-[12px] font-light text-[#f0ede8]/35 group-hover:text-[#f0ede8]/70 transition-colors">
              Part {pIdx} Quiz
            </span>
          </a>

          {#if pIdx < 4}
            <div class="mx-3 mt-3 border-t border-white/5"></div>
          {/if}
        {/if}
      {/each}

      <!-- Final exam (active) -->
      <div class="mx-3 mt-3 border-t border-white/5 mb-3"></div>
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#FF3E00]/10 border border-[#FF3E00]/20">
        <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center bg-[#FF3E00]/20">
          <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
          </svg>
        </div>
        <span class="text-[12px] font-light text-[#f0ede8]">Final Exam</span>
        <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/60 tracking-widest">ACTIVE</span>
      </div>
    </nav>
  </aside>

  <!-- MAIN CONTENT -->
  <div class="flex-1 min-w-0 ml-[260px]">

    {#if !started}
      <!-- PRE-EXAM SCREEN -->
      <main class="max-w-[640px] mx-auto px-8 py-20 text-center">

        <div class="flex items-center justify-center gap-2.5 mb-8">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Final Exam</span>
          <div class="w-4 h-px bg-[#FF3E00]"></div>
        </div>

        <h1 class="font-serif italic text-[clamp(32px,5vw,52px)] font-normal tracking-[-2px] text-[#f0ede8] mb-3 leading-tight">
          {track.title}
        </h1>
        <p class="font-serif italic text-lg text-[#f0ede8]/35 mb-12">
          Final Certification Exam
        </p>

        <!-- Info cards -->
        <div class="grid grid-cols-3 gap-3 mb-10">
          <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5">
            <div class="font-serif italic text-3xl text-[#f0ede8] mb-1">{questions.length}</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest">Questions</div>
          </div>
          <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5">
            <div class="font-serif italic text-3xl text-[#f0ede8] mb-1">80%</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest">To pass</div>
          </div>
          <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5">
            <div class="font-serif italic text-3xl text-[#f0ede8] mb-1">30m</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest">Time limit</div>
          </div>
        </div>

        <!-- Previous attempts -->
        {#if attempts.length > 0}
          <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5 mb-8 text-left">
            <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-3">
              Previous attempts
            </div>
            <div class="flex flex-col gap-2">
              {#each attempts.slice(0, 3) as attempt (attempt.taken_at)}
                <div class="flex items-center justify-between">
                  <span class="text-[#f0ede8]/40 text-xs font-light">
                    {new Date(attempt.taken_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
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

        <!-- Rules -->
        <div class="text-left bg-[#FF3E00]/[0.04] border border-[#FF3E00]/15 rounded-xl p-6 mb-10">
          <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-4">Before you begin</div>
          <ul class="space-y-2.5">
            {#each [
              'You have 30 minutes — the exam auto-submits when time runs out',
              'You need 80% or above to earn your certificate',
              'Questions are shuffled on every attempt',
              'You can retake the exam as many times as you need',
              'Make sure you have a stable internet connection'
            ] as rule, index (index)}
              <li class="flex items-baseline gap-3 text-[13px] text-[#f0ede8]/45 font-light">
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
        <p class="font-mono text-[10px] text-[#f0ede8]/20 mt-4">
          Timer starts when you click Begin
        </p>

      </main>

    {:else if submitted && !passed}
      <!-- FAILED SCREEN -->
      <main class="max-w-[640px] mx-auto px-8 py-20 text-center">

        <div class="flex items-center justify-center gap-2.5 mb-8">
          <div class="w-4 h-px bg-white/20"></div>
          <span class="font-mono text-[10px] text-[#f0ede8]/30 tracking-[2px] uppercase">Result</span>
          <div class="w-4 h-px bg-white/20"></div>
        </div>

        <div class="font-serif italic text-[80px] text-[#f0ede8] leading-none tracking-[-4px] mb-2">{score}%</div>
        <div class="font-mono text-[11px] text-[#f0ede8]/30 mb-1">{correctCount} of {questions.length} correct</div>
        <div class="font-mono text-[11px] text-[#f0ede8]/20 mb-12">
          Need {Math.ceil(questions.length * 0.8) - correctCount} more correct to pass
        </div>

        <!-- Missed questions review -->
        <div class="text-left mb-12">
          <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-4">
            Questions you missed
          </div>
          <div class="flex flex-col gap-4">
            {#each questions as question, qi (question.id)}
              {@const options = (Array.isArray(question.options)
                ? question.options
                : JSON.parse(question.options as string)) as string[]}
              {@const userAnswer = selectedAnswers[question.id]}
              {#if userAnswer !== question.correct_index}
                <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5 text-left">
                  <p class="text-[#f0ede8]/70 text-[13px] font-light mb-3">
                    <span class="font-mono text-[10px] text-[#f0ede8]/25 mr-2">Q{qi + 1}</span>
                    {question.question}
                  </p>
                  <div class="space-y-1.5">
                    {#if userAnswer !== undefined}
                      <div class="flex items-baseline gap-2 text-[12px] text-red-400/70 font-light">
                        <span class="font-mono text-[9px] flex-shrink-0">✗ Your answer:</span>
                        {options[userAnswer]}
                      </div>
                    {/if}
                    <div class="flex items-baseline gap-2 text-[12px] text-[#FF3E00]/80 font-light">
                      <span class="font-mono text-[9px] flex-shrink-0">✓ Correct:</span>
                      {options[question.correct_index]}
                    </div>
                    {#if question.explanation}
                      <p class="text-[#f0ede8]/35 text-[12px] font-light pt-2 border-t border-white/5 mt-2">
                        {question.explanation}
                      </p>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <button
          onclick={() => {
            selectedAnswers = {};
            submitted = false;
            score = 0;
            passed = false;
            correctCount = 0;
            timeLeft = 30 * 60;
            started = false;
          }}
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all">
          Try again →
        </button>

      </main>

    {:else}
      <!-- EXAM IN PROGRESS -->
      <div class="max-w-[760px] mx-auto px-8 py-10">

        <!-- Sticky header -->
        <div class="sticky top-14 z-30 bg-[#1a1a1a] border-b border-white/8 py-4 mb-10 flex items-center justify-between">
          <div>
            <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-0.5">Final Exam</div>
            <div class="font-serif italic text-sm text-[#f0ede8]/50">{track.title}</div>
          </div>
          <div class="flex items-center gap-5">
            <span class="font-mono text-[11px] text-[#f0ede8]/25">{answeredCount}/{questions.length}</span>
            <!-- Timer -->
            <div class="flex items-center gap-1.5 {timeWarning ? 'text-red-400' : 'text-[#f0ede8]/50'}">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span class="font-mono text-[13px] font-medium">{formatTime(timeLeft)}</span>
            </div>
            <button
              onclick={submitExam}
              disabled={!allAnswered || submitting}
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {submitting ? 'Submitting...' : 'Submit exam'}
            </button>
          </div>
        </div>

        <!-- Progress dots -->
        <div class="flex flex-wrap gap-1.5 mb-10">
          {#each questions as q, qi (q.id)}
            <div
              class="w-2 h-2 rounded-full transition-colors {isAnswered(q.id) ? 'bg-[#FF3E00]' : 'bg-white/12'}"
              title="Question {qi + 1}">
            </div>
          {/each}
        </div>

        <!-- Questions -->
        <div class="flex flex-col gap-12">
          {#each questions as question, qi (question.id)}
            {@const options = (Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options as string)) as string[]}
            {@const selected = (oi: number) => selectedAnswers[question.id] === oi}

            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-4">
                <span class="flex-shrink-0 font-mono text-[11px] text-[#f0ede8]/20 bg-white/4 rounded-md px-2 py-1 mt-0.5">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                <p class="text-[#f0ede8]/85 text-[15px] font-light leading-relaxed pt-0.5">
                  {question.question}
                </p>
              </div>

              <div class="flex flex-col gap-2 pl-10">
                {#each options as option, oi (oi)}
                  <button
                    onclick={() => selectAnswer(question.id, oi)}
                    class="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer
                      {selected(oi)
                        ? 'bg-white/8 border-white/25 text-[#f0ede8]'
                        : 'bg-transparent border-white/8 text-[#f0ede8]/50 hover:border-white/20 hover:bg-white/4 hover:text-[#f0ede8]/80'}">
                    <div class="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center
                      {selected(oi) ? 'border-[#f0ede8]/60' : 'border-white/20'}">
                      {#if selected(oi)}
                        <div class="w-2 h-2 rounded-full bg-[#f0ede8]/60"></div>
                      {/if}
                    </div>
                    <span class="text-[13px] font-light leading-snug">{option}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Bottom submit -->
        <div class="mt-16 pb-10 flex items-center justify-between border-t border-white/8 pt-6">
          <span class="font-mono text-[10px] text-[#f0ede8]/20">
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