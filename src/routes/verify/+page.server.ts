import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load = async ({ url }: RequestEvent) => {
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (!query) {
    return { query, results: [], total: 0 };
  }

  // Use service role to bypass RLS — public search page
  const serviceClient = createClient(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  // Search certificates by full_name_on_cert OR display_name
  const { data: certs } = await serviceClient
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
    .or(
      `full_name_on_cert.ilike.%${query}%`
    )
    .order('issued_at', { ascending: false })
    .limit(20);

  // Also search by display_name via profiles
  const { data: profileMatches } = await serviceClient
    .from('profiles')
    .select('id, display_name, avatar_url')
    .ilike('display_name', `%${query}%`)
    .limit(10);

  const profileIds = (profileMatches ?? []).map((p: { id: string }) => p.id);

  let profileCerts: any[] = [];
  if (profileIds.length > 0) {
    const { data: pc } = await serviceClient
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
      .in('user_id', profileIds)
      .order('issued_at', { ascending: false })
      .limit(20);
    profileCerts = pc ?? [];
  }

  // Merge and deduplicate by cert ID
  const allCerts = [...(certs ?? []), ...profileCerts];
  const seen = new Set<string>();
  const results = allCerts.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return {
    query,
    results,
    total: results.length
  };
};