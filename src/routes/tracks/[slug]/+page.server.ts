import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, parent }: RequestEvent & {
  parent: () => Promise<{
    track: { id: number; slug: string; title: string; prerequisite_track_id: number | null };
    allModules: { id: number; slug: string; title: string; order_index: number }[];
    completedModuleIds: (number | null)[];
    certificate: { id: string; issued_at: string | null; full_name_on_cert: string } | null;
    attempts: { score: number; passed: boolean; taken_at: string }[];
    allPartsPassed: boolean;
    allPartAssessments: { part_index: number; passed: boolean }[];
  }>
}) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // All data already fetched by the layout loader — zero extra DB calls
  const { track, allModules, completedModuleIds, certificate, attempts, allPartsPassed, allPartAssessments } = await parent();

  return {
    track,
    modules: allModules,
    completedModuleIds,
    certificate,
    attempts,
    allPartsPassed,
    allPartAssessments,
  };
};