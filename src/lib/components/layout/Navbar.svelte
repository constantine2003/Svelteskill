<script lang="ts">
  interface Props {
    user?: {
      display_name: string;
      avatar_url: string | null;
    } | null;
  }

  let { user = null }: Props = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-8 gap-8 bg-[#1c1c1c]/90 backdrop-blur-sm border-b border-white/10">

  <!-- Logo -->
  <a rel="external" href={user ? '/dashboard' : '/'} class="flex items-center gap-2.5 mr-4">
    <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
      <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
    </div>
    <span class="text-[#f0ede8] font-serif italic text-lg">SvelteSkill</span>
  </a>

  <!-- Links -->
  <div class="flex items-center gap-1 flex-1">
    {#if user}
      <!-- Logged in nav -->
      <a rel="external" href="/dashboard"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        Dashboard
      </a>
      <a rel="external" href="/tracks"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        Tracks
      </a>
    {:else}
      <!-- Logged out nav -->
      <a rel="external" href="/#tracks"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        Tracks
      </a>
      <a rel="external" href="/#how"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        How it works
      </a>
      <a rel="external" href="/#cert"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        Certificates
      </a>
    {/if}
  </div>

  <!-- Right side -->
  <div class="flex items-center gap-3 ml-auto">
    {#if user}
      <!-- Active page indicator + profile -->
      <a rel="external" href="/settings" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {#if user.avatar_url}
          <img src={user.avatar_url} alt="avatar" class="w-7 h-7 rounded-full" />
        {:else}
          <div class="w-7 h-7 rounded-full bg-[#FF3E00]/20 flex items-center justify-center text-xs text-[#FF3E00]">
            {user.display_name[0].toUpperCase()}
          </div>
        {/if}
        <span class="text-[#f0ede8]/70 text-sm">{user.display_name}</span>
      </a>
      <form method="POST" action="/auth/logout">
        <button class="text-[#f0ede8]/30 hover:text-[#f0ede8]/60 text-xs transition-colors px-2 py-1">
          Log out
        </button>
      </form>
    {:else}
      <a rel="external" href="/auth"
        class="text-[#f0ede8]/50 hover:text-[#f0ede8] text-sm px-3 py-1.5 rounded-md hover:bg-white/5 transition-all">
        Log in
      </a>
      <a rel="external" href="/auth"
        class="text-sm font-semibold text-white bg-[#FF3E00] hover:brightness-110 px-4 py-1.5 rounded-lg transition-all">
        Get started
      </a>
    {/if}
  </div>

</nav>