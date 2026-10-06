import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePortalData, type PortalDataScope } from './usePortalData';

const backend = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../supabaseClient', () => ({ isSupabaseConfigured: true, supabase: backend }));
afterEach(cleanup);
beforeEach(() => {
  backend.from.mockReset();
  backend.from.mockImplementation(() => ({ select: () => {
    const response = Promise.resolve({ data: [], error: null });
    return Object.assign(response, { order: () => response });
  } }));
});

describe('workspace data loading', () => {
  it('does not fetch business records before a workspace is selected', async () => {
    const view = renderHook(({ scope }) => usePortalData(scope), { initialProps: { scope: 'inactive' as PortalDataScope } });
    expect(backend.from).not.toHaveBeenCalled();
    view.rerender({ scope: 'sales-marketing' });
    await waitFor(() => expect(view.result.current.status).toBe('empty'));
    expect(backend.from.mock.calls.map(([table]) => table)).toEqual(['companies', 'deals', 'campaigns', 'approvals', 'audit_logs']);
  });
  it('loads only management collections and keeps explicit refresh available', async () => {
    const view = renderHook(() => usePortalData('management'));
    await waitFor(() => expect(view.result.current.status).toBe('empty'));
    expect(backend.from.mock.calls.map(([table]) => table)).toEqual(['companies', 'orders', 'approvals', 'audit_logs']);
    await act(async () => { await view.result.current.reload(); });
    expect(backend.from).toHaveBeenCalledTimes(8);
  });
  it('discards responses from a workspace that has been left', async () => {
    let finish: (value: { data: unknown[]; error: null }) => void;
    const pending = new Promise<{ data: unknown[]; error: null }>(resolve => { finish = resolve; });
    backend.from.mockImplementation(() => ({ select: () => Object.assign(pending, { order: () => pending }) }));
    const view = renderHook(({ scope }) => usePortalData(scope), { initialProps: { scope: 'management' as PortalDataScope } });
    view.rerender({ scope: 'inactive' });
    await act(async () => { finish!({ data: [{ id: 'stale-record' }], error: null }); await pending; });
    expect(view.result.current.companies).toEqual([]);
  });
});
