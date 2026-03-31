import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  console.log('[module load] params:', params);

  const { user } = await locals.safeGetSession();
  console.log('[module load] user:', user?.id ?? 'null');

  if (!user) throw redirect(303, '/auth');

  // Fetch the track
  const { data: track, error: trackError } = await locals.supabase
    .from('tracks')
    .select('*')
    .eq('slug', params?.slug ?? '')
    .single();

  console.log('[module load] track:', track?.id ?? 'null', '| error:', trackError?.message ?? 'none');
  if (!track) throw error(404, 'Track not found');

  // Fetch the module
  const { data: module, error: moduleError } = await locals.supabase
    .from('modules')
    .select('*')
    .eq('slug', params?.moduleSlug ?? '')
    .eq('track_id', track.id)
    .single();

  console.log('[module load] module:', module?.id ?? 'null', '| error:', moduleError?.message ?? 'none');
  if (!module) throw error(404, 'Module not found');

  // Fetch all modules for sidebar
  const { data: allModules, error: allModulesError } = await locals.supabase
    .from('modules')
    .select('id, title, slug, order_index')
    .eq('track_id', track.id)
    .order('order_index');

  console.log('[module load] allModules count:', allModules?.length ?? 0, '| error:', allModulesError?.message ?? 'none');

  // Fetch user progress
  const { data: progress, error: progressError } = await locals.supabase
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id);

  console.log('[module load] progress count:', progress?.length ?? 0, '| error:', progressError?.message ?? 'none');

  // Fetch quiz questions for this module
  const { data: questions, error: questionsError } = await locals.supabase
    .from('questions')
    .select('*')
    .eq('module_id', module.id)
    .eq('is_final_exam', false);

  console.log('[module load] questions count:', questions?.length ?? 0, '| error:', questionsError?.message ?? 'none');

  const completedModuleIds = (progress ?? []).map(
    (p: { module_id: number | null }) => p.module_id
  );

  const isCompleted = completedModuleIds.includes(module.id);

  const nextModule = (allModules ?? []).find(
    (m: { order_index: number }) => m.order_index === module.order_index + 1
  );

  console.log('[module load] isCompleted:', isCompleted, '| nextModule:', nextModule?.slug ?? 'none');

  return {
    track,
    module,
    allModules: allModules ?? [],
    completedModuleIds,
    questions: questions ?? [],
    isCompleted,
    nextModule: nextModule ?? null,
    userId: user.id
  };
};