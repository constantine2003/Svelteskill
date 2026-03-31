import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();

  if (!user) redirect(303, '/auth');

  const { data: profile, error: profileError } = await locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  // No profile found → send back to onboarding
  if (profileError || !profile) redirect(303, '/onboarding');

  const { data: tracks } = await locals.supabase
    .from('tracks')
    .select('*')
    .order('order_index');

  const { data: progress } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user!.id);

  const { data: certificates } = await locals.supabase
    .from('certificates')
    .select('*, tracks(title, slug)')
    .eq('user_id', user!.id);

  const { data: attempts } = await locals.supabase
    .from('exam_attempts')
    .select('track_id, passed, score')
    .eq('user_id', user!.id);

  return {
    profile,
    tracks: tracks ?? [],
    completedModuleIds: (progress ?? []).map((p: { module_id: number | null }) => p.module_id),
    certificates: certificates ?? [],
    attempts: attempts ?? []
  };
};