<script lang="ts">
  let { data } = $props();
  const user = $derived(data.profile);

  const trackList = [
    {
      num: '01',
      icon: '🔥',
      slug: 'svelte-fundamentals',
      title: 'Svelte Fundamentals',
      desc: 'Components, reactivity, props, events, stores, transitions. The foundation everything else is built on.',
      modules: 12,
      open: true
    },
    {
      num: '02',
      icon: '⚡',
      slug: 'sveltekit',
      title: 'SvelteKit',
      desc: 'File-based routing, SSR, load functions, form actions, hooks. Build and ship real apps.',
      modules: 14,
      open: false
    },
    {
      num: '03',
      icon: '🧠',
      slug: 'svelte-advanced',
      title: 'Svelte Advanced',
      desc: 'Custom stores, advanced transitions, actions, context API, and performance patterns.',
      modules: 10,
      open: false
    },
    {
      num: '04',
      icon: '🔷',
      slug: 'svelte-typescript',
      title: 'Svelte + TypeScript',
      desc: 'Type-safe components, store types, SvelteKit TypeScript patterns and best practices.',
      modules: 8,
      open: false
    }
  ];
</script>

<div class="min-h-screen bg-[#1c1c1c] text-[#f0ede8]">

  <!-- HERO -->
  <section class="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden">

    <!-- Background glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
        style="background: radial-gradient(ellipse, rgba(255,62,0,0.12) 0%, transparent 65%)">
      </div>
      <!-- Grid -->
      <div class="absolute inset-0 opacity-[0.03]"
        style="background-image: linear-gradient(#f0ede8 1px, transparent 1px), linear-gradient(90deg, #f0ede8 1px, transparent 1px); background-size: 48px 48px;">
      </div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto">

      <!-- Badge -->
      <div class="inline-flex items-center gap-2 bg-[#FF3E00]/10 border border-[#FF3E00]/20 text-[#FF3E00] font-mono text-[11px] tracking-widest uppercase px-4 py-2 rounded-full mb-10">
        <span class="w-1.5 h-1.5 bg-[#FF3E00] rounded-full animate-pulse"></span>
        Free · Community · Open to everyone
      </div>

      <!-- Headline -->
      <h1 class="font-serif italic text-[clamp(52px,8vw,96px)] font-normal leading-[1.0] tracking-[-3px] mb-4">
        Earn a <span class="text-[#FF3E00]">Svelte</span><br>certificate.
      </h1>

      <p class="font-serif italic text-[clamp(18px,3vw,28px)] text-[#f0ede8]/50 mb-8 tracking-[-0.5px]">
        for free. for everyone.
      </p>

      <p class="text-[#f0ede8]/50 text-base font-light leading-relaxed max-w-md mx-auto mb-10">
        The missing certification for the Svelte ecosystem. Learn from Fundamentals to Advanced — prove it with a verified cert.
      </p>

      <!-- CTAs -->
      <div class="flex items-center justify-center gap-3 flex-wrap">
        {#if user}
          <a rel="external" href="/dashboard"
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all">
            Go to dashboard →
          </a>
        {:else}
          <a rel="external" href="/auth"
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all">
            Start learning free →
          </a>
          <a rel="external" href="#tracks"
            class="inline-flex items-center gap-2 bg-transparent hover:bg-white/5 text-[#f0ede8] font-medium text-sm px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 transition-all">
            View tracks
          </a>
        {/if}
      </div>

      <p class="font-mono text-[11px] text-[#f0ede8]/25 mt-6 tracking-wide">
        no credit card · no company · just svelte
      </p>

      <!-- Stats -->
      <div class="flex items-center justify-center gap-8 mt-16">
        <div class="text-center">
          <div class="font-serif italic text-3xl text-[#f0ede8]">4</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Cert tracks</div>
        </div>
        <div class="w-px h-10 bg-white/10"></div>
        <div class="text-center">
          <div class="font-serif italic text-3xl text-[#f0ede8]">Free</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Always</div>
        </div>
        <div class="w-px h-10 bg-white/10"></div>
        <div class="text-center">
          <div class="font-serif italic text-3xl text-[#f0ede8]">∞</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 uppercase tracking-widest mt-1">Learners welcome</div>
        </div>
      </div>

    </div>
  </section>

  <!-- MARQUEE STRIP -->
  <div class="border-y border-white/10 py-3 overflow-hidden bg-[#FF3E00]/[0.03]">
    <div class="flex gap-12 w-max animate-marquee">
      {#each Array(2) as _}
        {#each ['Svelte Fundamentals', 'SvelteKit', 'Svelte Advanced', 'Svelte + TypeScript', 'Free forever', 'Verifiable certs', 'Community driven', 'No paywall'] as item}
          <span class="font-mono text-[11px] uppercase tracking-widest text-[#f0ede8]/30 flex items-center gap-3 whitespace-nowrap">
            <span class="w-1 h-1 bg-[#FF3E00] rounded-full opacity-60"></span>
            {item}
          </span>
        {/each}
      {/each}
    </div>
  </div>

  <!-- SVELTE VS SVELTEKIT -->
  <section class="border-y border-white/10 py-24 px-6" id="explainer">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <p class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-4">Before you begin</p>
        <h2 class="font-serif italic text-[clamp(28px,4vw,44px)] tracking-[-1px] mb-4">
          Svelte vs SvelteKit —<br>what's actually different?
        </h2>
        <p class="text-[#f0ede8]/40 text-sm font-light max-w-md mx-auto">
          Every beginner asks this. We answer it by separating them into two distinct tracks.
        </p>
      </div>

      <div class="grid grid-cols-[1fr_48px_1fr] gap-0 items-start">

        <!-- Svelte -->
        <div class="border border-[#FF3E00]/30 bg-[#FF3E00]/[0.03] rounded-xl p-8">
          <div class="inline-flex items-center gap-1.5 bg-[#FF3E00]/15 text-[#FF3E00] font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded mb-5">
            Track 01 · Start here
          </div>
          <h3 class="font-serif italic text-2xl mb-3">Svelte</h3>
          <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed mb-6">
            A compiler — not a runtime library. Turns your components into optimised vanilla JS at build time. No virtual DOM, no overhead.
          </p>
          <ul class="space-y-2.5">
            {#each ['Reactivity without a runtime', 'Components, props, events', 'Stores, transitions, actions', 'The language itself'] as point}
              <li class="flex items-baseline gap-3 text-sm text-[#f0ede8]/60 font-light">
                <span class="text-[#FF3E00] text-xs flex-shrink-0">→</span>
                {point}
              </li>
            {/each}
          </ul>
        </div>

        <!-- Arrow -->
        <div class="flex items-center justify-center pt-32 text-[#FF3E00]/30 text-xl">→</div>

        <!-- SvelteKit -->
        <div class="border border-white/10 rounded-xl p-8">
          <div class="inline-flex items-center gap-1.5 bg-white/5 text-[#f0ede8]/40 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded mb-5">
            Track 02 · After Fundamentals
          </div>
          <h3 class="font-serif italic text-2xl mb-3">SvelteKit</h3>
          <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed mb-6">
            The application framework built on top of Svelte. Once you know Svelte, SvelteKit is how you build and ship a real product.
          </p>
          <ul class="space-y-2.5">
            {#each ['File-based routing', 'Server-side rendering (SSR)', 'load() and form actions', 'Adapters and deployment'] as point}
              <li class="flex items-baseline gap-3 text-sm text-[#f0ede8]/60 font-light">
                <span class="text-[#FF3E00] text-xs flex-shrink-0">→</span>
                {point}
              </li>
            {/each}
          </ul>
        </div>

      </div>
    </div>
  </section>

  <!-- TRACKS -->
  <section class="py-24 px-6 bg-[#171717]" id="tracks">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <p class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-3">Curriculum</p>
          <h2 class="font-serif italic text-[clamp(28px,4vw,44px)] tracking-[-1px]">
            Four tracks.<br>One clear path.
          </h2>
        </div>
        <p class="text-[#f0ede8]/40 text-sm font-light max-w-[240px] text-right">
          Complete each track in order. Every cert earned unlocks the next.
        </p>
      </div>

      <div class="grid grid-cols-4 border border-white/10 rounded-xl overflow-hidden divide-x divide-white/10">
        {#each trackList as track (track.slug)}
          <div class="relative p-7 bg-[#1c1c1c] hover:bg-[#222] transition-colors group
            {track.open ? '' : 'opacity-50'}">

            {#if track.open}
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-[#FF3E00]"></div>
            {/if}

            <div class="font-mono text-[10px] text-[#f0ede8]/20 tracking-widest mb-5">{track.num} / 04</div>
            <div class="text-2xl mb-4">{track.icon}</div>
            <h3 class="font-serif italic text-base text-[#f0ede8] mb-2 leading-snug">{track.title}</h3>
            <p class="text-[#f0ede8]/35 text-[11px] font-light leading-relaxed mb-6">{track.desc}</p>

            <div class="flex items-center justify-between">
              <span class="font-mono text-[10px] text-[#f0ede8]/25">{track.modules} modules</span>
              {#if track.open}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-[#FF3E00]/15 text-[#FF3E00] rounded-full">● Open</span>
              {:else}
                <span class="font-mono text-[9px] tracking-widest uppercase px-2 py-1 bg-white/5 text-[#f0ede8]/25 rounded-full">🔒 Locked</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="py-24 px-6 border-t border-white/10" id="how">
    <div class="max-w-5xl mx-auto">
      <div class="mb-16">
        <p class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-3">Process</p>
        <h2 class="font-serif italic text-[clamp(28px,4vw,44px)] tracking-[-1px]">How you earn it</h2>
      </div>

      <div class="grid grid-cols-3 border border-white/10 rounded-xl overflow-hidden divide-x divide-white/10">
        {#each [
          { n: '01', tag: 'Learn', title: 'Complete all modules', desc: 'Work through every lesson at your own pace. Each module ends with a short quiz to check your understanding.' },
          { n: '02', tag: 'Prove it', title: 'Pass the final exam', desc: 'A timed exam covering the full track. Score 80% or above to pass. No limit on retakes.' },
          { n: '03', tag: 'Share it', title: 'Get your certificate', desc: 'Download a PDF cert with a unique verifiable ID. Anyone can confirm it\'s real at svelteskill.dev/verify.' }
        ] as step}
          <div class="bg-[#1c1c1c] p-10">
            <div class="font-serif italic text-[56px] text-[#FF3E00]/10 leading-none mb-6 tracking-[-3px]">{step.n}</div>
            <div class="inline-block font-mono text-[9px] tracking-widest uppercase bg-[#FF3E00]/10 text-[#FF3E00] px-2 py-1 rounded mb-4">{step.tag}</div>
            <h3 class="font-serif italic text-lg text-[#f0ede8] mb-3">{step.title}</h3>
            <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed">{step.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CERT PREVIEW -->
  <section class="py-24 px-6 bg-[#171717] border-t border-white/10" id="cert">
    <div class="max-w-5xl mx-auto grid grid-cols-2 gap-20 items-center">

      <!-- Mock cert -->
      <div class="border border-white/10 rounded-xl overflow-hidden bg-[#1c1c1c]">
        <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
        <div class="p-10">
          <div class="flex items-center justify-between mb-12">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-[#FF3E00] rounded-md flex items-center justify-center">
                <svg viewBox="0 0 98.1 118" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                  <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
                </svg>
              </div>
              <span class="font-serif italic text-sm text-[#f0ede8]">SvelteSkill</span>
            </div>
            <span class="font-mono text-[10px] text-[#f0ede8]/30">March 22, 2026</span>
          </div>

          <div class="font-mono text-[9px] text-[#FF3E00] tracking-[2px] uppercase mb-2">Certificate of Completion</div>
          <div class="font-serif italic text-2xl text-[#f0ede8] mb-1">This certifies that</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 mb-1">awarded to</div>
          <div class="font-serif italic text-xl text-[#f0ede8] mb-2">Daniel Montesclaros</div>
          <div class="text-sm font-light text-[#f0ede8]/40 mb-10">
            has completed <span class="text-[#FF3E00]">Svelte Fundamentals</span>
          </div>

          <div class="border-t border-white/10 pt-5 flex items-center justify-between">
            <span class="font-mono text-[9px] text-[#f0ede8]/20">SVSK·2026·A3F9B2C1</span>
            <button class="font-mono text-[9px] text-[#FF3E00] bg-[#FF3E00]/10 px-3 py-1.5 rounded">verify →</button>
          </div>
        </div>
      </div>

      <!-- Text -->
      <div>
        <p class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-4">Certificates</p>
        <h2 class="font-serif italic text-[clamp(26px,3vw,38px)] tracking-[-0.5px] leading-[1.2] mb-5">
          A cert worth sharing<br>on LinkedIn
        </h2>
        <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed mb-3">
          Every certificate has a public verification page. Send the link to anyone — recruiter, client, teammate — and they can confirm it instantly.
        </p>
        <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed mb-8">
          No company behind it. The Svelte community is the credibility.
        </p>
        <ul class="space-y-4">
          {#each [
            'Unique ID · publicly verifiable at /verify',
            'Downloadable PDF with your full name',
            'One-click LinkedIn share',
            'Public profile showing all earned certs'
          ] as feat}
            <li class="flex items-center gap-3 text-sm text-[#f0ede8]/60 font-light">
              <span class="w-1.5 h-1.5 bg-[#FF3E00] rounded-full opacity-70 flex-shrink-0"></span>
              {feat}
            </li>
          {/each}
        </ul>
      </div>

    </div>
  </section>

  <!-- CTA -->
  <section class="py-32 px-6 text-center border-t border-white/10 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,62,0,0.07) 0%, transparent 65%)">
    </div>
    <div class="relative z-10 max-w-lg mx-auto">
      <p class="font-mono text-[10px] text-[#FF3E00]/70 tracking-[2px] uppercase mb-6">Ready?</p>
      <h2 class="font-serif italic text-[clamp(38px,6vw,64px)] tracking-[-2px] leading-[1.05] mb-5">
        Start with<br><span class="text-[#FF3E00]">Fundamentals</span>
      </h2>
      <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed mb-10">
        Free forever. No paywall. Sign in with GitHub or Google and begin your first module right now.
      </p>
      <div class="flex items-center justify-center gap-3 flex-wrap">
        <a rel="external" href="/auth"
          class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </a>
        <a rel="external" href="/auth"
          class="inline-flex items-center gap-2 bg-transparent hover:bg-white/5 text-[#f0ede8]/60 font-medium text-sm px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 transition-all">
          Continue with Google
        </a>
      </div>
      <p class="font-mono text-[10px] text-[#f0ede8]/20 mt-6 tracking-wide">
        no credit card · no company · just svelte
      </p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-white/10 px-8 py-8 flex items-center justify-between bg-[#171717]">
    <div class="flex items-center gap-2">
      <div class="w-5 h-5 bg-[#FF3E00] rounded flex items-center justify-center">
        <svg viewBox="0 0 98.1 118" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
        </svg>
      </div>
      <span class="font-serif italic text-[#f0ede8]/40 text-sm">SvelteSkill — built for the community</span>
    </div>
    <div class="flex gap-6">
      <a rel="external" href="/verify" class="font-mono text-[10px] uppercase tracking-widest text-[#f0ede8]/25 hover:text-[#f0ede8]/50 transition-colors">Verify</a>
      <a rel="external" href="https://github.com" class="font-mono text-[10px] uppercase tracking-widest text-[#f0ede8]/25 hover:text-[#f0ede8]/50 transition-colors">GitHub</a>
    </div>
  </footer>

</div>

<style>
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
</style>