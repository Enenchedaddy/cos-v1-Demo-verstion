import { configuration, environment, PublicError, service } from '../_shared/publisher-runtime.ts';
import { numericId, sha256 } from '../_shared/instagram.ts';

Deno.serve(async req => {
  try {
    const config = configuration();
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    const url = new URL(req.url); const state = url.searchParams.get('state');
    if (!state || !/^[a-f0-9]{64}$/.test(state)) throw new PublicError('Connection state is invalid.');
    const stateHash = await sha256(state);
    await service('oauth.consume', { state_hash: stateHash });
    const code = url.searchParams.get('code');
    if (!code || url.searchParams.has('error')) throw new PublicError('Instagram connection was cancelled.');
    const redirect = `${config.url}/functions/v1/social-publisher-callback`;
    const shortResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST', body: new URLSearchParams({ client_id: environment('INSTAGRAM_APP_ID'), client_secret: environment('INSTAGRAM_APP_SECRET'), grant_type: 'authorization_code', redirect_uri: redirect, code }), signal: AbortSignal.timeout(20_000),
    });
    const short = await shortResponse.json();
    if (!shortResponse.ok || !short.access_token) throw new PublicError('Instagram did not authorize the connection.');
    const tokenUrl = new URL('https://graph.instagram.com/access_token');
    tokenUrl.search = new URLSearchParams({ grant_type: 'ig_exchange_token', client_secret: environment('INSTAGRAM_APP_SECRET'), access_token: short.access_token }).toString();
    const tokenResponse = await fetch(tokenUrl, { signal: AbortSignal.timeout(20_000) });
    const long = await tokenResponse.json();
    if (!tokenResponse.ok || !long.access_token || !Number.isFinite(long.expires_in)) throw new PublicError('Could not secure a long-lived Instagram connection.');
    const profileResponse = await fetch(`https://graph.instagram.com/${config.apiVersion}/me?fields=user_id,username`, { headers: { Authorization: `Bearer ${long.access_token}` }, signal: AbortSignal.timeout(20_000) });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.username) throw new PublicError('Instagram account details are unavailable.');
    await service('oauth.complete', { state_hash: stateHash, provider_account_id: numericId(profile.user_id ?? profile.id), username: String(profile.username), access_token: long.access_token, expires_at: new Date(Date.now() + long.expires_in * 1000).toISOString() });
    // Fixed allowlisted destination, no credentials or OAuth state in browser URLs.
    return new Response(null, { status: 303, headers: { Location: `${config.appOrigin}/app/sales-marketing`, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch {
    return new Response('Instagram connection could not be completed. Return to COS → Content & Social → Social Publisher and try connecting again.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  }
});
