<script lang="ts">
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
  const certificate = $derived(data.certificate);
  const certId = $derived(data.certId);

  const formattedDate = $derived(
    certificate?.issued_at
      ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      : ''
  );

  const shortId = $derived(certId.toUpperCase().slice(0, 8));

  let certEl = $state<HTMLDivElement>();
  let downloading = $state(false);

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

<div class="min-h-screen bg-[#1a1a1a] flex flex-col">

  <main class="flex-1 flex items-center justify-center px-8 py-16">

    {#if certificate}
      <div class="w-full max-w-[820px]">

        <!-- Verified badge -->
        <div class="flex items-center justify-center mb-10">
          <div class="inline-flex items-center gap-3 bg-[#FF3E00]/[0.08] border border-[#FF3E00]/20 rounded-full px-6 py-3">
            <div class="w-5 h-5 rounded-full bg-[#FF3E00]/20 flex items-center justify-center">
              <svg class="w-3 h-3 text-[#FF3E00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span class="font-mono text-[11px] text-[#FF3E00] tracking-widest uppercase">
              Verified Certificate
            </span>
          </div>
        </div>

        <!-- Gold parchment cert -->
        <div bind:this={certEl} class="relative bg-[#faf7f2] border border-[#c9a84c]" style="aspect-ratio: 1.414 / 1;">

          <!-- Corner ornaments -->
          {#each [
            'top-1.5 left-1.5',
            'top-1.5 right-1.5 -scale-x-100',
            'bottom-1.5 left-1.5 -scale-y-100',
            'bottom-1.5 right-1.5 scale-[-1]'
          ] as pos (pos)}
            <svg class="absolute {pos} w-7 h-7 opacity-60" viewBox="0 0 40 40" fill="none">
              <path d="M2 2 L12 2 M2 2 L2 12" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M14 2 Q20 8 14 14 Q8 20 2 14" stroke="#c9a84c" stroke-width="0.75" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="#c9a84c"/>
            </svg>
          {/each}

          <!-- Inner border -->
          <div class="absolute inset-3 border border-[#c9a84c]/50 flex flex-col justify-between px-12 py-6">

            <!-- TOP SECTION -->
            <div>
              <!-- Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 bg-white border border-[#c9a84c]/30 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="w-full h-full object-contain" crossorigin="anonymous" />
                  </div>
                  <span class="font-mono text-[12px] tracking-widest text-[#1a1a1a]" style="line-height:1;">SvelteSkill</span>
                </div>
                <span class="font-mono text-[9px] text-[#1a1a1a]/35 tracking-wide" style="line-height:1;">{formattedDate}</span>
              </div>

              <!-- Top divider -->
              <div class="h-px bg-[#c9a84c]/35 mb-4"></div>

              <!-- Seal -->
              <div class="flex justify-center mb-2.5">
                <div class="relative w-12 h-12 rounded-full bg-[#faf7f2] border-2 border-[#c9a84c] flex items-center justify-center">
                  <div class="absolute inset-[2px] rounded-full border border-dashed border-[#c9a84c]/60"></div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c"/>
                  </svg>
                </div>
              </div>

              <!-- Cert type -->
              <div class="text-center font-mono text-[8px] tracking-[3px] uppercase text-[#c9a84c] mb-2">
                Certificate of Completion
              </div>

              <!-- Headline -->
              <div class="text-center font-serif italic text-[22px] text-[#1a1a1a] leading-tight mb-1">
                This is to certify that
              </div>
              <div class="text-center font-mono text-[8px] tracking-[2px] uppercase text-[#1a1a1a]/25 mb-2.5">
                Awarded to
              </div>

              <!-- Name with diamond dividers -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
                <div class="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]/50"></div>
                <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
              </div>
              <div class="text-center font-serif italic text-[35px] text-[#1a1a1a] py-2">
                {certificate.full_name_on_cert}
              </div>
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
                <div class="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]/50"></div>
                <div class="flex-1 h-px bg-[#c9a84c]/30"></div>
              </div>

              <!-- Body text -->
              <p class="text-center text-[15px] text-[#1a1a1a]/45 leading-relaxed max-w-md mx-auto">
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
              <div class="flex items-end justify-between gap-4 mb-3">

                <div class="flex-1 text-center">
                  <img
                    src="/signature.svg"
                    alt="Signature"
                    class="h-8 w-auto mx-auto mb-1.5"
                    style="filter: brightness(0) opacity(0.55);"
                    crossorigin="anonymous"
                  />
                  <div class="h-px bg-[#c9a84c]/40 mb-1.5"></div>
                  <div class="font-mono text-[7px] text-[#1a1a1a]/35 uppercase tracking-wide leading-relaxed">
                    Daniel Montesclaros<br/>Lead Developer · Founder
                  </div>
                </div>

                <div class="flex-shrink-0 w-14 h-14 rounded-full border border-[#c9a84c] bg-[#faf7f2] flex flex-col items-center justify-center mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="mb-0.5">
                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" fill="#c9a84c" opacity="0.7"/>
                  </svg>
                  <span class="font-mono text-[6px] text-[#c9a84c]/60 tracking-widest uppercase text-center leading-tight">
                    Official<br/>Seal
                  </span>
                </div>

                <div class="flex-1 text-center">
                  <div class="h-8 flex items-end justify-center mb-1.5">
                    <span class="font-serif italic text-[17px] text-[#c9a84c]/70">SvelteSkill</span>
                  </div>
                  <div class="h-px bg-[#c9a84c]/40 mb-1.5"></div>
                  <div class="font-mono text-[7px] text-[#1a1a1a]/35 uppercase tracking-wide leading-relaxed">
                    SvelteSkill<br/>Platform Certification
                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div class="h-px bg-[#c9a84c]/20 mb-2"></div>
              <div class="flex items-center justify-between">
                <span class="font-mono text-[7px] text-[#1a1a1a]/20 tracking-widest">SVSK · {shortId}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Actions row -->
        <div class="mt-5 flex items-center justify-between gap-4">
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

          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse"></div>
            <span class="font-mono text-[10px] text-[#FF3E00]">Verified · SVSK·{shortId}</span>
          </div>
        </div>

        <!-- Issuer info -->
        <div class="mt-5 bg-[#1c1c1c] border border-white/8 rounded-xl p-5 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            {#if certificate.profiles?.avatar_url}
              <img
                src={certificate.profiles.avatar_url}
                alt={certificate.profiles.display_name}
                class="w-10 h-10 rounded-full border border-white/10"
              />
            {/if}
            <div>
              <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-0.5">Earned by</div>
              <div class="text-[#f0ede8]/70 text-sm font-light">{certificate.profiles?.display_name}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-0.5">Issued on</div>
            <div class="text-[#f0ede8]/50 text-sm font-light">{formattedDate}</div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-6 text-center">
          <p class="text-[#f0ede8]/25 text-sm font-light mb-3">Want to earn your own Svelte certificate?</p>
          <a rel="external" href="/auth"
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
            Start learning free →
          </a>
        </div>

      </div>

    {:else}
      <!-- INVALID CERT -->
      <div class="text-center max-w-md">
        <div class="w-16 h-16 bg-white/4 border border-white/8 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-7 h-7 text-[#f0ede8]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="font-serif italic text-2xl text-[#f0ede8]/60 mb-3">Certificate not found</h1>
        <p class="text-[#f0ede8]/30 text-sm font-light mb-2">
          The certificate ID <span class="font-mono text-[#f0ede8]/50">SVSK·{shortId}</span> does not exist or may have been revoked.
        </p>
        <p class="text-[#f0ede8]/20 text-xs font-mono mb-8">{certId}</p>
        <a rel="external" href="/"
          class="inline-flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#222] border border-white/8 text-[#f0ede8]/50 font-medium text-sm px-6 py-2.5 rounded-lg transition-all">
          ← Back to SvelteSkill
        </a>
      </div>
    {/if}

  </main>

  <!-- Footer -->
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