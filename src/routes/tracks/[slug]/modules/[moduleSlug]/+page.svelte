<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';

  interface Track { slug: string; title: string; }
  interface Module { id: number; slug: string; title: string; order_index: number; content: string | null; }
  interface Question { id: number; question: string; options: string[] | string; correct_index: number; explanation: string | null; }
  interface PartAssessmentSimple { part_index: number; passed: boolean; }

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
      allPartAssessments: PartAssessmentSimple[];
      allPartsPassed: boolean;
    };
  }

  const { data }: Props = $props();

  const track = $derived(data.track);
  const module = $derived(data.module);
  const allModules = $derived(data.allModules);

  // Maintain a local copy of completedModuleIds for immediate UI update
  const completedModuleIdsFromData = $derived(data.completedModuleIds);
  let localCompletedIds = $state<number[]>([]);

  $effect(() => {
    localCompletedIds = [...completedModuleIdsFromData];
  });

  const completedModuleIds = $derived(localCompletedIds);
  const nextModule = $derived(data.nextModule);
  const partIndex = $derived(data.partIndex);
  const isLastInPart = $derived(data.isLastInPart);
  const allPartModulesCompleted = $derived(data.allPartModulesCompleted);
  const allPartAssessments = $derived(data.allPartAssessments);
  const allPartsPassed = $derived(data.allPartsPassed);

  let completedLocally = $state<boolean | null>(null);
  const isCompleted = $derived(completedLocally ?? data.isCompleted);

  let partAssessmentPassed = $state(false);
  let partAssessmentScore = $state<number | null>(null);

  $effect(() => {
    // Check both the direct assessment and allPartAssessments for the current part
    const fromDirect = data.partAssessment?.passed ?? false;
    const fromAll = data.allPartAssessments?.some(
      pa => pa.part_index === data.partIndex && pa.passed
    ) ?? false;
    partAssessmentPassed = fromDirect || fromAll;
    partAssessmentScore = data.partAssessment?.score ?? null;
  });

  async function markComplete() {
    if (isCompleted) return;
    const { error } = await supabase
      .from('user_progress')
      .insert({ user_id: data.userId, module_id: module.id });
    if (!error) {
      localCompletedIds = [...localCompletedIds, module.id]; // update immediately
      completedLocally = true;
      await invalidate('supabase:auth');
    }
  }

  // Returns true if the quiz for a given part has been passed
  function isPartQuizPassed(pi: number): boolean {
    return allPartAssessments.some(pa => pa.part_index === pi && pa.passed);
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
          <!-- {@const isActivePart = pModules.some(m => m.id === module.id)} -->
          {@const quizPassed = isPartQuizPassed(pIdx)}
          {@const allDone = doneCount === pModules.length}

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

          <!-- Quiz row — always shown after part modules -->
          <a rel="external" href={allDone ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group
              {quizPassed
                ? 'border border-transparent'
                : allDone
                ? 'border border-[#FF3E00]/15 bg-[#FF3E00]/5'
                : 'border border-transparent opacity-40 cursor-not-allowed pointer-events-none'}">

            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
              {quizPassed ? 'bg-[#FF3E00]/20' : allDone ? 'bg-[#FF3E00]/10' : 'bg-white/4'}">
              {#if quizPassed}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else if allDone}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              {:else}
                <svg class="w-3 h-3 text-[#f0ede8]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              {/if}
            </div>

            <span class="text-[12px] font-light leading-snug
              {quizPassed ? 'text-[#FF3E00]/60' : allDone ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}
              group-hover:text-[#f0ede8]/70 transition-colors">
              Part {pIdx} Quiz
            </span>

            {#if quizPassed}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00] tracking-widest">✓</span>
            {:else if allDone}
              <span class="ml-auto font-mono text-[8px] text-[#FF3E00]/50 tracking-widest">START</span>
            {/if}
          </a>

          {#if pIdx < 4}
            <div class="mx-3 mt-3 border-t border-white/5"></div>
          {/if}
        {/if}
      {/each}
       <!-- Final Exam entry -->
      <div class="mx-3 mt-3 border-t border-white/5 mb-3"></div>
      {#if allPartsPassed}
        <a rel="external" href="/tracks/{track.slug}/exam"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group hover:bg-white/4 border border-transparent">
          <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center bg-[#FF3E00]/10">
            <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
            </svg>
          </div>
          <span class="text-[12px] font-light text-[#f0ede8]/35 group-hover:text-[#f0ede8]/70 transition-colors">
            Final Exam
          </span>
        </a>
      {:else}
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent opacity-30">
          <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/4">
            <svg class="w-3 h-3 text-[#f0ede8]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <span class="text-[12px] font-light text-[#f0ede8]/20">Final Exam</span>
        </div>
      {/if}
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
          <!-- 1. Not done — mark complete -->
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

        {:else if !isLastInPart}
          <!-- 2. Completed, not the last in part — go to next lesson -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] text-[#f0ede8]/25">✓ Lesson completed</span>
            {#if nextModule}
              <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
                Next lesson →
              </a>
            {/if}
          </div>

        {:else if isLastInPart && !allPartModulesCompleted}
          <!-- 3. Last in part but other lessons still incomplete -->
          <div class="bg-white/[0.02] border border-white/8 rounded-xl p-6">
            <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-2">
              Part {partIndex} Quiz — Locked
            </div>
            <p class="text-[#f0ede8]/40 text-sm font-light">
              Complete all lessons in Part {partIndex} — {partLabels[partIndex]} — to unlock the quiz.
            </p>
          </div>

        {:else if isLastInPart && allPartModulesCompleted && !partAssessmentPassed}
          <!-- 4. All lessons done, quiz not yet passed — go to quiz page -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-1">
                Part {partIndex} — {partLabels[partIndex]}
              </div>
              <p class="text-[#f0ede8]/35 text-sm font-light">
                All lessons complete. Time for the Part {partIndex} quiz.
              </p>
            </div>
            <a rel="external" href="/tracks/{track.slug}/part/{partIndex}/quiz"
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
              Take Part {partIndex} Quiz →
            </a>
          </div>

        {:else if isLastInPart && partAssessmentPassed}
          <!-- 5. Quiz already passed -->
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
        {/if}

      </div>

    </div>
  </div>
</div>