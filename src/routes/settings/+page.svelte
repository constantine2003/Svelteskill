<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    data: {
      profile: {
        display_name: string;
        full_name: string | null;
        avatar_url: string | null;
      }
    };
    form: {
      error?: string;
      success?: boolean;
      display_name?: string;
      full_name?: string;
    } | null;
  }

  const { data, form }: Props = $props();

  const profile = $derived(data.profile);

  let displayName = $state('');
  let fullName = $state('');

  $effect(() => {
    displayName = data.profile.display_name ?? '';
    fullName = data.profile.full_name ?? '';
  });

  let saving = $state(false);

  const hasChanges = $derived(
    displayName.trim() !== (data.profile.display_name ?? '') ||
    fullName.trim() !== (data.profile.full_name ?? '')
  );

  let copied = $state(false);

  function copyLink() {
    navigator.clipboard.writeText(`http://localhost:5173/u/${profile.display_name.toLowerCase().replace(/\s+/g, '-')}`);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  const profileSlug = $derived(profile.display_name.toLowerCase().replace(/\s+/g, '-'));
</script>

<svelte:head>
  <title>Profile Settings</title>
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a]">
  <main class="max-w-[640px] mx-auto px-4 sm:px-8 py-8">

    <!-- Header -->
    <div class="mb-8">
      <a rel="external" href="/dashboard"
        class="inline-flex items-center gap-2 text-[#f0ede8]/30 hover:text-[#f0ede8]/60 font-mono text-[11px] tracking-wide transition-colors mb-5">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Dashboard
      </a>
      <div class="flex items-center gap-2.5 mb-4">
        <div class="w-4 h-px bg-[#FF3E00]"></div>
        <span class="font-mono text-[10px] text-[#FF3E00] tracking-[2px] uppercase">Account</span>
      </div>
      <h1 class="font-serif italic text-[clamp(28px,4vw,40px)] font-normal tracking-[-1.5px] text-[#f0ede8]">
        Settings
      </h1>
    </div>

    <!-- Avatar -->
    <div class="flex items-center gap-5 mb-8 pb-8 border-b border-white/8">
      {#if profile.avatar_url}
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          class="w-16 h-16 rounded-full border border-white/10"
        />
      {:else}
        <div class="w-16 h-16 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/20 flex items-center justify-center">
          <span class="font-serif italic text-2xl text-[#FF3E00]">
            {profile.display_name[0].toUpperCase()}
          </span>
        </div>
      {/if}
      <div>
        <div class="text-[#f0ede8]/70 text-sm font-light mb-0.5">{profile.display_name}</div>
        <div class="font-mono text-[10px] text-[#f0ede8]/25">
          Avatar synced from GitHub or Google
        </div>
      </div>
    </div>

    <!-- Profile link -->
    <div class="mb-8 pb-8 border-b border-white/8">
      <div class="flex items-center justify-between mb-2.5">
        <div class="font-mono text-[10px] text-[#f0ede8]/40 uppercase tracking-widest">
          Your public profile
        </div>
        <a rel="external" href="/u/{profileSlug}"
          class="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#f0ede8]/30 hover:text-[#FF3E00] transition-colors">
          View profile
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div class="flex-1 bg-[#1c1c1c] border border-white/10 rounded-xl px-5 py-3.5 font-mono text-[12px] text-[#f0ede8]/40 truncate">
          http://localhost:5173/u/{profileSlug}
        </div>
        <button
          type="button"
          onclick={copyLink}
          class="sm:flex-shrink-0 font-mono text-[11px] border px-4 py-3.5 rounded-xl transition-all
            {copied
              ? 'text-[#FF3E00] border-[#FF3E00]/30 bg-[#FF3E00]/5'
              : 'text-[#f0ede8]/30 hover:text-[#FF3E00] border-white/8 hover:border-[#FF3E00]/30'}">
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>

    <!-- Success banner -->
    {#if form?.success}
      <div class="mb-8 flex items-center gap-3 bg-[#FF3E00]/[0.08] border border-[#FF3E00]/20 rounded-xl px-5 py-4">
        <svg class="w-4 h-4 text-[#FF3E00] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span class="text-[#FF3E00] text-sm font-light">Profile updated successfully.</span>
      </div>
    {/if}

    <!-- Error banner -->
    {#if form?.error}
      <div class="mb-8 flex items-center gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-5 py-4">
        <svg class="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
        <span class="text-red-400 text-sm font-light">{form.error}</span>
      </div>
    {/if}

    <!-- Form -->
    <form
      method="POST"
      action="?/updateProfile"
      use:enhance={() => {
        saving = true;
        return async ({ update }) => {
          await update();
          saving = false;
        };
      }}
    >
      <div class="flex flex-col gap-5">

        <!-- Display name -->
        <div>
          <label for="display_name" class="block font-mono text-[10px] text-[#f0ede8]/40 uppercase tracking-widest mb-2.5">
            Display name <span class="text-[#FF3E00]">*</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            bind:value={displayName}
            placeholder="How you appear on the platform"
            maxlength="50"
            required
            class="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-5 py-3.5 text-[#f0ede8] text-sm font-light placeholder:text-[#f0ede8]/20 focus:outline-none focus:border-[#FF3E00]/40 transition-colors"
          />
          <p class="text-[#f0ede8]/25 text-xs font-mono mt-2">
            Shown on your public profile and the platform · {displayName.length}/50
          </p>
        </div>

        <!-- Full name -->
        <div>
          <label for="full_name" class="block font-mono text-[10px] text-[#f0ede8]/40 uppercase tracking-widest mb-2.5">
            Full name
            <span class="text-[#f0ede8]/20 font-light normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            bind:value={fullName}
            placeholder="Your real name for certificates"
            maxlength="100"
            class="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-5 py-3.5 text-[#f0ede8] text-sm font-light placeholder:text-[#f0ede8]/20 focus:outline-none focus:border-[#FF3E00]/40 transition-colors"
          />
          <p class="text-[#f0ede8]/25 text-xs font-mono mt-2">
            {fullName.length}/100
          </p>

          <!-- Cert warning -->
          <div class="mt-3 flex items-start gap-3 bg-[#FF3E00]/[0.05] border border-[#FF3E00]/15 rounded-lg px-4 py-3">
            <svg class="w-4 h-4 text-[#FF3E00]/60 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div>
              <p class="text-[#f0ede8]/40 text-[12px] font-light leading-relaxed">
                <span class="text-[#FF3E00]/80">This name is printed on your certificates.</span>
                Make sure it is correct before taking the final exam.
                Changing it after a cert is issued will not update existing certificates.
              </p>
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="flex items-center justify-between pt-1 gap-4">
          <span class="font-mono text-[10px] text-[#f0ede8]/20">
            {#if hasChanges}
              Unsaved changes
            {:else}
              Up to date
            {/if}
          </span>
          <button
            type="submit"
            disabled={saving || !hasChanges || !displayName.trim()}
            class="inline-flex items-center gap-2 bg-[#FF3E00] hover:brightness-110 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {#if saving}
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            {:else}
              Save changes
            {/if}
          </button>
        </div>

      </div>
    </form>

    <!-- Account -->
    <div class="mt-10 pt-8 border-t border-white/8">
      <div class="font-mono text-[10px] text-[#f0ede8]/20 uppercase tracking-widest mb-4">Account</div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-[#f0ede8]/40 text-sm font-light mb-0.5">Sign out</div>
          <div class="font-mono text-[10px] text-[#f0ede8]/20">
            You will need to sign in again with GitHub or Google
          </div>
        </div>
        <form method="POST" action="/auth/logout">
          <button
            type="submit"
            class="font-mono text-[11px] text-[#f0ede8]/30 hover:text-[#f0ede8]/60 border border-white/8 hover:border-white/20 px-4 py-2 rounded-lg transition-all">
            Sign out
          </button>
        </form>
      </div>
    </div>

  </main>
</div>