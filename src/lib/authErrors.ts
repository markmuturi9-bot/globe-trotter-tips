import type { TranslationKey } from '@/lib/i18n';

/** An error with a short machine-readable code, so the UI can show it in the user's language. */
export function authError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code });
}

/**
 * Turns any error from sign-up / sign-in / password flows into a translated
 * text key. Supabase errors carry a `code`; our own errors use authError().
 * Anything unknown becomes a generic message (never raw English text).
 */
export function authErrorKey(error: unknown): TranslationKey {
  const e = error as { code?: string; message?: string } | null;
  const code = e?.code ?? '';
  const message = e?.message ?? '';

  switch (code) {
    case 'invalid_credentials':
      return 'auth.error.invalidCredentials';
    case 'user_already_exists':
    case 'email_exists':
      return 'auth.error.emailTaken';
    case 'email_not_confirmed':
      return 'auth.error.notConfirmed';
    case 'otp_expired':
      return 'auth.error.badCode';
    case 'weak_password':
      return 'auth.error.weakPassword';
    case 'same_password':
      return 'auth.error.samePassword';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'auth.error.rateLimit';
    case 'user_not_found':
      return 'auth.error.userNotFound';
    case 'lookup_unavailable':
      return 'auth.error.lookupUnavailable';
    case 'too_many_attempts':
      return 'auth.error.rateLimit';
    case 'validation_failed':
      return 'auth.error.invalidEmail';
  }

  // Older/other error shapes without a code.
  if (/invalid login credentials/i.test(message)) return 'auth.error.invalidCredentials';
  if (/already registered/i.test(message)) return 'auth.error.emailTaken';
  if (/email not confirmed/i.test(message)) return 'auth.error.notConfirmed';
  if (/token has expired or is invalid/i.test(message)) return 'auth.error.badCode';
  // The database stops sign-up with this text if the username is invalid or taken.
  if (/database error saving new user/i.test(message)) return 'auth.error.usernameRejected';
  return 'auth.error.generic';
}
