<script lang="ts">
  interface Track { id: number; slug: string; title: string }
  interface Certificate { id: string; issued_at: string }
  interface Profile { display_name: string; full_name: string | null }

  interface Props {
    data: {
      track: Track;
      certificate: Certificate | null;
      profile: Profile | null;
      score: number;
      issuedAt: string;
    }
  }

  const { data }: Props = $props();

  const track = $derived(data.track);
  const certificate = $derived(data.certificate);
  const profile = $derived(data.profile);
  const score = $derived(data.score);
  const issuedAt = $derived(data.issuedAt);

  const certName = $derived(
    profile?.full_name || profile?.display_name || 'Learner'
  );

  const formattedDate = $derived(
    new Date(issuedAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  );

  const certId = $derived(
    certificate?.id
      ? String(certificate.id).toUpperCase().slice(0, 8)
      : 'SVSK0000'
  );
</script>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-[640px] mx-auto px-8 py-20">

    <!-- Header -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-2.5 mb-6">
        <div class="w-8 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Congratulations</span>
        <div class="w-8 h-px bg-[#FF3E00]"></div>
      </div>
      <h1 class="font-serif italic text-[clamp(32px,5vw,56px)] font-normal tracking-[-2px] text-[#f0ede8] mb-4 leading-tight">
        You passed with {score}%
      </h1>
      <p class="text-[#f0ede8]/40 text-base font-light">
        Your {track.title} certificate has been issued.
      </p>
    </div>

    <!-- Certificate summary card (replaces the rendered cert) -->
    <div class="bg-[#1c1c1c] border border-[#c9a84c]/30 rounded-2xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(201,168,76,0.06)]">
      <div class="h-[2px] bg-gradient-to-r from-[#c9a84c] to-[#c9a84c]/10"></div>
      <div class="p-8">

        <!-- Cert meta -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="font-mono text-[9px] text-[#c9a84c] tracking-[2px] uppercase mb-2">Certificate of Completion</div>
            <div class="font-serif italic text-2xl text-[#f0ede8] mb-1">{certName}</div>
            <div class="text-[#f0ede8]/35 text-sm font-light">{track.title}</div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Score</div>
            <div class="font-serif italic text-3xl text-[#c9a84c]">{score}%</div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-[#c9a84c]/15 mb-6"></div>

        <!-- Details grid -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Issued</div>
            <div class="text-[#f0ede8]/60 text-xs font-light">{formattedDate}</div>
          </div>
          <div>
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Certificate ID</div>
            <div class="font-mono text-[#f0ede8]/60 text-xs">SVSK·{certId}</div>
          </div>
          <div>
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Status</div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse"></div>
              <span class="font-mono text-[10px] text-[#FF3E00]">Verified</span>
            </div>
          </div>
        </div>

        <!-- Track description -->
        <div class="bg-[#c9a84c]/[0.05] border border-[#c9a84c]/15 rounded-xl p-4 mb-6">
          <p class="text-[#f0ede8]/40 text-sm font-light leading-relaxed">
            {#if track.slug === 'svelte-fundamentals'}
              Demonstrated proficiency in core Svelte concepts, reactive programming principles, and component-driven UI development.
            {:else if track.slug === 'sveltekit'}
              Demonstrated proficiency in file-based routing, server-side rendering, and building full-stack applications with SvelteKit.
            {:else if track.slug === 'svelte-advanced'}
              Demonstrated proficiency in advanced Svelte patterns, performance optimization, and custom store architectures.
            {:else if track.slug === 'svelte-typescript'}
              Demonstrated proficiency in type-safe Svelte and SvelteKit application development with full TypeScript integration.
            {:else}
              Demonstrated proficiency in {track.title} through all required coursework and assessments.
            {/if}
          </p>
        </div>

        <!-- View certificate CTA -->
        <a rel="external" href="/verify/{certificate?.id}"
          class="flex items-center justify-center gap-2 bg-[#c9a84c] hover:brightness-110 text-[#1a1a1a] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all w-full">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          View & Download Certificate
        </a>

      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <a rel="external" href="/dashboard"
        class="flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#222] border border-white/8 hover:border-white/14 text-[#f0ede8]/70 font-medium text-sm px-6 py-3.5 rounded-xl transition-all">
        Go to dashboard
      </a>
      <a
        href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(`https://svelteskill.dev/verify/${certificate?.id}`)}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 bg-[#0077B5] hover:brightness-110 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share on LinkedIn
      </a>
    </div>

  </main>
</div>