import { describe, expect, it, vi } from 'vitest';
import { InstagramClient, jpegDimensions, numericId, ProviderError } from '../../supabase/functions/_shared/instagram';

describe('Instagram adapter', () => {
  it('creates a container and publishes only its confirmed ID', async () => {
    const request = vi.fn().mockResolvedValueOnce(Response.json({ id: '123' })).mockResolvedValueOnce(Response.json({ status_code: 'FINISHED' })).mockResolvedValueOnce(Response.json({ id: '456' })).mockResolvedValueOnce(Response.json({ permalink: 'https://www.instagram.com/p/example/' }));
    const client = new InstagramClient('synthetic-provider-test-token', 'v25.0', request);
    expect(await client.createImage('789', 'https://storage.example/image', 'Caption')).toBe('123');
    expect(await client.containerStatus('123')).toBe('FINISHED');
    expect(await client.publish('789', '123')).toBe('456');
    expect(await client.permalink('456')).toBe('https://www.instagram.com/p/example/');
    expect(String(request.mock.calls[0][0])).not.toContain('token');
    expect(request.mock.calls[2][1].body.get('creation_id')).toBe('123');
  });
  it('sanitizes provider errors and requests reconnect on token expiry', async () => {
    const client = new InstagramClient('synthetic-provider-test-token', 'v25.0', vi.fn().mockResolvedValue(Response.json({ error: { code: 190, message: 'private provider diagnostic' } }, { status: 401 })));
    await expect(client.containerStatus('123')).rejects.toMatchObject({ reconnect: true, retryable: false });
    await expect(client.containerStatus('123')).rejects.not.toThrow(/private provider diagnostic/);
  });
  it('marks rate limits as retryable', async () => {
    const client = new InstagramClient('synthetic-provider-test-token', 'v25.0', vi.fn().mockResolvedValue(Response.json({ error: { code: 4 } }, { status: 429 })));
    await expect(client.containerStatus('123')).rejects.toMatchObject({ retryable: true });
  });
  it('requires a pinned API version and numeric IDs', () => { expect(() => new InstagramClient('', 'latest')).toThrow(); expect(() => numericId('../tokens')).toThrow(); });
  it('does not trust MIME claims for uploaded bytes', () => expect(() => jpegDimensions(new TextEncoder().encode('<script>alert(1)</script>'))).toThrow(/JPEG/));
  it('extracts JPEG dimensions from a SOF segment', () => {
    const bytes = new Uint8Array([255, 216, 255, 192, 0, 17, 8, 4, 56, 4, 56, 3, 1, 17, 0, 2, 17, 0, 3, 17, 0, 255, 217]);
    expect(jpegDimensions(bytes)).toEqual({ width: 1080, height: 1080 });
  });
  it('fails closed for an invalid provider permalink', async () => {
    const client = new InstagramClient('synthetic-provider-test-token', 'v25.0', vi.fn().mockResolvedValue(Response.json({ permalink: 'https://attacker.test/' })));
    await expect(client.permalink('123')).rejects.toThrow(/verified permalink/);
  });
});
