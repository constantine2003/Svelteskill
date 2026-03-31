<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';

  let { data } = $props();

  // $derived so Svelte 5 tracks it reactively
  const user = $derived(data.user);

  // Use $derived for initial values from data too
  let displayName = $state('');
  let fullName = $state('');
  let loading = $state(false);
  let error = $state('');

  // Set initial display name from provider on mount
  $effect(() => {
    if (data.user?.provider_name) {
      displayName = data.user.provider_name as string;
    }
  });

  async function handleSubmit() {
    if (!displayName.trim()) {
      error = 'Display name is required';
      return;
    }

    loading = true;
    error = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as unknown as any)
      .from('profiles')
      .insert({
        id: user?.id,
        display_name: displayName.trim(),
        full_name: fullName.trim() || null,
        avatar_url: (user?.avatar_url as string) || null
      });

    if (err) {
      error = err.message;
      loading = false;
      return;
    }

    await invalidate('supabase:auth');
    window.location.href = '/dashboard';
  }
</script>

<div class="min-h-screen bg-[#1c1c1c] flex items-center justify-center px-4">
  <div class="w-full max-w-md">

    <!-- Header -->
    <div class="text-center mb-10">
      <div class="w-16 h-16 rounded-full overflow-hidden mx-auto mb-6 border border-white/10">
        {#if user?.avatar_url}
          <img
            src={user.avatar_url as string}
            alt="avatar"
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full bg-[#FF3E00]/10 flex items-center justify-center text-2xl">
            👤
          </div>
        {/if}
      </div>
      <h1 class="text-[#f0ede8] text-2xl font-serif italic mb-2">
        One last step
      </h1>
      <p class="text-[#f0ede8]/50 text-sm font-light">
        Set up your profile before we begin
      </p>
    </div>

    <!-- Form card -->
    <div class="bg-[#242424] border border-white/10 rounded-xl p-8">

      {#if error}
        <div class="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <div class="flex flex-col gap-5">

        <!-- Display name -->
        <div>
          <label for="display_name" class="block text-[#f0ede8]/70 text-xs font-medium mb-2 tracking-wide uppercase">
            Display name <span class="text-[#FF3E00]">*</span>
          </label>
          <input
            id="display_name"
            type="text"
            bind:value={displayName}
            placeholder="How you appear on the platform"
            class="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-[#f0ede8] text-sm placeholder:text-[#f0ede8]/25 focus:outline-none focus:border-[#FF3E00]/50 transition-colors"
          />
          <p class="text-[#f0ede8]/30 text-xs mt-1.5 font-light">
            Shown on your public profile
          </p>
        </div>

        <!-- Full name for cert -->
        <div>
          <label for="full_name" class="block text-[#f0ede8]/70 text-xs font-medium mb-2 tracking-wide uppercase">
            Full name <span class="text-[#f0ede8]/30 font-light normal-case">(optional)</span>
          </label>
          <input
            id="full_name"
            type="text"
            bind:value={fullName}
            placeholder="Printed on your certificates"
            class="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-[#f0ede8] text-sm placeholder:text-[#f0ede8]/25 focus:outline-none focus:border-[#FF3E00]/50 transition-colors"
          />
          <p class="text-[#f0ede8]/30 text-xs mt-1.5 font-light">
            This is what appears on your certificate PDF
          </p>
        </div>

        <!-- Email readonly -->
        <div>
          <label for="email" class="block text-[#f0ede8]/70 text-xs font-medium mb-2 tracking-wide uppercase">
            Email
          </label>
          <input
            id="email"
            type="text"
            value={user?.email ?? ''}
            disabled
            class="w-full bg-[#1c1c1c]/50 border border-white/5 rounded-lg px-4 py-3 text-[#f0ede8]/40 text-sm cursor-not-allowed"
          />
        </div>

        <!-- Submit -->
        <button
          onclick={handleSubmit}
          disabled={loading || !displayName.trim()}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {#if loading}
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Setting up your profile...
          {:else}
            Let's start learning →
          {/if}
        </button>

      </div>
    </div>

    <p class="text-center text-[#f0ede8]/25 text-xs mt-6 font-light">
      You can change your name anytime in settings
    </p>

  </div>
</div>