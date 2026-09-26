import { supabase } from '../supabaseClient';
import type { ModuleRole, ScopeContext } from './model';
export { zonedLocalToUtc, validateCaption, validateInstagramImage, safeInstagramUrl } from '../../supabase/functions/_shared/publisher-rules';

export interface CompanyContext { id: string; workspace_id: string; name: string }
export interface BrandContext extends CompanyContext { client_id: string; timezone: string }
export interface ScopedMembership { workspace_id: string; client_id: string | null; brand_id: string | null; role: ModuleRole }
export interface CompanyDirectory {
  workspaces: Array<{ id: string; name: string }>;
  companies: CompanyContext[];
  brands: BrandContext[];
  memberships: ScopedMembership[];
}

/** Directory is supplied by the membership-filtered RPC, never a global brand list. */
export function availableBrandScopes(directory: CompanyDirectory): ScopeContext[] {
  return directory.brands.flatMap(brand => {
    const company = directory.companies.find(c => c.id === brand.client_id && c.workspace_id === brand.workspace_id);
    const workspace = directory.workspaces.find(w => w.id === brand.workspace_id);
    return company && workspace ? [{ workspaceId: workspace.id, workspaceName: workspace.name,
      clientId: company.id, clientName: company.name, brandId: brand.id, brandName: brand.name, timezone: brand.timezone }] : [];
  });
}
export interface SocialAccount {
  id: string; workspace_id: string; client_id: string; brand_id: string;
  provider: 'INSTAGRAM'; provider_account_id: string; username: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECT_REQUIRED'; token_expires_at: string | null;
}
export interface PublisherJob {
  id: string; schedule_id: string; account_id: string; content_item_id: string;
  status: 'QUEUED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED' | 'NEEDS_REVIEW';
  planned_at: string; timezone: string; attempts: number; last_error: string | null;
  external_url: string | null; external_id?: string | null; updated_at: string;
}

export function applicableRoles(memberships: ScopedMembership[], scope: Pick<ScopeContext, 'workspaceId' | 'clientId' | 'brandId'>): ModuleRole[] {
  return [...new Set(memberships.filter(m => m.workspace_id === scope.workspaceId &&
    (!m.client_id || m.client_id === scope.clientId) && (!m.brand_id || m.brand_id === scope.brandId)).map(m => m.role))];
}

export function canOnboard(memberships: ScopedMembership[], workspaceId: string, companyId?: string): boolean {
  return memberships.some(m => m.workspace_id === workspaceId && !m.brand_id &&
    (!m.client_id || m.client_id === companyId) && ['CS_MANAGER', 'MODULE_ADMIN'].includes(m.role));
}

export async function loadCompanyDirectory(): Promise<CompanyDirectory> {
  const { data, error } = await supabase.rpc('cs_company_directory');
  if (error) throw new Error(error.code === 'PGRST202' ? 'Company support has not been activated in this environment. Apply the reviewed staging migration.' : error.message);
  return data as CompanyDirectory;
}

export async function publisherCommand<T = string>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc('cs_publisher_command', { p_action: action, p_payload: payload });
  if (error) throw new Error(error.message);
  return data as T;
}

export async function invokePublisher<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('social-publisher', { body: { action, ...payload } });
  if (error) {
    const response = 'context' in error ? error.context : null;
    if (response instanceof Response) {
      const body = await response.json().catch(() => null);
      if (typeof body?.error === 'string') throw new Error(body.error);
    }
    throw new Error('The publishing service is unavailable. Check its staging deployment and configuration.');
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function loadPublisher(scope: ScopeContext): Promise<{ accounts: SocialAccount[]; jobs: PublisherJob[] }> {
  const results = await Promise.all([
    supabase.from('cs_social_accounts').select('*').eq('workspace_id', scope.workspaceId).eq('client_id', scope.clientId).eq('brand_id', scope.brandId).order('username'),
    supabase.from('cs_publisher_jobs').select('*').eq('workspace_id', scope.workspaceId).eq('client_id', scope.clientId).eq('brand_id', scope.brandId).order('created_at', { ascending: false }).limit(100),
  ]);
  for (const result of results) if (result.error) throw new Error(result.error.message);
  return { accounts: results[0].data as SocialAccount[], jobs: results[1].data as PublisherJob[] };
}
