import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

// This runs on EVERY request before any page loads
// It attaches the Supabase client and session to locals
export const handle: Handle = async ({ event, resolve }) => {
  // Attach supabase client to every request
  event.locals.supabase = createSupabaseServerClient(event.cookies);

  // Helper that safely gets session without throwing
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();

    if (!session) return { session: null, user: null };

    // Validate the user with the Supabase server (more secure)
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();

    if (error) return { session: null, user: null };

    return { session, user };
  };

  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      // Required for Supabase to work correctly with SSR
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};