export type WorkspaceId = 'sales-marketing' | 'management';

export interface AuthorizationProfile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: string | null;
}

export interface AuthorizationRole {
  code: 'CEO' | 'MANAGEMENT' | 'SALES' | 'MARKETING' | 'SOFTWARE_ENGINEER';
  name: string;
}

export interface AuthorizationSnapshot {
  profile: AuthorizationProfile;
  role: AuthorizationRole;
  permissions: readonly string[];
}

export interface AuthorizationRpcRow {
  user_id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  department: string | null;
  role_code: string;
  role_name: string;
  permissions: unknown;
}

const ROLE_CODES = new Set<AuthorizationRole['code']>([
  'CEO', 'MANAGEMENT', 'SALES', 'MARKETING', 'SOFTWARE_ENGINEER',
]);

export const WORKSPACE_PATHS: Record<WorkspaceId, string> = {
  'sales-marketing': '/app/sales-marketing',
  management: '/app/management',
};

export function normalizeLegacyWorkspace(value: string | null): WorkspaceId | null {
  if (value === 'sales' || value === 'marketing' || value === 'sales-marketing') return 'sales-marketing';
  if (value === 'management') return 'management';
  return null;
}

export function toAuthorizationSnapshot(row: unknown, expectedUserId: string): AuthorizationSnapshot | null {
  if (!row || typeof row !== 'object') return null;
  const value = row as Partial<AuthorizationRpcRow>;
  if (
    value.user_id !== expectedUserId ||
    typeof value.first_name !== 'string' ||
    typeof value.last_name !== 'string' ||
    typeof value.role_name !== 'string' ||
    typeof value.role_code !== 'string' ||
    !ROLE_CODES.has(value.role_code as AuthorizationRole['code']) ||
    !Array.isArray(value.permissions) ||
    !value.permissions.every((permission) => typeof permission === 'string')
  ) return null;

  return {
    profile: {
      id: value.user_id,
      firstName: value.first_name,
      lastName: value.last_name,
      jobTitle: value.job_title ?? null,
      department: value.department ?? null,
    },
    role: { code: value.role_code as AuthorizationRole['code'], name: value.role_name },
    permissions: [...new Set(value.permissions)],
  };
}

export function hasPermission(permissions: readonly string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function resolveAllowedWorkspaces(permissions: readonly string[]): WorkspaceId[] {
  if (!hasPermission(permissions, 'workspace.view')) return [];
  const workspaces: WorkspaceId[] = [];
  if (hasPermission(permissions, 'sales.view') || hasPermission(permissions, 'marketing.view')) {
    workspaces.push('sales-marketing');
  }
  if (hasPermission(permissions, 'management.view')) workspaces.push('management');
  return workspaces;
}
