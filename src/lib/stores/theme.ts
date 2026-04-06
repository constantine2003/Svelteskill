import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Read saved preference or default to dark
const stored = browser
  ? (localStorage.getItem('theme') ?? 'dark')
  : 'dark';

export const theme = writable<'dark' | 'light'>(stored as 'dark' | 'light');

// Apply theme to <html> and save to localStorage whenever it changes
if (browser) {
  theme.subscribe((value) => {
    localStorage.setItem('theme', value);
    if (value === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  });
}

export function toggleTheme() {
  theme.update(t => t === 'dark' ? 'light' : 'dark');
}