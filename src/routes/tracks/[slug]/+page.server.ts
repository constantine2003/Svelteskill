import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  const { data: track } = await locals.supabase
    .from('tracks')
    .select('*')
    .eq('slug', params?.slug ?? '')
    .single();

  if (!track) throw error(404, 'Track not found');

  if (track.prerequisite_track_id) {
    const { data: prereqCert } = await locals.supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', track.prerequisite_track_id)
      .single();
    if (!prereqCert) throw redirect(303, '/tracks');
  }

  const { data: modules } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  const { data: progress } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  const { data: certificate } = await locals.supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .maybeSingle();

  const { data: attempts } = await locals.supabase
    .from('exam_attempts')
    .select('score, passed, taken_at')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .order('taken_at', { ascending: false });

  const completedModuleIds = (progress ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  // Fetch all part assessments
  const { data: allPartAssessmentsRaw } = await (locals.supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: unknown) => {
          eq: (k: string, v: unknown) => Promise<{
            data: { part_index: number; passed: boolean }[] | null;
          }>;
        };
      };
    };
  })
    .from('part_assessments')
    .select('part_index, passed')
    .eq('user_id', user.id)
    .eq('track_id', track.id);

  const allPartAssessments = (allPartAssessmentsRaw ?? []) as {
    part_index: number; passed: boolean;
  }[];

  const allPartsPassed = [1, 2, 3, 4].every(pi =>
    allPartAssessments.some(pa => pa.part_index === pi && pa.passed)
  );

  return {
    track,
    modules: modules ?? [],
    completedModuleIds,
    certificate: certificate ?? null,
    attempts: attempts ?? [],
    allPartsPassed,
    allPartAssessments,
  };
};