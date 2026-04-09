import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum character lengths enforced both here and ideally in your DB schema. */
const MAX_DISPLAY_NAME_LENGTH = 50;
const MAX_FULL_NAME_LENGTH    = 100;

/**
 * Maximum slug length for generated usernames.
 * Keeps URLs clean and prevents abnormally long DB values.
 */
const MAX_USERNAME_LENGTH = 30;

/**
 * How many suffix attempts to make before giving up on uniqueness.
 * Prevents an infinite loop if a large number of similar usernames exist.
 */
const MAX_USERNAME_ATTEMPTS = 100;

// ── Load function ──────────────────────────────────────────────────────────

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();

  // Not logged in → back to auth
  if (!user) redirect(303, '/auth');

  // Already has a profile → skip onboarding
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profile) redirect(303, '/dashboard');

  // Pass the minimum necessary user data to the page.
  // avatar_url and provider_name are read-only OAuth metadata — safe to expose.
  return {
    user: {
      id:            user.id,
      email:         user.email,
      avatar_url:    user.user_metadata?.avatar_url ?? '',
      // Providers use different keys for the display name; fall back gracefully.
      provider_name: user.user_metadata?.full_name
        ?? user.user_metadata?.name
        ?? user.user_metadata?.user_name
        ?? ''
    }
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts a display name into a URL-safe username slug.
 *
 * Rules:
 *   - Lowercased and trimmed
 *   - Special characters (anything that isn't alphanumeric, space, _ or -) removed
 *   - Spaces collapsed into underscores
 *   - Result truncated to MAX_USERNAME_LENGTH to keep URLs tidy
 *
 * Examples:
 *   "John Doe"   → "john_doe"
 *   "Ångström!!" → "ngstrm"   (non-ASCII stripped)
 *   " Hello  World " → "hello_world"
 */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')  // remove anything unsafe
    .replace(/\s+/g, '_')           // collapse whitespace into underscores
    .slice(0, MAX_USERNAME_LENGTH);  // cap length
}

/**
 * Finds a unique username by appending an incrementing suffix when the base
 * slug is already taken.
 *
 * Example: "john_doe" taken → tries "john_doe-1", "john_doe-2", …
 *
 * @throws Will return null after MAX_USERNAME_ATTEMPTS to prevent an
 *         infinite loop. The caller must handle the null case.
 *
 * NOTE: There is an inherent TOCTOU (time-of-check/time-of-use) race here —
 *       another request could claim the same username between the SELECT and
 *       the INSERT. This is mitigated by relying on a UNIQUE constraint on the
 *       `username` column in your database and handling the resulting
 *       unique-violation error (code 23505) in the action below.
 */
async function getUniqueUsername(
  supabase: RequestEvent['locals']['supabase'],
  base: string
): Promise<string | null> {
  let candidate = base;
  let suffix    = 0;

  while (suffix <= MAX_USERNAME_ATTEMPTS) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!data) return candidate; // username is free

    suffix   += 1;
    candidate = `${base}-${suffix}`;
  }

  // Exhausted all attempts — caller should surface this as a user-facing error.
  return null;
}

// ── Form action ────────────────────────────────────────────────────────────

/**
 * Handles profile creation on form submit.
 *
 * Flow:
 *   1. Re-validate the session (it could have expired since page load).
 *   2. Validate and sanitise form inputs server-side.
 *   3. Derive a unique URL-safe username from the display name.
 *   4. Insert the profile row.
 *   5. Redirect to /dashboard on success.
 *
 * Error handling:
 *   - 400 for missing/invalid input
 *   - 409 for username conflicts (race condition / unique constraint violation)
 *   - 500 for unexpected DB errors
 */
export const actions = {
  default: async ({ request, locals }: RequestEvent) => {
    const { user } = await locals.safeGetSession();

    // Guard — session could have expired between page load and submit.
    if (!user) redirect(303, '/auth');

    const form        = await request.formData();
    const displayName = (form.get('display_name') as string)?.trim();
    const fullName    = (form.get('full_name')    as string)?.trim();

    // ── Input validation ─────────────────────────────────────────────────

    if (!displayName || !fullName) {
      return fail(400, { error: 'Display name and full name are required.' });
    }

    // Guard against excessively long strings before they hit the database.
    if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return fail(400, {
        error: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`
      });
    }

    if (fullName.length > MAX_FULL_NAME_LENGTH) {
      return fail(400, {
        error: `Full name must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`
      });
    }

    // ── Username generation ──────────────────────────────────────────────

    const baseUsername = slugify(displayName);

    // If slugify strips everything (e.g. the name was all emoji/special chars),
    // fall back to a deterministic prefix derived from the user's UUID so we
    // always have a valid, non-empty candidate to work with.
    const safeBase = baseUsername || `user_${user.id.slice(0, 8)}`;

    const username = await getUniqueUsername(locals.supabase, safeBase);

    if (!username) {
      // Extremely unlikely in practice, but we must handle it gracefully.
      return fail(500, {
        error: 'Could not generate a unique username. Please try a different display name.'
      });
    }

    // ── Profile insert ───────────────────────────────────────────────────

    const { error } = await locals.supabase
      .from('profiles')
      .insert({
        id:           user.id,
        display_name: displayName,
        full_name:    fullName,
        // avatar_url comes from the OAuth provider, not user input — safe to store directly.
        avatar_url:   user.user_metadata?.avatar_url ?? null,
        username
      });

    if (error) {
      // Postgres unique-violation code — username was claimed between our
      // SELECT and this INSERT (race condition). Ask the user to retry.
      if (error.code === '23505') {
        return fail(409, {
          error: 'That username was just taken. Please try a slightly different display name.'
        });
      }

      // Surface other DB errors without leaking internal details in production.
      // Consider logging `error` to your observability tool here.
      return fail(500, { error: 'An unexpected error occurred. Please try again.' });
    }

    // Profile created successfully — send the user into the app.
    redirect(303, '/dashboard');
  }
};