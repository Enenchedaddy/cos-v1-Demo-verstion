// Isolated browser-test entry, not imported by the application or production build.
// Every backend request is intercepted locally; it cannot publish or mutate staging.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createSeedState, DEMO_SESSION } from '../../src/content-social/seed';
import type { ScopeContext } from '../../src/content-social/model';
import '../../src/index.css';
import '../../src/components/WorkspaceTheme.css';

if (!(import.meta as any).env.DEV) throw new Error('Test harness is development-only.');
const workspace = '81000000-0000-4000-8000-000000000001';
const companyA = '81000000-0000-4000-8000-000000000010';
const companyB = '81000000-0000-4000-8000-000000000020';
const brandA = '81000000-0000-4000-8000-000000000011';
const brandB = '81000000-0000-4000-8000-000000000021';
const directory = {
  workspaces: [{ id: workspace, name: 'Publisher test workspace' }],
  companies: [{ id: companyA, workspace_id: workspace, name: 'DE Labs' }, { id: companyB, workspace_id: workspace, name: 'Quicks Supplements UK' }],
  brands: [{ id: brandA, workspace_id: workspace, client_id: companyA, name: 'DE Labs test brand', timezone: 'Africa/Lagos' }, { id: brandB, workspace_id: workspace, client_id: companyB, name: 'Quicks test brand', timezone: 'Europe/London' }],
  memberships: [{ workspace_id: workspace, client_id: null, brand_id: null, role: 'CS_MANAGER' }],
};
const accounts = directory.brands.map((b, index) => ({ id: `81000000-0000-4000-8000-00000000003${index}`, workspace_id: workspace, client_id: b.client_id, brand_id: b.id, provider: 'INSTAGRAM', provider_account_id: `999${index}`, username: index ? 'quicks_test' : 'delabs_test', status: 'CONNECTED', token_expires_at: '2099-01-01T00:00:00Z' }));
const jobs: any[] = [];
const requests: any[] = [];
(window as any).__publisherTestRequests = requests;
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof Request ? input.url : input.href, location.origin);
  if (url.origin === location.origin) return realFetch(input, init);
  if (url.pathname.endsWith('/rpc/cs_company_directory')) return Response.json(directory);
  if (url.pathname.endsWith('/cs_social_accounts')) return Response.json(accounts.filter(a => !url.searchParams.has('brand_id') || url.searchParams.get('brand_id') === `eq.${a.brand_id}`));
  if (url.pathname.endsWith('/cs_publisher_jobs')) return Response.json(jobs.filter(j => url.searchParams.get('brand_id') === `eq.${j.brand_id}`));
  if (url.pathname.endsWith('/rpc/cs_publisher_command')) { requests.push(JSON.parse(String(init?.body))); return Response.json(crypto.randomUUID()); }
  if (url.pathname.endsWith('/functions/v1/social-publisher')) {
    if (init?.body instanceof FormData) { requests.push({ action: 'upload' }); return Response.json({ media_id: '81000000-0000-4000-8000-000000000099' }); }
    const body = JSON.parse(String(init?.body)); requests.push(body);
    if (body.action === 'schedule') {
      const account = accounts.find(a => a.id === body.account_id)!;
      const id = crypto.randomUUID();
      jobs.push({ id, schedule_id: id, account_id: account.id, workspace_id: workspace, client_id: account.client_id, brand_id: account.brand_id, content_item_id: createSeedState().contentItems[0].id, status: 'QUEUED', planned_at: new Date().toISOString(), timezone: body.timezone, attempts: 0, last_error: null, external_url: null, updated_at: new Date().toISOString() });
      return Response.json({ job_id: id }, { status: 202 });
    }
  }
  // Never allow unexpected external traffic from the fixture.
  return Response.json({ error: 'Unmocked request in isolated UI test' }, { status: 400 });
};

const { CompanyScope } = await import('../../src/content-social/CompanyScope');
const { default: SocialPublisher } = await import('../../src/content-social/SocialPublisher');
function stateFor(scope: ScopeContext) {
  const state = createSeedState();
  const item = state.contentItems[0];
  const variant = state.variants.find(v => v.contentItemId === item.id)!;
  const version = state.versions.find(v => v.id === variant.currentVersionId)!;
  state.briefs = [{ ...state.briefs[0], id: item.briefId, title: `${scope.brandName} approved brief`, status: 'APPROVED', channels: ['Instagram'], formats: ['Static'] }];
  state.contentItems = [{ ...item, title: `${scope.brandName} image post`, currentVersionId: version.id, primaryChannel: 'Instagram', format: 'Static' }];
  state.variants = [{ ...variant, channel: 'Instagram', format: 'Static' }];
  state.versions = [version];
  state.approvals = [{ ...state.approvals[0], contentItemId: item.id, status: 'APPROVED', targets: [{ variantId: variant.id, versionId: version.id, versionNumber: version.versionNumber, channel: 'Instagram' }] }];
  return state;
}
createRoot(document.getElementById('root')!).render(<main className="cos-ui p-4 sm:p-6"><div className="content-social-module mx-auto max-w-[1500px]"><p className="mb-4 text-xs">Isolated UI test — no real publishing</p><CompanyScope>{scope => <SocialPublisher scope={scope} state={stateFor(scope)} session={{ ...DEMO_SESSION, mode: 'supabase' }} onReload={async () => {}} onRouteChange={route => requests.push({ navigation: route })} legacy={<p>Existing manual evidence remains accessible.</p>} />}</CompanyScope></div></main>);
