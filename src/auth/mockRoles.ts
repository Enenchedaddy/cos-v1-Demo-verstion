export type PlatformRole = 'sales_marketing' | 'ceo_management';

const MOCK_ROLES_BY_USER_ID: Record<string, PlatformRole[]> = {
  'sales.user@cos.test': ['sales_marketing'],
  'ceo.user@cos.test': ['ceo_management'],
  'multi.user@cos.test': ['sales_marketing', 'ceo_management'],
  'noaccess.user@cos.test': [],
};

/**
 * Test-only legacy routing fixture. Production authorization must use
 * Supabase Auth plus public.get_my_authorization(); no application code imports this module.
 */
export async function getUserRoles(userId: string): Promise<PlatformRole[]> {
  return [...(MOCK_ROLES_BY_USER_ID[userId.trim().toLowerCase()] ?? [])];
}
