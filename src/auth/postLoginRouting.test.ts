import { describe, expect, it } from 'vitest';
import { getUserRoles } from './mockRoles';
import { getPostLoginDestination } from './postLoginRouting';

describe('post-login platform routing', () => {
  it('routes a Sales & Marketing-only user directly to that platform', async () => {
    const roles = await getUserRoles('sales.user@cos.test');
    expect(getPostLoginDestination(roles)).toEqual({ type: 'redirect', href: '/app?workspace=sales' });
  });

  it('routes a CEO & Management-only user directly to that platform', async () => {
    const roles = await getUserRoles('ceo.user@cos.test');
    expect(getPostLoginDestination(roles)).toEqual({ type: 'redirect', href: '/app?workspace=management' });
  });

  it('sends a multi-role user to the Identity Gateway', async () => {
    const roles = await getUserRoles('multi.user@cos.test');
    expect(getPostLoginDestination(roles)).toEqual({ type: 'gateway', href: '/app' });
  });

  it('returns no access when the user has no assigned roles', async () => {
    const roles = await getUserRoles('noaccess.user@cos.test');
    expect(getPostLoginDestination(roles)).toEqual({ type: 'no-access' });
  });
});
