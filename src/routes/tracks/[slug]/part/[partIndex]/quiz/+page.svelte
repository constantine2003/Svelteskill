<script lang="ts">
  import { supabase } from '$lib/supabase/client';

  interface Track { id: number; slug: string; title: string }
  interface Module { id: number; slug: string; title: string; order_index: number }
  interface Question { id: number; question: string; options: string[] | string; correct_index: number; explanation: string | null; part_index: number }
  interface Assessment { passed: boolean; score: number }

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
    }
  }

  const { data }: Props = $props();

  const track = $derived(data.track);
  const partIndex = $derived(data.partIndex);
  const partLabel = $derived(data.partLabel);
  const questions = $derived(data.questions);
  const nextPartFirstModule = $derived(data.nextPartFirstModule);
  const isLastPart = $derived(data.isLastPart);
  const allModules = $derived(data.allModules);
  const completedModuleIds = $derived(data.completedModuleIds);

  let alreadyPassed = $state(false);
  let alreadyScore = $state<number | null>(null);

  $effect(() => {
    alreadyPassed = data.existingAssessment?.passed ?? false;
    alreadyScore = data.existingAssessment?.score ?? null;
  });

  let selectedAnswers = $state<Record<number, number>>({});
  let submitted = $state(false);
  let submitting = $state(false);
  let score = $state(0);
  let passed = $state(false);
  let correctCount = $state(0);

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

  async function submitQuiz() {
    if (!allAnswered || submitting) return;
    submitting = true;

    let correct = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correct_index) correct++;
    }

    correctCount = correct;
    score = Math.round((correct / questions.length) * 100);
    passed = score >= 80;
    submitted = true;
    submitting = false;

    await (supabase as unknown as { from: (t: string) => { upsert: (v: unknown) => Promise<unknown> } })
      .from('part_assessments')
      .upsert({
        user_id: data.userId,
        track_id: track.id,
        part_index: partIndex,
        score,
        passed
      });

    if (passed) {
      alreadyPassed = true;
      alreadyScore = score;
    }
  }

  function retryQuiz() {
    selectedAnswers = {};
    submitted = false;
    score = 0;
    passed = false;
    correctCount = 0;
  }

  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  function getPartIdx(orderIndex: number): number {
    if (orderIndex <= 3) return 1;
    if (orderIndex <= 6) return 2;
    if (orderIndex <= 9) return 3;
    return 4;
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
          {@const isActivePart = pIdx === partIndex}

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
            <span class="font-mono text-[8px] text-[#f0ede8]/20">{doneCount}/{pModules.length}</span>
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

          <!-- Quiz row -->
          <a rel="external" href={allDone ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group
              {isActivePart
                ? 'bg-[#FF3E00]/10 border border-[#FF3E00]/20'
                : allDone
                ? 'border border-transparent hover:bg-white/4'
                : 'border border-transparent opacity-40 cursor-not-allowed pointer-events-none'}">
            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
              {isActivePart ? 'bg-[#FF3E00]/20' : allDone ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
              {#if alreadyPassed && isActivePart}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else}
                <svg class="w-3 h-3 {isActivePart ? 'text-[#FF3E00]' : allDone ? 'text-[#FF3E00]/40' : 'text-[#f0ede8]/20'}"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {/if}
            </div>
            <span class="text-[12px] font-light
              {isActivePart ? 'text-[#f0ede8]' : allDone ? 'text-[#f0ede8]/35' : 'text-[#f0ede8]/20'}
              group-hover:text-[#f0ede8]/70 transition-colors">
              Part {pIdx} Quiz
            </span>
            {#if isActivePart}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/60 tracking-widest">
                {alreadyPassed ? '✓ PASSED' : 'ACTIVE'}
              </span>
            {/if}
          </a>

          {#if pIdx < 4}
            <div class="mx-3 mt-3 border-t border-white/5"></div>
          {/if}
        {/if}
      {/each}
    </nav>
  </aside>

  <!-- MAIN CONTENT -->
  <div class="flex-1 min-w-0 ml-[260px]">
    <main class="max-w-[760px] mx-auto px-8 py-14">

      <!-- Header -->
      <div class="mb-12">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Part {partIndex} of 4
          </span>
        </div>
        <h1 class="font-serif italic text-[clamp(28px,4vw,44px)] font-normal tracking-[-1.5px] text-[#f0ede8] mb-3">
          {partLabel}
        </h1>
        <p class="text-[#f0ede8]/40 text-sm font-light">
          {questions.length} questions · Score 80% or above to pass · Unlimited retakes
        </p>
      </div>

      <!-- Already passed banner -->
      {#if alreadyPassed && !submitted}
        <div class="bg-[#FF3E00]/[0.06] border border-[#FF3E00]/20 rounded-xl p-6 mb-10 flex items-center justify-between gap-6">
          <div>
            <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-1">
              Already passed — {alreadyScore}%
            </div>
            <p class="text-[#f0ede8]/50 text-sm font-light">
              You passed this quiz. You can retake it anytime or continue to the next part.
            </p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button
              onclick={retryQuiz}
              class="font-mono text-[11px] text-[#f0ede8]/40 hover:text-[#f0ede8]/70 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all">
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

      <!-- Score result -->
      {#if submitted}
        <div class="mb-10 p-8 rounded-xl border
          {passed ? 'bg-[#FF3E00]/[0.06] border-[#FF3E00]/20' : 'bg-white/[0.02] border-white/10'}">
          <div class="flex items-start justify-between gap-6">
            <div>
              <div class="font-mono text-[10px] uppercase tracking-widest mb-2
                {passed ? 'text-[#FF3E00]' : 'text-[#f0ede8]/30'}">
                {passed ? 'Passed!' : 'Not quite'}
              </div>
              <div class="font-serif italic text-[52px] text-[#f0ede8] leading-none tracking-[-2px] mb-2">
                {score}%
              </div>
              <div class="font-mono text-[11px] text-[#f0ede8]/30">
                {correctCount} of {questions.length} correct
                {#if !passed}
                  · need {Math.ceil(questions.length * 0.8) - correctCount} more correct to pass
                {/if}
              </div>
            </div>
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
                <button
                  onclick={retryQuiz}
                  class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                  Try again
                </button>
                <a rel="external" href="/tracks/{track.slug}"
                  class="font-mono text-[11px] text-[#f0ede8]/30 hover:text-[#f0ede8]/60 text-center transition-colors">
                  Review lessons
                </a>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Questions -->
      {#if !submitted || !passed}
        <div class="flex flex-col gap-10">
          {#each questions as question, qi (question.id)}
            {@const options = (Array.isArray(question.options)
              ? question.options
              : JSON.parse(question.options as string)) as string[]}
            {@const isCorrectOption = (oi: number) => submitted && oi === question.correct_index}
            {@const isWrongSelected = (oi: number) => submitted && selectedAnswers[question.id] === oi && oi !== question.correct_index}
            {@const isSelected = (oi: number) => selectedAnswers[question.id] === oi}

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
                    disabled={submitted}
                    class="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                      {isCorrectOption(oi)
                        ? 'bg-[#FF3E00]/10 border-[#FF3E00]/30 text-[#f0ede8]'
                        : isWrongSelected(oi)
                        ? 'bg-red-500/8 border-red-500/20 text-[#f0ede8]/40'
                        : isSelected(oi)
                        ? 'bg-white/8 border-white/25 text-[#f0ede8]'
                        : 'bg-transparent border-white/8 text-[#f0ede8]/50 hover:border-white/20 hover:bg-white/4 hover:text-[#f0ede8]/80'}
                      {submitted ? 'cursor-default' : 'cursor-pointer'}">
                    <div class="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center
                      {isCorrectOption(oi)
                        ? 'border-[#FF3E00] bg-[#FF3E00]/10'
                        : isWrongSelected(oi)
                        ? 'border-red-400'
                        : isSelected(oi)
                        ? 'border-[#f0ede8]/60'
                        : 'border-white/20'}">
                      {#if isCorrectOption(oi)}
                        <div class="w-2 h-2 rounded-full bg-[#FF3E00]"></div>
                      {:else if isSelected(oi) && !submitted}
                        <div class="w-2 h-2 rounded-full bg-[#f0ede8]/60"></div>
                      {/if}
                    </div>
                    <span class="text-[13px] font-light leading-snug">{option}</span>
                  </button>
                {/each}
              </div>

              {#if submitted && question.explanation}
                <div class="pl-10">
                  <div class="bg-white/[0.025] border border-white/8 rounded-xl px-5 py-4">
                    <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-2">
                      Explanation
                    </div>
                    <p class="text-[#f0ede8]/50 text-[13px] font-light leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Submit bar -->
        {#if !submitted}
          <div class="sticky bottom-0 mt-12 py-5 bg-[#1a1a1a] border-t border-white/8 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                {#each questions as q (q.id)}
                  <div class="w-1.5 h-1.5 rounded-full transition-colors
                    {isAnswered(q.id) ? 'bg-[#FF3E00]' : 'bg-white/15'}">
                  </div>
                {/each}
              </div>
              <span class="font-mono text-[10px] text-[#f0ede8]/25">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
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