import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();

  if (!user) redirect(303, '/auth');

  // Fetch all tracks
  const { data: tracks } = await locals.supabase
    .from('tracks')
    .select('*')
    .order('order_index');

  // Fetch user's certificates to know which tracks are unlocked
  const { data: certificates } = await locals.supabase
    .from('certificates')
    .select('track_id')
    .eq('user_id', user.id);

  // Fetch exam attempts
  const { data: attempts } = await locals.supabase
    .from('exam_attempts')
    .select('track_id, passed, score')
    .eq('user_id', user.id);

  // Fetch module counts per track
  const { data: modules } = await locals.supabase
    .from('modules')
    .select('track_id');

  // Fetch user progress
  const { data: progress } = await locals.supabase
    .from('user_progress')
    .select('module_id, modules(track_id)')
    .eq('user_id', user.id);

  return {
    tracks: tracks ?? [],
    certificates: certificates ?? [],
    attempts: attempts ?? [],
    modules: modules ?? [],
    progress: progress ?? []
  };
};