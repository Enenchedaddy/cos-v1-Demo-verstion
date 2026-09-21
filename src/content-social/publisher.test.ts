import { describe, expect, it } from 'vitest';
import { applicableRoles, canOnboard, safeInstagramUrl, validateCaption, validateInstagramImage, zonedLocalToUtc } from './publisher';
import { can } from './domain';

describe('publisher timezone interpretation', () => {
  it('converts Lagos local time independently of browser timezone', () => expect(zonedLocalToUtc('2026-09-21T15:00', 'Africa/Lagos')).toBe('2026-09-21T14:00:00.000Z'));
  it('uses London summer time', () => expect(zonedLocalToUtc('2026-09-21T15:00', 'Europe/London')).toBe('2026-09-21T14:00:00.000Z'));
  it('uses London winter time', () => expect(zonedLocalToUtc('2026-12-21T15:00', 'Europe/London')).toBe('2026-12-21T15:00:00.000Z'));
  it('rejects a nonexistent DST time', () => expect(() => zonedLocalToUtc('2026-03-29T01:30', 'Europe/London')).toThrow(/does not exist/));
  it('rejects a repeated DST time', () => expect(() => zonedLocalToUtc('2026-10-25T01:30', 'Europe/London')).toThrow(/twice/));
  it('supports quarter-hour offsets', () => expect(zonedLocalToUtc('2026-09-21T15:00', 'Asia/Kathmandu')).toBe('2026-09-21T09:15:00.000Z'));
  it.each(['2026-02-31T15:00', '2026-09-21T25:00', 'not-a-date'])('rejects invalid time %s', value => expect(() => zonedLocalToUtc(value, 'UTC')).toThrow());
  it('rejects invalid timezone', () => expect(() => zonedLocalToUtc('2026-09-21T15:00', 'Fake/Zone')).toThrow());
});

describe('existing scoped memberships', () => {
  const scope = { workspaceId: 'workspace', clientId: 'company', brandId: 'brand' };
  const memberships = [
    { workspace_id: 'workspace', client_id: 'company', brand_id: 'brand', role: 'CONTRIBUTOR' as const },
    { workspace_id: 'workspace', client_id: 'company', brand_id: null, role: 'SOCIAL_COMMUNITY' as const },
    { workspace_id: 'workspace', client_id: 'another', brand_id: null, role: 'CS_MANAGER' as const },
  ];
  it('combines applicable roles without borrowing another company authority', () => expect(applicableRoles(memberships, scope)).toEqual(['CONTRIBUTOR', 'SOCIAL_COMMUNITY']));
  it('uses all applicable capabilities', () => expect(can(applicableRoles(memberships, scope), 'publish.confirm')).toBe(true));
  it('does not grant connection authority through company visibility', () => expect(can(applicableRoles(memberships, scope), 'connection.manage')).toBe(false));
  it('cannot create companies from brand or company membership', () => expect(canOnboard(memberships, 'workspace')).toBe(false));
  it('allows brand onboarding only under the correct managed company', () => { expect(canOnboard(memberships, 'workspace', 'another')).toBe(true); expect(canOnboard(memberships, 'workspace', 'company')).toBe(false); });
  it('allows a workspace module administrator to onboard', () => expect(canOnboard([{ workspace_id: 'workspace', client_id: null, brand_id: null, role: 'MODULE_ADMIN' }], 'workspace')).toBe(true));
});

describe('Instagram v1 validation', () => {
  it('accepts JPEG images and trimmed captions', () => { expect(() => validateInstagramImage('image/jpeg', 100_000, 1080, 1350)).not.toThrow(); expect(validateCaption(' hello ')).toBe('hello'); });
  it.each([
    ['image/png', 10, 1080, 1080], ['image/jpeg', 9 * 1024 * 1024, 1080, 1080],
    ['image/jpeg', 100, 300, 300], ['image/jpeg', 100, 1080, 2000],
  ])('rejects unsupported image %s/%s/%s/%s', (type, size, width, height) => expect(() => validateInstagramImage(type as string, size as number, width as number, height as number)).toThrow());
  it('rejects blank, overlong, and hashtag-heavy captions', () => { for (const value of ['', 'x'.repeat(2201), '#one '.repeat(31)]) expect(() => validateCaption(value)).toThrow(); });
  it('only accepts actual Instagram HTTPS result links', () => { expect(safeInstagramUrl('https://www.instagram.com/p/abc/')).toBeTruthy(); for (const value of ['javascript:alert(1)', 'https://instagram.com.attacker.test/post', 'http://instagram.com/post']) expect(safeInstagramUrl(value)).toBeNull(); });
});
