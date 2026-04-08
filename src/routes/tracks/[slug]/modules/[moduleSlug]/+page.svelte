<script lang="ts">
  /**
   * Module page — displays a single lesson's markdown content alongside
   * a sidebar showing all modules grouped by part with their completion state.
   *
   * Also handles:
   *   - Marking a module complete (optimistic local update via Supabase)
   *   - Part quiz unlock logic
   *   - Bottom CTA that adapts to the user's current progress state
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';

  // ── Types ────────────────────────────────────────────────────────────────

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

  // ── Derived state ────────────────────────────────────────────────────────

  const track      = $derived(data.track);
  const module     = $derived(data.module);
  const allModules = $derived(data.allModules);

  /**
   * We keep a local copy of completedModuleIds so the sidebar updates
   * immediately when the user clicks "Mark as complete", without waiting
   * for a full server round-trip.
   */
  const completedModuleIdsFromData = $derived(data.completedModuleIds);
  let localCompletedIds = $state<number[]>([]);
  $effect(() => { localCompletedIds = [...completedModuleIdsFromData]; });

  const completedModuleIds = $derived(localCompletedIds);
  const nextModule         = $derived(data.nextModule);
  const partIndex          = $derived(data.partIndex);
  const isLastInPart       = $derived(data.isLastInPart);
  const allPartAssessments = $derived(data.allPartAssessments);
  const allPartsPassed     = $derived(data.allPartsPassed);

  /**
   * Re-derived from the local copy so it updates immediately when the user
   * marks the final module in a part as complete.
   */
  const allPartModulesCompleted = $derived(
    data.partModules.every(m => completedModuleIds.includes(m.id))
  );

  /**
   * completedLocally is null until the user clicks "Mark as complete" this
   * session, at which point it overrides the server-provided value.
   */
  let completedLocally     = $state<boolean | null>(null);
  const isCompleted        = $derived(completedLocally ?? data.isCompleted);

  // Part quiz state — check both the direct assessment and the full list
  // to handle cases where the page loaded mid-session.
  let partAssessmentPassed = $state(false);
  let partAssessmentScore  = $state<number | null>(null);

  $effect(() => {
    const fromDirect = data.partAssessment?.passed ?? false;
    const fromAll    = data.allPartAssessments?.some(
      pa => pa.part_index === data.partIndex && pa.passed
    ) ?? false;
    partAssessmentPassed = fromDirect || fromAll;
    partAssessmentScore  = data.partAssessment?.score ?? null;
  });

  // ── Mobile sidebar state ─────────────────────────────────────────────────
  let sidebarOpen = $state(false);

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Inserts a user_progress row for this module.
   * Updates localCompletedIds immediately for optimistic UI,
   * then invalidates the auth dependency to sync server state.
   */
  async function markComplete() {
    if (isCompleted) return;
    const { error } = await supabase
      .from('user_progress')
      .insert({ user_id: data.userId, module_id: module.id });
    if (!error) {
      localCompletedIds = [...localCompletedIds, module.id];
      completedLocally  = true;
      await invalidate('supabase:auth');
    }
  }

  /** Returns true if the quiz for a given part index has been passed. */
  function isPartQuizPassed(pi: number): boolean {
    return allPartAssessments.some(pa => pa.part_index === pi && pa.passed);
  }

  // ── Markdown parser ──────────────────────────────────────────────────────

  /**
   * Minimal markdown → HTML converter for lesson content.
   * Code blocks and inline code are extracted first to avoid
   * double-processing, then standard markdown rules are applied,
   * then the extracted blocks are restored.
   *
   * Runs on trusted server-generated content only — NOT user input.
   */
  function parseMarkdown(content: string): string {
    const codeBlocks:  string[] = [];
    const inlineCodes: string[] = [];

    // 1. Extract fenced code blocks before any other processing
    let result = content.replace(/```(\w*)\s*\n?([\s\S]*?)```/g, (_, _lang, code) => {
      const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const escaped = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    // 2. Extract inline code spans
    result = result.replace(/`([^`]+)`/g, (_, code) => {
      const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const safe    = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      inlineCodes.push(`<code>${safe}</code>`);
      return `__INLINECODE_${inlineCodes.length - 1}__`;
    });

    // 3. Decode any remaining HTML entities from the server
    result = result
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // 4. Apply block and inline markdown rules
    result = result
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hpbuci]|<pre|<block|__)(.+)$/gm, '<p>$1</p>');

    // 5. Restore extracted code blocks and inline code
    result = result.replace(/__CODEBLOCK_(\d+)__/g,  (_, i) => codeBlocks[Number(i)]);
    result = result.replace(/__INLINECODE_(\d+)__/g, (_, i) => inlineCodes[Number(i)]);

    return result;
  }

  const parsedContent = $derived(parseMarkdown(module.content ?? ''));

  /** Human-readable names for each of the four track parts. */
  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  /**
   * Groups modules into their part based on order_index ranges:
   *   Part 1 → 1–3 | Part 2 → 4–6 | Part 3 → 7–9 | Part 4 → 10+
   */
  function getPartModules(pIdx: number) {
    return allModules.filter(m => {
      const oi = m.order_index;
      if (pIdx === 1) return oi <= 3;
      if (pIdx === 2) return oi <= 6 && oi > 3;
      if (pIdx === 3) return oi <= 9 && oi > 6;
      return oi > 9;
    });
  }
</script>

<svelte:head>
  <title>{module.title} — {track.title} | SvelteSkill</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-3.5rem)]" style="background: var(--bg)">

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
       Shown only on mobile (below the global navbar). Displays the current
       module title and a hamburger button to open the sidebar drawer.
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="fixed top-14 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
    style="background: var(--bg); border-bottom: 1px solid var(--border)">
    <span class="font-mono text-[11px] tracking-[2px] text-[#FF3E00] uppercase truncate pr-4">
      Module {module.order_index} · {module.title}
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

  <!-- ── Sidebar ───────────────────────────────────────────────────────────
       Fixed below the navbar (top-14). Lists all modules grouped by part
       with live completion state derived from localCompletedIds.
       On mobile: hidden off-canvas by default, slides in as a drawer.
  ──────────────────────────────────────────────────────────────────────── -->
  <aside class="w-[260px] flex-shrink-0 flex flex-col fixed top-14 bottom-0 overflow-y-auto z-40
                transition-transform duration-200
                -translate-x-full md:translate-x-0
                {sidebarOpen ? '!translate-x-0' : ''}"
    style="background: var(--bg); border-right: 1px solid var(--border)">

    <!-- Sidebar header — back link + track title -->
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

    <!-- Module nav grouped by part -->
    <nav class="flex-1 p-3">
      {#each [1, 2, 3, 4] as pIdx (pIdx)}
        {@const pModules   = getPartModules(pIdx)}
        {#if pModules.length > 0}
          {@const doneCount  = pModules.filter(m => completedModuleIds.includes(m.id)).length}
          {@const quizPassed = isPartQuizPassed(pIdx)}
          {@const allDone    = doneCount === pModules.length}

          <!-- Part label row -->
          <div class="flex items-center justify-between px-3 pt-4 pb-1.5 {pIdx > 1 ? 'mt-2' : ''}">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[9px] text-[#FF3E00]/70 tracking-[2px] uppercase">Part {pIdx}</span>
              <span class="font-mono text-[9px] tracking-wide" style="color: var(--text-muted)">— {partLabels[pIdx]}</span>
            </div>
            <span class="font-mono text-[8px]" style="color: var(--text-muted)">{doneCount}/{pModules.length}</span>
          </div>

          <!-- Module rows for this part -->
          {#each pModules as m (m.id)}
            {@const done   = completedModuleIds.includes(m.id)}
            {@const active = m.id === module.id}

            <!--
              Module link — three visual states:
                active  → orange-tinted bg + border (current page)
                done    → muted text, orange check icon
                neither → normal text, index number
            -->
            <a rel="external" href="/tracks/{track.slug}/modules/{m.slug}"
              onclick={() => sidebarOpen = false}
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group"
              style="
                background: {active ? 'var(--orange-faint)' : 'transparent'};
                border: 1px solid {active ? 'rgba(255,62,0,0.2)' : 'transparent'};
              ">

              <!-- Completion dot / index chip -->
              <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                style="
                  background: {done ? 'var(--orange-muted)' : active ? 'var(--orange-faint)' : 'var(--surface2)'};
                  border: 1px solid {done || active ? 'transparent' : 'var(--border2)'};
                ">
                {#if done}
                  <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {:else}
                  <span class="font-mono text-[8px]" style="color: {active ? '#FF3E00' : 'var(--text-muted)'}">
                    {String(m.order_index).padStart(2, '0')}
                  </span>
                {/if}
              </div>

              <!-- Module title -->
              <span class="text-[12px] leading-snug transition-colors"
                style="color: {active ? 'var(--text)' : done ? 'var(--text-muted)' : 'var(--text)'}; font-weight: {active ? '500' : '400'}">
                {m.title}
              </span>
            </a>
          {/each}

          <!-- Part quiz row — locked until all modules in the part are done -->
          <a rel="external" href={allDone ? `/tracks/${track.slug}/part/${pIdx}/quiz` : '#'}
            onclick={() => sidebarOpen = false}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group"
            class:opacity-40={!allDone && !quizPassed}
            class:pointer-events-none={!allDone && !quizPassed}
            style="
              background: {!quizPassed && allDone ? 'var(--orange-faint)' : 'transparent'};
              border: 1px solid {!quizPassed && allDone ? 'rgba(255,62,0,0.15)' : 'transparent'};
            ">

            <!-- Quiz icon: checkmark / plus circle / padlock -->
            <div class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
              style="
                background: {quizPassed ? 'var(--orange-muted)' : allDone ? 'var(--orange-faint)' : 'var(--surface2)'};
                border: 1px solid {quizPassed || allDone ? 'transparent' : 'var(--border2)'};
              ">
              {#if quizPassed}
                <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              {:else if allDone}
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
              style="color: {quizPassed ? 'rgba(255,62,0,0.7)' : allDone ? '#FF3E00' : 'var(--text-muted)'}">
              Part {pIdx} Quiz
            </span>

            <!-- Right-side status tag -->
            {#if quizPassed}
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

      <!-- ── Final exam entry ───────────────────────────────────────────────
           Shown as a link only when all 4 part quizzes have been passed.
           Otherwise rendered as a dimmed non-interactive div.
      ──────────────────────────────────────────────────────────────────── -->
      <div class="mx-3 mt-3 mb-3" style="border-top: 1px solid var(--border)"></div>
      {#if allPartsPassed}
        <a rel="external" href="/tracks/{track.slug}/exam"
          onclick={() => sidebarOpen = false}
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
            style="background: var(--surface2); border: 1px solid var(--border2)">
            <svg class="w-3 h-3" style="color: var(--text-muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <span class="text-[12px]" style="color: var(--text-muted)">Final Exam</span>
        </div>
      {/if}
    </nav>
  </aside>

  <!-- ── Main content area ─────────────────────────────────────────────────
       Offset by sidebar width on desktop, full width on mobile.
       Contains the rendered lesson and bottom CTA.
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="flex-1 min-w-0 ml-0 md:ml-[260px]">
    <div class="max-w-[720px] mx-auto px-4 md:px-10 pt-28 md:pt-12 pb-12">

      <!-- Module header — track position badge + optional completed pill + title -->
      <div class="mb-10">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Module {module.order_index} of {allModules.length}
          </span>
          {#if isCompleted}
            <span class="font-mono text-[9px] text-[#FF3E00] px-2 py-0.5 rounded-full tracking-widest uppercase"
              style="background: var(--orange-muted)">
              ✓ Completed
            </span>
          {/if}
        </div>
        <h1 class="font-serif italic text-[36px] font-normal tracking-[-1.5px] leading-tight"
          style="color: var(--text)">
          {module.title}
        </h1>
      </div>

      <!--
        Lesson content
        ──────────────
        Rendered from server-generated markdown — NOT user input.
        Base color inherits var(--text) so it's white in dark mode and
        black in light mode. Headings, code, blockquotes are overridden
        in app.css under the .lesson-content selector.

        Tailwind [&_*] selectors handle layout/spacing only — colors come
        from app.css so they can use CSS variables for theme switching.
      -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div class="lesson-content mb-14
        [&_h1]:font-serif [&_h1]:italic [&_h1]:text-[32px] [&_h1]:font-normal [&_h1]:tracking-[-1px] [&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:leading-[1.2]
        [&_h2]:font-serif [&_h2]:italic [&_h2]:text-[22px] [&_h2]:font-normal [&_h2]:mb-3.5 [&_h2]:mt-9 [&_h2]:tracking-[-0.5px]
        [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:mb-2.5 [&_h3]:mt-7 [&_h3]:tracking-[0.2px]
        [&_p]:text-[15px] [&_p]:font-light [&_p]:leading-[1.75] [&_p]:mb-4
        [&_strong]:font-medium
        [&_em]:italic
        [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-[#FF3E00] [&_code]:px-1.5 [&_code]:py-px [&_code]:rounded
        [&_pre]:rounded-xl [&_pre]:px-6 [&_pre]:py-5 [&_pre]:overflow-x-auto [&_pre]:my-5
        [&_pre_code]:font-mono [&_pre_code]:text-[12.5px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:leading-[1.7]
        [&_blockquote]:border-l-2 [&_blockquote]:border-[#FF3E00] [&_blockquote]:pl-5 [&_blockquote]:pr-5 [&_blockquote]:py-3 [&_blockquote]:my-5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-sm
        [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:pl-5 [&_ol]:mb-4
        [&_li]:text-[14px] [&_li]:font-light [&_li]:leading-[1.7] [&_li]:mb-1.5"
        style="color: var(--text)">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html parsedContent}
      </div>

      <!-- ── Bottom action area ──────────────────────────────────────────
           Five mutually exclusive states drive which CTA is rendered.
           Order matters — more specific conditions are checked last.
      ─────────────────────────────────────────────────────────────────── -->
      <div class="pt-10 mt-14" style="border-top: 1px solid var(--border)">

        {#if !isCompleted}
          <!-- State 1: Module not yet complete — primary mark-complete CTA -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p class="text-sm font-light" style="color: var(--text-faint)">
              Finished reading? Mark this lesson as complete.
            </p>
            <button onclick={markComplete}
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
              Mark as complete →
            </button>
          </div>

        {:else if !isLastInPart}
          <!-- State 2: Complete, not the last lesson in this part — next lesson CTA -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span class="font-mono text-[10px]" style="color: var(--text-faint)">✓ Lesson completed</span>
            {#if nextModule}
              <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
                Next lesson →
              </a>
            {/if}
          </div>

        {:else if isLastInPart && !allPartModulesCompleted}
          <!-- State 3: Last lesson in part but sibling lessons still incomplete -->
          <div class="rounded-xl p-6" style="background: var(--surface); border: 1px solid var(--border)">
            <div class="font-mono text-[10px] uppercase tracking-widest mb-2" style="color: var(--text-faint)">
              Part {partIndex} Quiz — Locked
            </div>
            <p class="text-sm font-light" style="color: var(--text-muted)">
              Complete all lessons in Part {partIndex} — {partLabels[partIndex]} — to unlock the quiz.
            </p>
          </div>

        {:else if isLastInPart && allPartModulesCompleted && !partAssessmentPassed}
          <!-- State 4: All lessons in part done, quiz not yet passed -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-1">
                Part {partIndex} — {partLabels[partIndex]}
              </div>
              <p class="text-sm font-light" style="color: var(--text-muted)">
                All lessons complete. Time for the Part {partIndex} quiz.
              </p>
            </div>
            <a rel="external" href="/tracks/{track.slug}/part/{partIndex}/quiz"
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
              Take Part {partIndex} Quiz →
            </a>
          </div>

        {:else if isLastInPart && partAssessmentPassed}
          <!-- State 5: Part quiz already passed — continue to next part or final exam -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="font-mono text-[9px] text-[#FF3E00] tracking-widest uppercase mb-1">
                Part {partIndex} quiz passed — {partAssessmentScore}%
              </div>
              <p class="text-sm font-light" style="color: var(--text-faint)">
                You already completed this part.
              </p>
            </div>
            {#if nextModule}
              <!-- More parts remain — go to next part's first module -->
              <a rel="external" href="/tracks/{track.slug}/modules/{nextModule.slug}"
                class="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-lg transition-all text-[#FF3E00]"
                style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
                Continue to Part {partIndex + 1} →
              </a>
            {:else}
              <!-- All parts done — go to the final exam -->
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