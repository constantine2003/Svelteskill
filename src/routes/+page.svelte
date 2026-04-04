<script lang="ts">
  let { data } = $props();
  const user = $derived(data.profile);
</script>

<div class="min-h-screen bg-[#1a1a1a] text-[#f0ede8]">

  <!-- HERO -->
  <div class="max-w-[1200px] mx-auto px-5 md:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center min-h-screen py-16 md:py-20">

      <!-- Left -->
      <div class="lg:pr-16">
        <div class="flex items-center gap-2.5 mb-7">
          <div class="w-6 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[11px] text-[#FF3E00] tracking-[1.5px] uppercase">Free Svelte Certification</span>
        </div>

        <h1 class="font-serif italic text-[clamp(44px,5.5vw,72px)] font-normal leading-[1.05] tracking-[-2px] mb-5">
          Get <span class="text-[#FF3E00] not-italic font-normal">certified</span><br>in Svelte.<br>For free.
        </h1>

        <p class="text-[#f0ede8]/45 text-[15px] font-light leading-relaxed max-w-[400px] mb-9">
          The only place to earn a verifiable Svelte certificate. No company, no paywall — just the community and a curriculum that actually covers everything.
        </p>

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
              class="inline-flex items-center gap-2 bg-transparent hover:bg-white/5 text-[#f0ede8]/60 font-medium text-sm px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              Explore tracks →
            </a>
          {/if}
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-5">
          <div>
            <div class="font-serif italic text-[26px] text-[#f0ede8] leading-none">4</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Tracks</div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div>
            <div class="font-serif italic text-[26px] text-[#f0ede8] leading-none">Free</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Always</div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div>
            <div class="font-serif italic text-[26px] text-[#f0ede8] leading-none">Open</div>
            <div class="font-mono text-[9px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Source</div>
          </div>
        </div>
      </div>

      <!-- Code window — hidden on small, shown on lg -->
      <div class="relative hidden lg:block">
        <div class="bg-[#111] border border-white/8 rounded-xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.4)]">

          <!-- Titlebar -->
          <div class="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-[#0d0d0d]">
            <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
            <span class="font-mono text-[11px] text-[#f0ede8]/25 ml-2">Counter.svelte</span>
          </div>

          <!-- Code -->
          <div class="p-6 overflow-x-auto">
            <pre class="font-mono text-[12.5px] leading-[1.7] tab-4"><span class="text-[#5c6370] italic">&lt;!-- Module 3: Reactivity --&gt;</span>

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

          <!-- Progress bar -->
          <div class="border-t border-white/6 px-5 py-3 flex items-center justify-between bg-[#0d0d0d]">
            <span class="font-mono text-[10px] text-[#f0ede8]/25">Svelte Fundamentals · Module 3 of 12</span>
            <div class="flex items-center gap-2">
              <div class="w-20 h-[3px] bg-white/8 rounded-full">
                <div class="w-1/4 h-full bg-[#FF3E00] rounded-full"></div>
              </div>
              <span class="font-mono text-[10px] text-[#FF3E00]">25%</span>
            </div>
          </div>
        </div>

        <!-- Floating cert card -->
        <div class="absolute -bottom-5 -right-4 bg-[#1a1a1a] border border-[#FF3E00]/25 rounded-lg px-4 py-3 flex items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div class="w-7 h-7 bg-[#FF3E00]/15 rounded-md flex items-center justify-center">
            <svg class="w-4 h-4 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/>
              <circle cx="12" cy="8" r="5"/>
            </svg>
          </div>
          <div>
            <div class="font-mono text-[9px] text-[#FF3E00] tracking-[1.5px] uppercase mb-0.5">Certificate earned</div>
            <div class="font-serif italic text-[12px] text-[#f0ede8]">Svelte Fundamentals</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- SUBTLE STAT ROW -->
  <div class="border-y border-white/6 py-5 px-5 md:px-10 flex flex-wrap items-center justify-center gap-6 md:gap-16 bg-[#141414]">
    <div class="flex items-center gap-3">
      <span class="font-mono text-[10px] text-[#f0ede8]/25 tracking-[1.5px] uppercase">Stack</span>
      <span class="font-serif italic text-sm text-[#f0ede8]/55">SvelteKit + Supabase</span>
    </div>
    <div class="hidden sm:block w-px h-5 bg-white/8"></div>
    <div class="flex items-center gap-3">
      <span class="font-mono text-[10px] text-[#f0ede8]/25 tracking-[1.5px] uppercase">Tracks</span>
      <span class="font-serif italic text-sm text-[#f0ede8]/55 hidden md:inline">Fundamentals → SvelteKit → Advanced → TypeScript</span>
      <span class="font-serif italic text-sm text-[#f0ede8]/55 md:hidden">4 tracks</span>
    </div>
    <div class="hidden sm:block w-px h-5 bg-white/8"></div>
    <div class="flex items-center gap-3">
      <span class="font-mono text-[10px] text-[#f0ede8]/25 tracking-[1.5px] uppercase">Cert</span>
      <span class="font-serif italic text-sm text-[#f0ede8]/55">Unique ID · Publicly verifiable</span>
    </div>
  </div>

  <!-- SVELTE VS SVELTEKIT -->
  <section class="border-b border-white/8 py-16 md:py-24 px-5 md:px-10 bg-[#141414]" id="explainer">
    <div class="max-w-[1200px] mx-auto">
      <div class="max-w-lg mb-10 md:mb-14">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Before you begin</span>
        </div>
        <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px] leading-[1.15] mb-3">
          Svelte vs SvelteKit —<br>what's actually different?
        </h2>
        <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed">
          Every beginner asks this. We answer it by separating them into two distinct tracks with a clear handoff between them.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] items-start gap-4 md:gap-0">

        <div class="border border-[#FF3E00]/25 bg-[#FF3E00]/[0.02] rounded-xl p-6 md:p-8">
          <div class="inline-flex font-mono text-[9px] tracking-[1.5px] uppercase bg-[#FF3E00]/12 text-[#FF3E00] px-2.5 py-1 rounded mb-4">Track 01 · Start here</div>
          <h3 class="font-serif italic text-[22px] font-normal text-[#f0ede8] mb-2.5">Svelte</h3>
          <p class="text-[#f0ede8]/40 text-[13px] font-light leading-relaxed mb-5">A compiler — not a runtime library. Turns your components into optimised vanilla JS at build time. No virtual DOM, no overhead.</p>
          <ul class="space-y-2">
            {#each ['Reactivity without a runtime', 'Components, props, events', 'Stores, transitions, actions', 'The language itself'] as point (point)}
              <li class="flex items-baseline gap-2.5 text-[13px] text-[#f0ede8]/55 font-light">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>{point}
              </li>
            {/each}
          </ul>
        </div>

        <!-- Arrow: rotated 90deg on mobile to point down -->
        <div class="flex items-center justify-center md:pt-20 text-[#FF3E00]/25 font-mono text-lg rotate-90 md:rotate-0">→</div>

        <div class="border border-white/8 rounded-xl p-6 md:p-8">
          <div class="inline-flex font-mono text-[9px] tracking-[1.5px] uppercase bg-white/5 text-[#f0ede8]/35 px-2.5 py-1 rounded mb-4">Track 02 · After Fundamentals</div>
          <h3 class="font-serif italic text-[22px] font-normal text-[#f0ede8] mb-2.5">SvelteKit</h3>
          <p class="text-[#f0ede8]/40 text-[13px] font-light leading-relaxed mb-5">The application framework built on top of Svelte. Once you know Svelte, SvelteKit is how you build and ship a real product.</p>
          <ul class="space-y-2">
            {#each ['File-based routing', 'Server-side rendering (SSR)', 'load() and form actions', 'Adapters and deployment'] as point (point)}
              <li class="flex items-baseline gap-2.5 text-[13px] text-[#f0ede8]/55 font-light">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>{point}
              </li>
            {/each}
          </ul>
        </div>

      </div>
    </div>
  </section>

  <!-- TRACKS -->
  <section class="py-16 md:py-24 px-5 md:px-10 bg-[#1a1a1a]" id="tracks">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10 gap-4">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-4 h-px bg-[#FF3E00]"></div>
            <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Curriculum</span>
          </div>
          <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px]">
            Four tracks.<br>One clear path.
          </h2>
        </div>
        <p class="text-[#f0ede8]/40 text-sm font-light sm:max-w-[220px] sm:text-right">
          Complete each track in order. Every cert earned unlocks the next.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/8 rounded-xl overflow-hidden divide-y divide-white/8 sm:divide-y-0 sm:divide-x sm:divide-white/8 lg:divide-x">
        {#each [
          { num: '01', icon: 'fundamentals', title: 'Svelte Fundamentals', desc: 'Components, reactivity, props, events, stores, transitions. The foundation everything else is built on.', modules: 12, open: true },
          { num: '02', icon: 'sveltekit', title: 'SvelteKit', desc: 'File-based routing, SSR, load functions, form actions, hooks. Build and ship real apps.', modules: 14, open: false },
          { num: '03', icon: 'advanced', title: 'Svelte Advanced', desc: 'Custom stores, advanced transitions, actions, context API, and performance patterns.', modules: 10, open: false },
          { num: '04', icon: 'typescript', title: 'Svelte + TypeScript', desc: 'Type-safe components, store types, SvelteKit TypeScript patterns and best practices.', modules: 8, open: false }
        ] as track (track.num)}
          <div class="relative p-6 md:p-7 bg-[#1c1c1c] hover:bg-[#1f1f1f] transition-colors {track.open ? '' : 'opacity-45'}">
            {#if track.open}
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-[#FF3E00]"></div>
            {/if}
            <div class="font-mono text-[10px] text-[#f0ede8]/20 tracking-widest mb-5">{track.num} / 04</div>

            <div class="w-9 h-9 rounded-lg mb-4 flex items-center justify-center {track.open ? 'bg-[#FF3E00]/12' : 'bg-white/5'}">
              {#if track.icon === 'fundamentals'}
                <svg class="w-5 h-5 {track.open ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              {:else if track.icon === 'sveltekit'}
                <svg class="w-5 h-5 {track.open ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              {:else if track.icon === 'advanced'}
                <svg class="w-5 h-5 {track.open ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              {:else}
                <svg class="w-5 h-5 {track.open ? 'text-[#FF3E00]' : 'text-[#f0ede8]/20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              {/if}
            </div>

            <h3 class="font-serif italic text-[15px] font-normal text-[#f0ede8] mb-2 leading-snug {!track.open ? 'text-[#f0ede8]/50' : ''}">{track.title}</h3>
            <p class="text-[#f0ede8]/30 text-[11px] font-light leading-relaxed mb-6">{track.desc}</p>
            <div class="flex items-center justify-between">
              <span class="font-mono text-[9px] text-[#f0ede8]/20">{track.modules} modules</span>
              {#if track.open}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-[#FF3E00]/12 text-[#FF3E00] rounded-full">● Open</span>
              {:else}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-white/4 text-[#f0ede8]/20 rounded-full">Locked</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="py-16 md:py-24 px-5 md:px-10 border-t border-white/8" id="how">
    <div class="max-w-[1200px] mx-auto">
      <div class="mb-10 md:mb-12">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Process</span>
        </div>
        <h2 class="font-serif italic text-[clamp(28px,3.5vw,42px)] font-normal tracking-[-1px]">How you earn it</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 border border-white/8 rounded-xl overflow-hidden divide-y divide-white/8 md:divide-y-0 md:divide-x md:divide-white/8">
        {#each [
          { n: '01', tag: 'Learn', title: 'Complete all modules', desc: 'Work through every lesson at your own pace. Each module ends with a short quiz to check your understanding before moving on.' },
          { n: '02', tag: 'Prove it', title: 'Pass the final exam', desc: 'A timed exam covering the full track. Score 80% or above to pass. No limit on retakes — take your time until you\'re confident.' },
          { n: '03', tag: 'Share it', title: 'Get your certificate', desc: 'Download a PDF cert with a unique verifiable ID. Anyone can confirm it\'s real at svelteskill.dev/verify. Put it on LinkedIn.' }
        ] as step (step.n)}
          <div class="bg-[#1c1c1c] p-8 md:p-10">
            <div class="font-serif italic text-[52px] font-normal text-[#FF3E00]/10 leading-none tracking-[-3px] mb-5">{step.n}</div>
            <div class="inline-block font-mono text-[9px] tracking-[1.5px] uppercase bg-[#FF3E00]/10 text-[#FF3E00] px-2.5 py-1 rounded mb-3">{step.tag}</div>
            <h3 class="font-serif italic text-[17px] font-normal text-[#f0ede8] mb-2.5">{step.title}</h3>
            <p class="text-[#f0ede8]/40 text-[13px] font-light leading-relaxed">{step.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CERT DESIGN -->
  <section class="py-16 md:py-24 px-5 md:px-10 bg-[#141414] border-t border-white/8" id="cert">
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

      <!-- Mock cert — landscape bond paper, portrait style content -->
      <div class="relative bg-[#faf7f2] border border-[#c9a84c]" style="aspect-ratio: 1.414 / 1;">

        <!-- Corner ornaments -->
        {#each [
          'top-1.5 left-1.5',
          'top-1.5 right-1.5 -scale-x-100',
          'bottom-1.5 left-1.5 -scale-y-100',
          'bottom-1.5 right-1.5 scale-[-1]'
        ] as pos (pos)}
          <svg class="absolute {pos} w-6 h-6 opacity-60" viewBox="0 0 40 40" fill="none">
            <path d="M2 2 L12 2 M2 2 L2 12" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 2 Q20 8 14 14 Q8 20 2 14" stroke="#c9a84c" stroke-width="0.75" fill="none"/>
            <circle cx="7" cy="7" r="2" fill="#c9a84c"/>
          </svg>
        {/each}

        <!-- Inner border -->
        <div class="absolute inset-2.5 border border-[#c9a84c]/50 flex flex-col px-10 py-5">

          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <!-- Logo: white bg instead of black -->
              <div class="w-6 h-6 bg-white border border-[#c9a84c]/30 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
              </div>
              <span class="font-mono text-[11px] tracking-widest text-[#1a1a1a]">SvelteSkill</span>
            </div>
            <span class="font-mono text-[8px] text-[#1a1a1a]/35 tracking-wide">March 22, 2026</span>
          </div>

          <!-- Top divider -->
          <div class="h-px bg-[#c9a84c]/35 mb-3"></div>

          <!-- Seal — gold instead of black -->
          <div class="flex justify-center mb-2">
            <div class="relative w-10 h-10 rounded-full bg-[#faf7f2] border-2 border-[#c9a84c] flex items-center justify-center">
              <div class="absolute inset-[2px] rounded-full border border-dashed border-[#c9a84c]/60"></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c"/>
              </svg>
            </div>
          </div>

          <!-- Cert type -->
          <div class="text-center font-mono text-[7px] tracking-[3px] uppercase text-[#c9a84c] mb-1.5">
            Certificate of Completion
          </div>

          <!-- Headline -->
          <div class="text-center font-serif italic text-[20px] text-[#1a1a1a] leading-tight mb-1">
            This is to certify that
          </div>
          <div class="text-center font-mono text-[7px] tracking-[2px] uppercase text-[#1a1a1a]/25 mb-2">
            Awarded to
          </div>

          <!-- Name with diamond dividers -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
            <div class="w-1 h-1 rotate-45 bg-[#c9a84c]/50"></div>
            <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
          </div>
          <div class="text-center font-serif italic text-[17px] text-[#1a1a1a] py-1.5">
            Daniel Montesclaros
          </div>
          <div class="flex items-center gap-3 mb-2.5">
            <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
            <div class="w-1 h-1 rotate-45 bg-[#c9a84c]/50"></div>
            <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
          </div>

          <!-- Body text -->
          <p class="text-center text-[9px] text-[#1a1a1a]/45 leading-relaxed mb-3 max-w-sm mx-auto">
            has successfully completed all required coursework and demonstrated proficiency in
            <strong class="text-[#1a1a1a]/70 font-semibold">Svelte Fundamentals</strong>,
            encompassing reactive programming principles, component architecture,
            and modern frontend development practices in the
            <em class="text-[#b08030]">Svelte framework</em>.
          </p>

          <!-- Signature row -->
          <div class="flex items-end justify-between gap-4 mt-auto mb-2">

            <!-- Left sig — with your SVG signature -->
            <div class="flex-1 text-center">
              <img
                src="/signature.svg"
                alt="Signature"
                class="h-7 w-auto mx-auto mb-1"
                style="filter: brightness(0) opacity(0.55);"
              />
              <div class="h-px bg-[#c9a84c]/40 mb-1"></div>
              <div class="font-mono text-[6.5px] text-[#1a1a1a]/35 uppercase tracking-wide leading-relaxed">
                Daniel Montesclaros<br/>Lead Developer · Founder
              </div>
            </div>

            <!-- Official seal — gold ring, no black -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full border border-[#c9a84c] bg-[#faf7f2] flex flex-col items-center justify-center mb-1" style="box-shadow: 0 0 0 2px #faf7f2, 0 0 0 3px #c9a84c40;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="mb-0.5">
                <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c" opacity="0.7"/>
              </svg>
              <span class="font-mono text-[5px] text-[#c9a84c]/60 tracking-widest uppercase text-center leading-tight">
                Official<br/>Seal
              </span>
            </div>

            <!-- Right — SvelteSkill platform -->
            <div class="flex-1 text-center">
              <div class="h-7 flex items-end justify-center mb-1">
                <span class="font-serif italic text-[15px] text-[#c9a84c]/70">SvelteSkill</span>
              </div>
              <div class="h-px bg-[#c9a84c]/40 mb-1"></div>
              <div class="font-mono text-[6.5px] text-[#1a1a1a]/35 uppercase tracking-wide leading-relaxed">
                SvelteSkill<br/>Platform Certification
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="h-px bg-[#c9a84c]/20 mb-1.5"></div>
          <div class="flex items-center justify-between">
            <span class="font-mono text-[6.5px] text-[#1a1a1a]/20 tracking-widest">SVSK · 2026 · A3F9B2C1</span>
          </div>

        </div>
      </div>

      <!-- Text — untouched -->
      <div>
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Certificates</span>
        </div>
        <h2 class="font-serif italic text-[clamp(26px,3vw,38px)] font-normal tracking-[-0.5px] leading-[1.2] mb-5">
          A cert worth sharing<br>on LinkedIn
        </h2>
        <p class="text-[#f0ede8]/40 text-[14px] font-light leading-relaxed mb-3">
          Every certificate has a public verification page. Send the link to anyone — recruiter, client, teammate — and they can confirm it instantly.
        </p>
        <p class="text-[#f0ede8]/40 text-[14px] font-light leading-relaxed mb-8">
          No company behind it. The Svelte community is the credibility.
        </p>
        <ul class="space-y-3.5">
          {#each [
            'Unique ID · publicly verifiable at /verify',
            'Downloadable PDF with your full name',
            'One-click LinkedIn share',
            'Public profile showing all earned certs'
          ] as feat (feat)}
            <li class="flex items-center gap-3 text-[13px] text-[#f0ede8]/55 font-light">
              <span class="w-[5px] h-[5px] bg-[#FF3E00] rounded-full opacity-70 flex-shrink-0"></span>
              {feat}
            </li>
          {/each}
        </ul>
      </div>

    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-white/8 px-5 md:px-10 py-6 md:py-7 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414]">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
      </div>
      <span class="font-serif italic text-[#f0ede8]/40 text-[13px]">
        <span class="text-[#FF3E00]">Svelte</span>Skill — built for the community
      </span>
    </div>
    <div class="flex gap-6">
      <a rel="external" href="/verify" class="font-mono text-[9px] uppercase tracking-widest text-[#f0ede8]/25 hover:text-[#f0ede8]/50 transition-colors no-underline">Verify</a>
      <a rel="external" href="https://github.com" class="font-mono text-[9px] uppercase tracking-widest text-[#f0ede8]/25 hover:text-[#f0ede8]/50 transition-colors no-underline">GitHub</a>
    </div>
  </footer>

</div>

<style>
  pre { tab-size: 2; }
</style>