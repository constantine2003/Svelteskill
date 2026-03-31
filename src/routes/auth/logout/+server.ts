import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ locals }: RequestEvent) => {
  await locals.supabase.auth.signOut();
  redirect(303, '/');
};