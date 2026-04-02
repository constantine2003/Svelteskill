import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  const partIndex = parseInt((params as { slug: string; partIndex: string }).partIndex ?? '0');
  if (!partIndex || partIndex < 1 || partIndex > 4) throw error(404, 'Invalid part');

  const { data: track } = await locals.supabase
    .from('tracks')
    .select('*')
    .eq('slug', params?.slug ?? '')
    .single();

  if (!track) throw error(404, 'Track not found');

  // Single fetch for all modules
  const { data: allModulesRaw } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  const allModules = (allModulesRaw ?? []) as { id: number; title: string; slug: string; order_index: number }[];

  // Single fetch for user progress
  const { data: progressRaw } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  const completedModuleIds = (progressRaw ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  function getPartIndex(orderIndex: number): number {
    if (orderIndex <= 3) return 1;
    if (orderIndex <= 6) return 2;
    if (orderIndex <= 9) return 3;
    return 4;
  }

  const partModules = allModules.filter(
    (m) => getPartIndex(m.order_index) === partIndex
  );

  const allPartModulesCompleted = partModules.every(
    (m) => completedModuleIds.includes(m.id)
  );

  if (!allPartModulesCompleted) {
    const firstIncomplete = partModules.find(
      (m) => !completedModuleIds.includes(m.id)
    );
    throw redirect(303, `/tracks/${params?.slug}/modules/${firstIncomplete?.slug}`);
  }

  const supabaseAny = locals.supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            eq: (col: string, val: unknown) => {
              maybeSingle: () => Promise<{ data: { passed: boolean; score: number } | null }>;
            };
          };
        };
      };
    };
  };

  const { data: existingAssessment } = await supabaseAny
    .from('part_assessments')
    .select('passed, score')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .eq('part_index', partIndex)
    .maybeSingle();

  const { data: questionsRaw } = await locals.supabase
    .from('questions')
    .select('*')
    .eq('track_id', track.id)
    .eq('is_final_exam', false);

  interface QuestionRow {
    id: number;
    question: string;
    options: unknown;
    correct_index: number;
    explanation: string | null;
    part_index: number | null;
    track_id: number | null;
    is_final_exam: boolean | null;
  }

  const questions = ((questionsRaw ?? []) as unknown as QuestionRow[]).filter(
    (q) => q.part_index === partIndex
  );

  const nextPartFirstModule = allModules.find(
    (m) => getPartIndex(m.order_index) === partIndex + 1
  ) as { slug: string } | undefined;

  const partLabels: Record<number, string> = {
    1: 'The Foundation',
    2: 'Interactivity',
    3: 'Svelte Internals',
    4: 'Advanced Patterns'
  };

  return {
    track,
    partIndex,
    partLabel: partLabels[partIndex] ?? '',
    questions,
    existingAssessment: existingAssessment ?? null,
    nextPartFirstModule: nextPartFirstModule ?? null,
    userId: user.id,
    isLastPart: partIndex === 4,
    allModules,
    completedModuleIds,
  };
};