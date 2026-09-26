import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useContentSocial } from './useContentSocial';
import { ContentSocialRepository } from './repository';
import { createSeedState, DELABS_SCOPE, DEMO_SESSION } from './seed';
import type { ScopeContext } from './model';

vi.mock('./repository', async importOriginal => ({ ...await importOriginal<typeof import('./repository')>(), ContentSocialRepository: vi.fn() }));
const targetScope = { ...DELABS_SCOPE, clientId: 'company-b', brandId: 'brand-b', brandName: 'Brand B' };
const input = { title: 'Brand-specific idea', summary: 'Test summary', source: 'Planning session', owner: 'Planner', priority: 'HIGH' as const };
const loaded = () => ({ state: createSeedState(), session: { ...DEMO_SESSION, role: 'PLANNER' as const, roles: ['PLANNER' as const], mode: 'supabase' as const }, mode: 'supabase' as const });
let source: { load: ReturnType<typeof vi.fn>; persist: ReturnType<typeof vi.fn> };
let target: typeof source;

describe('idea creation scope and retries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    source = { load: vi.fn().mockResolvedValue(loaded()), persist: vi.fn().mockResolvedValue(undefined) };
    target = { load: vi.fn().mockResolvedValue(loaded()), persist: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(ContentSocialRepository).mockImplementation(function (scope: ScopeContext) { return (scope.brandId === targetScope.brandId ? target : source) as unknown as ContentSocialRepository; });
  });
  afterEach(cleanup);

  it('saves the idea and audit to the destination without mixing source records', async () => {
    const { result } = renderHook(() => useContentSocial(DELABS_SCOPE));
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    await act(async () => { await result.current.actions.createIdea(input, targetScope); });
    const saved = target.persist.mock.calls[0][0];
    expect(saved.ideas[0]).toMatchObject({ title: input.title, clientId: targetScope.clientId, brandId: targetScope.brandId });
    expect(saved.auditEvents[0]).toMatchObject({ clientId: targetScope.clientId, brandId: targetScope.brandId, targetId: saved.ideas[0].id });
    expect(saved.auditEvents[0]).not.toHaveProperty('brandName');
    expect(source.persist).not.toHaveBeenCalled();
    expect(result.current.state.ideas.some(idea => idea.title === input.title)).toBe(false);
  });

  it('does not inherit source permissions when destination is read-only', async () => {
    target.load.mockResolvedValue({ ...loaded(), session: { ...loaded().session, role: 'EXECUTIVE_VIEWER', roles: ['EXECUTIVE_VIEWER'] } });
    const { result } = renderHook(() => useContentSocial(DELABS_SCOPE));
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    await act(async () => { await expect(result.current.actions.createIdea(input, targetScope)).rejects.toThrow(/cannot perform/); });
    expect(target.persist).not.toHaveBeenCalled();
    expect(source.persist).not.toHaveBeenCalled();
  });

  it('rejects revoked destination access and retains the source view', async () => {
    target.load.mockRejectedValue(new Error('No membership'));
    const { result } = renderHook(() => useContentSocial(DELABS_SCOPE));
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    await act(async () => { await expect(result.current.actions.createIdea(input, targetScope)).rejects.toThrow('No membership'); });
    expect(target.persist).not.toHaveBeenCalled();
    expect(result.current.status).toBe('loaded');
  });

  it('reuses the idea and audit IDs after a partial save failure', async () => {
    source.persist.mockRejectedValueOnce(new Error('Audit unavailable'));
    const { result } = renderHook(() => useContentSocial(DELABS_SCOPE));
    await waitFor(() => expect(result.current.status).toBe('loaded'));
    await act(async () => { await expect(result.current.actions.createIdea(input)).rejects.toThrow('Audit unavailable'); });
    const first = source.persist.mock.calls[0][0];
    await act(async () => { await result.current.actions.createIdea(input); });
    const retry = source.persist.mock.calls[1][0];
    expect(retry.ideas[0]).toBe(first.ideas[0]);
    expect(retry.auditEvents[0]).toBe(first.auditEvents[0]);
    expect(result.current.state.ideas.filter(idea => idea.title === input.title)).toHaveLength(1);
  });
});
