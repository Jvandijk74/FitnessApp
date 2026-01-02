import { cookies } from 'next/headers';

const STATE_COOKIE_NAME = 'strava_oauth_state';
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  // Generate a random state using crypto
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store the state in a secure HTTP-only cookie
 */
export function storeState(state: string): void {
  const cookieStore = cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_EXPIRY_MS / 1000,
    path: '/'
  });
}

/**
 * Validate and retrieve the state from cookies
 * Returns the state if valid, null otherwise
 */
export function validateState(receivedState: string | null): boolean {
  if (!receivedState) {
    return false;
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value;

  // Clear the state cookie after validation attempt
  cookieStore.delete(STATE_COOKIE_NAME);

  if (!storedState) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return storedState === receivedState;
}
