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

  const shortId = $derived(
    certId.toUpperCase().slice(0, 8)
  );
</script>

<svelte:head>
  <title>
    {certificate
      ? `${certificate.full_name_on_cert} — ${certificate.tracks?.title} Certificate`
      : 'Certificate Not Found'} · SvelteSkill
  </title>
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] flex flex-col">

  <!-- Simple nav — no auth needed -->
  <nav class="border-b border-white/8 px-8 py-4 flex items-center justify-between">
    <a rel="external" href="/" class="flex items-center gap-2.5">
      <div class="w-6 h-6 bg-[#FF3E00] rounded-md flex items-center justify-center">
        <svg viewBox="0 0 98.1 118" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
        </svg>
      </div>
      <span class="font-serif italic text-[#f0ede8] text-base">SvelteSkill</span>
    </a>
    <a rel="external" href="/auth"
      class="font-mono text-[11px] text-[#f0ede8]/30 hover:text-[#f0ede8]/60 transition-colors">
      Get certified →
    </a>
  </nav>

  <main class="flex-1 flex items-center justify-center px-8 py-16">

    {#if certificate}
      <!-- VALID CERT -->
      <div class="w-full max-w-[680px]">

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

        <!-- Certificate card -->
        <div class="border border-[#FF3E00]/20 rounded-2xl overflow-hidden bg-[#1c1c1c] shadow-[0_0_80px_rgba(255,62,0,0.07)]">
          <div class="h-[3px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
          <div class="p-12">

            <!-- Cert header -->
            <div class="flex items-center justify-between mb-14">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-[#FF3E00] rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 98.1 118" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
                  </svg>
                </div>
                <span class="font-serif italic text-lg text-[#f0ede8]">SvelteSkill</span>
              </div>
              <span class="font-mono text-[10px] text-[#f0ede8]/25">{formattedDate}</span>
            </div>

            <!-- Cert body -->
            <div class="mb-14">
              <div class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-3">
                Certificate of Completion
              </div>
              <div class="font-serif italic text-[26px] text-[#f0ede8] mb-2 leading-tight">
                This certifies that
              </div>
              <div class="font-mono text-[10px] text-[#f0ede8]/30 mb-2">awarded to</div>
              <div class="font-serif italic text-[34px] text-[#f0ede8] mb-4 tracking-[-0.5px]">
                {certificate.full_name_on_cert}
              </div>
              <div class="text-[#f0ede8]/40 text-sm font-light leading-relaxed">
                has successfully completed
                <span class="text-[#FF3E00]"> {certificate.tracks?.title}</span>
                <br />on the SvelteSkill community certification platform
              </div>
            </div>

            <!-- Cert footer -->
            <div class="border-t border-white/8 pt-6 flex items-center justify-between">
              <div>
                <div class="font-mono text-[9px] text-[#f0ede8]/20 mb-0.5">Certificate ID</div>
                <div class="font-mono text-[11px] text-[#f0ede8]/40">SVSK·{shortId}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse"></div>
                <span class="font-mono text-[10px] text-[#FF3E00]">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Issuer info -->
        <div class="mt-8 bg-[#1c1c1c] border border-white/8 rounded-xl p-5 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            {#if certificate.profiles?.avatar_url}
              <img
                src={certificate.profiles.avatar_url}
                alt={certificate.profiles.display_name}
                class="w-10 h-10 rounded-full border border-white/10"
              />
            {/if}
            <div>
              <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-0.5">
                Earned by
              </div>
              <div class="text-[#f0ede8]/70 text-sm font-light">
                {certificate.profiles?.display_name}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[9px] text-[#f0ede8]/25 uppercase tracking-widest mb-0.5">
              Issued on
            </div>
            <div class="text-[#f0ede8]/50 text-sm font-light">{formattedDate}</div>
          </div>
        </div>

        <!-- CTA for visitors -->
        <div class="mt-6 text-center">
          <p class="text-[#f0ede8]/25 text-sm font-light mb-3">
            Want to earn your own Svelte certificate?
          </p>
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

        <h1 class="font-serif italic text-2xl text-[#f0ede8]/60 mb-3">
          Certificate not found
        </h1>
        <p class="text-[#f0ede8]/30 text-sm font-light mb-2">
          The certificate ID <span class="font-mono text-[#f0ede8]/50">SVSK·{shortId}</span> does not exist or may have been revoked.
        </p>
        <p class="text-[#f0ede8]/20 text-xs font-mono mb-8">
          {certId}
        </p>

        <a rel="external" href="/"
          class="inline-flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#222] border border-white/8 text-[#f0ede8]/50 font-medium text-sm px-6 py-2.5 rounded-lg transition-all">
          ← Back to SvelteSkill
        </a>

      </div>
    {/if}

  </main>

  <!-- Footer -->
  <footer class="border-t border-white/8 px-8 py-5 flex items-center justify-between">
    <span class="font-serif italic text-[#f0ede8]/20 text-sm">
      <span class="text-[#FF3E00]">Svelte</span>Skill
    </span>
    <span class="font-mono text-[10px] text-[#f0ede8]/15">
      Community-driven · Free forever
    </span>
  </footer>

</div>