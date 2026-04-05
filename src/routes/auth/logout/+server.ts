//  This is the server-side logic for handling user logout.
//  When the user clicks "Logout", we need to clear their session on the server
//  and then redirect them back to the homepage or login page.
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ locals }: RequestEvent) => {
  await locals.supabase.auth.signOut();
  redirect(303, '/');
};