import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const [tracksRes, certsRes, attemptsRes, modulesRes, progressRes] = await Promise.all([
    locals.supabase
      .from('tracks')
      .select('id, slug, title, description, order_index, prerequisite_track_id')
      .order('order_index'),

    locals.supabase
      .from('certificates')
      .select('id, track_id, issued_at, full_name_on_cert') // ← fixed
      .eq('user_id', user!.id)
      .order('issued_at', { ascending: false }),

    locals.supabase
      .from('exam_attempts')
      .select('track_id, passed, score, taken_at')
      .eq('user_id', user!.id),

    locals.supabase
      .from('modules')
      .select('id, track_id, order_index')
      .order('order_index'),

    locals.supabase
      .from('user_progress')
      .select('module_id, completed_at, modules(track_id)')
      .eq('user_id', user!.id),
  ]);

  return {
    tracks: tracksRes.data ?? [],
    certificates: certsRes.data ?? [],
    attempts: attemptsRes.data ?? [],
    modules: modulesRes.data ?? [],
    progress: progressRes.data ?? [],
  };
};