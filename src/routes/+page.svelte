<script lang="ts">
  import Footer from "../lib/components/layout/Footer.svelte";
  /**
   * Landing page — public marketing page for SvelteSkill.
   *
   * Sections:
   *   - Hero: headline, CTA, stats, code window demo
   *   - Stat row: stack / tracks / cert info
   *   - Svelte vs SvelteKit explainer
   *   - Tracks grid: four learning tracks
   *   - How it works: three-step process
   *   - Certificate design showcase
   *   - Footer
   *
   * The mock certificate always uses fixed parchment colors (#faf7f2 / #1a1a1a)
   * regardless of theme — same reasoning as the verify page.
   */

  let { data } = $props();
  const user = $derived(data.profile);
</script>

<svelte:head>
  <title>SvelteSkill</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg); color: var(--text)">

  <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
  <div class="max-w-[1200px] mx-auto px-5 md:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center min-h-screen py-16 md:py-20">

      <!-- Left: headline + CTA + stats -->
      <div class="lg:pr-16">
        <div class="flex items-center gap-2.5 mb-7">
          <div class="w-6 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[11px] text-[#FF3E00] tracking-[1.5px] uppercase">Free Svelte Certification</span>
        </div>

        <h1 class="font-serif italic text-[clamp(44px,5.5vw,72px)] font-normal leading-[1.05] tracking-[-2px] mb-5"
          style="color: var(--text)">
          Get <span class="text-[#FF3E00] not-italic font-normal">certified</span><br>in Svelte.<br>For free.
        </h1>

        <p class="text-[15px] font-light leading-relaxed max-w-[400px] mb-9" style="color: var(--text-muted)">
          The only place to earn a verifiable Svelte certificate. No company, no paywall — just the community and a curriculum that actually covers everything.
        </p>

        <!-- CTA buttons -->
        <div class="flex items-center gap-2.5 flex-wrap mb-12">
          {#if user}
            <a rel="external" href="/dashboard"
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
              Go to dashboard →
            </a>
          {:else}
            <a rel="external" href="/auth"
              class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Start with GitHub
            </a>
            <a rel="external" href="#tracks"
              class="inline-flex items-center gap-2 bg-transparent font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
              style="color: var(--text-muted); border: 1px solid var(--border2)">
              Explore tracks →
            </a>
          {/if}
        </div>

        <!-- Quick stats -->
        <div class="flex items-center gap-5">
          {#each [
            { value: '4',    label: 'Tracks'  },
            { value: 'Free', label: 'Always'  },
            { value: 'Open', label: 'Source'  },
          ] as stat, i (stat.label)}
            {#if i > 0}
              <div class="w-px h-8" style="background: var(--border2)"></div>
            {/if}
            <div>
              <div class="font-serif italic text-[26px] leading-none" style="color: var(--text)">{stat.value}</div>
              <div class="font-mono text-[9px] uppercase tracking-widest mt-1" style="color: var(--text-faint)">{stat.label}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Right: code window — hidden on mobile, visible on lg -->
      <div class="relative hidden lg:block">
        <div class="rounded-xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.4)]"
          style="background: #111; border: 1px solid var(--border)">

          <!-- Titlebar -->
          <div class="flex items-center gap-2 px-4 py-3 border-b bg-[#0d0d0d]"
            style="border-color: rgba(255,255,255,0.06)">
            <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
            <span class="font-mono text-[11px] text-[#f0ede8]/25 ml-2">Counter.svelte</span>
          </div>

          <!-- Syntax-highlighted code — always dark, it's a code editor -->
          <div class="p-6 overflow-x-auto">
            <pre class="font-mono text-[12.5px] leading-[1.7] tab-4" style="color: #abb2bf"><span class="text-[#5c6370] italic">&lt;!-- Module 3: Reactivity --&gt;</span>
<span class="text-[#e06c75]">&lt;script&gt;</span>
<span class="text-[#c678dd]">let</span> <span class="text-[#e5c07b]">count</span> <span class="text-[#abb2bf]">=</span> <span class="text-[#98c379]">$state</span><span class="text-[#abb2bf]">(</span><span class="text-[#98c379]">0</span><span class="text-[#abb2bf]">)</span>

<span class="text-[#c678dd]">let</span> <span class="text-[#e5c07b]">doubled</span> <span class="text-[#abb2bf]">=</span> <span class="text-[#98c379]">$derived</span><span class="text-[#abb2bf]">(</span><span class="text-[#e5c07b]">count</span> <span class="text-[#abb2bf]">*</span> <span class="text-[#98c379]">2</span><span class="text-[#abb2bf]">)</span>

<span class="text-[#c678dd]">function</span> <span class="text-[#61afef]">increment</span><span class="text-[#abb2bf]">{'() {'}</span>
  <span class="text-[#e5c07b]">count</span><span class="text-[#abb2bf]">++</span>
<span class="text-[#abb2bf]">&#125;</span>
<span class="text-[#e06c75]">&lt;/script&gt;</span>

<span class="text-[#e06c75]">&lt;button</span> <span class="text-[#d19a66]">onclick</span><span class="text-[#abb2bf]">={'={'}</span><span class="text-[#61afef]">increment</span><span class="text-[#abb2bf]">&#125;&gt;</span>
  clicks<span class="text-[#abb2bf]">:</span> <span class="text-[#abb2bf]">{'{'}</span><span class="text-[#e5c07b]">count</span><span class="text-[#abb2bf]">&#125;</span>
<span class="text-[#e06c75]">&lt;/button&gt;</span>

<span class="text-[#e06c75]">&lt;p&gt;</span>doubled<span class="text-[#abb2bf]">:</span> <span class="text-[#abb2bf]">{'{'}</span><span class="text-[#e5c07b]">doubled</span><span class="text-[#abb2bf]">&#125;</span><span class="text-[#e06c75]">&lt;/p&gt;</span></pre>

          </div>

          <!-- Progress bar footer -->
          <div class="border-t px-5 py-3 flex items-center justify-between bg-[#0d0d0d]"
            style="border-color: rgba(255,255,255,0.06)">
            <span class="font-mono text-[10px] text-[#f0ede8]/25">Svelte Fundamentals · Module 3 of 12</span>
            <div class="flex items-center gap-2">
              <div class="w-20 h-[3px] rounded-full" style="background: rgba(255,255,255,0.08)">
                <div class="w-1/4 h-full bg-[#FF3E00] rounded-full"></div>
              </div>
              <span class="font-mono text-[10px] text-[#FF3E00]">25%</span>
            </div>
          </div>
        </div>

        <!-- Floating certificate earned card -->
        <div class="absolute -bottom-5 -right-4 rounded-lg px-4 py-3 flex items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
          style="background: var(--surface); border: 1px solid rgba(255,62,0,0.25)">
          <div class="w-7 h-7 rounded-md flex items-center justify-center"
            style="background: var(--orange-muted)">
            <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/>
              <circle cx="12" cy="8" r="5"/>
            </svg>
          </div>
          <div>
            <div class="font-mono text-[9px] text-[#FF3E00] tracking-[1.5px] uppercase mb-0.5">Certificate earned</div>
            <div class="font-serif italic text-[12px]" style="color: var(--text)">Svelte Fundamentals</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ── Stat row ──────────────────────────────────────────────────────────── -->
  <div class="py-5 px-5 md:px-10 flex flex-wrap items-center justify-center gap-6 md:gap-16"
    style="background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border)">
    {#each [
      { label: 'Stack', value: 'SvelteKit + Supabase' },
      { label: 'Tracks', valueFull: 'Fundamentals → SvelteKit → Advanced → TypeScript', valueShort: '4 tracks' },
      { label: 'Cert',  value: 'Unique ID · Publicly verifiable' },
    ] as item, i (item.label)}
      {#if i > 0}
        <div class="hidden sm:block w-px h-5" style="background: var(--border2)"></div>
      {/if}
      <div class="flex items-center gap-3">
        <span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text-faint)">{item.label}</span>
        {#if item.valueFull}
          <span class="font-serif italic text-sm hidden md:inline" style="color: var(--text-muted)">{item.valueFull}</span>
          <span class="font-serif italic text-sm md:hidden" style="color: var(--text-muted)">{item.valueShort}</span>
        {:else}
          <span class="font-serif italic text-sm" style="color: var(--text-muted)">{item.value}</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- ── Svelte vs SvelteKit explainer ─────────────────────────────────────── -->
  <section class="py-16 md:py-24 px-5 md:px-10" id="explainer"
    style="background: var(--bg2); border-bottom: 1px solid var(--border)">
    <div class="max-w-[1200px] mx-auto">
      <div class="max-w-lg mb-10 md:mb-14">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Before you begin</span>
        </div>
        <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px] leading-[1.15] mb-3"
          style="color: var(--text)">
          Svelte vs SvelteKit —<br>what's actually different?
        </h2>
        <p class="text-sm font-light leading-relaxed" style="color: var(--text-muted)">
          Every beginner asks this. We answer it by separating them into two distinct tracks with a clear handoff between them.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] items-start gap-4 md:gap-0">

        <!-- Track 01: Svelte -->
        <div class="rounded-xl p-6 md:p-8"
          style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.25)">
          <div class="inline-flex font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded mb-4 text-[#FF3E00]"
            style="background: var(--orange-muted)">
            Track 01 · Start here
          </div>
          <h3 class="font-serif italic text-[22px] font-normal mb-2.5" style="color: var(--text)">Svelte</h3>
          <p class="text-[13px] font-light leading-relaxed mb-5" style="color: var(--text-muted)">
            A compiler — not a runtime library. Turns your components into optimised vanilla JS at build time. No virtual DOM, no overhead.
          </p>
          <ul class="space-y-2">
            {#each ['Reactivity without a runtime', 'Components, props, events', 'Stores, transitions, actions', 'The language itself'] as point (point)}
              <li class="flex items-baseline gap-2.5 text-[13px] font-light" style="color: var(--text-muted)">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>{point}
              </li>
            {/each}
          </ul>
        </div>

        <!-- Arrow divider -->
        <div class="flex items-center justify-center md:pt-20 font-mono text-lg rotate-90 md:rotate-0"
          style="color: var(--text-faint)">→</div>

        <!-- Track 02: SvelteKit -->
        <div class="rounded-xl p-6 md:p-8"
          style="background: var(--surface); border: 1px solid var(--border)">
          <div class="inline-flex font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded mb-4"
            style="background: var(--surface2); color: var(--text-muted)">
            Track 02 · After Fundamentals
          </div>
          <h3 class="font-serif italic text-[22px] font-normal mb-2.5" style="color: var(--text)">SvelteKit</h3>
          <p class="text-[13px] font-light leading-relaxed mb-5" style="color: var(--text-muted)">
            The application framework built on top of Svelte. Once you know Svelte, SvelteKit is how you build and ship a real product.
          </p>
          <ul class="space-y-2">
            {#each ['File-based routing', 'Server-side rendering (SSR)', 'load() and form actions', 'Adapters and deployment'] as point (point)}
              <li class="flex items-baseline gap-2.5 text-[13px] font-light" style="color: var(--text-muted)">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>{point}
              </li>
            {/each}
          </ul>
        </div>

      </div>
    </div>
  </section>

  <!-- ── Tracks grid ───────────────────────────────────────────────────────── -->
  <section class="py-16 md:py-24 px-5 md:px-10" id="tracks"
    style="background: var(--bg)">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10 gap-4">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-4 h-px bg-[#FF3E00]"></div>
            <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Curriculum</span>
          </div>
          <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px]"
            style="color: var(--text)">
            Four tracks.<br>One clear path.
          </h2>
        </div>
        <p class="text-sm font-light sm:max-w-[220px] sm:text-right" style="color: var(--text-muted)">
          Complete each track in order. Every cert earned unlocks the next.
        </p>
      </div>

      <!-- Four-column grid — stacks on mobile, 2-col on sm, 4-col on lg -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x lg:divide-x"
        style="border: 1px solid var(--border); --tw-divide-opacity: 1;">
        {#each [
          { num: '01', icon: 'fundamentals', title: 'Svelte Fundamentals', desc: 'Components, reactivity, props, events, stores, transitions. The foundation everything else is built on.', modules: 12, open: true  },
          { num: '02', icon: 'sveltekit',    title: 'SvelteKit',            desc: 'File-based routing, SSR, load functions, form actions, hooks. Build and ship real apps.',                 modules: 14, open: false },
          { num: '03', icon: 'advanced',     title: 'Svelte Advanced',      desc: 'Custom stores, advanced transitions, actions, context API, and performance patterns.',                   modules: 10, open: false },
          { num: '04', icon: 'typescript',   title: 'Svelte + TypeScript',  desc: 'Type-safe components, store types, SvelteKit TypeScript patterns and best practices.',                  modules:  8, open: false },
        ] as t (t.num)}
          <div class="relative p-6 md:p-7 transition-colors {t.open ? '' : 'opacity-50'}"
            style="background: var(--surface); border-color: var(--border)">
            <!-- Orange top bar for the open/active track -->
            {#if t.open}
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-[#FF3E00]"></div>
            {/if}

            <div class="font-mono text-[10px] tracking-widest mb-5" style="color: var(--text-faint)">{t.num} / 04</div>

            <!-- Track icon -->
            <div class="w-9 h-9 rounded-lg mb-4 flex items-center justify-center"
              style="background: {t.open ? 'var(--orange-muted)' : 'var(--surface2)'}">
              {#if t.icon === 'fundamentals'}
                <svg class="w-5 h-5 {t.open ? 'text-[#FF3E00]' : ''}" style="color: {t.open ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              {:else if t.icon === 'sveltekit'}
                <svg class="w-5 h-5" style="color: {t.open ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              {:else if t.icon === 'advanced'}
                <svg class="w-5 h-5" style="color: {t.open ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              {:else}
                <svg class="w-5 h-5" style="color: {t.open ? '#FF3E00' : 'var(--text-faint)'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              {/if}
            </div>

            <h3 class="font-serif italic text-[15px] font-normal mb-2 leading-snug" style="color: var(--text)">{t.title}</h3>
            <p class="text-[11px] font-light leading-relaxed mb-6" style="color: var(--text-faint)">{t.desc}</p>

            <div class="flex items-center justify-between">
              <span class="font-mono text-[9px]" style="color: var(--text-faint)">{t.modules} modules</span>
              {#if t.open}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-full text-[#FF3E00]"
                  style="background: var(--orange-muted)">● Open</span>
              {:else}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-full"
                  style="background: var(--surface2); color: var(--text-faint)">Locked</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── How it works ──────────────────────────────────────────────────────── -->
  <section class="py-16 md:py-24 px-5 md:px-10" id="how"
    style="border-top: 1px solid var(--border)">
    <div class="max-w-[1200px] mx-auto">
      <div class="mb-10 md:mb-12">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Process</span>
        </div>
        <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px]"
          style="color: var(--text)">
          How you earn it
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x"
        style="border: 1px solid var(--border)">
        {#each [
          { n: '01', tag: 'Learn',    title: 'Complete all modules',  desc: 'Work through every lesson at your own pace. Each module ends with a short quiz to check your understanding before moving on.' },
          { n: '02', tag: 'Prove it', title: 'Pass the final exam',   desc: "A timed exam covering the full track. Score 80% or above to pass. No limit on retakes — take your time until you're confident." },
          { n: '03', tag: 'Share it', title: 'Get your certificate',  desc: "Download a PDF cert with a unique verifiable ID. Anyone can confirm it's real at svelteskill.dev/verify. Put it on LinkedIn." },
        ] as step (step.n)}
          <div class="p-8 md:p-10" style="background: var(--surface); border-color: var(--border)">
            <div class="font-serif italic text-[52px] font-normal leading-none tracking-[-3px] mb-5"
              style="color: #FF3E00">
              {step.n}
            </div>
            <div class="inline-block font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded mb-3 text-[#FF3E00]"
              style="background: var(--orange-muted)">
              {step.tag}
            </div>
            <h3 class="font-serif italic text-[17px] font-normal mb-2.5" style="color: var(--text)">{step.title}</h3>
            <p class="text-[13px] font-light leading-relaxed" style="color: var(--text-muted)">{step.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Certificate design showcase ──────────────────────────────────────── -->
  <section class="py-16 md:py-24 px-5 md:px-10" id="cert"
    style="background: var(--bg2); border-top: 1px solid var(--border)">
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

      <div class="relative bg-[#faf7f2] border border-[#c9a84c] w-full"
        style="aspect-ratio: 1.414 / 1; box-shadow: 0 4px 32px rgba(0,0,0,0.15); container-type: inline-size;">

        <!-- Corner ornaments -->
        {#each [
          'top-1.5 left-1.5',
          'top-1.5 right-1.5 -scale-x-100',
          'bottom-1.5 left-1.5 -scale-y-100',
          'bottom-1.5 right-1.5 scale-[-1]'
        ] as pos (pos)}
          <svg class="absolute {pos} opacity-60" style="width: 4cqi; height: 4cqi" viewBox="0 0 40 40" fill="none">
            <path d="M2 2 L12 2 M2 2 L2 12" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 2 Q20 8 14 14 Q8 20 2 14" stroke="#c9a84c" stroke-width="0.75" fill="none"/>
            <circle cx="7" cy="7" r="2" fill="#c9a84c"/>
          </svg>
        {/each}

        <div class="absolute inset-0" style="padding: 3cqi">
          <div class="w-full h-full border border-[#c9a84c]/50 flex flex-col" style="padding: 3cqi 5cqi">

            <!-- Header row -->
            <div class="flex items-center justify-between" style="margin-bottom: 2cqi">
              <div class="flex items-center" style="gap: 1.5cqi">
                <img src="/svelteskill_logo.png" alt="SvelteSkill Logo"
                  style="width: 5cqi; height: 5cqi; border: 1px solid rgba(201,168,76,0.3); border-radius: 0.5rem;"
                  class="object-contain flex-shrink-0"
                />
                <span class="font-mono tracking-widest text-[#1a1a1a]" style="font-size: 1.853cqi">SvelteSkill</span>
              </div>
              <span class="font-mono text-[#1a1a1a]/35 tracking-wide" style="font-size: 1.36cqi">March 22, 2026</span>
            </div>

            <!-- Star badge -->
            <div class="flex justify-center" style="margin-bottom: 1.5cqi">
              <div class="relative rounded-full bg-[#faf7f2] border-2 border-[#c9a84c] flex items-center justify-center"
                style="width: 8cqi; height: 8cqi">
                <div class="absolute inset-[8%] rounded-full border border-dashed border-[#c9a84c]/60"></div>
                <svg style="width: 45%; height: 45%" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c"/>
                </svg>
              </div>
            </div>

            <div class="text-center font-mono uppercase text-[#c9a84c]"
              style="font-size: 1.36cqi; letter-spacing: 0.371cqi; margin-bottom: 1.236cqi">Certificate of Completion</div>

            <div class="text-center font-serif italic text-[#1a1a1a] leading-tight"
              style="font-size: 3.46cqi; margin-bottom: 0.618cqi">This is to certify that</div>

            <div class="text-center font-mono uppercase text-[#1a1a1a]/25"
              style="font-size: 1.236cqi; letter-spacing: 0.247cqi; margin-bottom: 1.853cqi">Awarded to</div>

            <div class="flex items-center" style="gap: 2cqi">
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
              <div class="rotate-45 bg-[#c9a84c]/50" style="width: 0.6cqi; height: 0.6cqi"></div>
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
            </div>

            <div class="text-center font-serif italic text-[#1a1a1a]"
              style="font-size: 2.97cqi; padding: 1.236cqi 0">Daniel Montesclaros</div>

            <div class="flex items-center" style="gap: 2cqi; margin-bottom: 2cqi">
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
              <div class="rotate-45 bg-[#c9a84c]/50" style="width: 0.6cqi; height: 0.6cqi"></div>
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
            </div>

            <p class="text-center text-[#1a1a1a]/45 leading-relaxed mx-auto"
              style="font-size: 1.422cqi; margin-bottom: 2.473cqi; max-width: 80%">
              has successfully completed all required coursework and demonstrated proficiency in
              <strong class="text-[#1a1a1a]/70 font-semibold">Svelte Fundamentals</strong>,
              encompassing reactive programming principles, component architecture, and modern frontend development practices.
            </p>

            <!-- Signatures -->
            <div class="flex items-end justify-between mt-auto" style="gap: 3cqi; margin-bottom: 1.5cqi">
              <div class="flex-1 text-center">
                <img src="/signature.svg" alt="Signature" class="mx-auto"
                  style="height: 4cqi; width: auto; margin-bottom: 0.5cqi; filter: brightness(0) opacity(0.55);" />
                <div class="bg-[#c9a84c]/40" style="height: 1px; margin-bottom: 0.5cqi"></div>
                <div class="font-mono text-[#1a1a1a]/35 uppercase leading-relaxed"
                  style="font-size: 1.113cqi; letter-spacing: 0.124cqi">Daniel Montesclaros<br/>Lead Developer · Founder</div>
              </div>

              <div class="flex-shrink-0 rounded-full border border-[#c9a84c] bg-[#faf7f2] flex flex-col items-center justify-center"
                style="width: 10cqi; height: 10cqi">
                <svg style="width: 35%; height: 35%; margin-bottom: 0.3cqi" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c" opacity="0.7"/>
                </svg>
                <span class="font-mono text-[#c9a84c]/60 tracking-widest uppercase text-center leading-tight"
                  style="font-size: 0.75cqi">Official<br/>Seal</span>
              </div>

              <div class="flex-1 text-center">
                <div class="flex items-end justify-center" style="height: 4cqi; margin-bottom: 0.5cqi">
                  <span class="font-serif italic text-[#c9a84c]/70" style="font-size: 2.2cqi">SvelteSkill</span>
                </div>
                <div class="bg-[#c9a84c]/40" style="height: 1px; margin-bottom: 0.5cqi"></div>
                <div class="font-mono text-[#1a1a1a]/35 uppercase leading-relaxed"
                  style="font-size: 1.113cqi; letter-spacing: 0.124cqi">SvelteSkill<br/>Platform Certification</div>
              </div>
            </div>

            <span class="font-mono text-[#1a1a1a]/20 tracking-widest" style="font-size: 1.025cqi">SVSK · 2026 · A3F9B2C1</span>

          </div>
        </div>
      </div>

      <!-- Text side -->
      <div>
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Certificates</span>
        </div>
        <h2 class="font-serif italic text-[clamp(26px,3vw,38px)] font-normal tracking-[-0.5px] leading-[1.2] mb-5"
          style="color: var(--text)">
          A cert worth sharing<br>on LinkedIn
        </h2>
        <p class="text-[14px] font-light leading-relaxed mb-3" style="color: var(--text-muted)">
          Every certificate has a public verification page. Send the link to anyone — recruiter, client, teammate — and they can confirm it instantly.
        </p>
        <p class="text-[14px] font-light leading-relaxed mb-8" style="color: var(--text-muted)">
          No company behind it. The Svelte community is the credibility.
        </p>
        <ul class="space-y-3.5">
          {#each [
            'Unique ID · publicly verifiable at /verify',
            'Downloadable PDF with your full name',
            'One-click LinkedIn share',
            'Public profile showing all earned certs'
          ] as feat (feat)}
            <li class="flex items-center gap-3 text-[13px] font-light" style="color: var(--text-muted)">
              <span class="w-[5px] h-[5px] bg-[#FF3E00] rounded-full opacity-70 flex-shrink-0"></span>
              {feat}
            </li>
          {/each}
        </ul>
      </div>

    </div>
  </section>

  <!-- ── Footer ────────────────────────────────────────────────────────────── -->
  <Footer />

</div>
<style>
  pre { tab-size: 2; }
</style>