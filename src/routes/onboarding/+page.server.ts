import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();

  // Not logged in → back to auth
  if (!user) redirect(303, '/auth');

  // Already has a profile → skip onboarding
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profile) redirect(303, '/dashboard');

  // Pass user data to the page
  return {
    user: {
      id: user.id,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url ?? '',
      provider_name: user.user_metadata?.full_name
        ?? user.user_metadata?.name
        ?? user.user_metadata?.user_name
        ?? ''
    }
  };
};