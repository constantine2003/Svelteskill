import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals, params }: RequestEvent) => {
  // Public page — no auth required
  // Find profile by display_name
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('id, display_name, full_name, avatar_url, created_at')
    .eq('username', params?.username ?? '')

    .single();

  if (!profile) throw error(404, 'User not found');

  // Fetch their certificates with track info
  const { data: certificates } = await locals.supabase
    .from('certificates')
    .select(`
      id,
      issued_at,
      full_name_on_cert,
      tracks (
        title,
        slug,
        order_index
      )
    `)
    .eq('user_id', profile.id)
    .order('issued_at', { ascending: false });

  return {
    profile,
    certificates: certificates ?? [],
    username: params?.username ?? ''
  };
};