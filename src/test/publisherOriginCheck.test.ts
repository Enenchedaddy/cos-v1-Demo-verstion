import { describe, expect, it, vi } from 'vitest';
import { checkPublisherOrigin, publisherCheckTarget } from '../../scripts/checkPublisherOrigin';

const projectRef = 'abcdefghijklmnopqrst';
const origin = 'https://cos-staging.example.com';
function preflight(headers: Record<string, string> = {}) {
  return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type, X-Client-Info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', ...headers,
  } });
}

describe('non-mutating publisher origin check', () => {
  it.each([origin, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000'])('accepts explicit hosted or local origin %s', value => {
    expect(publisherCheckTarget(projectRef, value).origin).toBe(value);
  });
  it.each(['http://cos-staging.example.com', `${origin}/app`, `${origin}?token=x`, `${origin}#x`,
    'https://user:password@example.com', 'https://*.vercel.app', 'file:///app', 'not-an-origin'])('rejects unsafe/malformed origin %s', value => {
    expect(() => publisherCheckTarget(projectRef, value)).toThrow();
  });
  it('rejects malformed project references before any request', async () => {
    const request = vi.fn();
    await expect(checkPublisherOrigin('not-a-ref', origin, request)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });
  it('checks exact CORS, anonymous rejection and untrusted origins without credentials or publishing actions', async () => {
    const request = vi.fn().mockResolvedValueOnce(preflight())
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    const results = await checkPublisherOrigin(projectRef, origin, request);
    expect(results).toHaveLength(3);
    expect(results.every(result => result.passed)).toBe(true);
    expect(request.mock.calls.map(call => call[1].method)).toEqual(['OPTIONS', 'POST', 'OPTIONS']);
    for (const [url, init] of request.mock.calls) {
      expect(url).toBe(`https://${projectRef}.supabase.co/functions/v1/social-publisher`);
      expect(init.redirect).toBe('error');
      expect(init.headers.Authorization).toBeUndefined();
      expect(init.headers.apikey).toBeUndefined();
    }
    expect(request.mock.calls[1][1].body).toBe('{}');
  });
  it.each([{}, { 'Access-Control-Allow-Origin': '*' }, { 'Access-Control-Allow-Headers': 'content-type' },
    { 'Access-Control-Allow-Methods': 'GET' }])('fails closed for missing configuration or incorrect CORS %j', async headers => {
    const response = Object.keys(headers).length ? preflight(headers) : new Response(null, { status: 503 });
    const request = vi.fn().mockResolvedValue(response);
    const results = await checkPublisherOrigin(projectRef, origin, request);
    expect(results).toEqual([expect.objectContaining({ passed: false })]);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('reports anonymous access or untrusted CORS regressions as failures', async () => {
    const request = vi.fn().mockResolvedValueOnce(preflight())
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }));
    expect((await checkPublisherOrigin(projectRef, origin, request)).map(result => result.passed)).toEqual([true, false, false]);
  });
  it('does not silently pass network failures', async () => {
    await expect(checkPublisherOrigin(projectRef, origin, vi.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline');
  });
});
