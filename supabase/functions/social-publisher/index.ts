import { authenticatedClient, configuration, cors, environment, json, PublicError, serverClient, service } from '../_shared/publisher-runtime.ts';
import { jpegDimensions, numericId, sha256 } from '../_shared/instagram.ts';
import { zonedLocalToUtc } from '../_shared/publisher-rules.ts';

Deno.serve(async req => {
  let headers: Record<string, string> = {};
  try {
    const config = configuration();
    headers = cors(req, config.appOrigin);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, headers);
    if (Number(req.headers.get('Content-Length') ?? 0) > 9 * 1024 * 1024) throw new PublicError('Image is too large.', 413);
    if (req.headers.get('Content-Type')?.startsWith('multipart/form-data')) {
      const { user } = await authenticatedClient(req);
      const form = await req.formData();
      const file = form.get('file');
      if (form.get('action') !== 'upload' || !(file instanceof File) || file.type !== 'image/jpeg' || file.size > 8388608) throw new PublicError('Upload a JPEG no larger than 8 MB.');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const dimensions = jpegDimensions(bytes);
      const media = await service('media.register', { actor_id: user.id, brand_id: form.get('brand_id'), sha256: await sha256(bytes), byte_size: bytes.length, ...dimensions });
      const { error } = await serverClient().storage.from('cs-publisher').upload(media.storage_path, bytes, { contentType: 'image/jpeg', upsert: false });
      if (error) throw new PublicError('Image storage failed. No post was created.', 503);
      return json({ media_id: media.id }, 200, headers);
    }
    const input = await req.json();
    if (input.action === 'preview') {
      const actor = input.approval_token ? null : (await authenticatedClient(req)).user.id;
      const media = await service('media.preview', { actor_id: actor, approval_token: input.approval_token, version_id: input.version_id });
      if (!media.storage_path) return json({ url: null }, 200, headers);
      const { data, error } = await serverClient().storage.from('cs-publisher').createSignedUrl(media.storage_path, 600);
      if (error || !data) throw new PublicError('Image preview unavailable.', 503);
      return json({ url: data.signedUrl }, 200, headers);
    }
    const { client } = await authenticatedClient(req);
    if (input.action === 'connect') {
      const state = [...crypto.getRandomValues(new Uint8Array(32))].map(n => n.toString(16).padStart(2, '0')).join('');
      const { error } = await client.rpc('cs_publisher_command', { p_action: 'oauth.begin', p_payload: { brand_id: input.brand_id, state_hash: await sha256(state) } });
      if (error) throw new PublicError('You cannot manage social connections for this brand.', 403);
      const url = new URL('https://www.instagram.com/oauth/authorize');
      url.search = new URLSearchParams({ client_id: environment('INSTAGRAM_APP_ID'), redirect_uri: `${config.url}/functions/v1/social-publisher-callback`, response_type: 'code', scope: 'instagram_business_basic,instagram_business_content_publish', state, enable_fb_login: '0', force_authentication: '1' }).toString();
      return json({ url: url.href }, 200, headers);
    }
    if (input.action === 'schedule') {
      const planned = input.immediate === true ? new Date().toISOString() : zonedLocalToUtc(input.local_time, input.timezone);
      if (input.immediate !== true && Date.parse(planned) <= Date.now()) throw new PublicError('Choose a future publishing time.');
      const { data, error } = await client.rpc('cs_publisher_command', { p_action: 'schedule', p_payload: { account_id: input.account_id, version_id: input.version_id, request_id: input.request_id, planned_at: planned, timezone: input.timezone } });
      if (error) throw new PublicError(error.code === '23505' ? 'This account/version already has a publishing job. Check its result before reposting.' : 'Scheduling was rejected. Check scoped access, current approval, account connection, and image.');
      return json({ job_id: data }, 202, headers);
    }
    throw new PublicError('Unsupported action.');
  } catch (error) {
    return json({ error: error instanceof PublicError ? error.message : 'The publishing request could not be processed.' }, error instanceof PublicError ? error.status : 400, headers);
  }
});
