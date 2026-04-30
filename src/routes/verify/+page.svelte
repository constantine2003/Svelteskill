<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  interface Cert {
    id: string;
    issued_at: string;
    full_name_on_cert: string;
    tracks: { title: string; slug: string; order_index: number } | null;
    profiles: { display_name: string; avatar_url: string | null } | null;
  }

  interface Props {
    data: {
      query: string;
      results: Cert[];
      total: number;
    }
  }

  const { data }: Props = $props();

  let searchValue = $state(data.query ?? '');
  let isSearching = $state(false);

  function handleSearch(e: Event) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    isSearching = true;
    goto(`/verify?q=${encodeURIComponent(searchValue.trim())}`, {
      replaceState: false
    }).finally(() => {
      isSearching = false;
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSearch(e);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  const trackBadgeColor = (order: number) => {
    const colors = ['#FF3E00', '#e06c75', '#61afef', '#98c379'];
    return colors[(order - 1) % colors.length];
  };
</script>

<svelte:head>
  <title>
    {data.query ? `"${data.query}" — Certificate Search` : 'Verify Certificates'} · SvelteSkill
  </title>
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: var(--bg)">

  <!-- Simple nav -->
  <nav class="border-b px-8 py-4 flex items-center justify-between"
    style="border-color: var(--border)">
    <a rel="external" href="/" class="flex items-center gap-2.5">
      <div class="w-6 h-6 bg-[#FF3E00] rounded-md flex items-center justify-center">
        <svg viewBox="0 0 98.1 118" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
          <path fill="white" d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.7 20.3 48.2 10.4l27.5-17.6c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-8.9-.4-18.1-5.7-25.4"/>
        </svg>
      </div>
      <span class="font-serif italic text-base" style="color: var(--text)">SvelteSkill</span>
    </a>
    <a rel="external" href="/auth"
      class="font-mono text-[11px] transition-colors"
      style="color: var(--text-faint)">
      Get certified →
    </a>
  </nav>

  <main class="flex-1 max-w-[680px] mx-auto w-full px-8 py-16">

    <!-- Header -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-3 mb-5">
        <div class="w-8 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
          Certificate Verification
        </span>
        <div class="w-8 h-px bg-[#FF3E00]"></div>
      </div>
      <h1 class="font-serif italic text-[clamp(28px,5vw,44px)] font-normal tracking-[-1.5px] mb-3"
        style="color: var(--text)">
        Verify a certificate
      </h1>
      <p class="text-sm font-light" style="color: var(--text-muted)">
        Search by name to find certificates, or paste a certificate ID directly.
      </p>
    </div>

    <!-- Search form -->
    <div class="mb-10">
      <form onsubmit={handleSearch}>
        <div class="flex gap-3">
          <div class="flex-1 relative">
            <input
              type="text"
              bind:value={searchValue}
              onkeydown={handleKeydown}
              placeholder="Search by name or username..."
              class="w-full px-5 py-3.5 rounded-xl text-sm font-light transition-colors focus:outline-none"
              style="
                background: var(--surface);
                border: 1px solid var(--border2);
                color: var(--text);
              "
            />
            {#if searchValue}
              <button
                type="button"
                onclick={() => { searchValue = ''; goto('/verify'); }}
                class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style="color: var(--text-faint)">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            {/if}
          </div>
          <button
            type="submit"
            disabled={!searchValue.trim() || isSearching}
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            {#if isSearching}
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            {:else}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            {/if}
            Search
          </button>
        </div>
      </form>

      <!-- Direct cert ID hint -->
      <p class="font-mono text-[10px] mt-3 text-center" style="color: var(--text-faint)">
        Have a certificate ID?
        <a rel="external" href="/verify/paste-cert-id-here"
          class="text-[#FF3E00]/60 hover:text-[#FF3E00] transition-colors">
          Go to /verify/[id] directly →
        </a>
      </p>
    </div>

    <!-- Results -->
    {#if data.query}
      {#if data.results.length > 0}
        <div>
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-4 h-px bg-[#FF3E00]"></div>
            <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
              {data.total} result{data.total !== 1 ? 's' : ''} for "{data.query}"
            </span>
          </div>

          <div class="flex flex-col gap-3">
            {#each data.results as cert (cert.id)}
              <div class="rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
                style="background: var(--surface); border: 1px solid rgba(255,62,0,0.15)">
                <div class="h-[2px] bg-gradient-to-r from-[#FF3E00] to-[#FF3E00]/10"></div>
                <div class="p-5 flex items-center gap-4">

                  <!-- Avatar -->
                  {#if cert.profiles?.avatar_url}
                    <img
                      src={cert.profiles.avatar_url}
                      alt={cert.profiles.display_name}
                      class="w-10 h-10 rounded-full border flex-shrink-0"
                      style="border-color: var(--border)"
                    />
                  {:else}
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style="background: var(--orange-muted); border: 1px solid rgba(255,62,0,0.2)">
                      <span class="font-serif italic text-base text-[#FF3E00]">
                        {cert.full_name_on_cert[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                  {/if}

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="font-serif italic text-base mb-0.5 truncate"
                      style="color: var(--text)">
                      {cert.full_name_on_cert}
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-[10px]" style="color: var(--text-faint)">
                        {cert.tracks?.title ?? 'Unknown track'}
                      </span>
                      <span style="color: var(--border2)">·</span>
                      <span class="font-mono text-[10px]" style="color: var(--text-faint)">
                        {formatDate(cert.issued_at)}
                      </span>
                    </div>
                  </div>

                  <!-- Track badge + verify link -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <div class="flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse"></div>
                      <span class="font-mono text-[9px] text-[#FF3E00] uppercase tracking-widest">
                        Verified
                      </span>
                    </div>
                    <a rel="external" href="/verify/{cert.id}"
                      class="font-mono text-[11px] px-3 py-1.5 rounded-lg transition-all"
                      style="
                        color: var(--text-muted);
                        background: var(--bg);
                        border: 1px solid var(--border);
                      ">
                      View →
                    </a>
                  </div>

                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else}
        <!-- No results -->
        <div class="text-center py-14">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style="background: var(--surface); border: 1px solid var(--border)">
            <svg class="w-6 h-6" style="color: var(--text-faint)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <p class="text-sm font-light mb-1" style="color: var(--text-muted)">
            No certificates found for "<span style="color: var(--text)">{data.query}</span>"
          </p>
          <p class="font-mono text-[10px]" style="color: var(--text-faint)">
            Try a different name or check the spelling
          </p>
        </div>
      {/if}

    {:else}
      <!-- Empty state — no search yet -->
      <div class="text-center py-14">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style="background: var(--surface); border: 1px solid var(--border)">
          <svg class="w-7 h-7 text-[#FF3E00]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 15l-2 5-3-1-1 3-4-4 3-1-1-3 5-2"/><circle cx="12" cy="8" r="5"/>
          </svg>
        </div>
        <p class="text-sm font-light mb-6" style="color: var(--text-muted)">
          Search for a name to find verified Svelte certificates
        </p>

        <!-- How to verify hint -->
        <div class="inline-block text-left rounded-xl px-6 py-5 max-w-sm"
          style="background: var(--surface); border: 1px solid var(--border)">
          <div class="font-mono text-[10px] text-[#FF3E00] uppercase tracking-widest mb-3">
            How to verify
          </div>
          <ul class="space-y-2">
            {#each [
              'Search by the person\'s name above',
              'Or go directly to /verify/[certificate-id]',
              'Every SvelteSkill cert has a unique public URL'
            ] as hint}
              <li class="flex items-baseline gap-2.5 text-[12px] font-light"
                style="color: var(--text-muted)">
                <span class="text-[#FF3E00] font-mono text-[11px] flex-shrink-0">→</span>
                {hint}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}

  </main>

  <!-- Footer -->
  <footer class="px-8 py-5 flex items-center justify-between"
    style="border-top: 1px solid var(--border)">
    <span class="font-serif italic text-sm" style="color: var(--text-faint)">
      <span class="text-[#FF3E00]">Svelte</span>Skill
    </span>
    <span class="font-mono text-[10px]" style="color: var(--text-faint)">
      Community-driven · Free forever
    </span>
  </footer>

</div>