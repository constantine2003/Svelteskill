<script lang="ts">
  /**
   * Exam result page — shown after passing the final exam.
   *
   * Displays a certificate summary card with the learner's name, score,
   * issue date, and cert ID, plus CTAs to view the full certificate,
   * go to the dashboard, or share on LinkedIn.
   *
   * Data is loaded server-side via +page.server.ts and passed in through `data`.
   */

  // ── Types ────────────────────────────────────────────────────────────────

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

  // ── Derived state ────────────────────────────────────────────────────────

  const track       = $derived(data.track);
  const certificate = $derived(data.certificate);
  const profile     = $derived(data.profile);
  const score       = $derived(data.score);
  const issuedAt    = $derived(data.issuedAt);

  /** Prefers full_name for the certificate; falls back to display_name. */
  const certName = $derived(
    profile?.full_name || profile?.display_name || 'Learner'
  );

  /** Long-form date shown on the certificate card, e.g. "April 6, 2026". */
  const formattedDate = $derived(
    new Date(issuedAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  );

  /**
   * Short display ID derived from the certificate UUID.
   * Shown as "SVSK·XXXXXXXX" on the card.
   */
  const certId = $derived(
    certificate?.id
      ? String(certificate.id).toUpperCase().slice(0, 8)
      : 'SVSK0000'
  );

  /**
   * Per-track proficiency description shown in the certificate card.
   * Falls back to a generic string for tracks not listed here.
   */
  const trackDescription: Record<string, string> = {
    'svelte-fundamentals': 'Demonstrated proficiency in core Svelte concepts, reactive programming principles, and component-driven UI development.',
    'sveltekit':           'Demonstrated proficiency in file-based routing, server-side rendering, and building full-stack applications with SvelteKit.',
    'svelte-advanced':     'Demonstrated proficiency in advanced Svelte patterns, performance optimization, and custom store architectures.',
    'svelte-typescript':   'Demonstrated proficiency in type-safe Svelte and SvelteKit application development with full TypeScript integration.',
  };
</script>

<svelte:head>
  <title>Certificate - {track.title} | SvelteSkill</title>
</svelte:head>

<div class="min-h-screen" style="background: var(--bg)">
  <main class="max-w-[640px] mx-auto px-8 py-20">

    <!-- ── Page header ──────────────────────────────────────────────────── -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-2.5 mb-6">
        <div class="w-8 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Congratulations</span>
        <div class="w-8 h-px bg-[#FF3E00]"></div>
      </div>
      <h1 class="font-serif italic text-[clamp(32px,5vw,56px)] font-normal tracking-[-2px] mb-4 leading-tight"
        style="color: var(--text)">
        You passed with {score}%
      </h1>
      <p class="text-base font-light" style="color: var(--text-muted)">
        Your {track.title} certificate has been issued.
      </p>
    </div>

    <!-- ── Certificate summary card ─────────────────────────────────────── -->
    <!--
      Uses a gold (#c9a84c) accent color separate from the orange brand color
      to give certificates a distinct, premium feel.
    -->
    <div class="rounded-2xl overflow-hidden mb-6"
      style="background: var(--surface); border: 1px solid rgba(201,168,76,0.3); box-shadow: 0 0 40px rgba(201,168,76,0.06)">

      <!-- Gold top accent bar -->
      <div class="h-[2px] bg-gradient-to-r from-[#c9a84c] to-[#c9a84c]/10"></div>

      <div class="p-8">

        <!-- Certificate meta — name + track on left, score on right -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="font-mono text-[9px] text-[#c9a84c] tracking-[2px] uppercase mb-2">
              Certificate of Completion
            </div>
            <div class="font-serif italic text-2xl mb-1" style="color: var(--text)">{certName}</div>
            <div class="text-sm font-light" style="color: var(--text-faint)">{track.title}</div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[9px] uppercase tracking-widest mb-1" style="color: var(--text-faint)">Score</div>
            <div class="font-serif italic text-3xl text-[#c9a84c]">{score}%</div>
          </div>
        </div>

        <!-- Gold hairline divider -->
        <div class="h-px mb-6" style="background: rgba(201,168,76,0.15)"></div>

        <!-- Details grid: issue date / cert ID / verified status -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div class="font-mono text-[9px] uppercase tracking-widest mb-1" style="color: var(--text-faint)">Issued</div>
            <div class="text-xs font-light" style="color: var(--text-muted)">{formattedDate}</div>
          </div>
          <div>
            <div class="font-mono text-[9px] uppercase tracking-widest mb-1" style="color: var(--text-faint)">Certificate ID</div>
            <div class="font-mono text-xs" style="color: var(--text-muted)">SVSK·{certId}</div>
          </div>
          <div>
            <div class="font-mono text-[9px] uppercase tracking-widest mb-1" style="color: var(--text-faint)">Status</div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse"></div>
              <span class="font-mono text-[10px] text-[#FF3E00]">Verified</span>
            </div>
          </div>
        </div>

        <!-- Track proficiency description -->
        <div class="rounded-xl p-4 mb-6"
          style="background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.15)">
          <p class="text-sm font-light leading-relaxed" style="color: var(--text-muted)">
            {trackDescription[track.slug] ?? `Demonstrated proficiency in ${track.title} through all required coursework and assessments.`}
          </p>
        </div>

        <!-- Primary CTA — view and download the full certificate -->
        <a rel="external" href="/verify/{certificate?.id}"
          class="flex items-center justify-center gap-2 bg-[#c9a84c] hover:brightness-110 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all w-full"
          style="color: var(--bg)">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          View & Download Certificate
        </a>

      </div>
    </div>

    <!-- ── Secondary actions ─────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-4 mb-6">

      <!-- Dashboard link -->
      <a rel="external" href="/dashboard"
        class="flex items-center justify-center gap-2 font-medium text-sm px-6 py-3.5 rounded-xl transition-all"
        style="background: var(--surface); border: 1px solid var(--border); color: var(--text-muted)">
        Go to dashboard
      </a>

      <!-- LinkedIn share — opens the LinkedIn share dialog with the verify URL -->
      <a
        href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(`https://svelteskill.dev/verify/${certificate?.id}`)}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 bg-[#0077B5] hover:brightness-110 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share on LinkedIn
      </a>
    </div>

  </main>
</div>