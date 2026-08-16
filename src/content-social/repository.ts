import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import type { ContentSocialSession, ContentSocialState, ModuleRole, ScopeContext } from './model';
import { createSeedState, DEMO_SESSION } from './seed';

export type ContentSocialCollection = keyof ContentSocialState;

export interface RepositoryLoadResult {
  state: ContentSocialState;
  session: ContentSocialSession;
  mode: 'supabase' | 'demo';
  warning?: string;
}

const TABLES: Record<ContentSocialCollection, string> = {
  ideas: 'cs_ideas',
  briefs: 'cs_briefs',
  contentItems: 'cs_content_items',
  variants: 'cs_platform_variants',
  versions: 'cs_content_versions',
  approvals: 'cs_approval_requests',
  schedules: 'cs_schedules',
  publishRecords: 'cs_publish_records',
  assets: 'cs_assets',
  communityRecords: 'cs_community_records',
  listeningSignals: 'cs_listening_signals',
  metrics: 'cs_metric_observations',
  notifications: 'cs_notifications',
  auditEvents: 'cs_audit_events',
};

const COLLECTIONS = Object.keys(TABLES) as ContentSocialCollection[];
const APPROVAL_SELECT = 'id,workspace_id,client_id,brand_id,approval_number,content_item_id,title,route_name,step_name,status,targets,requested_by,requested_at,due_at,client_visible,secure_token_expires_at,decisions,created_at,created_by,updated_at,updated_by,revision,archived_at,deleted_at,deleted_by,deletion_reason,purge_after';
const STORAGE_VERSION = 2;

class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: 'RESTRICTED' | 'UNAVAILABLE' | 'PERSISTENCE',
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function transformKeys(value: unknown, transform: (key: string) => string): any {
  if (Array.isArray(value)) return value.map((item) => transformKeys(item, transform));
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [transform(key), transformKeys(nested, transform)]),
  );
}

const toDatabase = (value: unknown) => transformKeys(value, toSnakeKey);
const fromDatabase = (value: unknown) => transformKeys(value, toCamelKey);

function storageKey(scope: ScopeContext): string {
  return `cos-content-social:${STORAGE_VERSION}:${scope.workspaceId}:${scope.clientId}:${scope.brandId}`;
}

function loadLocal(scope: ScopeContext): ContentSocialState {
  try {
    const raw = localStorage.getItem(storageKey(scope));
    if (raw) return JSON.parse(raw) as ContentSocialState;
  } catch {
    // Privacy-restricted browsers can block localStorage; the seed remains usable in memory.
  }
  return createSeedState();
}

function saveLocal(scope: ScopeContext, state: ContentSocialState): void {
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify(state));
  } catch (error) {
    throw new RepositoryError(error instanceof Error ? error.message : 'Local persistence failed.', 'PERSISTENCE');
  }
}

function isModuleRole(value: unknown): value is ModuleRole {
  return ['CS_MANAGER', 'PLANNER', 'CONTRIBUTOR', 'SOCIAL_COMMUNITY', 'PERFORMANCE_ANALYST', 'ACCOUNT_BRAND', 'EXECUTIVE_VIEWER', 'MODULE_ADMIN', 'CLIENT_APPROVER'].includes(String(value));
}

async function resolveSession(client: SupabaseClient, user: User, scope: ScopeContext): Promise<ContentSocialSession> {
  const { data, error } = await client
    .from('cs_memberships')
    .select('role, display_name')
    .eq('user_id', user.id)
    .eq('workspace_id', scope.workspaceId)
    .or(`client_id.is.null,client_id.eq.${scope.clientId}`)
    .or(`brand_id.is.null,brand_id.eq.${scope.brandId}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || !isModuleRole(data.role)) {
    throw new RepositoryError('Your account has no Content & Social membership for this entity scope.', 'RESTRICTED');
  }
  return {
    userId: user.id,
    displayName: data.display_name || user.email || 'COS user',
    role: data.role,
    mode: 'supabase',
  };
}

async function loadSupabase(client: SupabaseClient, scope: ScopeContext, user: User): Promise<RepositoryLoadResult> {
  const session = await resolveSession(client, user, scope);
  const results = await Promise.all(
    COLLECTIONS.map(async (collection) => {
      const table = TABLES[collection];
      let query = client
        .from(table)
        .select(collection === 'approvals' ? APPROVAL_SELECT : '*')
        .eq('workspace_id', scope.workspaceId)
        .eq('client_id', scope.clientId)
        .eq('brand_id', scope.brandId);
      if (collection === 'auditEvents') query = query.order('occurred_at', { ascending: false }).limit(250);
      const { data, error } = await query;
      if (error) throw error;
      return [collection, fromDatabase(data ?? [])] as const;
    }),
  );
  const state = Object.fromEntries(results) as ContentSocialState;
  return { state, session, mode: 'supabase' };
}

export class ContentSocialRepository {
  private mode: 'supabase' | 'demo' = 'demo';

  constructor(
    private readonly scope: ScopeContext,
    private readonly client: SupabaseClient = supabase,
  ) {}

  async signIn(email: string, password: string): Promise<void> {
    if (!isSupabaseConfigured) throw new RepositoryError('Supabase authentication is not configured.', 'UNAVAILABLE');
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new RepositoryError(error.message, 'RESTRICTED');
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw new RepositoryError(error.message, 'UNAVAILABLE');
    this.mode = 'demo';
  }

  async issueApprovalToken(approvalId: string): Promise<string> {
    if (this.mode !== 'supabase') {
      throw new RepositoryError('Secure client links require an authenticated Supabase session.', 'RESTRICTED');
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.client.rpc('cs_issue_approval_token', { p_approval_id: approvalId, p_expires_at: expiresAt });
    if (error) throw new RepositoryError(error.message, 'PERSISTENCE');
    return String(data);
  }

  async load(): Promise<RepositoryLoadResult> {
    const metaEnv = (import.meta as any).env ?? {};
    const allowDemo = Boolean(metaEnv.DEV) || metaEnv.VITE_COS_ALLOW_DEMO === 'true';

    if (!isSupabaseConfigured) {
      this.mode = 'demo';
      return { state: loadLocal(this.scope), session: DEMO_SESSION, mode: 'demo', warning: 'Supabase is not configured. Changes are stored in this browser only.' };
    }

    try {
      const { data, error } = await this.client.auth.getUser();
      if (error) throw error;
      if (!data.user) {
        if (!allowDemo) throw new RepositoryError('Sign in to access Content & Social.', 'RESTRICTED');
        this.mode = 'demo';
        return { state: loadLocal(this.scope), session: DEMO_SESSION, mode: 'demo', warning: 'Development demo mode: sign in to use tenant-secured Supabase records.' };
      }
      const result = await loadSupabase(this.client, this.scope, data.user);
      this.mode = 'supabase';
      return result;
    } catch (error) {
      if (error instanceof RepositoryError && error.code === 'RESTRICTED') throw error;
      if (!allowDemo) throw new RepositoryError('The governed Content & Social data service is unavailable.', 'UNAVAILABLE');
      this.mode = 'demo';
      return {
        state: loadLocal(this.scope),
        session: DEMO_SESSION,
        mode: 'demo',
        warning: 'The Supabase service is unavailable or not migrated. Development changes are stored in this browser only.',
      };
    }
  }

  async persist(state: ContentSocialState, changed: ContentSocialCollection[]): Promise<void> {
    if (this.mode === 'demo') {
      saveLocal(this.scope, state);
      return;
    }

    for (const collection of changed) {
      const records = state[collection] as unknown[];
      if (records.length === 0) continue;
      const payload = records.map(toDatabase);
      const { error } = collection === 'auditEvents' || collection === 'versions'
        ? await this.client.from(TABLES[collection]).upsert(payload, { onConflict: 'id', ignoreDuplicates: true })
        : await this.client.from(TABLES[collection]).upsert(payload, { onConflict: 'id' });
      if (error) throw new RepositoryError(error.message, 'PERSISTENCE');
    }
  }

  async resetDemo(): Promise<ContentSocialState> {
    const state = createSeedState();
    this.mode = 'demo';
    saveLocal(this.scope, state);
    return state;
  }
}

export { RepositoryError };
