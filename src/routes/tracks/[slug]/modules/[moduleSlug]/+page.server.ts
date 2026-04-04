import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Maps part number to the order_index of its last module.
// Update this if you add more modules to a part.
const PART_LAST_MODULE: Record<number, number> = {
  1: 3, 2: 6, 3: 9, 4: 12
};

// Derives which part (1–4) a module belongs to based on its order_index.
function getPartIndex(orderIndex: number): number {
  if (orderIndex <= 3) return 1;
  if (orderIndex <= 6) return 2;
  if (orderIndex <= 9) return 3;
  return 4;
}

type PartAssessmentSimple = { part_index: number; passed: boolean };

// Temporary cast until `part_assessments` is added to generated types.
// Remove after: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabase = { from: (table: string) => any };

export const load = async ({ locals, params, parent }: RequestEvent & {
  parent: () => Promise<{
    track: { id: number; slug: string; title: string; prerequisite_track_id: number | null };
    allModules: { id: number; slug: string; title: string; order_index: number; content: string }[];
    allQuestions: { id: number; question: string; options: string[]; correct_index: number; explanation: string | null; part_index?: number }[];
    completedModuleIds: (number | null)[];
    allPartAssessments: PartAssessmentSimple[];
    allPartsPassed: boolean;
  }>
}) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // Pull static curriculum data from the layout loader.
  // The layout fetches all modules (with content) and questions once when
  // the user enters the track — no DB calls needed here for that data.
  const { track, allModules, allQuestions, completedModuleIds, allPartAssessments, allPartsPassed } = await parent();

  // Resolve the current module from the cached list — zero DB calls.
  const module = allModules.find(m => m.slug === params?.moduleSlug);
  if (!module) throw error(404, 'Module not found');

  const partIndex = getPartIndex(module.order_index);
  const isLastInPart = module.order_index === PART_LAST_MODULE[partIndex];
  const completedSet = new Set(completedModuleIds);

  // Only fetch the current part assessment — user-specific, always fresh.
  // progress, allPartAssessments, and allPartsPassed come from the layout.
  const db = locals.supabase as unknown as UntypedSupabase;
  const partAssessmentRes = await db
    .from('part_assessments')
    .select('passed, score, part_index')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .eq('part_index', partIndex)
    .maybeSingle();

  const partAssessment = (partAssessmentRes.data ?? null) as { passed: boolean; score: number } | null;

  // Modules that belong to the current part — used for quiz unlock logic.
  const partModules = allModules.filter(m => getPartIndex(m.order_index) === partIndex);

  // Questions for the current part — only relevant on the last module of a part.
  const partQuestions = isLastInPart
    ? allQuestions.filter(q => q.part_index === partIndex)
    : [];

  return {
    module,
    allModules,
    // Pass through from layout — already fetched, no extra DB call
    completedModuleIds,
    isCompleted: completedSet.has(module.id),
    // Next module in sequence — null if this is the last module in the track.
    nextModule: allModules.find(m => m.order_index === module.order_index + 1) ?? null,
    userId: user.id,
    partIndex,
    isLastInPart,
    // True only when every module in the current part is completed.
    allPartModulesCompleted: partModules.every(m => completedSet.has(m.id)),
    partAssessment,
    partQuestions,
    partModules,
    // Pass through from layout
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