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

  <!-- CERT PREVIEW -->
  <section class="py-16 md:py-24 px-5 md:px-10 bg-[#141414] border-t border-white/8" id="cert">
    <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

      <!-- Mock cert -->
      <div class="border border-white/8 rounded-xl overflow-hidden bg-[#141414]">
        <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
        <div class="p-7 md:p-10">
          <div class="flex items-center justify-between mb-8 md:mb-10">
            <div class="flex items-center gap-2">
              <div class="w-[22px] h-[22px] bg-[#FF3E00] rounded-[4px] flex items-center justify-center">
                <svg viewBox="0 0 98.1 118" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
                  <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
                </svg>
              </div>
              <span class="font-serif italic text-[13px] text-[#f0ede8]">SvelteSkill</span>
            </div>
            <span class="font-mono text-[9px] text-[#f0ede8]/30">March 22, 2026</span>
          </div>
          <div class="font-mono text-[9px] text-[#FF3E00] tracking-[2px] uppercase mb-1.5">Certificate of Completion</div>
          <div class="font-serif italic text-[24px] text-[#f0ede8] mb-1">This certifies that</div>
          <div class="font-mono text-[9px] text-[#f0ede8]/30 mb-1">awarded to</div>
          <div class="font-serif italic text-[19px] text-[#f0ede8] mb-1.5">Daniel Montesclaros</div>
          <div class="text-[12px] font-light text-[#f0ede8]/40 mb-8">
            has completed <span class="text-[#FF3E00]">Svelte Fundamentals</span>
          </div>
          <div class="border-t border-white/8 pt-4 flex items-center justify-between">
            <span class="font-mono text-[9px] text-[#f0ede8]/20">SVSK·2026·A3F9B2C1</span>
            <button class="font-mono text-[9px] text-[#FF3E00] bg-[#FF3E00]/10 border-none px-2.5 py-1.5 rounded cursor-pointer">verify →</button>
          </div>
        </div>
      </div>

      <!-- Text -->
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

  <!-- CTA -->
  <section class="py-24 md:py-32 px-5 md:px-10 text-center border-t border-white/8 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,62,0,0.07) 0%, transparent 65%)">
    </div>
    <div class="relative z-10 max-w-[500px] mx-auto">
      <div class="flex items-center justify-center gap-2.5 mb-6">
        <div class="w-4 h-px bg-[#FF3E00]/60"></div>
        <span class="font-mono text-[10px] text-[#FF3E00]/70 tracking-[2px] uppercase">Ready?</span>
        <div class="w-4 h-px bg-[#FF3E00]/60"></div>
      </div>
      <h2 class="font-serif italic text-[clamp(40px,6vw,64px)] font-normal tracking-[-2px] leading-[1.05] text-[#f0ede8] mb-4">
        Start with<br><span class="text-[#FF3E00]">Fundamentals</span>
      </h2>
      <p class="text-[#f0ede8]/40 text-[14px] font-light leading-relaxed mb-10">
        Free forever. No paywall. Sign in with GitHub or Google and begin your first module right now.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2.5 flex-wrap">
        <a rel="external" href="/auth"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg transition-all">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </a>
        <a rel="external" href="/auth"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-[#f0ede8]/55 font-medium text-[14px] px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>
      </div>
      <p class="font-mono text-[10px] text-[#f0ede8]/20 mt-5 tracking-wide">
        no credit card · no company · just svelte
      </p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-white/8 px-5 md:px-10 py-6 md:py-7 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414]">
    <div class="flex items-center gap-2">
      <div class="w-5 h-5 bg-[#FF3E00] rounded flex items-center justify-center">
        <svg viewBox="0 0 98.1 118" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
        </svg>
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