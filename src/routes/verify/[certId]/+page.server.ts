import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  // This page is fully public — no auth required
  const { data: certificate } = await locals.supabase
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
    .eq('id', params?.certId ?? '')
    .single();

  return {
    certificate: certificate ?? null,
    certId: params?.certId ?? ''
  };
};