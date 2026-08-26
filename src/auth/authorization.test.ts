import { describe, expect, it } from 'vitest';
import { hasPermission, normalizeLegacyWorkspace, resolveAllowedWorkspaces, toAuthorizationSnapshot } from './authorization';

const rolePermissions = {
  CEO: ['workspace.view', 'dashboard.view', 'management.view', 'sales.view', 'sales.create', 'sales.update', 'marketing.view', 'marketing.create', 'marketing.update', 'system.view'],
  MANAGEMENT: ['workspace.view', 'management.view', 'sales.view', 'marketing.view'],
  SALES: ['workspace.view', 'sales.view', 'sales.create', 'sales.update'],
  MARKETING: ['workspace.view', 'marketing.view', 'marketing.create', 'marketing.update'],
  SOFTWARE_ENGINEER: ['workspace.view', 'system.view'],
} as const;

describe('global authorization utilities', () => {
  it('resolves CEO and Management into their approved workspaces', () => {
    expect(resolveAllowedWorkspaces(rolePermissions.CEO)).toEqual(['sales-marketing', 'management']);
    expect(resolveAllowedWorkspaces(rolePermissions.MANAGEMENT)).toEqual(['sales-marketing', 'management']);
  });

  it('keeps Sales and Marketing in the single combined workspace', () => {
    expect(resolveAllowedWorkspaces(rolePermissions.SALES)).toEqual(['sales-marketing']);
    expect(resolveAllowedWorkspaces(rolePermissions.MARKETING)).toEqual(['sales-marketing']);
  });

  it('does not grant SOFTWARE_ENGINEER a business workspace', () => {
    expect(resolveAllowedWorkspaces(rolePermissions.SOFTWARE_ENGINEER)).toEqual([]);
  });

  it('requires workspace.view in addition to a module view permission', () => {
    expect(resolveAllowedWorkspaces(['sales.view'])).toEqual([]);
  });

  it('normalizes legacy query workspace names without treating them as grants', () => {
    expect(normalizeLegacyWorkspace('sales')).toBe('sales-marketing');
    expect(normalizeLegacyWorkspace('marketing')).toBe('sales-marketing');
    expect(normalizeLegacyWorkspace('management')).toBe('management');
    expect(normalizeLegacyWorkspace('unknown')).toBeNull();
  });

  it('checks capabilities by permission key rather than role name', () => {
    expect(hasPermission(rolePermissions.SALES, 'sales.create')).toBe(true);
    expect(hasPermission(rolePermissions.SALES, 'management.view')).toBe(false);
  });

  it('accepts only a caller-matching RPC snapshot', () => {
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', job_title: null, department: 'Marketing',
      role_code: 'MARKETING', role_name: 'Marketing', permissions: ['workspace.view', 'marketing.view'],
    }, 'user-1')).toMatchObject({ role: { code: 'MARKETING' }, permissions: ['workspace.view', 'marketing.view'] });
    expect(toAuthorizationSnapshot({
      user_id: 'another-user', first_name: 'Aisha', last_name: 'Bello', role_code: 'MARKETING', role_name: 'Marketing', permissions: [],
    }, 'user-1')).toBeNull();
  });

  it('fails closed on malformed permissions or unapproved role codes', () => {
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', role_code: 'ADMIN', role_name: 'Admin', permissions: [],
    }, 'user-1')).toBeNull();
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', role_code: 'SALES', role_name: 'Sales', permissions: ['sales.view', 42],
    }, 'user-1')).toBeNull();
  });
});
