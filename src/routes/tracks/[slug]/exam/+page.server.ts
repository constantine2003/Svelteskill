import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params, parent }: RequestEvent & {
  parent: () => Promise<{
    track: { id: number; slug: string; title: string; description: string | null; order_index: number; prerequisite_track_id: number | null };
    allModules: { id: number; slug: string; title: string; order_index: number }[];
    completedModuleIds: (number | null)[];
    allPartAssessments: { part_index: number; passed: boolean }[];
    allPartsPassed: boolean;
    attempts: { score: number; passed: boolean; taken_at: string }[];
  }>
}) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // All static data from layout — no DB calls needed
  const { track, allModules, completedModuleIds, allPartAssessments, allPartsPassed, attempts } = await parent();

  // Guard — all modules must be completed
  const allModulesCompleted = allModules.every(m => completedModuleIds.includes(m.id));
  if (!allModulesCompleted) throw redirect(303, `/tracks/${params?.slug}`);

  // Guard — all 4 part quizzes must be passed
  if (!allPartsPassed) throw redirect(303, `/tracks/${params?.slug}`);

  // Run remaining user-specific queries in parallel
  const [certificateRes, questionsRes] = await Promise.all([
    // Check if already certified — redirect to result page if so
    locals.supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('track_id', track.id)
      .maybeSingle(),

    // Final exam questions only
    locals.supabase
      .from('questions')
      .select('id, question, options, correct_index, explanation')
      .eq('track_id', track.id)
      .eq('is_final_exam', true),
  ]);

  // Already certified — send to result page
  if (certificateRes.data) throw redirect(303, `/tracks/${params?.slug}/exam/result`);

  // Shuffle questions for each attempt
  const questions = (questionsRes.data ?? []).sort(() => Math.random() - 0.5);

  return {
    track,
    questions,
    attempts,
    userId: user.id,
    allModules,
    completedModuleIds,
    partAssessments: allPartAssessments,
  };
};