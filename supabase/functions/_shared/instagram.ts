import { safeInstagramUrl, validateInstagramImage } from './publisher-rules.ts';

export class ProviderError extends Error {
  constructor(public readonly retryable: boolean, public readonly reconnect: boolean, code: string) {
    super(`Instagram request failed (${code}).${reconnect ? ' Reconnect the account.' : retryable ? ' A safe retry will be attempted.' : ' Review the account or post configuration.'}`);
  }
}

export class InstagramClient {
  constructor(private token: string, private version: string, private request: typeof fetch = fetch) {
    if (!/^v\d+\.\d+$/.test(version)) throw new Error('An explicit supported Meta API version is required.');
  }
  async call(path: string, body?: Record<string, string>): Promise<Record<string, any>> {
    const url = new URL(`https://graph.instagram.com/${this.version}/${path}`);
    const response = await this.request(url, {
      method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${this.token}` },
      body: body ? new URLSearchParams(body) : undefined, signal: AbortSignal.timeout(20_000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const code = Number(data.error?.code ?? response.status);
      throw new ProviderError(response.status === 429 || response.status >= 500 || data.error?.is_transient === true, code === 190 || response.status === 401, String(code));
    }
    return data;
  }
  async createImage(accountId: string, imageUrl: string, caption: string): Promise<string> {
    const data = await this.call(`${accountId}/media`, { image_url: imageUrl, caption });
    return numericId(data.id);
  }
  async containerStatus(id: string): Promise<string> {
    const data = await this.call(`${numericId(id)}?fields=status_code`);
    return String(data.status_code ?? 'UNKNOWN');
  }
  async publish(accountId: string, containerId: string): Promise<string> {
    const data = await this.call(`${numericId(accountId)}/media_publish`, { creation_id: numericId(containerId) });
    return numericId(data.id);
  }
  async permalink(id: string): Promise<string> {
    const data = await this.call(`${numericId(id)}?fields=permalink`);
    const url = safeInstagramUrl(data.permalink);
    if (!url) throw new Error('Instagram did not return a verified permalink.');
    return url;
  }
}

export function numericId(value: unknown): string {
  const id = String(value ?? '');
  if (!/^\d+$/.test(id)) throw new Error('Invalid Instagram object identifier.');
  return id;
}

/** Parse JPEG SOF markers server-side; do not trust browser MIME or dimensions. */
export function jpegDimensions(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('The file is not a valid JPEG image.');
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error('Invalid JPEG marker.');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    const length = bytes[offset] * 256 + bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) throw new Error('Invalid JPEG segment.');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      const height = bytes[offset + 3] * 256 + bytes[offset + 4];
      const width = bytes[offset + 5] * 256 + bytes[offset + 6];
      validateInstagramImage('image/jpeg', bytes.length, width, height);
      return { width, height };
    }
    offset += length;
  }
  throw new Error('Unsupported or incomplete JPEG image.');
}

export async function sha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const hash = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
