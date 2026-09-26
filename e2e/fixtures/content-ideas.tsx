// Development-only contract test. All external traffic is intercepted; no staging writes.
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { User } from '@supabase/supabase-js';
import '../../src/index.css';
import '../../src/components/WorkspaceTheme.css';

if (!(import.meta as any).env.DEV) throw new Error('Test harness is development-only.');
const workspace = '82000000-0000-4000-8000-000000000001';
const actor = '82000000-0000-4000-8000-000000000002';
const companyA = '82000000-0000-4000-8000-000000000010';
const companyB = '82000000-0000-4000-8000-000000000020';
const brandA = '82000000-0000-4000-8000-000000000011';
const brandB = '82000000-0000-4000-8000-000000000021';
const brandReadOnly = '82000000-0000-4000-8000-000000000022';
const directory = {
  workspaces: [{ id: workspace, name: 'Idea test workspace' }],
  companies: [{ id: companyA, workspace_id: workspace, name: 'Test company A' }, { id: companyB, workspace_id: workspace, name: 'Test company B' }],
  brands: [{ id: brandA, workspace_id: workspace, client_id: companyA, name: 'Brand Alpha', timezone: 'Africa/Lagos' }, { id: brandB, workspace_id: workspace, client_id: companyB, name: 'Brand Beta', timezone: 'Europe/London' }, { id: brandReadOnly, workspace_id: workspace, client_id: companyB, name: 'Read-only brand', timezone: 'Europe/London' }],
  memberships: [{ workspace_id: workspace, client_id: companyA, brand_id: brandA, role: 'PLANNER' }, { workspace_id: workspace, client_id: companyB, brand_id: brandB, role: 'PLANNER' }, { workspace_id: workspace, client_id: companyB, brand_id: brandReadOnly, role: 'EXECUTIVE_VIEWER' }],
};
type Row = Record<string, unknown>;
const rows: Record<string, Row[]> = {
  cs_ideas: [],
  cs_audit_events: [{ id: '82000000-0000-4000-8000-000000000003', workspace_id: workspace, client_id: companyB, brand_id: brandB, actor_type: 'USER', actor_id: 'other-actor', actor_name: 'Other planner', occurred_at: new Date().toISOString(), action: 'idea.created', target_type: 'ContentIdea', target_id: 'old', result: 'SUCCESS', summary: 'Existing history', request_id: 'history' }],
};
const requests: Array<{ table: string; payload: Row[] }> = [];
Object.assign(window, { __ideaTestRows: rows, __ideaTestRequests: requests, __failNextAudit: false });
const auditColumns = new Set(['id', 'workspace_id', 'client_id', 'brand_id', 'occurred_at', 'actor_type', 'actor_id', 'actor_name', 'action', 'target_type', 'target_id', 'target_version', 'result', 'summary', 'request_id']);
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.href, location.origin);
  if (url.origin === location.origin) return realFetch(input, init);
  if (url.pathname.endsWith('/rpc/cs_company_directory')) return Response.json(directory);
  const table = url.pathname.split('/').at(-1)!;
  if (table === 'cs_memberships') {
    const brand = directory.brands.find(b => url.search.includes(b.id));
    return Response.json(brand ? [{ role: brand.id === brandReadOnly ? 'EXECUTIVE_VIEWER' : 'PLANNER', display_name: 'Test planner' }] : []);
  }
  if (table.startsWith('cs_')) {
    if (init?.method === 'POST') {
      const payload = JSON.parse(String(init.body)) as Row[];
      requests.push({ table, payload });
      if (table === 'cs_audit_events') {
        if (payload.some(row => Object.keys(row).some(key => !auditColumns.has(key)))) return Response.json({ code: 'PGRST204', message: 'Unexpected audit column' }, { status: 400 });
        if (payload.some(row => row.actor_id !== actor)) return Response.json({ code: '42501', message: 'Audit actor mismatch' }, { status: 403 });
        if ((window as any).__failNextAudit) { (window as any).__failNextAudit = false; return Response.json({ message: 'Temporary audit failure' }, { status: 503 }); }
      }
      if (payload.some(row => !directory.brands.some(b => b.id === row.brand_id && b.client_id === row.client_id && b.workspace_id === row.workspace_id) || row.brand_id === brandReadOnly)) return Response.json({ message: 'Scope denied' }, { status: 403 });
      rows[table] ??= [];
      for (const row of payload) {
        const index = rows[table].findIndex(saved => saved.id === row.id);
        if (index < 0) rows[table].push(row); else rows[table][index] = row;
      }
      return new Response(null, { status: 201 });
    }
    return Response.json((rows[table] ?? []).filter(row => ['workspace_id', 'client_id', 'brand_id'].every(key => !url.searchParams.has(key) || url.searchParams.get(key) === `eq.${row[key]}`)));
  }
  return Response.json({ error: 'External traffic blocked in test harness' }, { status: 400 });
};
const { supabase } = await import('../../src/supabaseClient');
supabase.auth.getUser = async () => ({ data: { user: { id: actor } as User }, error: null });
const { default: ContentSocialModule } = await import('../../src/content-social/ContentSocialModule');
createRoot(document.getElementById('root')!).render(<main className="cos-ui p-4 sm:p-6"><p className="mb-4 text-xs">Isolated idea test — no staging writes</p><ContentSocialModule activeRoute="Planning & Briefs" globalSearch="" scopeMode="company" notificationOpen={false} onNotificationClose={() => {}} onRouteChange={() => {}} /></main>);
