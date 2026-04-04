import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Temporary cast until `part_assessments` is added to generated types.
// Remove after: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabase = { from: (table: string) => any };

export const load = async ({ locals, params }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // Step 1 — Track first, everything depends on track.id
  const { data: track } = await locals.supabase
    .from('tracks')
    .select('id, slug, title, description, order_index, prerequisite_track_id')
    .eq('slug', params?.slug ?? '')
    .single();

  if (!track) throw error(404, 'Track not found');

  // Step 2 — Prerequisite check
  // If this track requires another to be completed first, verify the cert exists.
  if (track.prerequisite_track_id) {
    const { data: prereqCert } = await locals.supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', track.prerequisite_track_id)
      .single();
    if (!prereqCert) throw redirect(303, '/tracks');
  }

  const db = locals.supabase as unknown as UntypedSupabase;

  // Step 3 — All remaining queries in parallel.
  // Everything here depends only on track.id and user.id so they can
  // all fire simultaneously, cutting total wait to the slowest query.
  const [modulesRes, questionsRes, progressRes, certificateRes, attemptsRes, partAssessmentsRes] =
    await Promise.all([
      // All modules with content — child pages get this via parent() for free,
      // so navigating between lessons never needs another DB call for content.
      locals.supabase
        .from('modules')
        .select('id, slug, title, order_index, content')
        .eq('track_id', track.id)
        .order('order_index'),

      // All non-exam questions — child pages filter by part_index in JS.
      locals.supabase
        .from('questions')
        .select('id, question, options, correct_index, explanation, part_index')
        .eq('track_id', track.id)
        .eq('is_final_exam', false),

      // Which modules this user has completed.
      locals.supabase
        .from('user_progress')
        .select('module_id')
        .eq('user_id', user.id),

      // The user's certificate for this track — null if not yet earned.
      locals.supabase
        .from('certificates')
        .select('id, issued_at, full_name_on_cert')
        .eq('user_id', user.id)
        .eq('track_id', track.id)
        .maybeSingle(),

      // All exam attempts, newest first — used to show score history.
      locals.supabase
        .from('exam_attempts')
        .select('score, passed, taken_at')
        .eq('user_id', user.id)
        .eq('track_id', track.id)
        .order('taken_at', { ascending: false }),

      // Per-part quiz results — stale generated types, use untyped client.
      db
        .from('part_assessments')
        .select('part_index, passed')
        .eq('user_id', user.id)
        .eq('track_id', track.id),
    ]);

  const completedModuleIds = (progressRes.data ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  const allPartAssessments = (partAssessmentsRes.data ?? []) as {
    part_index: number;
    passed: boolean;
  }[];

  // True when the user has a passing result for all 4 parts — gates exam access.
  const allPartsPassed = [1, 2, 3, 4].every((pi) =>
    allPartAssessments.some((pa) => pa.part_index === pi && pa.passed)
  );

  return {
    user,
    track,
    // All modules with full content — shared to all child routes via parent()
    allModules: modulesRes.data ?? [],
    // All part questions — child pages filter to their part in JS
    allQuestions: questionsRes.data ?? [],
    completedModuleIds,
    certificate: certificateRes.data ?? null,
    attempts: attemptsRes.data ?? [],
    allPartsPassed,
    allPartAssessments,
  };
};