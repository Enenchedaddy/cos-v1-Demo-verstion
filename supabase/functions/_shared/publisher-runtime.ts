import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

export class PublicError extends Error { constructor(message: string, public status = 400) { super(message); } }

export function environment(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new PublicError('Publishing is not configured for this environment.', 503);
  return value;
}

export function configuration() {
  const url = environment('SUPABASE_URL');
  const expected = environment('COS_PUBLISHER_EXPECTED_PROJECT_REF');
  if (new URL(url).hostname !== `${expected}.supabase.co` || environment('COS_PUBLISHER_ENABLED') !== 'true') {
    throw new PublicError('Publishing is disabled for this environment.', 503);
  }
  return { url, appOrigin: new URL(environment('COS_PUBLISHER_APP_ORIGIN')).origin, apiVersion: environment('INSTAGRAM_API_VERSION') };
}

export function serverClient() {
  return createClient(environment('SUPABASE_URL'), environment('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authenticatedClient(req: Request) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) throw new PublicError('Sign in to COS first.', 401);
  const client = createClient(environment('SUPABASE_URL'), environment('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new PublicError('Your COS session is invalid or expired.', 401);
  return { client, user: data.user };
}

export async function service(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await serverClient().rpc('cs_publisher_service', { p_action: action, p_payload: payload });
  // Do not serialize database/provider errors: a credential operation can contain secrets.
  if (error) throw new PublicError('The publishing operation was rejected. Check access, connection state, and job status.', 409);
  return data;
}

export function cors(req: Request, appOrigin: string) {
  const origin = req.headers.get('Origin');
  if (origin && origin !== appOrigin) throw new PublicError('Origin is not allowed.', 403);
  return { 'Access-Control-Allow-Origin': appOrigin, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
