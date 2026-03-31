import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ url, locals }: RequestEvent) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await locals.supabase.auth.getUser();

      if (user) {
        const { data: profile } = await locals.supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // First time login → onboarding
        // Returning user → dashboard
        if (!profile) {
          redirect(303, '/onboarding');
        }
      }

      redirect(303, next);
    }
  }

  redirect(303, '/auth?error=callback_error');
};