import React from 'react';
import { ArrowLeft, ChevronRight, Search, ShieldCheck, X } from 'lucide-react';
import COSLogo from './COSLogo';
import { GlobalIconRail } from './DualRailNavigation';
import { SALES_MARKETING_NAVIGATION_AREAS, type SalesMarketingNavigationArea } from '../navigation/salesMarketing';

interface SalesMarketingSidebarProps {
  activeArea: SalesMarketingNavigationArea;
  activeRoute: string;
  mode: 'global' | 'contextual';
  scopeMode: 'company' | 'group';
  onScopeModeChange: (mode: 'company' | 'group') => void;
  onAreaSelect: (area: SalesMarketingNavigationArea) => void;
  onRouteSelect: (areaId: string, route: string) => void;
  onBackToMain: () => void;
  onClose?: () => void;
  onExit?: () => void;
  isOpen?: boolean;
}

function SidebarHeader({ title, onClose, onExit, showLogo = true }: { title: string; onClose?: () => void; onExit?: () => void; showLogo?: boolean }) {
  const handleHeaderAction = () => {
    const isSmallViewport = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1023px)').matches;
    (isSmallViewport ? onClose : (onExit ?? onClose))?.();
  };
  return (
    <header className="sm-sidebar__header">
      {showLogo && <COSLogo className="h-8 w-8 shrink-0" variant="white" />}
      <div className="min-w-0 flex-1">
        <p>Central Operating System</p>
        <h2 title={title}>{title}</h2>
      </div>
      {(onClose || onExit) && <button type="button" onClick={handleHeaderAction} aria-label="Close Sales and Marketing sidebar"><X size={20} /></button>}
    </header>
  );
}

function EntityScope({ mode, onChange }: { mode: 'company' | 'group'; onChange: (mode: 'company' | 'group') => void }) {
  return (
    <section className="sm-sidebar__scope" aria-labelledby="sm-entity-scope-label">
      <label id="sm-entity-scope-label" htmlFor="sm-entity-scope">Entity scope</label>
      <div className="sm-sidebar__scope-select">
        <ShieldCheck size={15} aria-hidden="true" />
        <select id="sm-entity-scope" aria-label="Sales and Marketing entity scope" defaultValue="delabs"><option value="delabs">DL · DELabs Ltd (UK Hub)</option></select>
      </div>
      <div className="sm-sidebar__segments" aria-label="Entity scope level">
        {(['company', 'group'] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} data-active={mode === value} onClick={() => onChange(value)}>{value === 'company' ? 'Company' : 'Group'}</button>)}
      </div>
    </section>
  );
}

export default function SalesMarketingSidebar({ activeArea, activeRoute, mode, scopeMode, onScopeModeChange, onAreaSelect, onRouteSelect, onBackToMain, onClose, onExit, isOpen = true }: SalesMarketingSidebarProps) {
  const [query, setQuery] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setQuery(''), [activeArea.id]);
  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const filteredGroups = activeArea.groups.map((group) => ({
    ...group,
    routes: group.routes.filter((route) => route.toLowerCase().includes(query.trim().toLowerCase())),
  })).filter((group) => group.routes.length > 0);

  return (
    <>
      <button type="button" className="sm-sidebar__backdrop" data-open={isOpen} aria-label="Close navigation" onClick={onClose} />
      <div id="sales-marketing-sidebar" className="sm-sidebar" data-mode={mode} data-open={isOpen}>
        {mode === 'global' ? (
          <aside className="sm-sidebar__global" aria-label="Sales and Marketing main menu">
            <SidebarHeader title="Sales & Marketing" onClose={onClose} onExit={onExit} />
            <EntityScope mode={scopeMode} onChange={onScopeModeChange} />
            <nav className="sm-sidebar__global-nav" aria-label="Sales and Marketing areas">
              {SALES_MARKETING_NAVIGATION_AREAS.map((area) => {
                const Icon = area.icon;
                return <button key={area.id} type="button" onClick={() => onAreaSelect(area)} data-active={area.id === activeArea.id} aria-current={area.id === activeArea.id ? 'page' : undefined}><span className="sm-sidebar__active-rule" /><Icon size={20} strokeWidth={1.75} aria-hidden="true" /><span>{area.label}</span><ChevronRight size={16} className="ml-auto" aria-hidden="true" /></button>;
              })}
            </nav>
            <footer className="sm-sidebar__user"><span>AB</span><div><strong>Aisha Bello</strong><small>Marketing Lead</small></div>{(onExit || onClose) && <button type="button" onClick={onExit ?? onClose}>Exit workspace</button>}</footer>
          </aside>
        ) : (
          <div className="sm-sidebar__contextual">
            <aside aria-label="Sales and Marketing area rail"><GlobalIconRail areas={SALES_MARKETING_NAVIGATION_AREAS} activeId={activeArea.id} initials="AB" onSelect={(id) => { const area = SALES_MARKETING_NAVIGATION_AREAS.find((candidate) => candidate.id === id); if (area) onAreaSelect(area); }} onExit={onExit ?? onClose} /></aside>
            <aside className="sm-sidebar__panel" aria-label={`${activeArea.label} submenu`}>
              <SidebarHeader title={activeArea.label} onClose={onClose} onExit={onExit} showLogo={false} />
              <EntityScope mode={scopeMode} onChange={onScopeModeChange} />
              <button type="button" className="sm-sidebar__main-menu" onClick={onBackToMain}><ArrowLeft size={16} aria-hidden="true" />Back to main menu</button>
              <div className="sm-sidebar__search"><label htmlFor="sm-area-search">Search this area</label><div><Search size={15} aria-hidden="true" /><input ref={searchRef} id="sm-area-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this area" />{query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear area search"><X size={14} /></button>}</div></div>
              <nav className="sm-sidebar__submenu" aria-label={`${activeArea.label} routes`}>
                {filteredGroups.map((group) => <section key={group.label}><h3>{group.label}</h3>{group.routes.map((route) => <button key={route} type="button" onClick={() => onRouteSelect(activeArea.id, route)} data-active={route === activeRoute} aria-current={route === activeRoute ? 'page' : undefined}><span className="sm-sidebar__active-rule" />{route}</button>)}</section>)}
                {filteredGroups.length === 0 && <p className="sm-sidebar__empty">No routes match “{query}”.</p>}
              </nav>
              <footer className="sm-sidebar__user"><span>AB</span><div><strong>Aisha Bello</strong><small>Marketing Lead</small></div></footer>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
