// This is the server-side logic for the auth page.
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();

  // If already logged in, no reason to be on the auth page
  if (user) redirect(303, '/dashboard');
};