import React from 'react';
import { ArrowLeft, ChevronRight, CircleDot, Search, X } from 'lucide-react';
import COSLogo from './COSLogo';
import type { ExpandedRailChild, ExpandedRailItem, RailArea } from '../navigation/types';

export type { ExpandedRailChild, ExpandedRailItem, RailArea } from '../navigation/types';

interface GlobalIconRailProps {
  areas: readonly RailArea[];
  activeId: string;
  initials: string;
  onSelect: (id: string) => void;
  onExit?: () => void;
}

interface GlobalRailBrandProps {
  onActivate: () => void;
  label?: string;
}

export function GlobalRailBrand({ onActivate, label = 'Open COS home' }: GlobalRailBrandProps) {
  return (
    <div className="flex shrink-0 flex-col items-center" data-testid="cos-rail-brand">
      <button
        type="button"
        onClick={onActivate}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#082B5B] transition-colors duration-200 hover:bg-[#155EEF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        aria-label={label}
      >
        <COSLogo className="h-7 w-7" variant="white" />
      </button>
      <span className="mt-5 h-px w-10 bg-[#123C70]" data-testid="cos-rail-brand-divider" aria-hidden="true" />
    </div>
  );
}

export function GlobalIconRail({ areas, activeId, initials, onSelect, onExit }: GlobalIconRailProps) {
  return (
    <div className="dual-rail-global flex h-full w-[66px] shrink-0 flex-col items-center border-r border-[#2A4E82] bg-[#061B3A] py-4">
      <GlobalRailBrand onActivate={() => areas[0] && onSelect(areas[0].id)} />

      <nav className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-2.5 overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Global workspace areas">
        {areas.map((area) => {
          const Icon = area.icon;
          const isActive = area.id === activeId;
          return (
            <div key={area.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(area.id)}
                aria-label={area.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative grid h-12 w-12 place-items-center rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                  isActive
                    ? 'scale-105 bg-gradient-to-br from-[#155EEF] to-[#2970FF] text-white shadow-[0_0_20px_rgba(41,112,255,0.42)]'
                    : 'text-[#9CB7DE] hover:bg-[#082B5B] hover:text-sky-300'
                }`}
              >
                {isActive && <span className="absolute -left-2 h-6 w-1 rounded-r bg-amber-300" aria-hidden="true" />}
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-[#264B7E] bg-[#061B3A] px-2.5 py-1.5 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {area.label}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="mt-3 flex shrink-0 flex-col items-center gap-3 border-t border-[#2A4E82] pt-4">
        <div className="grid h-11 w-11 place-items-center rounded-full border border-[#5B91FF] bg-[#155EEF] text-xs font-bold text-white" aria-label={`Signed in as ${initials}`}>
          {initials}
        </div>
        {onExit && (
          <button type="button" onClick={onExit} className="grid h-11 w-11 place-items-center rounded-lg text-[#9CB7DE] transition hover:bg-[#082B5B] hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300" aria-label="Exit workspace">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ContextRailHeader({ area }: { area: RailArea }) {
  const Icon = area.icon;
  const titleScale = area.label.length <= 12
    ? 'text-xl leading-6 whitespace-nowrap'
    : area.label.length <= 16
      ? 'text-lg leading-6 whitespace-nowrap'
      : area.label.length <= 22
        ? 'text-[14px] leading-5 whitespace-nowrap'
        : 'text-sm leading-[1.05rem] whitespace-normal';

  return (
    <header className="flex h-[90px] shrink-0 flex-col justify-center border-b border-[#2A4E82] px-5" data-testid="cos-context-rail-header">
      <p className="truncate font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[#AFC8F2]">Central Operating System</p>
      <div className="mt-2 flex min-w-0 items-center gap-2.5">
        <Icon size={23} strokeWidth={1.9} className="shrink-0 text-[#2F7BFF]" aria-hidden="true" />
        <p
          className={`min-w-0 max-w-full overflow-hidden font-display font-extrabold uppercase tracking-[-0.025em] text-white ${titleScale}`}
          data-testid="cos-context-rail-title"
          title={area.label}
        >
          {area.label}
        </p>
      </div>
    </header>
  );
}

interface ContextRailSearchProps {
  navId?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function ContextRailSearch({ navId, value, onChange, placeholder = 'Search navigation...' }: ContextRailSearchProps) {
  const [internalQuery, setInternalQuery] = React.useState('');
  const query = value ?? internalQuery;

  const filterRoutes = (value: string) => {
    if (onChange) {
      onChange(value);
      return;
    }
    setInternalQuery(value);
    if (!navId) return;
    const normalized = value.trim().toLowerCase();
    document.querySelectorAll<HTMLButtonElement>(`#${navId} button`).forEach((button) => {
      const isFiltered = normalized.length > 0 && !button.textContent?.toLowerCase().includes(normalized);
      button.style.display = isFiltered ? 'none' : '';
    });
  };

  return (
    <div className="border-b border-[#2A4E82] px-4 py-4">
      <label className="relative block">
        <span className="sr-only">Search navigation</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8EABD2]" />
        <input value={query} onChange={(event) => filterRoutes(event.target.value)} placeholder={placeholder} className="min-h-11 w-full rounded-lg border border-[#31558B] bg-[#061B3A]/80 pl-9 pr-9 text-sm text-white placeholder:text-[#8EABD2] focus:border-[#2F7BFF] focus:outline-none focus:ring-2 focus:ring-[#2F7BFF]/25" />
        {query && (
          <button type="button" onClick={() => filterRoutes('')} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#8EABD2] hover:bg-[#082B5B] hover:text-white" aria-label="Clear area search">
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </label>
    </div>
  );
}

interface ExpandedSidebarNavigationProps {
  items: readonly ExpandedRailItem[];
  activeParentId: string;
  activeChildId?: string;
  query?: string;
  ariaLabel: string;
  onParentSelect: (id: string) => void;
  onChildSelect: (parentId: string, childId: string) => void;
}

export function ExpandedSidebarNavigation({
  items,
  activeParentId,
  activeChildId,
  query = '',
  ariaLabel,
  onParentSelect,
  onChildSelect,
}: ExpandedSidebarNavigationProps) {
  const [drillPath, setDrillPath] = React.useState<string[]>([]);
  const normalizedQuery = query.trim().toLowerCase();

  React.useEffect(() => {
    if (drillPath.length > 0 && drillPath[0] !== activeParentId) setDrillPath([]);
  }, [activeParentId, drillPath]);

  const findNode = React.useCallback((path: readonly string[]) => {
    let nodes: readonly ExpandedRailItem[] | readonly ExpandedRailChild[] = items;
    let node: ExpandedRailItem | ExpandedRailChild | undefined;
    for (const id of path) {
      node = nodes.find((candidate) => candidate.id === id);
      if (!node) return undefined;
      nodes = node.children ?? [];
    }
    return node;
  }, [items]);

  const drillNode = findNode(drillPath);
  const levelItems: readonly ExpandedRailItem[] | readonly ExpandedRailChild[] = drillNode?.children ?? items;

  const visibleItems = React.useMemo(() => levelItems.filter((item) => !normalizedQuery || item.label.toLowerCase().includes(normalizedQuery)), [levelItems, normalizedQuery]);

  const handleItem = (item: ExpandedRailItem | ExpandedRailChild) => {
    const hasChildren = Boolean(item.children?.length);
    if (hasChildren) {
      if (drillPath.length === 0) onParentSelect(item.id);
      setDrillPath((current) => [...current, item.id]);
      return;
    }
    if (drillPath.length > 0) onChildSelect(drillPath[0], item.id);
    else onParentSelect(item.id);
  };

  const handleBack = () => setDrillPath((current) => current.slice(0, -1));
  const parentNode = drillPath.length > 1 ? findNode(drillPath.slice(0, -1)) : undefined;
  const backLabel = drillPath.length > 1 ? parentNode?.label ?? 'Previous menu' : 'Main Menu';

  return (
    <nav className="cos-expanded-navigation min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label={ariaLabel}>
      {drillPath.length > 0 && (
        <div className="cos-expanded-navigation__drill-header">
          <button type="button" className="cos-expanded-navigation__back" onClick={handleBack} aria-label={`Back to ${backLabel}`}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to {backLabel}</span>
          </button>
          <div className="cos-expanded-navigation__drill-title" data-testid="cos-drill-title">
            {drillNode && (() => {
              const Icon = drillNode.icon ?? CircleDot;
              return <Icon size={18} strokeWidth={1.8} aria-hidden="true" />;
            })()}
            <span>{drillNode?.label}</span>
          </div>
        </div>
      )}
      {visibleItems.length === 0 && (
        <p className="px-3 py-8 text-center text-xs leading-5 text-[#91A9D2]">No navigation items match this search.</p>
      )}
      {visibleItems.map((item) => {
        const Icon = item.icon ?? CircleDot;
        const hasChildren = Boolean(item.children?.length);
        const isRootItem = drillPath.length === 0;
        const isActive = isRootItem ? item.id === activeParentId : drillPath.length === 1 && item.id === activeChildId;
        return (
          <div key={item.id} className="cos-expanded-navigation__section" data-level={drillPath.length}>
            <button
              type="button"
              className="cos-expanded-navigation__parent"
              data-active={isActive || undefined}
              onClick={() => handleItem(item)}
              aria-current={isActive ? 'page' : undefined}
              aria-haspopup={hasChildren ? 'menu' : undefined}
            >
              <span className="cos-expanded-navigation__accent" aria-hidden="true" />
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-left">{item.label}</span>
              {hasChildren && <ChevronRight size={15} className="cos-expanded-navigation__chevron" aria-hidden="true" />}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
