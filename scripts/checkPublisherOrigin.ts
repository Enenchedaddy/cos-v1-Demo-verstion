import { pathToFileURL } from 'node:url';

const requestedHeaders = ['authorization', 'apikey', 'content-type', 'x-client-info'];

export function publisherCheckTarget(projectRef: string, appOrigin: string) {
  if (!/^[a-z]{20}$/.test(projectRef)) throw new Error('Provide the confirmed 20-letter Supabase staging project reference.');
  const url = new URL(appOrigin);
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !localHttp) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || url.hostname.includes('*')) {
    throw new Error('Use an exact HTTPS application origin (HTTP is allowed only for local development), without credentials, paths, queries or wildcards.');
  }
  return { endpoint: `https://${projectRef}.supabase.co/functions/v1/social-publisher`, origin: url.origin };
}

/** No credentials, OAuth state, database writes or worker calls. Never prints response bodies. */
export async function checkPublisherOrigin(projectRef: string, appOrigin: string, request: typeof fetch = fetch) {
  const { endpoint, origin } = publisherCheckTarget(projectRef, appOrigin);
  const send = (init: RequestInit) => request(endpoint, { ...init, redirect: 'error', signal: AbortSignal.timeout(15_000) });
  const preflight = await send({ method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': requestedHeaders.join(', '),
  } });
  const allowedHeaders = (preflight.headers.get('access-control-allow-headers') ?? '').toLowerCase().split(',').map(value => value.trim());
  const allowedMethods = (preflight.headers.get('access-control-allow-methods') ?? '').toUpperCase().split(',').map(value => value.trim());
  const originAccepted = preflight.status === 204 && preflight.headers.get('access-control-allow-origin') === origin &&
    allowedMethods.includes('POST') && requestedHeaders.every(header => allowedHeaders.includes(header));
  const results = [{ name: 'Exact application origin and browser preflight', passed: originAccepted, status: preflight.status }];
  if (!originAccepted) return results;

  // An empty object cannot name a publishing action, even if authentication regresses.
  const anonymous = await send({ method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
  results.push({ name: 'Unauthenticated request rejected', passed: anonymous.status === 401, status: anonymous.status });

  const untrustedOrigin = origin === 'https://publisher-origin-check.invalid'
    ? 'https://other-publisher-origin-check.invalid' : 'https://publisher-origin-check.invalid';
  const untrusted = await send({ method: 'OPTIONS', headers: {
    Origin: untrustedOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': requestedHeaders.join(', '),
  } });
  results.push({ name: 'Untrusted origin rejected', passed: untrusted.status === 403 &&
    !untrusted.headers.has('access-control-allow-origin'), status: untrusted.status });
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--project-ref' || args[2] !== '--origin') {
    throw new Error('Usage: npm run check:publisher-origin -- --project-ref <staging-ref> --origin <https://staging-host>');
  }
  const results = await checkPublisherOrigin(args[1], args[3]);
  for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name} (HTTP ${result.status})`);
  console.log('This checks configuration boundaries only, not hosted page loading, Meta credentials, account connection or publishing.');
  if (results.some(result => !result.passed)) {
    console.error('Review staging COS_PUBLISHER_APP_ORIGIN, project guard and enabled setting; do not relax origin or authentication checks.');
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    // Do not echo arbitrary URLs, response bodies or environment values on failures.
    console.error('Publisher check could not finish. Check arguments, staging origin, network and function availability. No credentials are required.');
    process.exitCode = 1;
  });
}
