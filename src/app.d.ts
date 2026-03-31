import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

declare global {
  namespace App {
    interface Locals {
      // Supabase server client available in every +page.server.ts
      supabase: SupabaseClient<Database>;
      // Helper to safely get session
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
      session: Session | null;
      user: User | null;
    }
    interface PageData {
      // Session available in every +page.svelte via data.session
      session: Session | null;
      user: User | null;
    }
  }
}

export {};