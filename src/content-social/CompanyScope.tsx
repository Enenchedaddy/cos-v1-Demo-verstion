import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { isContentSocialDemoEnabled } from './repository';
import { DELABS_SCOPE, DEMO_SESSION } from './seed';
import { canOnboard, loadCompanyDirectory, publisherCommand, type CompanyDirectory } from './publisher';
import type { ScopeContext } from './model';

export function useCompanyDirectory() {
  const [directory, setDirectory] = useState<CompanyDirectory | null>(null);
  const [error, setError] = useState<string>();
  const [generation, setGeneration] = useState(0);
  const identity = useRef<string | null>(null);
  const reload = useCallback(() => setGeneration(value => value + 1), []);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextIdentity = session?.user.id ?? null;
      if (identity.current !== nextIdentity) setDirectory(null);
      identity.current = nextIdentity;
      reload();
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);
  useEffect(() => {
    let active = true;
    setError(undefined);
    const load = async () => {
      // Explicit development fixtures only; never a fallback for a live service error.
      if (isContentSocialDemoEnabled((import.meta as ImportMeta & { env?: Record<string, unknown> }).env ?? {})) {
        const s = DELABS_SCOPE;
        return {
          workspaces: [{ id: s.workspaceId, name: s.workspaceName }],
          companies: [{ id: s.clientId, workspace_id: s.workspaceId, name: s.clientName }],
          brands: [{ id: s.brandId, workspace_id: s.workspaceId, client_id: s.clientId, name: s.brandName, timezone: 'Europe/London' }],
          memberships: [{ workspace_id: s.workspaceId, client_id: s.clientId, brand_id: s.brandId, role: DEMO_SESSION.role }],
        } satisfies CompanyDirectory;
      }
      return loadCompanyDirectory();
    };
    void load().then(value => { if (active) setDirectory(value); }).catch(reason => {
      if (active) { setDirectory(null); setError(reason instanceof Error ? reason.message : 'Company access could not be verified.'); }
    });
    return () => { active = false; };
  }, [generation]);
  return { directory, error, reload };
}

export function CompanyScope({ children }: { children: (scope: ScopeContext) => ReactNode }) {
  const { directory, error, reload } = useCompanyDirectory();
  const [workspaceId, setWorkspaceId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [onboarding, setOnboarding] = useState<'company' | 'brand' | null>(null);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [saveError, setSaveError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const workspace = directory?.workspaces.find(w => w.id === workspaceId) ?? directory?.workspaces[0];
  const companies = directory?.companies.filter(c => c.workspace_id === workspace?.id) ?? [];
  const company = companies.find(c => c.id === companyId) ?? companies[0];
  const brands = directory?.brands.filter(b => b.client_id === company?.id && b.workspace_id === workspace?.id) ?? [];
  const brand = brands.find(b => b.id === brandId) ?? brands[0];
  const scope = useMemo<ScopeContext | null>(() => workspace && company && brand ? {
    workspaceId: workspace.id, workspaceName: workspace.name, clientId: company.id,
    clientName: company.name, brandId: brand.id, brandName: brand.name, timezone: brand.timezone,
  } : null, [workspace?.id, workspace?.name, company?.id, company?.name, brand?.id, brand?.name, brand?.timezone]);

  if (error) return <section className="cs-surface p-6" role="alert"><h2 className="text-lg font-bold">Company access unavailable</h2><p className="my-3 text-sm">{error}</p><button className="cs-button-secondary" onClick={reload}>Retry</button></section>;
  if (!directory) return <p role="status" className="p-6">Loading authorized companies…</p>;
  if (!workspace) return <section className="p-6"><h2 className="text-lg font-bold">No Content & Social access</h2><p className="mt-2 text-sm">An approved administrator must assign a scoped membership. Company visibility does not grant access.</p></section>;
  const canAddCompany = canOnboard(directory.memberships, workspace.id);
  const canAddBrand = company && canOnboard(directory.memberships, workspace.id, company.id);

  return <div className="space-y-5">
    <section aria-label="Company and brand context" className="rounded-xl border border-[#D9E0EA] bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {directory.workspaces.length > 1 && <label className="text-xs font-semibold">Workspace<select className="cs-input mt-2 min-h-11" value={workspace.id} onChange={e => { setWorkspaceId(e.target.value); setCompanyId(''); setBrandId(''); setOnboarding(null); }}>{directory.workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>}
        <label className="text-xs font-semibold">Company<select className="cs-input mt-2 min-h-11" value={company?.id ?? ''} onChange={e => { setCompanyId(e.target.value); setBrandId(''); setOnboarding(null); }} disabled={!companies.length}>{!companies.length && <option value="">No authorized companies</option>}{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Brand<select className="cs-input mt-2 min-h-11" value={brand?.id ?? ''} onChange={e => setBrandId(e.target.value)} disabled={!brands.length}>{!brands.length && <option value="">No authorized brands</option>}{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="mr-auto text-xs text-[#65758B]">Only assigned scopes are shown. Access is checked on every request.</p>
        {canAddCompany && <button className="cs-button-secondary min-h-11" onClick={() => { setOnboarding('company'); setName(''); }}>Add company</button>}
        {canAddBrand && <button className="cs-button-secondary min-h-11" onClick={() => { setOnboarding('brand'); setName(''); }}>Add brand</button>}
      </div>
      {onboarding && <form className="mt-4 grid gap-3 border-t border-[#D9E0EA] pt-4 sm:grid-cols-2" onSubmit={async e => {
        e.preventDefault(); setBusy(true); setSaveError(undefined);
        try {
          const id = await publisherCommand<string>(`${onboarding}.create`, { workspace_id: workspace.id, client_id: company?.id, name, timezone });
          if (onboarding === 'company') { setCompanyId(id); setBrandId(''); } else setBrandId(id);
          setOnboarding(null); reload();
        } catch (reason) { setSaveError(reason instanceof Error ? reason.message : 'Could not save.'); }
        finally { setBusy(false); }
      }}>
        <label className="text-xs font-semibold">{onboarding === 'company' ? 'Company name' : 'Brand name'}<input autoFocus required maxLength={160} className="cs-input mt-2 min-h-11" value={name} onChange={e => setName(e.target.value)} /></label>
        {onboarding === 'brand' && <label className="text-xs font-semibold">Brand timezone<input required className="cs-input mt-2 min-h-11" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="Africa/Lagos" /></label>}
        <div className="flex gap-2"><button disabled={busy} className="cs-button-primary min-h-11">{busy ? 'Saving…' : 'Save'}</button><button type="button" className="cs-button-secondary min-h-11" onClick={() => setOnboarding(null)}>Cancel</button></div>
        {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
      </form>}
    </section>
    {scope ? <div key={`${scope.workspaceId}:${scope.clientId}:${scope.brandId}`}>{children(scope)}</div> : <p className="p-4 text-sm">No accessible brand in this company. Add a brand if authorized, or request a scoped membership.</p>}
  </div>;
}
