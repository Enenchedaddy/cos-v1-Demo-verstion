import { describe, expect, it } from 'vitest';
import { hasPermission, normalizeLegacyWorkspace, toAuthorizationSnapshot } from './authorization';

const serverIssuedWorkspaceMatrix = {
  CEO: ['sales-marketing', 'management'],
  MANAGEMENT: ['sales-marketing', 'management'],
  SALES: ['sales-marketing'],
  MARKETING: ['sales-marketing'],
  SOFTWARE_ENGINEER: ['sales-marketing', 'management'],
} as const;

describe('global authorization utilities', () => {
  it('accepts the complete server-issued workspace visibility matrix', () => {
    for (const [roleCode, allowedWorkspaces] of Object.entries(serverIssuedWorkspaceMatrix)) {
      expect(toAuthorizationSnapshot({
        user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', job_title: null, department: 'Operations',
        role_code: roleCode, role_name: roleCode, permissions: ['workspace.view'], allowed_workspaces: allowedWorkspaces,
      }, 'user-1')).toMatchObject({ role: { code: roleCode }, allowedWorkspaces });
    }
  });

  it('normalizes legacy query workspace names without treating them as grants', () => {
    expect(normalizeLegacyWorkspace('sales')).toBe('sales-marketing');
    expect(normalizeLegacyWorkspace('marketing')).toBe('sales-marketing');
    expect(normalizeLegacyWorkspace('management')).toBe('management');
    expect(normalizeLegacyWorkspace('unknown')).toBeNull();
  });

  it('checks capabilities by permission key rather than role name', () => {
    expect(hasPermission(['sales.view', 'sales.create'], 'sales.create')).toBe(true);
    expect(hasPermission(['sales.view', 'sales.create'], 'management.view')).toBe(false);
  });

  it('accepts only a caller-matching RPC snapshot', () => {
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', job_title: null, department: 'Marketing',
      role_code: 'MARKETING', role_name: 'Marketing', permissions: ['workspace.view', 'marketing.view'], allowed_workspaces: ['sales-marketing'],
    }, 'user-1')).toMatchObject({ role: { code: 'MARKETING' }, permissions: ['workspace.view', 'marketing.view'], allowedWorkspaces: ['sales-marketing'] });
    expect(toAuthorizationSnapshot({
      user_id: 'another-user', first_name: 'Aisha', last_name: 'Bello', role_code: 'MARKETING', role_name: 'Marketing', permissions: [], allowed_workspaces: ['sales-marketing'],
    }, 'user-1')).toBeNull();
  });

  it('fails closed on malformed permissions or unapproved role codes', () => {
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', role_code: 'ADMIN', role_name: 'Admin', permissions: [], allowed_workspaces: [],
    }, 'user-1')).toBeNull();
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', role_code: 'SALES', role_name: 'Sales', permissions: ['sales.view', 42], allowed_workspaces: ['sales-marketing'],
    }, 'user-1')).toBeNull();
    expect(toAuthorizationSnapshot({
      user_id: 'user-1', first_name: 'Aisha', last_name: 'Bello', role_code: 'SALES', role_name: 'Sales', permissions: ['sales.view'], allowed_workspaces: ['management', 'unknown'],
    }, 'user-1')).toBeNull();
  });
});
