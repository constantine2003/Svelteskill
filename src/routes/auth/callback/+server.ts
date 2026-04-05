import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ url, locals }: RequestEvent) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  // Guard early — no code means something went wrong with the OAuth flow
  if (!code) redirect(303, '/auth?error=callback_error');

  // Exchange the OAuth code for a Supabase session
  const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

  // If exchange failed (expired code, network issue, etc.), bail out
  if (error) redirect(303, '/auth?error=callback_error');

  // Prefer getSession() over getUser() here — session is already in memory
  // after exchangeCodeForSession, so this is a free sync call with no extra
  // round-trip to Supabase Auth servers
  const { data: { session } } = await locals.supabase.auth.getSession();

  if (!session?.user) redirect(303, '/auth?error=callback_error');

  // Sanitize `next` to only allow relative paths — prevents open redirect attacks
  // where a malicious link could set ?next=https://evil.com and hijack the redirect
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  // Check if the user has completed onboarding.
  // Select the bare minimum — just 'id' — we only need to know if a row exists.
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single();

  // No profile row → first-time login, send to onboarding
  // Profile exists → returning user, send to intended destination
  redirect(303, profile ? safeNext : '/onboarding');
};