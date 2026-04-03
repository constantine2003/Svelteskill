<script lang="ts">
  interface Certificate {
    id: string;
    issued_at: string;
    full_name_on_cert: string;
    tracks: { title: string; slug: string; order_index: number } | null;
  }

  interface Profile {
    id: string;
    display_name: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  }

  interface Props {
    data: {
      profile: Profile;
      certificates: Certificate[];
      username: string;
    }
  }

  const { data }: Props = $props();
  const profile = $derived(data.profile);
  const certificates = $derived(data.certificates);

  const joinedDate = $derived(
    new Date(profile.created_at).toLocaleDateString('en-US', {
      month: 'long', year: 'numeric'
    })
  );

//   const trackOrder: Record<string, number> = {
//     'svelte-fundamentals': 1,
//     'sveltekit': 2,
//     'svelte-advanced': 3,
//     'svelte-typescript': 4
//   };

</script>

<svelte:head>
  <title>{profile.display_name} — SvelteSkill</title>
  <meta name="description" content="{profile.display_name} has earned {certificates.length} Svelte certificate{certificates.length !== 1 ? 's' : ''} on SvelteSkill." />
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-[760px] mx-auto px-8 py-14">

    <!-- Profile header -->
    <div class="flex items-start gap-6 mb-14 pb-14 border-b border-white/8">
      <!-- Avatar -->
      {#if profile.avatar_url}
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          class="w-20 h-20 rounded-full border border-white/10 flex-shrink-0"
        />
      {:else}
        <div class="w-20 h-20 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/20 flex items-center justify-center flex-shrink-0">
          <span class="font-serif italic text-3xl text-[#FF3E00]">
            {profile.display_name[0].toUpperCase()}
          </span>
        </div>
      {/if}

      <!-- Info -->
      <div class="flex-1">
        <h1 class="font-serif italic text-[clamp(24px,4vw,36px)] font-normal tracking-[-1px] text-[#f0ede8] mb-1">
          {profile.display_name}
        </h1>
        {#if profile.full_name && profile.full_name !== profile.display_name}
          <p class="text-[#f0ede8]/40 text-sm font-light mb-3">{profile.full_name}</p>
        {/if}
        <div class="flex items-center gap-4">
          <span class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest">
            Joined {joinedDate}
          </span>
          <span class="w-1 h-1 rounded-full bg-white/20"></span>
          <span class="font-mono text-[10px] text-[#f0ede8]/25 uppercase tracking-widest">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
          </span>
        </div>
      </div>
    </div>

    <!-- Certificates section -->
    {#if certificates.length > 0}
      <div>
        <div class="flex items-center gap-2.5 mb-8">
          <div class="w-4 h-px bg-[#FF3E00]"></div>
          <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
            Certificates
          </span>
        </div>

        <div class="flex flex-col gap-4">
          {#each certificates as cert (cert.id)}
            <div class="bg-[#1c1c1c] border border-[#FF3E00]/20 rounded-xl overflow-hidden">
              <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
              <div class="p-6 flex items-center justify-between gap-6">

                <div class="flex items-center gap-4">
                  <!-- Track number badge -->
                  <div class="w-10 h-10 rounded-lg bg-[#FF3E00]/10 border border-[#FF3E00]/20 flex items-center justify-center flex-shrink-0">
                    <span class="font-mono text-[11px] text-[#FF3E00]">
                      0{cert.tracks?.order_index ?? '?'}
                    </span>
                  </div>

                  <div>
                    <div class="font-serif italic text-base text-[#f0ede8] mb-0.5">
                      {cert.tracks?.title ?? 'Unknown track'}
                    </div>
                    <div class="font-mono text-[10px] text-[#f0ede8]/30">
                      Issued {new Date(cert.issued_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 flex-shrink-0">
                  <!-- Verified badge -->
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse"></div>
                    <span class="font-mono text-[9px] text-[#FF3E00] uppercase tracking-widest">Verified</span>
                  </div>

                  <a rel="external" href="/verify/{cert.id}"
                    class="font-mono text-[10px] text-[#f0ede8]/40 hover:text-[#FF3E00] border border-white/8 hover:border-[#FF3E00]/30 px-3 py-1.5 rounded-lg transition-all">
                    View →
                  </a>
                </div>

              </div>
            </div>
          {/each}
        </div>
      </div>

    {:else}
      <!-- No certs yet -->
      <div class="text-center py-16">
        <div class="w-14 h-14 bg-white/4 border border-white/8 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-[#f0ede8]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
          </svg>
        </div>
        <p class="text-[#f0ede8]/30 text-sm font-light mb-1">No certificates yet</p>
        <p class="text-[#f0ede8]/15 text-xs font-mono">
          {profile.display_name} hasn't earned any certificates yet
        </p>
      </div>
    {/if}

    <!-- CTA for visitors -->
    <div class="mt-14 pt-10 border-t border-white/8 text-center">
      <p class="text-[#f0ede8]/20 text-sm font-light mb-4">
        Want to earn your own Svelte certificate?
      </p>
      <a rel="external" href="/auth"
        class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
        Start learning free →
      </a>
    </div>

  </main>
</div>