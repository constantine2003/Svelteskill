<script lang="ts">
  import { page } from '$app/state';

  const status = $derived(page.status);
  const message = $derived(page.error?.message ?? 'Something went wrong');

  const is404 = $derived(status === 404);
  const is403 = $derived(status === 403);
</script>

<svelte:head>
  <title>{status} — SvelteSkill</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-8" style="background: var(--bg)">
  <div class="max-w-md w-full text-center">

    <!-- Status number -->
    <div class="font-serif italic text-[120px] leading-none tracking-[-6px] mb-6"
      style="color: var(--border2)">
      {status}
    </div>

    <!-- Orange line -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <div class="w-8 h-px bg-[#FF3E00]"></div>
      <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">
        {#if is404}Page not found{:else if is403}Access denied{:else}Error{/if}
      </span>
      <div class="w-8 h-px bg-[#FF3E00]"></div>
    </div>

    <!-- Message -->
    <p class="text-sm font-light mb-10" style="color: var(--text-muted)">
      {#if is404}
        The page you're looking for doesn't exist or has been moved.
      {:else if is403}
        You don't have permission to access this page.
      {:else}
        {message}
      {/if}
    </p>

    <!-- Actions -->
    <div class="flex items-center justify-center gap-3 flex-wrap">
      <a rel="external" href="/"
        class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
        Go home
      </a>
      <a rel="external" href="/dashboard"
        class="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
        style="background: var(--surface); border: 1px solid var(--border); color: var(--text-muted)">
        Dashboard
      </a>
    </div>

    <!-- Subtle hint -->
    <p class="font-mono text-[10px] mt-8" style="color: var(--text-faint)">
      Lost? Try searching from the <a rel="external" href="/tracks" class="text-[#FF3E00] hover:underline">tracks page</a>.
    </p>

  </div>
</div>