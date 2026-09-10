import { describe, expect, it } from 'vitest';
import { validateSupabaseClientEnvironment } from './supabaseEnvironment';

const validUrl = 'https://example-project.supabase.co';

function legacyJwt(role: string): string {
  const payload = globalThis.btoa(JSON.stringify({ role })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${payload}.signature`;
}

describe('validateSupabaseClientEnvironment', () => {
  it('accepts a browser-safe publishable key', () => {
    expect(validateSupabaseClientEnvironment({
      VITE_SUPABASE_URL: validUrl,
      VITE_SUPABASE_ANON_KEY: 'sb_publishable_test-key',
    })).toEqual([]);
  });

  it('accepts a legacy anon key during the migration period', () => {
    expect(validateSupabaseClientEnvironment({
      VITE_SUPABASE_URL: validUrl,
      VITE_SUPABASE_ANON_KEY: legacyJwt('anon'),
    })).toEqual([]);
  });

  it('rejects missing client configuration', () => {
    expect(validateSupabaseClientEnvironment({})).toEqual([
      'VITE_SUPABASE_URL is required for a production build.',
      'VITE_SUPABASE_ANON_KEY is required for a production build.',
    ]);
  });

  it('rejects placeholder configuration', () => {
    expect(validateSupabaseClientEnvironment({
      VITE_SUPABASE_URL: 'https://your-project-ref.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-publishable-or-legacy-anon-key',
    })).toEqual([
      'VITE_SUPABASE_URL must not contain a placeholder value.',
      'VITE_SUPABASE_ANON_KEY must not contain a placeholder value.',
    ]);
  });

  it('rejects modern secret keys and legacy service-role keys', () => {
    expect(validateSupabaseClientEnvironment({
      VITE_SUPABASE_URL: validUrl,
      VITE_SUPABASE_ANON_KEY: 'sb_secret_test-key',
    })).toContain('VITE_SUPABASE_ANON_KEY must be a browser-safe publishable key, never a secret key.');

    expect(validateSupabaseClientEnvironment({
      VITE_SUPABASE_URL: validUrl,
      VITE_SUPABASE_ANON_KEY: legacyJwt('service_role'),
    })).toContain('VITE_SUPABASE_ANON_KEY must be a legacy anon key, never a service-role key.');
  });
});
