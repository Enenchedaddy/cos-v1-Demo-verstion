import { configuration, environment, json, serverClient, service } from '../_shared/publisher-runtime.ts';
import { InstagramClient, jpegDimensions, ProviderError, sha256 } from '../_shared/instagram.ts';
import { validateCaption } from '../_shared/publisher-rules.ts';

Deno.serve(async req => {
  let job: any = null;
  let dispatched = false;
  let externalId: string | undefined;
  try {
    const config = configuration();
    if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    const provided = req.headers.get('x-cos-worker-token');
    // Hash before comparison: never accept a user bearer token as worker authority.
    if (!provided || await sha256(provided) !== await sha256(environment('COS_PUBLISHER_WORKER_TOKEN'))) return json({ error: 'Unauthorized.' }, 401);
    job = await service('job.claim');
    if (!job) return json({ processed: 0 });
    const context = { job_id: job.job_id, lease_id: job.lease_id };
    if (Date.parse(job.expires_at) < Date.now() + 2 * 86400_000) {
      const refreshUrl = new URL('https://graph.instagram.com/refresh_access_token');
      refreshUrl.search = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: job.access_token }).toString();
      const response = await fetch(refreshUrl, { signal: AbortSignal.timeout(15_000) });
      const token = await response.json();
      if (!response.ok || !token.access_token || !Number.isFinite(token.expires_in)) throw new ProviderError(false, true, 'refresh');
      await service('account.refresh', { ...context, access_token: token.access_token, expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString() });
      job.access_token = token.access_token;
    }
    const provider = new InstagramClient(job.access_token, config.apiVersion);
    if (!job.container_id) {
      const { data: bytes, error: readError } = await serverClient().storage.from('cs-publisher').download(job.media.storage_path);
      if (readError || !bytes) throw new Error('Stored image unavailable.');
      const image = new Uint8Array(await bytes.arrayBuffer()); jpegDimensions(image);
      if (await sha256(image) !== job.media.sha256) throw new Error('Stored image changed.');
      const { data: signed, error } = await serverClient().storage.from('cs-publisher').createSignedUrl(job.media.storage_path, 3600);
      if (error || !signed) throw new Error('Image access could not be prepared.');
      job.container_id = await provider.createImage(job.provider_account_id, signed.signedUrl, validateCaption(job.caption));
      await service('job.container', { ...context, container_id: job.container_id });
    }
    const status = await provider.containerStatus(job.container_id);
    if (status === 'IN_PROGRESS') {
      await service('job.result', { ...context, status: 'QUEUED', message: 'Instagram is processing the image.' });
      return json({ processed: 1, pending: true });
    }
    if (status !== 'FINISHED') throw new ProviderError(false, false, `container-${status}`);
    await service('job.authorize', context);
    dispatched = true;
    externalId = await provider.publish(job.provider_account_id, job.container_id);
    const permalink = await provider.permalink(externalId);
    await service('job.result', { ...context, status: 'PUBLISHED', external_id: externalId, external_url: permalink, message: null });
    return json({ processed: 1, published: true });
  } catch (error) {
    if (job) {
      const retryable = error instanceof ProviderError ? error.retryable : error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name);
      const message = dispatched ? 'Instagram may have received this post. Verify the provider result before any repost.' : error instanceof ProviderError ? error.message : 'Publishing could not complete. Review the connection, approval, and image.';
      await service('job.result', { job_id: job.job_id, lease_id: job.lease_id, status: dispatched ? 'NEEDS_REVIEW' : retryable ? 'QUEUED' : 'FAILED', message, reconnect: error instanceof ProviderError && error.reconnect, external_id: externalId }).catch(() => undefined);
    }
    return json({ error: 'Worker did not complete delivery. Check job status.' }, 503);
  }
});
