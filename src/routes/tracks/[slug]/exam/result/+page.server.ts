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

  // Fetch profile for cert name
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('display_name, full_name')
    .eq('id', user.id)
    .single();

  // Get latest passed exam attempt
  const { data: latestAttempt } = await locals.supabase
    .from('exam_attempts')
    .select('score, passed, taken_at')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .eq('passed', true)
    .order('taken_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestAttempt) throw redirect(303, `/tracks/${params?.slug}/exam`);

  // Check if cert already exists
  const { data: existingCert } = await locals.supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .eq('track_id', track.id)
    .single();

  // Generate cert if not exists
  let certificate = existingCert;
  if (!certificate) {
    const certName = profile?.full_name || profile?.display_name || 'Learner';
    const { data: newCert } = await locals.supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        track_id: track.id,
        full_name_on_cert: certName
      })
      .select()
      .single();
    certificate = newCert;
  }

  return {
    track,
    certificate,
    profile,
    score: latestAttempt.score,
    issuedAt: certificate?.issued_at ?? new Date().toISOString()
  };
};