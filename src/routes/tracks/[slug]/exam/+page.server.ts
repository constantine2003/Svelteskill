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

  // Fetch all modules
  const { data: allModulesRaw } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  const allModules = (allModulesRaw ?? []) as {
    id: number; title: string; slug: string; order_index: number;
  }[];

  // Fetch user progress
  const { data: progressRaw } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  const completedModuleIds = (progressRaw ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  // Make sure ALL modules are completed
  const allModulesCompleted = allModules.every(
    (m) => completedModuleIds.includes(m.id)
  );

  if (!allModulesCompleted) {
    throw redirect(303, `/tracks/${params?.slug}`);
  }

  // Make sure ALL 4 part quizzes are passed
    const supabaseAny = locals.supabase as unknown as {
        from: (t: string) => {
            select: (cols: string) => {
                eq: (col: string, val: unknown) => {
                    eq: (col: string, val: unknown) => Promise<{ data: unknown[] | null }>;
                };
            };
        };
    };

    const { data: partAssessmentsRaw } = await supabaseAny
    .from('part_assessments')
    .select('part_index, passed')
    .eq('user_id', user.id)
    .eq('track_id', track.id);

  const partAssessments = (partAssessmentsRaw ?? []) as {
    part_index: number; passed: boolean;
  }[];

  const allPartsPassed = [1, 2, 3, 4].every(pi =>
    partAssessments.some(pa => pa.part_index === pi && pa.passed)
  );

  if (!allPartsPassed) {
    throw redirect(303, `/tracks/${params?.slug}`);
  }

  // Check if already has a certificate — redirect to result
  const { data: certificate } = await locals.supabase
    .from('certificates')
    .select('id')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .single();

  if (certificate) {
    throw redirect(303, `/tracks/${params?.slug}/exam/result`);
  }

  // Previous exam attempts
  const { data: attemptsRaw } = await locals.supabase
    .from('exam_attempts')
    .select('score, passed, taken_at')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .order('taken_at', { ascending: false });

  const attempts = (attemptsRaw ?? []) as {
    score: number; passed: boolean; taken_at: string;
  }[];

  // Fetch final exam questions
  const { data: questionsRaw } = await locals.supabase
    .from('questions')
    .select('*')
    .eq('track_id', track.id)
    .eq('is_final_exam', true);

  interface QuestionRow {
    id: number;
    question: string;
    options: unknown;
    correct_index: number;
    explanation: string | null;
    is_final_exam: boolean | null;
  }

  // Shuffle for each attempt
  const questions = ((questionsRaw ?? []) as unknown as QuestionRow[])
    .sort(() => Math.random() - 0.5);

  return {
    track,
    questions,
    attempts,
    userId: user.id,
    allModules,
    completedModuleIds,
    partAssessments
  };
};