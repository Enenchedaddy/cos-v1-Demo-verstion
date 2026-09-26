import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ContentSocialRepository, isContentSocialDemoEnabled } from './repository';
import { createAuditEvent } from './domain';
import { DELABS_SCOPE } from './seed';

vi.mock('../supabaseClient', () => ({ isSupabaseConfigured: true, supabase: {} }));

describe('Content & Social demo-mode gate', () => {
  it('requires both a development build and the explicit flag', () => {
    expect(isContentSocialDemoEnabled({ DEV: true, VITE_COS_ALLOW_DEMO: 'true' })).toBe(true);
    expect(isContentSocialDemoEnabled({ DEV: true })).toBe(false);
    expect(isContentSocialDemoEnabled({ DEV: false, VITE_COS_ALLOW_DEMO: 'true' })).toBe(false);
  });
});

describe('Content & Social audit persistence', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('sends only schema columns and never re-submits other actors’ loaded audit history', async () => {
    vi.stubEnv('VITE_COS_ALLOW_DEMO', 'false');
    const writes: Array<{ table: string; payload: Record<string, unknown>[] }> = [];
    const oldEvent = { id: 'old-event', actor_id: 'different-actor', brand_id: DELABS_SCOPE.brandId };
    const client = {
      auth: { getUser: async () => ({ data: { user: { id: 'current-actor' } }, error: null }) },
      from: (table: string) => {
        const result = { data: table === 'cs_memberships' ? [{ role: 'PLANNER', display_name: 'Planner' }] : table === 'cs_audit_events' ? [oldEvent] : [], error: null };
        const query: Record<string, unknown> = {};
        for (const method of ['select', 'eq', 'or', 'order', 'limit']) query[method] = () => query;
        query.then = (resolve: (result: unknown) => unknown) => Promise.resolve(result).then(resolve);
        query.upsert = async (payload: Record<string, unknown>[]) => { writes.push({ table, payload }); return { error: null }; };
        return query;
      },
    } as unknown as SupabaseClient;
    const repository = new ContentSocialRepository(DELABS_SCOPE, client);
    const { state } = await repository.load();
    const event = createAuditEvent({ ...DELABS_SCOPE, actorId: 'current-actor', actorName: 'Planner', action: 'idea.created', targetType: 'ContentIdea', targetId: 'idea', summary: 'Created.' });
    state.auditEvents.unshift(event);
    await repository.persist(state, ['auditEvents']);
    expect(writes).toHaveLength(1);
    expect(writes[0].payload).toHaveLength(1);
    expect(writes[0].payload[0]).toMatchObject({ actor_id: 'current-actor', brand_id: DELABS_SCOPE.brandId });
    expect(Object.keys(writes[0].payload[0]).sort()).toEqual(['id', 'workspace_id', 'client_id', 'brand_id', 'occurred_at', 'actor_type', 'actor_id', 'actor_name', 'action', 'target_type', 'target_id', 'target_version', 'result', 'summary', 'request_id'].sort());
    await repository.persist(state, ['auditEvents']);
    expect(writes).toHaveLength(1);
  });
});
