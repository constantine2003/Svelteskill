import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params, parent }: RequestEvent & {
  parent: () => Promise<{
    track: { id: number; slug: string; title: string; description: string | null; order_index: number; prerequisite_track_id: number | null };
  }>
}) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // Track comes from layout — no DB call needed
  const { track } = await parent();

  // These 3 are independent — run in parallel
  const [profileRes, latestAttemptRes, existingCertRes] = await Promise.all([
    // Profile for certificate name
    locals.supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', user.id)
      .single(),

    // Latest passing exam attempt
    locals.supabase
      .from('exam_attempts')
      .select('score, passed, taken_at')
      .eq('user_id', user.id)
      .eq('track_id', track.id)
      .eq('passed', true)
      .order('taken_at', { ascending: false })
      .limit(1)
      .single(),

    // Existing certificate if already generated
    locals.supabase
      .from('certificates')
      .select('id, issued_at, full_name_on_cert')
      .eq('user_id', user.id)
      .eq('track_id', track.id)
      .maybeSingle(),
  ]);

  // No passing attempt — send back to exam
  if (!latestAttemptRes.data) throw redirect(303, `/tracks/${params?.slug}/exam`);

  const profile = profileRes.data;

  // Generate certificate if it doesn't exist yet
  let certificate = existingCertRes.data;
  if (!certificate) {
    const certName = profile?.full_name || profile?.display_name || 'Learner';
    const { data: newCert } = await locals.supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        track_id: track.id,
        full_name_on_cert: certName
      })
      .select('id, issued_at, full_name_on_cert')
      .single();
    certificate = newCert;
  }

  return {
    track,
    certificate,
    profile,
    score: latestAttemptRes.data.score,
    issuedAt: certificate?.issued_at ?? new Date().toISOString(),
  };
};