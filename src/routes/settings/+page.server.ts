import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('display_name, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) throw redirect(303, '/onboarding');

  return { profile };
};

export const actions = {
  updateProfile: async ({ locals, request }: RequestEvent) => {
    const { user } = await locals.safeGetSession();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const displayName = (form.get('display_name') as string)?.trim();
    const fullName = (form.get('full_name') as string)?.trim();

    // Validate
    if (!displayName) {
      return fail(400, {
        error: 'Display name is required',
        display_name: displayName,
        full_name: fullName
      });
    }

    if (displayName.length < 2) {
      return fail(400, {
        error: 'Display name must be at least 2 characters',
        display_name: displayName,
        full_name: fullName
      });
    }

    if (displayName.length > 50) {
      return fail(400, {
        error: 'Display name must be under 50 characters',
        display_name: displayName,
        full_name: fullName
      });
    }

    if (fullName && fullName.length > 100) {
      return fail(400, {
        error: 'Full name must be under 100 characters',
        display_name: displayName,
        full_name: fullName
      });
    }

    const { error } = await locals.supabase
      .from('profiles')
      .update({
        display_name: displayName,
        full_name: fullName || null
      })
      .eq('id', user.id);

    if (error) {
      return fail(500, {
        error: 'Failed to update profile. Please try again.',
        display_name: displayName,
        full_name: fullName
      });
    }

    return { success: true };
  }
};