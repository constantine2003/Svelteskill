import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  // Public page — no session check needed, anyone can view a certificate

  // Single query with inline joins to tracks and profiles —
  // avoids extra round-trips by fetching everything in one shot.
  // Only selecting columns the certificate view page actually needs.
  const { data: certificate, error: certError } = await locals.supabase
    .from('certificates')
    .select(`
      id,
      issued_at,
      full_name_on_cert,
      tracks (
        title,
        slug,
        order_index
      ),
      profiles (
        display_name,
        avatar_url
      )
    `)
    // certId comes from the URL param e.g. /cert/[certId]
    .eq('id', params?.certId ?? '')
    .single();

  // Throw a proper 404 rather than returning null and handling it in the UI —
  // this also prevents the page from rendering with empty/broken data
  if (certError || !certificate) throw error(404, 'Certificate not found');

  return {
    certificate,
    // Pass certId through so the page can use it for the shareable URL
    certId: params?.certId ?? ''
  };
};