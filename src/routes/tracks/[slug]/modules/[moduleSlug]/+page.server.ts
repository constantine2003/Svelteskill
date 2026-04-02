import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const PART_LAST_MODULE: Record<number, number> = {
  1: 3,
  2: 6,
  3: 9,
  4: 12
};

function getPartIndex(orderIndex: number): number {
  if (orderIndex <= 3) return 1;
  if (orderIndex <= 6) return 2;
  if (orderIndex <= 9) return 3;
  return 4;
}

type ModuleRow = {
  id: number;
  title: string;
  slug: string;
  order_index: number;
};

type PartAssessmentRow = {
  id: number;
  user_id: string;
  track_id: number;
  part_index: number;
  passed: boolean;
  created_at: string | null;
};

type PartAssessmentSimple = {
  part_index: number;
  passed: boolean;
};

type QuestionRow = {
  id: number;
  track_id: number | null;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  is_final_exam: boolean;
  module_id: number | null;
};

type PartAssessmentQueryBuilder = {
  from: (table: 'part_assessments') => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: PartAssessmentRow | null; error: unknown }>;
          };
          then: never;
        } & Promise<{ data: PartAssessmentSimple[] | null; error: unknown }>;
      };
    };
  };
};

export const load = async ({ locals, params }: RequestEvent) => {
  console.log('[module load] params:', params);

  const { user } = await locals.safeGetSession();
  console.log('[module load] user:', user?.id ?? 'null');

  if (!user) throw redirect(303, '/auth');

  const { data: track, error: trackError } = await locals.supabase
    .from('tracks')
    .select('*')
    .eq('slug', params?.slug ?? '')
    .single();

  console.log('[module load] track:', track?.id ?? 'null', '| error:', trackError?.message ?? 'none');
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

  const { data: module, error: moduleError } = await locals.supabase
    .from('modules')
    .select('*')
    .eq('slug', params?.moduleSlug ?? '')
    .eq('track_id', track.id)
    .single();

  console.log('[module load] module:', module?.id ?? 'null', '| error:', moduleError?.message ?? 'none');
  if (!module) throw error(404, 'Module not found');

  const { data: allModulesRaw, error: allModulesError } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  const allModules = (allModulesRaw ?? []) as ModuleRow[];
  console.log('[module load] allModules count:', allModules.length, '| error:', allModulesError?.message ?? 'none');

  const { data: progress, error: progressError } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  console.log('[module load] progress count:', progress?.length ?? 0, '| error:', progressError?.message ?? 'none');

  const completedModuleIds = (progress ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  const isCompleted = completedModuleIds.includes(module.id);
  const partIndex = getPartIndex(module.order_index);
  const isLastInPart = module.order_index === PART_LAST_MODULE[partIndex];

  const partModules = allModules.filter(
    (m) => getPartIndex(m.order_index) === partIndex
  );

  const allPartModulesCompleted = partModules.every(
    (m) => completedModuleIds.includes(m.id)
  );

  console.log('[module load] partIndex:', partIndex, '| isLastInPart:', isLastInPart, '| allPartModulesCompleted:', allPartModulesCompleted);

  const db = locals.supabase as unknown as PartAssessmentQueryBuilder;

  // Use maybeSingle so no error is thrown when no row exists yet
  const { data: partAssessmentRaw } = await db
    .from('part_assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .eq('part_index', partIndex)
    .maybeSingle();

  const partAssessment = (partAssessmentRaw ?? null) as PartAssessmentRow | null;
  console.log('[module load] partAssessment:', partAssessment?.passed ?? 'none');

  const { data: allPartAssessmentsRaw } = await (
    locals.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: unknown) => {
            eq: (k: string, v: unknown) => Promise<{
              data: PartAssessmentSimple[] | null;
            }>;
          };
        };
      };
    }
  )
    .from('part_assessments')
    .select('part_index, passed')
    .eq('user_id', user.id)
    .eq('track_id', track.id);

  const allPartAssessments = (allPartAssessmentsRaw ?? []) as PartAssessmentSimple[];

  const allPartsPassed = [1, 2, 3, 4].every(pi =>
    allPartAssessments.some(pa => pa.part_index === pi && pa.passed)
  );

  let partQuestions: QuestionRow[] = [];
  if (isLastInPart) {
    const { data: qs, error: qsError } = await locals.supabase
      .from('questions')
      .select('*')
      .eq('track_id', track.id)
      .eq('is_final_exam', false);

    partQuestions = ((qs ?? []) as QuestionRow[]).filter(
      // @ts-expect-error — part_index not yet in generated types
      (q) => q.part_index === partIndex
    );
    console.log('[module load] partQuestions count:', partQuestions.length, '| error:', qsError?.message ?? 'none');
  }

  const nextModule = allModules.find(
    (m) => m.order_index === module.order_index + 1
  );

  console.log('[module load] isCompleted:', isCompleted, '| nextModule:', nextModule?.slug ?? 'none');

  return {
    track,
    module,
    allModules,
    completedModuleIds,
    isCompleted,
    nextModule: nextModule ?? null,
    userId: user.id,
    partIndex,
    isLastInPart,
    allPartModulesCompleted,
    partAssessment,
    partQuestions,
    partModules,
    allPartAssessments,
    allPartsPassed,
  };
};

/*
 * ─── REQUIRED SUPABASE MIGRATIONS ───────────────────────────────────────────
 * Run these in your Supabase SQL editor, then regenerate types:
 *   npx supabase gen types typescript --project-id <your-id> > src/lib/database.types.ts
 *
 * ALTER TABLE modules ADD COLUMN IF NOT EXISTS part_index integer;
 * UPDATE modules SET part_index = CASE
 *   WHEN order_index <= 3 THEN 1
 *   WHEN order_index <= 6 THEN 2
 *   WHEN order_index <= 9 THEN 3
 *   ELSE 4
 * END;
 *
 * ALTER TABLE questions ADD COLUMN IF NOT EXISTS part_index integer;
 *
 * CREATE TABLE IF NOT EXISTS part_assessments (
 *   id serial PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users(id),
 *   track_id integer REFERENCES tracks(id),
 *   part_index integer NOT NULL,
 *   passed boolean DEFAULT false,
 *   score integer DEFAULT 0,
 *   created_at timestamptz DEFAULT now()
 * );
 * ─────────────────────────────────────────────────────────────────────────────
 */