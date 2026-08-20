import type { PlatformRole } from './mockRoles';

export type PostLoginDestination =
  | { type: 'redirect'; href: string }
  | { type: 'gateway'; href: string }
  | { type: 'no-access' };

const PLATFORM_ROUTES: Record<PlatformRole, string> = {
  sales_marketing: '/app?workspace=sales',
  ceo_management: '/app?workspace=management',
};

export function getPostLoginDestination(roles: PlatformRole[]): PostLoginDestination {
  if (roles.length === 0) return { type: 'no-access' };
  if (roles.length === 1) return { type: 'redirect', href: PLATFORM_ROUTES[roles[0]] };
  return { type: 'gateway', href: '/app' };
}
