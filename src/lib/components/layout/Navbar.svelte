<script lang="ts">
  /**
   * Navbar.svelte
   * ─────────────
   * Top navigation bar — fixed, full-width, 56px tall.
   * Renders different links depending on whether the user is logged in.
   * Includes a dark/light theme toggle that persists via localStorage.
   *
   * Props:
   *   user — profile object from the layout server load, or null if logged out
   */

  import { theme, toggleTheme } from '$lib/stores/theme';

  interface Props {
    user?: {
      display_name: string;
      avatar_url: string | null;
    } | null;
  }

  let { user = null }: Props = $props();

  // Reactive boolean so the template can branch on dark vs light
  const isDark = $derived($theme === 'dark');
</script>

<!--
  nav
  ───
  Fixed to the top of the viewport. z-50 keeps it above page content.
  backdrop-blur gives a frosted-glass feel when content scrolls under it.
  Uses --nav-bg CSS variable so it adapts to dark/light mode automatically.
-->
<nav
  class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 sm:px-8 gap-8 backdrop-blur-sm"
  style="background: var(--nav-bg); border-bottom: 1px solid var(--border)"
>

  <!-- ── Logo ─────────────────────────────────────────────────────────────
       Links to dashboard when logged in, landing page when logged out.
       rel="external" forces a full page navigation (avoids SvelteKit
       client-side routing for pages that need a fresh server load).
  ──────────────────────────────────────────────────────────────────────── -->
  <a rel="external" href={user ? '/dashboard' : '/'} class="flex items-center gap-2.5 mr-4">
    <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
      <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
    </div>
    <span class="font-serif italic text-lg" style="color: var(--text)">SvelteSkill</span>
  </a>

  <!-- ── Primary navigation links ─────────────────────────────────────────
       Hidden on mobile (sm:flex) to prevent overflow on small screens.
       Logged-in and logged-out states render different link sets.
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="hidden sm:flex items-center gap-1 flex-1">
    {#if user}
      <!-- Authenticated links -->
      <a rel="external" href="/dashboard"
        class="text-sm px-3 py-1.5 rounded-md transition-all hover:bg-black/5"
        style="color: var(--text-muted)">
        Dashboard
      </a>
      <a rel="external" href="/tracks"
        class="text-sm px-3 py-1.5 rounded-md transition-all hover:bg-black/5"
        style="color: var(--text-muted)">
        Tracks
      </a>
    {:else}
      <!-- Public / marketing links -->
      <a rel="external" href="/#tracks"
        class="text-sm px-3 py-1.5 rounded-md transition-all hover:bg-black/5"
        style="color: var(--text-muted)">
        Tracks
      </a>
      <a rel="external" href="/#how"
        class="text-sm px-3 py-1.5 rounded-md transition-all hover:bg-black/5"
        style="color: var(--text-muted)">
        How it works
      </a>
      <a rel="external" href="/#cert"
        class="text-sm px-3 py-1.5 rounded-md transition-all hover:bg-black/5"
        style="color: var(--text-muted)">
        Certificates
      </a>
    {/if}
  </div>

  <!-- ── Right-side actions ─────────────────────────────────────────────── -->
  <div class="flex items-center gap-2 sm:gap-3 ml-auto">

    <!-- Theme toggle
         Shows a sun icon in dark mode (click → light),
         moon icon in light mode (click → dark).
         flex-shrink-0 prevents it from being squeezed on narrow screens.
    -->
    <button
      onclick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      class="w-8 h-8 rounded-md flex items-center justify-center transition-all flex-shrink-0"
      style="border: 1px solid var(--border2); color: var(--text-faint)"
    >
      {#if isDark}
        <!-- Sun icon — visible in dark mode -->
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#FFB300' : 'currentColor'} stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      {:else}
        <!-- Moon icon — visible in light mode -->
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#22304A" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      {/if}
    </button>

    {#if user}
      <!-- ── Authenticated: avatar + display name + logout ── -->

      <!-- Avatar links to settings. Display name hidden on mobile to save space. -->
      <a rel="external" href="/settings" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {#if user.avatar_url}
          <img src={user.avatar_url} alt="avatar" class="w-7 h-7 rounded-full" />
        {:else}
          <!-- Fallback: first letter of display name -->
          <div class="w-7 h-7 rounded-full bg-[#FF3E00]/20 flex items-center justify-center text-xs text-[#FF3E00]">
            {user.display_name[0].toUpperCase()}
          </div>
        {/if}
        <span class="hidden sm:inline text-sm" style="color: var(--text-muted)">
          {user.display_name}
        </span>
      </a>

      <!-- Logout — POST to the server action at /auth/logout -->
      <form method="POST" action="/auth/logout">
        <button
          class="text-xs transition-colors px-2 py-1"
          style="color: var(--text-faint)"
        >
          Log out
        </button>
      </form>

    {:else}
      <!-- ── Unauthenticated: log in + get started ── -->

      <!-- Log in hidden on mobile — only the CTA button shows -->
      <a rel="external" href="/auth"
        class="hidden sm:block text-sm px-3 py-1.5 rounded-md transition-all"
        style="color: var(--text-muted)">
        Log in
      </a>

      <!-- Primary CTA — always visible including on mobile -->
      <a rel="external" href="/auth"
        class="text-sm font-semibold text-white bg-[#FF3E00] hover:brightness-110 px-4 py-1.5 rounded-lg transition-all">
        Get started
      </a>
    {/if}

  </div>

</nav>