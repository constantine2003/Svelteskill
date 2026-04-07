<script lang="ts">
  import Footer from "../../../lib/components/layout/Footer.svelte";
  /**
   * Certificate verify page — public page for viewing and downloading a certificate.
   *
   * Features:
   *   - Renders the gold parchment certificate (kept as-is, fixed light background)
   *   - PNG download via html2canvas at 3x scale
   *   - Verified badge + cert ID display
   *   - Issuer info card below the certificate
   *   - Invalid state when certificate ID is not found
   *
   * The certificate itself always uses a fixed light parchment background (#faf7f2)
   * regardless of the current theme — this ensures the downloaded PNG is consistent
   * and the cert doesn't blend into the page in light mode.
   */

  // ── Types ────────────────────────────────────────────────────────────────

  interface Props {
    data: {
      certificate: {
        id: string;
        issued_at: string;
        full_name_on_cert: string;
        tracks: { title: string; slug: string; order_index: number } | null;
        profiles: { display_name: string; avatar_url: string | null } | null;
      } | null;
      certId: string;
    }
  }

  const { data }: Props = $props();

  // ── Derived state ────────────────────────────────────────────────────────

  const certificate = $derived(data.certificate);
  const certId      = $derived(data.certId);

  /** Long-form date shown on the certificate, e.g. "April 6, 2026". */
  const formattedDate = $derived(
    certificate?.issued_at
      ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      : ''
  );

  /** First 8 chars of the UUID uppercased — shown as the short cert ID. */
  const shortId = $derived(certId.toUpperCase().slice(0, 8));

  // ── Download ─────────────────────────────────────────────────────────────

  let certEl     = $state<HTMLDivElement>();
  let downloading = $state(false);

  /**
   * Renders the certificate DOM node to a canvas via html2canvas
   * and triggers a PNG download. Scale 3 gives a high-res output.
   */
  async function downloadPng() {
    if (!certEl || downloading) return;
    downloading = true;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certEl, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#faf7f2',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `SvelteSkill-${shortId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      downloading = false;
    }
  }
</script>

<svelte:head>
  <title>
    {certificate
      ? `${certificate.full_name_on_cert} — ${certificate.tracks?.title} Certificate`
      : 'Certificate Not Found'} · SvelteSkill
  </title>
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: var(--bg)">

  <main class="flex-1 flex items-center justify-center px-8 py-16">

    {#if certificate}
      <div class="w-full max-w-[820px]">

        <!-- ── Verified badge ─────────────────────────────────────────── -->
        <div class="flex items-center justify-center mb-10">
          <div class="inline-flex items-center gap-3 rounded-full px-6 py-3"
            style="background: var(--orange-faint); border: 1px solid rgba(255,62,0,0.2)">
            <div class="w-5 h-5 rounded-full flex items-center justify-center"
              style="background: var(--orange-muted)">
              <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span class="font-mono text-[11px] text-[#FF3E00] tracking-widest uppercase">
              Verified Certificate
            </span>
          </div>
        </div>

        <!-- ── Gold parchment certificate ───────────────────────────────
             The certificate always uses a fixed #faf7f2 background and
             #1a1a1a text regardless of theme — this ensures:
               1. The downloaded PNG always looks the same
               2. It doesn't disappear into a white page in light mode
             A subtle shadow separates it from the page background.
        ─────────────────────────────────────────────────────────────── -->
        <div
        bind:this={certEl}
        class="relative border border-[#c9a84c]"
        style="background: #faf7f2; aspect-ratio: 1.414 / 1; box-shadow: 0 4px 40px rgba(0,0,0,0.15); container-type: inline-size;"
      >

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

        <!-- Inner border -->
        <div class="absolute flex flex-col justify-between"
          style="inset: 3cqi; border: 1px solid rgba(201,168,76,0.5); padding: 3cqi 5cqi;">

          <!-- TOP SECTION -->
          <div>
            <!-- Header row -->
            <div class="flex items-center justify-between" style="margin-bottom: 2cqi">
              <div class="flex items-center" style="gap: 1.5cqi">
                <img src="/svelteskill_logo.png" alt="SvelteSkill Logo"
                  style="width: 5cqi; height: 5cqi; border: 1px solid rgba(201,168,76,0.3)"
                  class="object-contain flex-shrink-0 rounded"
                  crossorigin="anonymous" />
                <span class="font-mono tracking-widest text-[#1a1a1a]" style="font-size: 1.5cqi; line-height: 1">SvelteSkill</span>
              </div>
              <span class="font-mono text-[#1a1a1a]/35 tracking-wide" style="font-size: 1.1cqi; line-height: 1">{formattedDate}</span>
            </div>


            <!-- Wax seal -->
            <div class="flex justify-center" style="margin-bottom: 1.5cqi">
              <div class="relative rounded-full bg-[#faf7f2] flex items-center justify-center"
                style="width: 8cqi; height: 8cqi; border: 2px solid #c9a84c">
                <div class="absolute inset-[8%] rounded-full" style="border: 1px dashed rgba(201,168,76,0.6)"></div>
                <svg style="width: 45%; height: 45%" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c"/>
                </svg>
              </div>
            </div>

            <div class="text-center font-mono uppercase text-[#c9a84c]"
              style="font-size: 1.1cqi; letter-spacing: 0.3cqi; margin-bottom: 1cqi">
              Certificate of Completion
            </div>

            <div class="text-center font-serif italic text-[#1a1a1a] leading-tight"
              style="font-size: 2.8cqi; margin-bottom: 0.5cqi">
              This is to certify that
            </div>
            <div class="text-center font-mono uppercase text-[#1a1a1a]/25"
              style="font-size: 1cqi; letter-spacing: 0.2cqi; margin-bottom: 1.5cqi">
              Awarded to
            </div>

            <!-- Name with diamond dividers -->
            <div class="flex items-center" style="gap: 2cqi">
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
              <div class="rotate-45 bg-[#c9a84c]/50" style="width: 0.6cqi; height: 0.6cqi"></div>
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
            </div>
            <div class="text-center font-serif italic text-[#1a1a1a]"
              style="font-size: 3.8cqi; padding: 0.8cqi 0">
              {certificate.full_name_on_cert}
            </div>
            <div class="flex items-center" style="gap: 2cqi; margin-bottom: 2cqi">
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
              <div class="rotate-45 bg-[#c9a84c]/50" style="width: 0.6cqi; height: 0.6cqi"></div>
              <div class="flex-1 bg-[#c9a84c]/30" style="height: 1px"></div>
            </div>

            <!-- Proficiency description -->
            <p class="text-center text-[#1a1a1a]/45 leading-relaxed mx-auto" style="font-size: 1.3cqi; max-width: 80%">
              has successfully completed all required coursework and demonstrated proficiency in
              <strong class="text-[#1a1a1a]/70 font-semibold">{certificate.tracks?.title}</strong>
              {#if certificate.tracks?.slug === 'svelte-fundamentals'},
                encompassing core Svelte concepts, reactive programming principles, and component-driven UI development.
              {:else if certificate.tracks?.slug === 'sveltekit'},
                encompassing file-based routing, server-side rendering, and building full-stack applications with SvelteKit.
              {:else if certificate.tracks?.slug === 'svelte-advanced'},
                encompassing advanced Svelte patterns, performance optimization, and custom store architectures.
              {:else if certificate.tracks?.slug === 'svelte-typescript'},
                encompassing type-safe Svelte and SvelteKit application development with full TypeScript integration.
              {/if}
            </p>
          </div>

          <!-- BOTTOM SECTION -->
          <div>
            <!-- Signature row -->
            <div class="flex items-end justify-between" style="gap: 3cqi; margin-bottom: 1.5cqi">
              <div class="flex-1 text-center">
                <img src="/signature.svg" alt="Signature" class="mx-auto"
                  style="height: 4cqi; width: auto; margin-bottom: 0.5cqi; filter: brightness(0) opacity(0.55);" crossorigin="anonymous" />
                <div class="bg-[#c9a84c]/40" style="height: 1px; margin-bottom: 0.5cqi"></div>
                <div class="font-mono text-[#1a1a1a]/35 uppercase leading-relaxed"
                  style="font-size: 0.9cqi; letter-spacing: 0.1cqi">
                  Daniel Montesclaros<br/>Lead Developer · Founder
                </div>
              </div>

              <!-- Official seal -->
              <div class="flex-shrink-0 rounded-full bg-[#faf7f2] flex flex-col items-center justify-center"
                style="width: 10cqi; height: 10cqi; border: 1px solid #c9a84c">
                <svg style="width: 35%; height: 35%; margin-bottom: 0.3cqi" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c" opacity="0.7"/>
                </svg>
                <span class="font-mono text-[#c9a84c]/60 tracking-widest uppercase text-center leading-tight"
                  style="font-size: 0.75cqi">
                  Official<br/>Seal
                </span>
              </div>

              <div class="flex-1 text-center">
                <div class="flex items-end justify-center" style="height: 4cqi; margin-bottom: 0.5cqi">
                  <span class="font-serif italic text-[#c9a84c]/70" style="font-size: 2.2cqi">SvelteSkill</span>
                </div>
                <div class="bg-[#c9a84c]/40" style="height: 1px; margin-bottom: 0.5cqi"></div>
                <div class="font-mono text-[#1a1a1a]/35 uppercase leading-relaxed"
                  style="font-size: 0.9cqi; letter-spacing: 0.1cqi">
                  SvelteSkill<br/>Platform Certification
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#c9a84c]/20" style="height: 1px; margin-bottom: 1cqi"></div>
            <span class="font-mono text-[#1a1a1a]/20 tracking-widest" style="font-size: 1.05cqi">SVSK · {shortId}</span>
          </div>

        </div>
      </div>

        <!-- ── Actions row ────────────────────────────────────────────── -->
        <div class="mt-5 flex items-center justify-between gap-4">
          <!-- Download PNG — uses html2canvas, see downloadPng() above -->
          <button
            onclick={downloadPng}
            disabled={downloading}
            class="inline-flex items-center gap-2 bg-[#faf7f2] hover:bg-[#f0e8d0] border border-[#c9a84c]/50 text-[#b08030] font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if downloading}
              <svg class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Generating...
            {:else}
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download PNG
            {/if}
          </button>

          <!-- Verified status indicator -->
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse"></div>
            <span class="font-mono text-[10px] text-[#FF3E00]">Verified · SVSK·{shortId}</span>
          </div>
        </div>

        <!-- ── Issuer info card ────────────────────────────────────────── -->
        <div class="mt-5 rounded-xl p-5 flex items-center justify-between gap-4"
          style="background: var(--surface); border: 1px solid var(--border)">
          <div class="flex items-center gap-4">
            {#if certificate.profiles?.avatar_url}
              <img
                src={certificate.profiles.avatar_url}
                alt={certificate.profiles.display_name}
                class="w-10 h-10 rounded-full"
                style="border: 1px solid var(--border)"
              />
            {/if}
            <div>
              <div class="font-mono text-[9px] uppercase tracking-widest mb-0.5" style="color: var(--text-faint)">
                Earned by
              </div>
              <div class="text-sm font-light" style="color: var(--text-muted)">
                {certificate.profiles?.display_name}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[9px] uppercase tracking-widest mb-0.5" style="color: var(--text-faint)">
              Issued on
            </div>
            <div class="text-sm font-light" style="color: var(--text-muted)">{formattedDate}</div>
          </div>
        </div>

        <!-- ── CTA for non-learners viewing the page ──────────────────── -->
        <div class="mt-6 text-center">
          <p class="text-sm font-light mb-3" style="color: var(--text-faint)">
            Want to earn your own Svelte certificate?
          </p>
          <a rel="external" href="/auth"
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
            Start learning free →
          </a>
        </div>

      </div>

    {:else}
      <!-- ── Invalid certificate screen ───────────────────────────────── -->
      <div class="text-center max-w-md">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style="background: var(--surface2); border: 1px solid var(--border)">
          <svg class="w-7 h-7" style="color: var(--text-faint)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="font-serif italic text-2xl mb-3" style="color: var(--text-muted)">
          Certificate not found
        </h1>
        <p class="text-sm font-light mb-2" style="color: var(--text-faint)">
          The certificate ID
          <span class="font-mono" style="color: var(--text-muted)">SVSK·{shortId}</span>
          does not exist or may have been revoked.
        </p>
        <p class="text-xs font-mono mb-8" style="color: var(--text-faint)">{certId}</p>
        <a rel="external" href="/"
          class="inline-flex items-center gap-2 font-medium text-sm px-6 py-2.5 rounded-lg transition-all"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text-muted)">
          ← Back to SvelteSkill
        </a>
      </div>
    {/if}

  </main>

  <!-- ── Footer ───────────────────────────────────────────────────────────── -->
  <Footer />

</div>