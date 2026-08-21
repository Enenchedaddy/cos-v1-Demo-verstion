import React from 'react';
import { ArrowLeft, ChevronRight, Search, ShieldCheck, X } from 'lucide-react';
import COSLogo from './COSLogo';
import { GlobalIconRail } from './DualRailNavigation';
import { MANAGEMENT_RAIL_AREAS } from '../navigation/management';
import type { ExpandedRailItem } from '../navigation/types';

interface ManagementSidebarProps {
  activeArea: ExpandedRailItem;
  activeChildId: string;
  mode: 'global' | 'contextual';
  onAreaSelect: (id: string) => void;
  onChildSelect: (parentId: string, childId: string) => void;
  onBackToMain: () => void;
  onClose?: () => void;
  onExit?: () => void;
  isOpen?: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  home: 'Command views', performance: 'Performance views', governance: 'Governance views',
  strategy: 'Strategy views', organisation: 'Organisation views', acquisitions: 'Acquisition views',
  alerts: 'Alert views', 'group-admin': 'Registry views',
};

function Header({ title, onClose, onExit }: { title: string; onClose?: () => void; onExit?: () => void }) {
  const handleHeaderAction = () => {
    const isSmallViewport = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1023px)').matches;
    (isSmallViewport ? onClose : (onExit ?? onClose))?.();
  };
  return <header className="sm-sidebar__header"><COSLogo className="h-8 w-8 shrink-0" variant="white" /><div className="min-w-0 flex-1"><p>Central Operating System</p><h2 title={title}>{title}</h2></div>{(onClose || onExit) && <button type="button" onClick={handleHeaderAction} aria-label="Close Management sidebar"><X size={20} /></button>}</header>;
}

function EntityScope() {
  const [mode, setMode] = React.useState<'company' | 'group'>('company');
  const [selected, setSelected] = React.useState({ company: 'delabs', group: 'operating-group' });
  const options = mode === 'company'
    ? [{ value: 'delabs', label: 'DL · DELabs Ltd (UK Hub)' }, { value: 'advanced-gases', label: 'AG · Advanced Gases Nigeria' }]
    : [{ value: 'operating-group', label: 'OG · Operating Group' }, { value: 'consolidated-group', label: 'COS · Consolidated Group' }];

  return <section className="sm-sidebar__scope" aria-labelledby="management-entity-scope-label"><label id="management-entity-scope-label" htmlFor="management-entity-scope">Entity scope</label><div className="sm-sidebar__scope-select"><ShieldCheck size={15} aria-hidden="true" /><select id="management-entity-scope" aria-label={`Management ${mode} entity scope`} value={selected[mode]} onChange={(event) => setSelected((current) => ({ ...current, [mode]: event.target.value }))}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div className="sm-sidebar__segments" aria-label="Entity scope level">{(['company', 'group'] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} data-active={mode === value} onClick={() => setMode(value)}>{value === 'company' ? 'Company' : 'Group'}</button>)}</div></section>;
}

export default function ManagementSidebar({ activeArea, activeChildId, mode, onAreaSelect, onChildSelect, onBackToMain, onClose, onExit, isOpen = true }: ManagementSidebarProps) {
  const [query, setQuery] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => setQuery(''), [activeArea.id]);
  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const children = (activeArea.children ?? []).filter((child) => child.label.toLowerCase().includes(query.trim().toLowerCase()));

  return <><button type="button" className="sm-sidebar__backdrop" data-open={isOpen} aria-label="Close navigation" onClick={onClose} /><div id="management-sidebar" className="sm-sidebar management-sidebar" data-mode={mode} data-open={isOpen}>{mode === 'global' ? <aside className="sm-sidebar__global" aria-label="Management main menu"><Header title="Executive Management" onClose={onClose} onExit={onExit} /><EntityScope /><nav className="sm-sidebar__global-nav" aria-label="Management areas">{MANAGEMENT_RAIL_AREAS.map((area) => { const Icon = area.icon; return <button key={area.id} type="button" onClick={() => onAreaSelect(area.id)} data-active={area.id === activeArea.id} aria-current={area.id === activeArea.id ? 'page' : undefined}><span className="sm-sidebar__active-rule" /><Icon size={20} strokeWidth={1.75} aria-hidden="true" /><span>{area.label}</span><ChevronRight size={16} className="ml-auto" aria-hidden="true" /></button>; })}</nav><footer className="sm-sidebar__user"><span>OR</span><div><strong>Olivia Reed</strong><small>Group CEO</small></div>{(onExit || onClose) && <button type="button" onClick={onExit ?? onClose}>Exit workspace</button>}</footer></aside> : <div className="sm-sidebar__contextual"><aside aria-label="Management area rail"><GlobalIconRail areas={MANAGEMENT_RAIL_AREAS} activeId={activeArea.id} initials="OR" onSelect={onAreaSelect} onExit={onExit ?? onClose} /></aside><aside className="sm-sidebar__panel" aria-label={`${activeArea.label} submenu`}><Header title={activeArea.label} onClose={onClose} onExit={onExit} /><EntityScope /><button type="button" className="sm-sidebar__main-menu" onClick={onBackToMain}><ArrowLeft size={16} aria-hidden="true" />Back to main menu</button><div className="sm-sidebar__search"><label htmlFor="management-area-search">Search this area</label><div><Search size={15} aria-hidden="true" /><input ref={searchRef} id="management-area-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this area" />{query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear area search"><X size={14} /></button>}</div></div><nav className="sm-sidebar__submenu" aria-label={`${activeArea.label} routes`}><section><h3>{GROUP_LABELS[activeArea.id] ?? 'Views'}</h3>{children.map((child) => <button key={child.id} type="button" onClick={() => onChildSelect(activeArea.id, child.id)} data-active={child.id === activeChildId} aria-current={child.id === activeChildId ? 'page' : undefined}><span className="sm-sidebar__active-rule" />{child.label}</button>)}</section>{children.length === 0 && <p className="sm-sidebar__empty">No routes match “{query}”.</p>}</nav><footer className="sm-sidebar__user"><span>OR</span><div><strong>Olivia Reed</strong><small>Group CEO</small></div></footer></aside></div>}</div></>;
}
