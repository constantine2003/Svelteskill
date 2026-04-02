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
  <main class="max-w-[760px] mx-auto px-8 py-20">

    <!-- Header -->
    <div class="text-center mb-16">
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

    <!-- Certificate card -->
    <div class="border border-[#FF3E00]/25 rounded-2xl overflow-hidden bg-[#1c1c1c] mb-10 shadow-[0_0_60px_rgba(255,62,0,0.08)]">
      <div class="h-[3px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
      <div class="p-12">

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

        <div class="mb-14">
          <div class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase mb-3">
            Certificate of Completion
          </div>
          <div class="font-serif italic text-[28px] text-[#f0ede8] mb-2 leading-tight">
            This certifies that
          </div>
          <div class="font-mono text-[10px] text-[#f0ede8]/30 mb-2">awarded to</div>
          <div class="font-serif italic text-[32px] text-[#f0ede8] mb-4 tracking-[-0.5px]">
            {certName}
          </div>
          <div class="text-[#f0ede8]/40 text-sm font-light">
            has successfully completed
            <span class="text-[#FF3E00]"> {track.title}</span>
            <br />with a final exam score of
            <span class="text-[#f0ede8]"> {score}%</span>
          </div>
        </div>

        <div class="border-t border-white/8 pt-6 flex items-center justify-between">
          <div>
            <div class="font-mono text-[9px] text-[#f0ede8]/20 mb-0.5">Certificate ID</div>
            <div class="font-mono text-[11px] text-[#f0ede8]/40">SVSK·{certId}</div>
          </div>
          <a rel="external" href="/verify/{certificate?.id}"
            class="font-mono text-[10px] text-[#FF3E00] bg-[#FF3E00]/10 hover:bg-[#FF3E00]/20 px-3 py-2 rounded-lg transition-colors">
            Verify →
          </a>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <a rel="external" href="/dashboard"
        class="flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#222] border border-white/8 hover:border-white/14 text-[#f0ede8]/70 font-medium text-sm px-6 py-3.5 rounded-xl transition-all">
        Go to dashboard
      </a>
      <a rel="external" href="/verify/{certificate?.id}"
        class="flex items-center justify-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all">
        View verify page →
      </a>
    </div>

    <!-- LinkedIn share -->
    <div class="bg-[#1c1c1c] border border-white/8 rounded-xl p-5 flex items-center justify-between gap-4">
      <div>
        <div class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest mb-1">Share on LinkedIn</div>
        <p class="text-[#f0ede8]/40 text-sm font-light">
          Let your network know you earned this certificate.
        </p>
      </div>
      <a
        href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(`https://svelteskill.dev/verify/${certificate?.id}`)}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-shrink-0 inline-flex items-center gap-2 bg-[#0077B5] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share
      </a>
    </div>

  </main>
</div>