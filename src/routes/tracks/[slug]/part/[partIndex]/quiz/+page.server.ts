import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabase = { from: (table: string) => any };

function getPartIndex(orderIndex: number): number {
  if (orderIndex <= 3) return 1;
  if (orderIndex <= 6) return 2;
  if (orderIndex <= 9) return 3;
  return 4;
}

const partLabels: Record<number, string> = {
  1: 'The Foundation',
  2: 'Interactivity',
  3: 'Svelte Internals',
  4: 'Advanced Patterns'
};

export const load = async ({ locals, params, parent }: RequestEvent & {
  parent: () => Promise<{
    track: { id: number; slug: string };
    allModules: { id: number; slug: string; title: string; order_index: number }[];
    allQuestions: { id: number; question: string; options: string[]; correct_index: number; explanation: string | null; part_index?: number }[];
    completedModuleIds: (number | null)[];
    allPartAssessments: { part_index: number; passed: boolean }[];
    allPartsPassed: boolean;
  }>
}) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  const partIndex = parseInt((params as { slug: string; partIndex: string }).partIndex ?? '0');
  if (!partIndex || partIndex < 1 || partIndex > 4) throw error(404, 'Invalid part');

  // All static data from layout — no DB calls needed
  const { track, allModules, allQuestions, completedModuleIds, allPartAssessments, allPartsPassed } = await parent();

  // Guard — redirect if not all part modules are completed
  const partModules = allModules.filter(m => getPartIndex(m.order_index) === partIndex);
  const allPartModulesCompleted = partModules.every(m => completedModuleIds.includes(m.id));

  if (!allPartModulesCompleted) {
    const firstIncomplete = partModules.find(m => !completedModuleIds.includes(m.id));
    throw redirect(303, `/tracks/${params?.slug}/modules/${firstIncomplete?.slug}`);
  }

  // Only fetch the current part's assessment — user-specific, must be fresh
  const db = locals.supabase as unknown as UntypedSupabase;
  const { data: existingAssessment } = await db
    .from('part_assessments')
    .select('passed, score')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .eq('part_index', partIndex)
    .maybeSingle();

  // Filter questions for this part from the cached list — no DB call
  const questions = allQuestions.filter(q => q.part_index === partIndex);

  // First module of the next part — for the "continue" button after passing
  const nextPartFirstModule = allModules.find(
    m => getPartIndex(m.order_index) === partIndex + 1
  ) ?? null;

  return {
    track,
    partIndex,
    partLabel: partLabels[partIndex] ?? '',
    questions,
    existingAssessment: existingAssessment ?? null,
    nextPartFirstModule,
    userId: user.id,
    isLastPart: partIndex === 4,
    allModules,
    completedModuleIds,
    allPartsPassed,
    allPartAssessments,
  };
};