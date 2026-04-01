<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';

  interface Track { slug: string; title: string; }
  interface Module { id: number; slug: string; title: string; order_index: number; content: string | null; }
  interface Question { id: number; question: string; options: string[] | string; correct_index: number; explanation: string | null; }

  interface Props {
    data: PageData & {
      track: Track;
      module: Module;
      allModules: Module[];
      completedModuleIds: number[];
      isCompleted: boolean;
      nextModule: Module | null;
      userId: string;
      partIndex: number;
      isLastInPart: boolean;
      allPartModulesCompleted: boolean;
      partAssessment: { passed: boolean; score: number } | null;
      partQuestions: Question[];
      partModules: Module[];
    };
  }

  const { data }: Props = $props();

  const track = $derived(data.track);
  const module = $derived(data.module);
  const allModules = $derived(data.allModules);
  const completedModuleIds = $derived(data.completedModuleIds);
  const nextModule = $derived(data.nextModule);
  const partIndex = $derived(data.partIndex);
  const isLastInPart = $derived(data.isLastInPart);
  const allPartModulesCompleted = $derived(data.allPartModulesCompleted);
  const partQuestions = $derived(data.partQuestions);

  let completedLocally = $state<boolean | null>(null);
  const isCompleted = $derived(completedLocally ?? data.isCompleted);

  let partAssessmentPassed = $state(false);
  let partAssessmentScore = $state<number | null>(null);
  $effect(() => {
    partAssessmentPassed = data.partAssessment?.passed ?? false;
    partAssessmentScore = data.partAssessment?.score ?? null;
  });

  // Quiz state
  let selectedAnswers = $state<Record<number, number>>({});
  let submitted = $state(false);
  let submitting = $state(false);
  let score = $state(0);
  let passed = $state(false);



  function selectAnswer(questionId: number, index: number) {
    if (submitted) return;
    selectedAnswers[questionId] = index;
  }

  function isAnswered(questionId: number): boolean {
    return selectedAnswers[questionId] !== undefined;
  }

  const allAnswered = $derived(
    partQuestions.length === 0 ||
    partQuestions.every((q: Question) => isAnswered(q.id))
  );

  async function submitPartQuiz() {
    if (!allAnswered || submitting) return;
    submitting = true;

    let correct = 0;
    for (const q of partQuestions) {
      if (selectedAnswers[q.id] === q.correct_index) correct++;
    }

    score = Math.round((correct / partQuestions.length) * 100);
    passed = score >= 80;
    submitted = true;
    submitting = false;

    // Save to part_assessments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('part_assessments')
      .upsert({
        user_id: data.userId,
        track_id: data.track.id,
        part_index: partIndex,
        score,
        passed
      });

    if (passed) {
      partAssessmentPassed = true;
      partAssessmentScore = score;
    }
  }

  function retryQuiz() {
    selectedAnswers = {};
    submitted = false;
    score = 0;
    passed = false;
  }

  async function markComplete() {
    if (isCompleted) return;
    const { error } = await supabase
      .from('user_progress')
      .insert({ user_id: data.userId, module_id: module.id });
    if (!error) {
      completedLocally = true;
      await invalidate('supabase:auth');
    }
  }

  function parseMarkdown(content: string): string {
    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    let result = content.replace(/```(\w*)\s*\n?([\s\S]*?)```/g, (_, _lang, code) => {
      const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const escaped = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    result = result.replace(/`([^`]+)`/g, (_, code) => {
      const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const safe = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      inlineCodes.push(`<code>${safe}</code>`);
      return `__INLINECODE_${inlineCodes.length - 1}__`;
    });

    result = result
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    result = result
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hpbuci]|<pre|<block|__)(.+)$/gm, '<p>$1</p>');

    result = result.replace(/__CODEBLOCK_(\d+)__/g, (_, i) => codeBlocks[Number(i)]);
    result = result.replace(/__INLINECODE_(\d+)__/g, (_, i) => inlineCodes[Number(i)]);

    return result;
  }

  const parsedContent = $derived(parseMarkdown(module.content ?? ''));

  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };
</script>

<div class="bg-[#1a1a1a] flex min-h-[calc(100vh-3.5rem)]">

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
        {@const pModules = allModules.filter(m => {
          const oi = m.order_index;
          if (pIdx === 1) return oi <= 3;
          if (pIdx === 2) return oi <= 6 && oi > 3;
          if (pIdx === 3) return oi <= 9 && oi > 6;
          return oi > 9;
        })}
        {#if pModules.length > 0}
          {@const doneCount = pModules.filter(m => completedModuleIds.includes(m.id)).length}
          {@const allDone = doneCount === pModules.length}
          {@const isActivePart = pModules.some(m => m.id === module.id)}
          {@const quizPassed = isActivePart ? partAssessmentPassed : false}

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
            <div class="flex items-center gap-1.5">
              {#if quizPassed}
                <span class="font-mono text-[8px] text-[#FF3E00] bg-[#FF3E00]/10 px-1.5 py-0.5 rounded tracking-widest">✓ PASSED</span>
              {:else if allDone}
                <span class="font-mono text-[8px] text-[#f0ede8]/30 bg-white/4 px-1.5 py-0.5 rounded tracking-widest">QUIZ</span>
              {:else}
                <span class="font-mono text-[8px] text-[#f0ede8]/20">{doneCount}/{pModules.length}</span>
              {/if}
            </div>
          </div>

          <!-- Modules in this part -->
          {#each pModules as m (m.id)}
            {@const done = completedModuleIds.includes(m.id)}
            {@const active = m.id === module.id}

            <a rel="external" href="/tracks/{track.slug}/modules/{m.slug}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group
                {active
                  ? 'bg-[#FF3E00]/10 border border-[#FF3E00]/20'
                  : 'hover:bg-white/4 border border-transparent'}">

              <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
                {done ? 'bg-[#FF3E00]/20' : active ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
                {#if done}
                  <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {:else}
                  <span class="font-mono text-[8px] {active ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}">
                    {String(m.order_index).padStart(2, '0')}
                  </span>
                {/if}
              </div>

              <span class="text-[12px] font-light leading-snug
                {active ? 'text-[#f0ede8]' : done ? 'text-[#f0ede8]/40' : 'text-[#f0ede8]/35'}
                group-hover:text-[#f0ede8]/70 transition-colors">
                {m.title}
              </span>
            </a>
          {/each}

          <!-- Divider between parts -->
          {#if pIdx < 4}
            <div class="mx-3 mt-3 border-t border-white/5"></div>
          {/if}
        {/if}
      {/each}
    </nav>
  </aside>

  <!-- MAIN CONTENT -->
  <div class="flex-1 min-w-0 ml-[260px]">
    <div class="max-w-[720px] mx-auto px-10 py-12">

      <!-- Module header -->
      <div class="mb-10">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Module {module.order_index} of {allModules.length}
          </span>
          {#if isCompleted}
            <span class="font-mono text-[9px] bg-[#FF3E00]/12 text-[#FF3E00] px-2 py-0.5 rounded-full tracking-widest uppercase">
              ✓ Completed
            </span>
          {/if}
        </div>
        <h1 class="font-serif italic text-[36px] font-normal tracking-[-1.5px] text-[#f0ede8] leading-tight">
          {module.title}
        </h1>
      </div>

      <!-- Lesson content — markdown is internal/server-generated, not user input -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div class="lesson-content mb-14
        [&_h1]:font-serif [&_h1]:italic [&_h1]:text-[32px] [&_h1]:font-normal [&_h1]:tracking-[-1px] [&_h1]:text-[#f0ede8] [&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:leading-[1.2]
        [&_h2]:font-serif [&_h2]:italic [&_h2]:text-[22px] [&_h2]:font-normal [&_h2]:text-[#f0ede8] [&_h2]:mb-3.5 [&_h2]:mt-9 [&_h2]:tracking-[-0.5px]
        [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-[#f0ede8]/80 [&_h3]:mb-2.5 [&_h3]:mt-7 [&_h3]:tracking-[0.2px]
        [&_p]:text-[15px] [&_p]:font-light [&_p]:text-[#f0ede8]/55 [&_p]:leading-[1.75] [&_p]:mb-4
        [&_strong]:text-[#f0ede8]/85 [&_strong]:font-medium
        [&_em]:text-[#f0ede8]/70 [&_em]:italic
        [&_code]:font-mono [&_code]:text-[12px] [&_code]:bg-[#FF3E00]/8 [&_code]:text-[#FF3E00] [&_code]:px-1.5 [&_code]:py-px [&_code]:rounded
        [&_pre]:bg-[#111] [&_pre]:border [&_pre]:border-white/8 [&_pre]:rounded-xl [&_pre]:px-6 [&_pre]:py-5 [&_pre]:overflow-x-auto [&_pre]:my-5
        [&_pre_code]:font-mono [&_pre_code]:text-[12.5px] [&_pre_code]:bg-transparent [&_pre_code]:text-[#abb2bf] [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:leading-[1.7]
        [&_blockquote]:border-l-2 [&_blockquote]:border-[#FF3E00] [&_blockquote]:pl-5 [&_blockquote]:pr-5 [&_blockquote]:py-3 [&_blockquote]:my-5 [&_blockquote]:bg-[#FF3E00]/4 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-[#f0ede8]/60 [&_blockquote]:text-sm
        [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:pl-5 [&_ol]:mb-4
        [&_li]:text-[14px] [&_li]:font-light [&_li]:text-[#f0ede8]/55 [&_li]:leading-[1.7] [&_li]:mb-1.5">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html parsedContent}
      </div>

      <!-- BOTTOM ACTION AREA -->
      <div class="border-t border-white/8 pt-10 mt-14">

        {#if !isCompleted}
          <!-- Mark complete button -->
          <div class="flex items-center justify-between">
            <p class="text-[#f0ede8]/30 text-sm font-light">
              Finished reading? Mark this lesson as complete.
            </p>
            <button
              onclick={markComplete}
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
              Mark as complete →
            </button>
          </div>

        {:else if isLastInPart && !allPartModulesCompleted}
          <!-- Locked — need to complete other modules in part first -->
          <div class="bg-white/[0.02] border border-white/8 rounded-xl p-6">
            <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-2">
              Part {partIndex} Quiz — Locked
            </div>
            <p class="text-[#f0ede8]/40 text-sm font-light">
              Complete all lessons in Part {partIndex} — {partLabels[partIndex]} — to unlock the quiz.
            </p>
          </div>

        {:else if isLastInPart && allPartModulesCompleted && !partAssessmentPassed}
          <!-- PART QUIZ -->
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-4 h-px bg-[#FF3E00]"></div>
              <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
                Part {partIndex} Quiz — {partLabels[partIndex]}
              </span>
              <span class="font-mono text-[9px] text-[#f0ede8]/25">
                {partQuestions.length} questions · pass with 80%+
              </span>
            </div>
            <p class="text-[#f0ede8]/40 text-sm font-light mb-8">
              You have completed all lessons in Part {partIndex}. Answer these questions to unlock Part {partIndex + 1}.
            </p>

            <!-- Score banner -->
            {#if submitted}
              <div class="mb-8 p-6 rounded-xl border
                {passed ? 'bg-[#FF3E00]/[0.06] border-[#FF3E00]/20' : 'bg-white/[0.02] border-white/10'}">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-mono text-[10px] tracking-widest uppercase mb-1
                      {passed ? 'text-[#FF3E00]' : 'text-[#f0ede8]/30'}">
                      {passed ? 'Passed! Part ' + partIndex + ' complete.' : 'Not quite — ' + score + '% (need 80%)'}
                    </div>
                    <div class="font-serif italic text-2xl text-[#f0ede8]">{score}%</div>
                  </div>
                  {#if !passed}
                    <button
                      onclick={retryQuiz}
                      class="font-mono text-[11px] text-[#f0ede8]/40 hover:text-[#f0ede8]/70 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all">
                      Try again
                    </button>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Questions -->
            {#if !submitted || !passed}
              <div class="flex flex-col gap-8 mb-10">
                {#each partQuestions as question, qi (question.id)}
                  {@const options = (Array.isArray(question.options) ? question.options : JSON.parse(question.options as string)) as string[]}
                  {@const isCorrectOption = (oi: number) => submitted && oi === question.correct_index}
                  {@const isWrongSelected = (oi: number) => submitted && selectedAnswers[question.id] === oi && oi !== question.correct_index}

                  <div class="flex flex-col gap-4">
                    <div class="flex items-start gap-3">
                      <span class="flex-shrink-0 font-mono text-[10px] text-[#f0ede8]/25 mt-1">Q{qi + 1}</span>
                      <p class="text-[#f0ede8]/80 text-sm font-light leading-relaxed">{question.question}</p>
                    </div>

                    <div class="flex flex-col gap-2 pl-6">
                      {#each options as option, oi (oi)}
                        {@const selected = selectedAnswers[question.id] === oi}
                        <button
                          onclick={() => selectAnswer(question.id, oi)}
                          disabled={submitted}
                          class="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all
                            {isCorrectOption(oi)
                              ? 'bg-[#FF3E00]/10 border-[#FF3E00]/30 text-[#f0ede8]'
                              : isWrongSelected(oi)
                              ? 'bg-red-500/10 border-red-500/20 text-[#f0ede8]/50'
                              : selected
                              ? 'bg-white/8 border-white/20 text-[#f0ede8]'
                              : 'bg-transparent border-white/8 text-[#f0ede8]/50 hover:border-white/16 hover:bg-white/4'}
                            {submitted ? 'cursor-default' : 'cursor-pointer'}">
                          <div class="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center
                            {isCorrectOption(oi) ? 'border-[#FF3E00]' : isWrongSelected(oi) ? 'border-red-400' : selected ? 'border-[#f0ede8]/60' : 'border-white/20'}">
                            {#if isCorrectOption(oi)}
                              <div class="w-2 h-2 rounded-full bg-[#FF3E00]"></div>
                            {:else if selected && !submitted}
                              <div class="w-2 h-2 rounded-full bg-[#f0ede8]/60"></div>
                            {/if}
                          </div>
                          <span class="text-[13px] font-light">{option}</span>
                        </button>
                      {/each}
                    </div>

                    {#if submitted && question.explanation}
                      <div class="pl-6">
                        <div class="bg-white/[0.03] border border-white/8 rounded-lg px-4 py-3">
                          <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Explanation</div>
                          <p class="text-[#f0ede8]/50 text-[12px] font-light leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>

              <!-- Submit -->
              {#if !submitted}
                <div class="flex items-center justify-between">
                  <button
                    onclick={submitPartQuiz}
                    disabled={!allAnswered || submitting}
                    class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {submitting ? 'Checking...' : 'Submit Part ' + partIndex + ' Quiz'}
                  </button>
                  <span class="font-mono text-[10px] text-[#f0ede8]/20">
                    {Object.keys(selectedAnswers).length}/{partQuestions.length} answered
                  </span>
                </div>
              {/if}
            {/if}

            <!-- Passed — show next action -->
            {#if submitted && passed}
              <div class="flex items-center justify-between mt-6">
                {#if nextModule}
                  <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                    class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
                    Start Part {partIndex + 1} →
                  </a>
                {:else}
                  <a rel="external" href="/tracks/{track.slug}/exam"
                    class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
                    Take Final Exam →
                  </a>
                {/if}
                <span class="font-mono text-[10px] text-[#FF3E00]/60">Part {partIndex} complete!</span>
              </div>
            {/if}
          </div>

        {:else if isLastInPart && partAssessmentPassed}
          <!-- Already passed this part -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase mb-1">
                Part {partIndex} quiz passed — {partAssessmentScore}%
              </div>
              <p class="text-[#f0ede8]/30 text-sm font-light">You already completed this part.</p>
            </div>
            {#if nextModule}
              <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                class="inline-flex items-center gap-2 bg-[#FF3E00]/10 hover:bg-[#FF3E00]/20 text-[#FF3E00] font-semibold text-sm px-5 py-2 rounded-lg transition-all border border-[#FF3E00]/20">
                Continue to Part {partIndex + 1} →
              </a>
            {:else}
              <a rel="external" href="/tracks/{track.slug}/exam"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
                Take Final Exam →
              </a>
            {/if}
          </div>

        {:else if !isLastInPart && isCompleted}
          <!-- Normal completed lesson — go to next -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] text-[#f0ede8]/25">Lesson completed</span>
            {#if nextModule}
              <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
                Next lesson →
              </a>
            {/if}
          </div>
        {/if}

      </div>

    </div>
  </div>
</div>