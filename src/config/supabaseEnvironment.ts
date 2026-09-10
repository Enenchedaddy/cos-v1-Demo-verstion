export type SupabaseClientEnvironment = Readonly<Record<string, string | undefined>>;

const PLACEHOLDER_PATTERN = /placeholder|your[-_ ]?(?:project|publishable|anon|key)/i;
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]+$/;

function getLegacyJwtRole(key: string): string | null {
  const parts = key.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(globalThis.atob(paddedPayload)) as { role?: unknown };
    return typeof decoded.role === 'string' ? decoded.role : null;
  } catch {
    return null;
  }
}

function validateUrl(value: string): string | null {
  if (PLACEHOLDER_PATTERN.test(value)) {
    return 'VITE_SUPABASE_URL must not contain a placeholder value.';
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) {
      return 'VITE_SUPABASE_URL must be a valid HTTPS project URL without credentials, query parameters, or a fragment.';
    }
  } catch {
    return 'VITE_SUPABASE_URL must be a valid HTTPS project URL.';
  }

  return null;
}

function validateKey(value: string): string | null {
  if (PLACEHOLDER_PATTERN.test(value)) {
    return 'VITE_SUPABASE_ANON_KEY must not contain a placeholder value.';
  }

  if (value.startsWith('sb_secret_')) {
    return 'VITE_SUPABASE_ANON_KEY must be a browser-safe publishable key, never a secret key.';
  }

  if (PUBLISHABLE_KEY_PATTERN.test(value)) return null;

  const legacyRole = getLegacyJwtRole(value);
  if (legacyRole === 'anon') return null;
  if (legacyRole === 'service_role') {
    return 'VITE_SUPABASE_ANON_KEY must be a legacy anon key, never a service-role key.';
  }

  return 'VITE_SUPABASE_ANON_KEY must be a Supabase publishable key or legacy anon key.';
}

export function validateSupabaseClientEnvironment(environment: SupabaseClientEnvironment): string[] {
  const errors: string[] = [];
  const url = environment.VITE_SUPABASE_URL?.trim();
  const key = environment.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url) errors.push('VITE_SUPABASE_URL is required for a production build.');
  else {
    const urlError = validateUrl(url);
    if (urlError) errors.push(urlError);
  }

  if (!key) errors.push('VITE_SUPABASE_ANON_KEY is required for a production build.');
  else {
    const keyError = validateKey(key);
    if (keyError) errors.push(keyError);
  }

  return errors;
}

export function assertSupabaseClientEnvironment(environment: SupabaseClientEnvironment): void {
  const errors = validateSupabaseClientEnvironment(environment);
  if (errors.length > 0) {
    throw new Error(`Invalid public Supabase production configuration: ${errors.join(' ')}`);
  }
}
