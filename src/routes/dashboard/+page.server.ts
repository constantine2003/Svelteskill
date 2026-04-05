import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  // Profile must resolve first (gate for onboarding redirect)
  const { data: profile, error: profileError } = await locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) redirect(303, '/onboarding');

  // All remaining queries are independent — run them in parallel
  const [
    { data: tracks },
    { data: progress },
    { data: certificates },
    { data: attempts }
  ] = await Promise.all([
    locals.supabase
      .from('tracks')
      .select('*')
      .order('order_index'),

    locals.supabase
      .from('user_progress')
      .select('module_id')
      .eq('user_id', user.id),

    locals.supabase
      .from('certificates')
      .select('*, tracks(title, slug)')
      .eq('user_id', user.id),

    locals.supabase
      .from('exam_attempts')
      .select('track_id, passed, score')
      .eq('user_id', user.id),
  ]);

  return {
    profile,
    tracks: tracks ?? [],
    completedModuleIds: (progress ?? []).map((p: { module_id: number | null }) => p.module_id),
    certificates: certificates ?? [],
    attempts: attempts ?? []
  };
};