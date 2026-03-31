import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!user) return { session, user, profile: null };

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    session,
    user,
    profile: profile ?? null
  };
};