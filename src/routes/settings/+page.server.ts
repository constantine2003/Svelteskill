import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// ── Constants ──────────────────────────────────────────────────────────────

/**
 * These limits are shared between client (maxlength attributes) and server.
 * If you change them here, update the matching maxlength values in +page.svelte.
 */
const MAX_DISPLAY_NAME_LENGTH = 50;
const MAX_FULL_NAME_LENGTH    = 100;

/** Slugs longer than this get truncated — keeps profile URLs tidy. */
const MAX_USERNAME_LENGTH = 30;

/**
 * Safety ceiling for the uniqueness loop.
 * Prevents an infinite loop if a large block of suffixed usernames exists.
 */
const MAX_USERNAME_ATTEMPTS = 100;

// ── Load ───────────────────────────────────────────────────────────────────

export const load = async ({ locals }: RequestEvent) => {
  const { user } = await locals.safeGetSession();
  if (!user) throw redirect(303, '/auth');

  // Include `username` so the page can display the current profile URL
  // and derive a real-time preview when the display name is edited.
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('display_name, full_name, avatar_url, username')
    .eq('id', user.id)
    .single();

  if (!profile) throw redirect(303, '/onboarding');

  return { profile };
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts a display name into a URL-safe username slug.
 *
 * Rules:
 *   - Lowercased and trimmed
 *   - Anything that isn't alphanumeric, space, underscore, or hyphen is removed
 *   - Spaces collapsed into underscores
 *   - Result truncated to MAX_USERNAME_LENGTH
 *
 * Examples:
 *   "Jane Doe"   → "jane_doe"
 *   "Ångström!!" → "ngstrm"
 */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')  // strip unsafe characters
    .replace(/\s+/g, '_')            // collapse whitespace into underscores
    .slice(0, MAX_USERNAME_LENGTH);  // cap length
}

/**
 * Finds a unique username by appending an incrementing suffix when the base
 * slug is already taken by a *different* user.
 *
 * The `currentUserId` parameter is used to skip the row that belongs to the
 * user making the request — without this, a user saving the same display name
 * they already have would see their own username as "taken" and get a suffix.
 *
 * Returns null after MAX_USERNAME_ATTEMPTS to avoid an infinite loop.
 * The caller must handle the null case.
 *
 * NOTE: There is an inherent TOCTOU race between the SELECT and the UPDATE.
 * This is mitigated by a UNIQUE constraint on the `username` column — the DB
 * will reject a duplicate and the action returns a 409 for the caller to handle.
 */
async function getUniqueUsername(
  supabase: RequestEvent['locals']['supabase'],
  base: string,
  currentUserId: string
): Promise<string | null> {
  let candidate = base;
  let suffix    = 0;

  while (suffix <= MAX_USERNAME_ATTEMPTS) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    // Free — or already owned by this user (same display name re-save)
    if (!data || data.id === currentUserId) return candidate;

    suffix   += 1;
    candidate = `${base}-${suffix}`;
  }

  // Exhausted all attempts — caller should surface a user-facing error
  return null;
}

// ── Actions ────────────────────────────────────────────────────────────────

export const actions = {
  /**
   * Updates the authenticated user's display name, full name, and username.
   *
   * Username is re-derived from the new display name server-side — the client
   * never sends a username directly, preventing slug injection.
   *
   * Flow:
   *   1. Re-validate the session (it could have expired since page load)
   *   2. Validate and sanitise form inputs
   *   3. Fetch the current display name to check whether it actually changed
   *   4. If changed, derive a new unique username from the new display name
   *   5. Update the profile row
   *   6. Return { success: true } — SvelteKit re-runs load() automatically
   */
  updateProfile: async ({ locals, request }: RequestEvent) => {
    const { user } = await locals.safeGetSession();

    // Guard — session could have expired between page load and submit
    if (!user) throw redirect(303, '/auth');

    const form        = await request.formData();
    const displayName = (form.get('display_name') as string)?.trim();
    const fullName    = (form.get('full_name')    as string)?.trim();

    // ── Input validation ─────────────────────────────────────────────────

    if (!displayName) {
      return fail(400, {
        error: 'Display name is required.',
        display_name: displayName,
        full_name:    fullName
      });
    }

    if (displayName.length < 2) {
      return fail(400, {
        error: 'Display name must be at least 2 characters.',
        display_name: displayName,
        full_name:    fullName
      });
    }

    // Belt-and-suspenders: maxlength on the input catches this client-side,
    // but we always re-validate on the server since inputs can be bypassed.
    if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return fail(400, {
        error: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`,
        display_name: displayName,
        full_name:    fullName
      });
    }

    if (fullName && fullName.length > MAX_FULL_NAME_LENGTH) {
      return fail(400, {
        error: `Full name must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`,
        display_name: displayName,
        full_name:    fullName
      });
    }

    // ── Username regeneration ────────────────────────────────────────────

    // Fetch the current display name so we only regenerate the username when
    // it has actually changed — avoids unnecessary suffix churn on unrelated saves.
    const { data: current } = await locals.supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const displayNameChanged = current?.display_name !== displayName;

    let usernameUpdate: { username?: string } = {};

    if (displayNameChanged) {
      // Derive a slug from the new display name.
      const baseUsername = slugify(displayName);

      // If slugify strips everything (e.g. the name was all emoji/special chars),
      // fall back to a prefix derived from the user's UUID so we always have a
      // valid, non-empty candidate.
      const safeBase = baseUsername || `user_${user.id.slice(0, 8)}`;

      const username = await getUniqueUsername(locals.supabase, safeBase, user.id);

      if (!username) {
        // Extremely unlikely in practice but must be handled gracefully.
        return fail(500, {
          error: 'Could not generate a unique username. Please try a different display name.',
          display_name: displayName,
          full_name:    fullName
        });
      }

      usernameUpdate = { username };
    }

    // ── Profile update ───────────────────────────────────────────────────

    const { error } = await locals.supabase
      .from('profiles')
      .update({
        display_name: displayName,
        full_name:    fullName || null,
        ...usernameUpdate  // only included when display name changed
      })
      .eq('id', user.id);

    if (error) {
      // Postgres unique-violation — username was claimed between our SELECT
      // and this UPDATE (race condition). Ask the user to retry.
      if (error.code === '23505') {
        return fail(409, {
          error: 'That username was just taken. Please try a slightly different display name.',
          display_name: displayName,
          full_name:    fullName
        });
      }

      // All other DB errors — log internally, return a safe message to the client.
      // Consider piping `error` to your observability tool here.
      return fail(500, {
        error: 'Failed to update profile. Please try again.',
        display_name: displayName,
        full_name:    fullName
      });
    }

    return { success: true };
  }
};