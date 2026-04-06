<script lang="ts">
  /**
   * Navbar.svelte
   * ─────────────
   * Top navigation bar — fixed, full-width, 56px tall.
   * Renders different links depending on whether the user is logged in.
   * Includes a dark/light theme toggle that persists via localStorage.
   * Mobile-friendly: collapses nav links into a slide-down drawer on small screens.
   * On mobile, the theme toggle lives inside the drawer to keep the navbar uncluttered.
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

  // Controls the mobile drawer open/closed state
  let menuOpen = $state(false);

  // Convenience helper — called by drawer links and the backdrop tap
  function closeMenu() { menuOpen = false; }
</script>

<!--
  nav
  ───
  Fixed to the top of the viewport. z-50 keeps it above page content.
  backdrop-blur gives a frosted-glass feel when content scrolls under it.
  Uses --nav-bg CSS variable so it adapts to dark/light mode automatically.
-->
<nav
  class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 sm:px-8 gap-3 backdrop-blur-sm"
  style="background: var(--nav-bg); border-bottom: 1px solid var(--border)"
>

  <!-- ── Logo ─────────────────────────────────────────────────────────────
       Links to dashboard when logged in, landing page when logged out.
       rel="external" forces a full page navigation (avoids SvelteKit
       client-side routing for pages that need a fresh server load).
       flex-shrink-0 prevents the logo from being squeezed on narrow screens.
  ──────────────────────────────────────────────────────────────────────── -->
  <a rel="external" href={user ? '/dashboard' : '/'} class="flex items-center gap-2.5 mr-2 sm:mr-4 flex-shrink-0">
    <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center overflow-hidden">
      <img src="/svelteskill_logo.png" alt="SvelteSkill Logo" class="max-w-full max-h-full object-contain" />
    </div>
    <span class="font-serif italic text-lg" style="color: var(--text)">SvelteSkill</span>
  </a>

  <!-- ── Desktop nav links ─────────────────────────────────────────────────
       Hidden on mobile (sm:flex) — mobile users get a drawer instead.
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

  <!-- ── Mobile spacer ─────────────────────────────────────────────────────
       On mobile, the desktop nav links are hidden so this spacer fills the
       gap and pushes the right-side icons to the edge. On sm+ the desktop
       nav's flex-1 takes over, so this spacer is hidden to avoid conflict.
  ──────────────────────────────────────────────────────────────────────── -->
  <div class="flex-1 sm:hidden"></div>

  <!-- ── Right-side actions ─────────────────────────────────────────────── -->
  <div class="flex items-center gap-2">

    <!-- Theme toggle — desktop only.
         On mobile this moves into the drawer to free up navbar space for the
         hamburger button. Shows sun in dark mode, moon in light mode.
         flex-shrink-0 prevents it from being squeezed on narrow screens.
    -->
    <button
      onclick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      class="hidden sm:flex w-8 h-8 rounded-md items-center justify-center transition-all flex-shrink-0"
      style="border: 1px solid var(--border2); color: var(--text-faint)"
    >
      {#if isDark}
        <!-- Sun icon — visible in dark mode -->
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFB300" stroke-width="2">
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
      <!-- ── Authenticated: avatar + display name (desktop) + logout (desktop) ── -->

      <!-- Avatar always visible — tapping it links to settings.
           Display name is hidden on mobile to save horizontal space. -->
      <a rel="external" href="/settings" class="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
        {#if user.avatar_url}
          <img src={user.avatar_url} alt="avatar" class="w-7 h-7 rounded-full" />
        {:else}
          <!-- Fallback: first letter of display name in brand color -->
          <div class="w-7 h-7 rounded-full bg-[#FF3E00]/20 flex items-center justify-center text-xs text-[#FF3E00]">
            {user.display_name[0].toUpperCase()}
          </div>
        {/if}
        <span class="hidden sm:inline text-sm" style="color: var(--text-muted)">
          {user.display_name}
        </span>
      </a>

      <!-- Logout button — desktop only. Mobile users log out via the drawer. -->
      <form method="POST" action="/auth/logout" class="hidden sm:block">
        <button
          class="text-xs transition-colors px-2 py-1"
          style="color: var(--text-faint)"
        >
          Log out
        </button>
      </form>

    {:else}
      <!-- ── Unauthenticated: log in (desktop) + get started (always) ── -->

      <!-- Log in is desktop-only; mobile users access it via the drawer -->
      <a rel="external" href="/auth"
        class="hidden sm:block text-sm px-3 py-1.5 rounded-md transition-all"
        style="color: var(--text-muted)">
        Log in
      </a>

      <!-- Primary CTA — always visible including on mobile, since it's
           the single most important action on the marketing pages. -->
      <a rel="external" href="/auth"
        class="text-sm font-semibold text-white bg-[#FF3E00] hover:brightness-110 px-4 py-1.5 rounded-lg transition-all flex-shrink-0">
        Get started
      </a>
    {/if}

    <!-- ── Hamburger button — mobile only ────────────────────────────────
     Toggles the mobile drawer. Swaps between a hamburger and ✕ icon
     when the menu is open. aria-expanded is set dynamically so screen
     readers announce the state. Placed last so it sits at the far right.
    ──────────────────────────────────────────────────────────────────────── -->
    <button
      onclick={() => menuOpen = !menuOpen}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      class="sm:hidden w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
      style="border: 1px solid var(--border2); color: var(--text-muted)"
    >
      {#if menuOpen}
        <!-- ✕ close icon -->
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      {:else}
        <!-- Hamburger icon -->
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      {/if}
    </button>

  </div>
</nav>

<!-- ── Mobile drawer ───────────────────────────────────────────────────────
     Slides in just below the fixed nav bar when menuOpen is true.
     Only rendered on mobile (sm:hidden on the drawer and backdrop).
     z-40 sits below the nav (z-50) but above all page content.

     Structure:
       - Backdrop: full-screen dim overlay, tap it to close the menu
       - Drawer panel: the actual link list, anchored to top: 56px (nav height)
       - Theme toggle row: placed at the bottom of the drawer so the toggle
         is always accessible on mobile without cluttering the navbar
──────────────────────────────────────────────────────────────────────────── -->
{#if menuOpen}

  <!-- Backdrop — dims the page and closes the drawer on tap -->
  <div
    class="fixed inset-0 z-40 sm:hidden"
    style="background: rgba(0,0,0,0.2); top: 56px;"
    onclick={closeMenu}
    aria-hidden="true"
  ></div>

  <!-- Drawer panel -->
  <div
    class="fixed left-0 right-0 z-40 sm:hidden flex flex-col gap-1 p-3"
    style="top: 56px; background: var(--nav-bg); border-bottom: 1px solid var(--border); backdrop-blur-sm;"
  >
    {#if user}
      <!-- Authenticated drawer links -->
      <a rel="external" href="/dashboard" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Dashboard</a>
      <a rel="external" href="/tracks" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Tracks</a>
      <!-- Settings is desktop-accessible via the avatar; surfaced here for mobile -->
      <a rel="external" href="/settings" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Settings</a>
      <div style="height: 1px; background: var(--border); margin: 4px 0;"></div>
      <!-- Logout via a POST form action — same mechanism as the desktop button -->
      <form method="POST" action="/auth/logout">
        <button class="w-full text-left text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
          style="color: var(--text-faint)">
          Log out
        </button>
      </form>
    {:else}
      <!-- Public / marketing drawer links -->
      <a rel="external" href="/#tracks" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Tracks</a>
      <a rel="external" href="/#how" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">How it works</a>
      <a rel="external" href="/#cert" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Certificates</a>
      <div style="height: 1px; background: var(--border); margin: 4px 0;"></div>
      <!-- Log in is hidden in the navbar on mobile, so it must appear here -->
      <a rel="external" href="/auth" onclick={closeMenu}
        class="text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
        style="color: var(--text-muted)">Log in</a>
    {/if}

    <!-- ── Theme toggle row ───────────────────────────────────────────────
         Moved here from the navbar on mobile to free up space for the
         hamburger button. Displays the current mode label next to the
         toggle so the action is self-explanatory without an icon tooltip.
    ──────────────────────────────────────────────────────────────────────── -->
    <div style="height: 1px; background: var(--border); margin: 4px 0;"></div>
    <button
      onclick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      class="flex items-center gap-3 w-full text-sm px-3 py-3 rounded-lg hover:bg-black/5 transition-all"
      style="color: var(--text-muted)"
    >
      {#if isDark}
        <!-- Sun icon — indicates clicking will switch to light mode -->
        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#FFB300" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        Switch to light mode
      {:else}
        <!-- Moon icon — indicates clicking will switch to dark mode -->
        <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
        Switch to dark mode
      {/if}
    </button>

  </div>

{/if}