import React from 'react';
import { Search, X, type LucideIcon } from 'lucide-react';
import COSLogo from './COSLogo';

export interface RailArea {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface GlobalIconRailProps {
  areas: readonly RailArea[];
  activeId: string;
  initials: string;
  onSelect: (id: string) => void;
  onExit?: () => void;
}

export function GlobalIconRail({ areas, activeId, initials, onSelect, onExit }: GlobalIconRailProps) {
  return (
    <div className="dual-rail-global flex h-full w-[66px] shrink-0 flex-col items-center border-r border-[#2A4E82] bg-[#061B3A] py-4">
      <button
        type="button"
        onClick={() => areas[0] && onSelect(areas[0].id)}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#082B5B] transition-colors hover:bg-[#155EEF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        aria-label="Open COS home"
      >
        <COSLogo className="h-7 w-7" variant="white" />
      </button>

      <nav className="mt-5 flex min-h-0 flex-1 flex-col items-center gap-2.5 overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Global workspace areas">
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
  return (
    <header className="flex min-h-[97px] flex-col justify-center border-b border-[#2A4E82] px-5">
      <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#AFC8F2]">Central Operating System</p>
      <div className="mt-2 flex min-w-0 items-center gap-3">
        <Icon size={23} strokeWidth={1.8} className="shrink-0 text-[#2F7BFF]" aria-hidden="true" />
        <p className="truncate font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-white">{area.label}</p>
      </div>
    </header>
  );
}

export function ContextRailSearch({ navId }: { navId: string }) {
  const [query, setQuery] = React.useState('');

  const filterRoutes = (value: string) => {
    setQuery(value);
    const normalized = value.trim().toLowerCase();
    document.querySelectorAll<HTMLButtonElement>(`#${navId} button`).forEach((button) => {
      const isFiltered = normalized.length > 0 && !button.textContent?.toLowerCase().includes(normalized);
      button.style.display = isFiltered ? 'none' : '';
    });
  };

  return (
    <div className="border-b border-[#2A4E82] px-4 py-4">
      <label className="relative block">
        <span className="sr-only">Search this area</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8EABD2]" />
        <input value={query} onChange={(event) => filterRoutes(event.target.value)} placeholder="Search this area..." className="min-h-10 w-full rounded-xl border border-[#31558B] bg-[#061B3A]/80 pl-9 pr-9 text-sm text-white placeholder:text-[#8EABD2] focus:border-[#2F7BFF] focus:outline-none" />
        {query && (
          <button type="button" onClick={() => filterRoutes('')} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#8EABD2] hover:bg-[#082B5B] hover:text-white" aria-label="Clear area search">
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </label>
    </div>
  );
}
