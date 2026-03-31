import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  const { user } = await locals.safeGetSession();

  if (!user) redirect(303, '/auth');

  // Fetch the track by slug
  const { data: track } = await locals.supabase
    .from('tracks')
    .select('*')
    .eq('slug', params?.slug ?? '')
    .single();

  if (!track) error(404, 'Track not found');

  // Check prerequisite — is this track unlocked?
  if (track.prerequisite_track_id) {
    const { data: prereqCert } = await locals.supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', track.prerequisite_track_id)
      .single();

    if (!prereqCert) redirect(303, '/tracks');
  }

  // Fetch all modules for this track
  const { data: modules } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  // Fetch user's completed modules for this track
  const { data: progress } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  // Fetch certificate for this track
  const { data: certificate } = await locals.supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .single();

  // Fetch exam attempts for this track
  const { data: attempts } = await locals.supabase
    .from('exam_attempts')
    .select('score, passed, taken_at')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .order('taken_at', { ascending: false });

  const completedModuleIds = (progress ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  return {
    track,
    modules: modules ?? [],
    completedModuleIds,
    certificate: certificate ?? null,
    attempts: attempts ?? []
  };
};