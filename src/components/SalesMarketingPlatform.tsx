import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Handshake,
  HeartHandshake,
  Home,
  ListTodo,
  LockKeyhole,
  Megaphone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import COSLogoWatermark from './COSLogoWatermark';
import ContentSocialModule from '../content-social/ContentSocialModule';
import { ContextRailHeader, GlobalRailBrand } from './DualRailNavigation';
import { PageTitleBar, SectionTitleBar } from './Typography';
import type { ApprovalRequest, AuditLog, Campaign, Company, Deal } from '../types';

type WorkspaceState = 'loaded' | 'empty' | 'loading' | 'error' | 'restricted';
type CreationType = 'deal' | 'task' | 'lead';

interface NavigationArea {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  routes: readonly string[];
}

interface TaskRecord {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Complete';
}

interface LeadRecord {
  id: string;
  name: string;
  company: string;
  owner: string;
  status: 'New' | 'Qualified' | 'Nurture';
}

interface InspectableRecord {
  id: string;
  kind: 'Account' | 'Deal' | 'Task' | 'Campaign' | 'Lead' | 'Audit';
  title: string;
  subtitle: string;
  status: string;
  owner: string;
  value?: string;
  date?: string;
  details: Array<[string, string]>;
}

interface SalesMarketingPlatformProps {
  companies: Company[];
  deals: Deal[];
  campaigns: Campaign[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  initialArea?: string;
  onUpdateDeals: (deals: Deal[]) => void;
  onAddLog: (
    action: string,
    entityType: 'Order' | 'Quote' | 'Invoice' | 'Cylinder' | 'Customer' | 'Payment' | 'Permission',
    entityName: string,
    platform: 'S&M',
    details?: string,
  ) => void;
  onLogoutToGateway?: () => void;
}

const NAVIGATION_AREAS: readonly NavigationArea[] = [
  { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home, routes: ['My Work', 'Team View', 'Client View', 'Alerts', 'Approvals', 'Master Calendar'] },
  { id: 'strategy', label: 'Strategy & Planning', shortLabel: 'Strategy', icon: Target, routes: ['Research', 'ICPs & Personas', 'Positioning', 'Product/Offer Strategy', 'Annual & Quarterly Plans', 'GTM Plans', 'Targets', 'KPIs', 'Budgets'] },
  { id: 'crm', label: 'CRM & Accounts', shortLabel: 'CRM', icon: Users, routes: ['Leads', 'Contacts', 'Accounts', 'Lead Capture', 'Scoring', 'Routing', 'Enrichment', 'Lists', 'Segments', 'Activity History'] },
  { id: 'sales-execution', label: 'Sales Execution', shortLabel: 'Sales', icon: BriefcaseBusiness, routes: ['Prospecting', 'Inbox', 'Sequences', 'Calls', 'Meetings', 'Pipeline', 'Opportunities', 'Account Plans', 'Pricing', 'Quotes', 'Proposals', 'Tenders', 'Contracts', 'E-signature', 'Forecasts', 'Quotas', 'Commissions', 'Handoffs'] },
  { id: 'campaigns', label: 'Campaigns', shortLabel: 'Campaigns', icon: Megaphone, routes: ['Campaign Portfolio', 'Briefs', 'Calendar', 'Audiences', 'Offers', 'Channels', 'Timelines', 'Dependencies', 'Budgets', 'Experiments', 'Retrospectives'] },
  { id: 'content-social', label: 'Content & Social', shortLabel: 'Content', icon: FileText, routes: ['Overview', 'Planning & Briefs', 'Production Pipeline', 'Content Calendar', 'Approvals', 'Asset Library', 'Social Publisher', 'Community Inbox', 'Social Listening', 'Performance', 'Module Settings'] },
  { id: 'paid-media', label: 'Paid Media', shortLabel: 'Paid Media', icon: Radio, routes: ['Media Plans', 'Campaigns', 'Audiences', 'Ads', 'Creative Testing', 'Budgets', 'Pacing', 'Optimisation', 'Conversion Tracking', 'Performance'] },
  { id: 'lifecycle', label: 'Lifecycle & Customer Growth', shortLabel: 'Lifecycle', icon: HeartHandshake, routes: ['Customer Profiles', 'Email', 'SMS', 'WhatsApp', 'Journeys', 'Automation', 'Consent', 'Deliverability', 'Onboarding', 'Support', 'Reviews', 'Loyalty', 'Referrals', 'Customer Health', 'Renewals', 'Upselling'] },
  { id: 'commerce', label: 'Commerce & Conversion', shortLabel: 'Commerce', icon: ShoppingCart, routes: ['Products', 'Catalogue', 'Offers', 'Promotions', 'Landing Pages', 'Forms', 'Funnels', 'Storefronts', 'Merchandising', 'Marketplaces', 'Feed Health', 'SEO/GEO', 'CRO', 'Order Signals'] },
  { id: 'partnerships', label: 'Creators & Partnerships', shortLabel: 'Partners', icon: Handshake, routes: ['Creator Discovery', 'Outreach', 'Negotiation', 'Influencers', 'UGC', 'Sponsorships', 'Affiliates', 'Channel Partners', 'PR & Media', 'Events', 'Agreements', 'Rights', 'Deliverables', 'Commissions', 'Payouts', 'Performance'] },
  { id: 'analytics', label: 'Analytics & Intelligence', shortLabel: 'Analytics', icon: BarChart3, routes: ['Sales Analytics', 'Marketing Analytics', 'Campaign Analytics', 'Content Analytics', 'Paid Media Analytics', 'Partnership Analytics', 'Customer Analytics', 'Attribution', 'ROI', 'LTV', 'Cohorts', 'Profitability', 'Competitor Intelligence', 'Forecasts', 'Reports', 'Tracking Health'] },
  { id: 'commercial-ops', label: 'Commercial Operations', shortLabel: 'Operations', icon: Workflow, routes: ['Clients & Brands', 'Onboarding', 'Service Scopes', 'Requests', 'Projects', 'Tasks', 'Workload', 'Deliverables', 'SLAs', 'QA', 'Central Approvals', 'Time', 'Costs', 'Client Reporting', 'Profitability', 'SOPs'] },
  { id: 'settings', label: 'Settings & Governance', shortLabel: 'Settings', icon: Settings, routes: ['Users', 'Roles', 'Permissions', 'Integrations', 'Workflow Automation', 'Fields', 'Taxonomies', 'Claims Rules', 'Consent', 'Privacy', 'Notifications', 'Audit', 'Security'] },
] as const;

const INITIAL_TASKS: TaskRecord[] = [
  { id: 'task-01', title: 'Approve Q3 pricing exception', owner: 'Aisha Bello', dueDate: '2026-08-12', status: 'Open' },
  { id: 'task-02', title: 'Review DELabs renewal sequence', owner: 'Marcus Hale', dueDate: '2026-08-14', status: 'In Progress' },
  { id: 'task-03', title: 'Publish industrial gases campaign brief', owner: 'Daniel Kerr', dueDate: '2026-08-16', status: 'Open' },
];

const INITIAL_LEADS: LeadRecord[] = [
  { id: 'lead-01', name: 'Amaka Nwosu', company: 'NigerDock Fabrication', owner: 'Marcus Hale', status: 'Qualified' },
  { id: 'lead-02', name: 'Tunde Balogun', company: 'Prime Process Systems', owner: 'Chris Allen', status: 'New' },
  { id: 'lead-03', name: 'Ella Thompson', company: 'North Sea Engineering', owner: 'Aisha Bello', status: 'Nurture' },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(value);

const groupRoutes = (routes: readonly string[]) => {
  const size = Math.ceil(routes.length / 3);
  const labels = ['Core workflows', 'Execution & delivery', 'Controls & reporting'];
  return labels.map((label, index) => ({ label, routes: routes.slice(index * size, (index + 1) * size) })).filter((group) => group.routes.length > 0);
};

export default function SalesMarketingPlatform({
  companies,
  deals,
  campaigns,
  approvals,
  auditLogs,
  initialArea = 'home',
  onUpdateDeals,
  onAddLog,
  onLogoutToGateway,
}: SalesMarketingPlatformProps) {
  const initial = NAVIGATION_AREAS.find((area) => area.id === initialArea) ?? NAVIGATION_AREAS[0];
  const [activeAreaId, setActiveAreaId] = useState(initial.id);
  const [activeRoute, setActiveRoute] = useState(initial.routes[0]);
  const [scopeMode, setScopeMode] = useState<'company' | 'group'>('company');
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('loaded');
  const [areaSearch, setAreaSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);
  const [leads, setLeads] = useState<LeadRecord[]>(INITIAL_LEADS);
  const [inspectedRecord, setInspectedRecord] = useState<InspectableRecord | null>(null);
  const [creationType, setCreationType] = useState<CreationType | null>(null);
  const [contentNotificationsOpen, setContentNotificationsOpen] = useState(false);
  const [creationForm, setCreationForm] = useState({ title: '', company: companies[0]?.name ?? '', owner: 'Aisha Bello', value: '', dueDate: '2026-08-31' });

  const activeArea = NAVIGATION_AREAS.find((area) => area.id === activeAreaId) ?? NAVIGATION_AREAS[0];
  const ActiveAreaIcon = activeArea.icon;
  const routeGroups = groupRoutes(activeArea.routes).map((group) => ({
    ...group,
    routes: group.routes.filter((route) => route.toLowerCase().includes(areaSearch.trim().toLowerCase())),
  })).filter((group) => group.routes.length > 0);

  const allRecords = useMemo<InspectableRecord[]>(() => {
    const accountRecords = companies.map((company) => ({
      id: company.id,
      kind: 'Account' as const,
      title: company.name,
      subtitle: company.industry,
      status: company.creditStatus,
      owner: company.accountOwner,
      value: formatMoney(company.availableCredit),
      details: [['Customer ID', company.customerNumber], ['Industry', company.industry], ['Payment terms', company.paymentTerms], ['Available credit', formatMoney(company.availableCredit)]],
    }));
    const dealRecords = deals.map((deal) => ({
      id: deal.id,
      kind: 'Deal' as const,
      title: deal.title,
      subtitle: deal.companyName,
      status: deal.stage,
      owner: deal.owner,
      value: formatMoney(deal.amount),
      date: deal.closeDate,
      details: [['Account', deal.companyName], ['Stage', deal.stage], ['Probability', `${deal.probability}%`], ['Expected close', deal.closeDate], ['Health', deal.health]],
    }));
    const campaignRecords = campaigns.map((campaign) => ({
      id: campaign.id,
      kind: 'Campaign' as const,
      title: campaign.name,
      subtitle: campaign.channel,
      status: campaign.status,
      owner: 'Aisha Bello',
      value: `${campaign.roi}% ROI`,
      details: [['Channel', campaign.channel], ['Objective', campaign.objective], ['Spend', formatMoney(campaign.spend)], ['Revenue', formatMoney(campaign.revenue)], ['MQLs', String(campaign.mqls)]],
    }));
    const taskRecords = tasks.map((task) => ({
      id: task.id,
      kind: 'Task' as const,
      title: task.title,
      subtitle: 'Commercial operations task',
      status: task.status,
      owner: task.owner,
      date: task.dueDate,
      details: [['Owner', task.owner], ['Due date', task.dueDate], ['Status', task.status]],
    }));
    const leadRecords = leads.map((lead) => ({
      id: lead.id,
      kind: 'Lead' as const,
      title: lead.name,
      subtitle: lead.company,
      status: lead.status,
      owner: lead.owner,
      details: [['Company', lead.company], ['Owner', lead.owner], ['Qualification', lead.status]],
    }));
    const auditRecords = auditLogs.slice(0, 8).map((log) => ({
      id: log.id,
      kind: 'Audit' as const,
      title: log.action,
      subtitle: log.entityName,
      status: log.platform,
      owner: log.user,
      date: log.timestamp,
      details: [['Entity', log.entityName], ['Actor', log.user], ['Timestamp', log.timestamp], ['Details', log.details ?? 'No additional detail']],
    }));
    return [...accountRecords, ...dealRecords, ...campaignRecords, ...taskRecords, ...leadRecords, ...auditRecords];
  }, [companies, deals, campaigns, tasks, leads, auditLogs]);

  const areaKinds: Record<string, InspectableRecord['kind'][]> = {
    home: ['Task', 'Deal', 'Campaign'], strategy: ['Task', 'Campaign'], crm: ['Lead', 'Account'],
    'sales-execution': ['Deal', 'Task'], campaigns: ['Campaign', 'Task'], 'content-social': ['Campaign', 'Task'],
    'paid-media': ['Campaign'], lifecycle: ['Account', 'Lead'], commerce: ['Campaign', 'Deal'],
    partnerships: ['Task', 'Campaign'], analytics: ['Deal', 'Campaign'], 'commercial-ops': ['Task', 'Account'], settings: ['Audit'],
  };
  const visibleRecords = allRecords.filter((record) => areaKinds[activeAreaId]?.includes(record.kind))
    .filter((record) => `${record.title} ${record.subtitle} ${record.owner} ${record.status}`.toLowerCase().includes(globalSearch.trim().toLowerCase()));

  const selectArea = (area: NavigationArea) => {
    setActiveAreaId(area.id);
    setActiveRoute(area.routes[0]);
    setAreaSearch('');
  };

  const submitCreation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!creationType || !creationForm.title.trim()) return;
    const createdAt = Date.now();
    if (creationType === 'deal') {
      const company = companies.find((item) => item.name === creationForm.company) ?? companies[0];
      if (!company) return;
      const newDeal: Deal = {
        id: `deal-${createdAt}`, title: creationForm.title, companyId: company.id, companyName: company.name,
        amount: Number(creationForm.value) || 0, stage: 'Prospecting', probability: 10, closeDate: creationForm.dueDate,
        owner: creationForm.owner, health: 'Needs Analysis', lastActivity: new Date().toISOString().slice(0, 10),
      };
      onUpdateDeals([newDeal, ...deals]);
      onAddLog('Deal Opportunity Created', 'Customer', newDeal.title, 'S&M', `Created for ${company.name} at ${formatMoney(newDeal.amount)}.`);
    } else if (creationType === 'task') {
      setTasks((current) => [{ id: `task-${createdAt}`, title: creationForm.title, owner: creationForm.owner, dueDate: creationForm.dueDate, status: 'Open' }, ...current]);
      onAddLog('Commercial Task Created', 'Permission', creationForm.title, 'S&M', `Assigned to ${creationForm.owner}.`);
    } else {
      setLeads((current) => [{ id: `lead-${createdAt}`, name: creationForm.title, company: creationForm.company, owner: creationForm.owner, status: 'New' }, ...current]);
      onAddLog('Lead Created', 'Customer', creationForm.title, 'S&M', `Lead captured for ${creationForm.company}.`);
    }
    setCreationType(null);
    setCreationForm((current) => ({ ...current, title: '', value: '' }));
  };

  return (
    <div className="sm-platform-v11 relative flex h-screen overflow-hidden bg-[#F7F9FC] font-sans text-[#172B4D]">
      <aside className="relative z-40 flex h-full w-16 shrink-0 flex-col items-center border-r border-[#082B5B] bg-[#061B3A] py-3" aria-label="Global Sales and Marketing navigation">
        <GlobalRailBrand onActivate={() => selectArea(NAVIGATION_AREAS[0])} label="Go to Sales and Marketing home" />
        <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Authoritative areas">
          {NAVIGATION_AREAS.map((area) => {
            const Icon = area.icon;
            const active = area.id === activeAreaId;
            return (
              <button key={area.id} type="button" onClick={() => selectArea(area)} className={`group relative grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all ${active ? 'bg-[#155EEF] text-white shadow-[0_0_16px_rgba(21,94,239,0.38)]' : 'text-[#91A9D2] hover:bg-[#082B5B] hover:text-sky-300'}`} aria-label={area.label} aria-current={active ? 'page' : undefined}>
                {active && <span className="absolute -left-2 h-5 w-1 rounded-r bg-amber-300" />}
                <Icon size={17} aria-hidden="true" />
                <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-[#061B3A] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-lg group-hover:block">{area.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#155EEF] text-[10px] font-bold text-white" aria-label="Aisha Bello, Marketing Lead">AB</div>
        {onLogoutToGateway && <button type="button" onClick={onLogoutToGateway} className="mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[#91A9D2] hover:bg-[#082B5B] hover:text-white" aria-label="Exit workspace"><X size={18} /></button>}
      </aside>

      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-[#082B5B] bg-[#0B3672] text-white lg:flex" aria-label={`${activeArea.label} routes`}>
        <ContextRailHeader area={activeArea} />
        <div className="border-b border-[#244D80] p-3">
          <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.1em] text-[#91A9D2]">Entity scope</p><p className="mt-1 text-[11px] font-semibold">DL · DELabs Ltd (UK Hub)</p></div><ShieldCheck size={16} className="text-sky-300" /></div>
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-[#31558B] bg-[#061B3A]/45 p-1">
            {(['company', 'group'] as const).map((mode) => <button key={mode} type="button" onClick={() => setScopeMode(mode)} className={`min-h-9 rounded-md text-[10px] font-bold capitalize ${scopeMode === mode ? 'bg-[#155EEF] text-white' : 'text-[#91A9D2] hover:text-white'}`}>{mode}</button>)}
          </div>
        </div>
        <div className="border-b border-[#244D80] p-3"><label className="relative block"><span className="sr-only">Search this area</span><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91A9D2]" /><input value={areaSearch} onChange={(event) => setAreaSearch(event.target.value)} placeholder="Search this area" className="min-h-10 w-full rounded-lg border border-[#31558B] bg-[#061B3A]/45 pl-9 pr-8 text-xs text-white placeholder:text-[#91A9D2] focus:border-[#155EEF]" />{areaSearch && <button type="button" onClick={() => setAreaSearch('')} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-[#91A9D2] hover:text-white" aria-label="Clear area search"><X size={13} /></button>}</label></div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label={`${activeArea.label} submenu`}>
          {routeGroups.length === 0 ? <p className="p-4 text-center text-xs text-[#91A9D2]">No routes match this search.</p> : routeGroups.map((group) => <div key={group.label} className="mb-5"><p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#7E9AC2]">{group.label}</p><div className="space-y-1">{group.routes.map((route) => <button key={route} type="button" onClick={() => setActiveRoute(route)} className={`relative flex min-h-10 w-full items-center rounded-lg border-l-4 px-3 text-left text-[11px] transition ${activeRoute === route ? 'border-amber-300 bg-gradient-to-r from-[#155EEF] to-[#2970FF] font-bold text-white' : 'border-transparent text-[#C0D0E7] hover:translate-x-1 hover:border-sky-400 hover:bg-[#082B5B] hover:text-white'}`}>{route}{activeRoute === route && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-amber-300" />}</button>)}</div></div>)}
        </nav>
        <div className="border-t border-[#244D80] p-3"><div className="rounded-xl bg-[#061B3A]/55 p-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#155EEF] text-[10px] font-bold">AB</span><div><p className="text-[11px] font-bold text-white">Aisha Bello</p><p className="mt-0.5 text-[9px] text-[#91A9D2]">Marketing Lead</p></div></div></div></div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F9FC]">
        <COSLogoWatermark />
        <header className="cos-global-topbar relative z-10 flex shrink-0 items-center justify-between gap-3 px-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-md"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7A90]" /><input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search accounts, deals, tasks, campaigns..." className="min-h-10 w-full rounded-lg border border-[#D9E0EA] bg-[#F7F9FC] pl-9 pr-3 text-xs focus:border-[#155EEF]" /></div>
          <div className="hidden items-center gap-2 xl:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-emerald-700">Audit Stream Live</span></div>
          <div className="hidden items-center gap-1 rounded-lg border border-[#D9E0EA] bg-[#F7F9FC] p-1 md:flex" aria-label="Workspace state simulator">{(['loaded', 'empty', 'loading', 'error', 'restricted'] as const).map((state) => <button key={state} type="button" onClick={() => setWorkspaceState(state)} className={`min-h-8 rounded-md px-2 text-[9px] font-bold uppercase ${workspaceState === state ? 'bg-[#155EEF] text-white' : 'text-[#65758B] hover:bg-white'}`}>{state}</button>)}</div>
          <button type="button" onClick={() => activeAreaId === 'content-social' ? setContentNotificationsOpen(true) : setInspectedRecord(allRecords.find((record) => record.kind === 'Audit') ?? null)} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#D9E0EA] text-[#52617A] hover:border-[#155EEF] hover:text-[#155EEF]" aria-label="Notifications"><Bell size={16} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" /></button>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          {activeAreaId === 'content-social' && (
            <ContentSocialModule
              activeRoute={activeRoute}
              globalSearch={globalSearch}
              forcedState={workspaceState}
              scopeMode={scopeMode}
              notificationOpen={contentNotificationsOpen}
              onNotificationClose={() => setContentNotificationsOpen(false)}
              onRouteChange={setActiveRoute}
            />
          )}
          {activeAreaId !== 'content-social' && <>
          {workspaceState === 'loading' && <StatePanel icon={RefreshCw} title="Loading governed workspace" detail="Synchronising entity records, permissions, and audit context." spinning />}
          {workspaceState === 'empty' && <StatePanel icon={Sparkles} title="No records in this view" detail={`Create the first record for ${activeArea.label} · ${activeRoute}.`} action={() => setCreationType('task')} actionLabel="Create a task" />}
          {workspaceState === 'error' && <StatePanel icon={AlertTriangle} title="Workspace data could not be reconciled" detail="Trace COS-SM-11F2 · No records were changed. Retry the governed query." action={() => setWorkspaceState('loaded')} actionLabel="Retry" danger />}
          {workspaceState === 'restricted' && <StatePanel icon={LockKeyhole} title="Restricted commercial view" detail="Your current DELabs scope masks this dataset. Request elevated access from Settings & Governance." action={() => { setActiveAreaId('settings'); setActiveRoute('Permissions'); setWorkspaceState('loaded'); }} actionLabel="Open permissions" />}
          {workspaceState === 'loaded' && (
            <div className="mx-auto max-w-[1500px] space-y-5">
              <PageTitleBar
                eyebrow={<span className="flex items-center gap-2"><ActiveAreaIcon size={14} />{activeArea.label}<ChevronRight size={12} /><span>{activeRoute}</span></span>}
                title={activeRoute}
                subtitle={<>DELabs Ltd · {scopeMode === 'company' ? 'Company' : 'Group'} scope · governed commercial workspace</>}
                actions={<><CreateButton icon={BriefcaseBusiness} label="New deal" onClick={() => setCreationType('deal')} /><CreateButton icon={ListTodo} label="New task" onClick={() => setCreationType('task')} /><CreateButton icon={UserPlus} label="New lead" primary onClick={() => setCreationType('lead')} /></>}
              />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Open pipeline" value={formatMoney(deals.filter((deal) => deal.stage !== 'Closed Won').reduce((sum, deal) => sum + deal.amount, 0))} note={`${deals.length} governed opportunities`} icon={TrendingUp} />
                <MetricCard label="Active campaigns" value={String(campaigns.filter((campaign) => campaign.status === 'Active').length)} note={`${campaigns.reduce((sum, campaign) => sum + campaign.mqls, 0)} marketing-qualified leads`} icon={Megaphone} />
                <MetricCard label="Open tasks" value={String(tasks.filter((task) => task.status !== 'Complete').length)} note="Across sales and marketing" icon={ClipboardCheck} />
                <MetricCard label="Pending approvals" value={String(approvals.filter((approval) => approval.status === 'Pending').length)} note="Central authority queue" icon={ShieldCheck} warning />
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <section className="overflow-hidden rounded-2xl border border-[#D9E0EA] bg-white shadow-2xs" data-card-ignore>
                  <SectionTitleBar title="Live records" detail={`Records relevant to ${activeArea.shortLabel}`} action={<span className="font-mono text-[10px] text-[#74839A]">{visibleRecords.length} ITEMS</span>} />
                  <div className="divide-y divide-[#E8ECF2]">{visibleRecords.slice(0, 10).map((record) => <button key={`${record.kind}-${record.id}`} type="button" onClick={() => setInspectedRecord(record)} className="grid min-h-[72px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F4F7FC] sm:grid-cols-[90px_minmax(0,1fr)_130px_110px_auto] sm:px-5"><span className="hidden text-[9px] font-bold uppercase tracking-[0.08em] text-[#155EEF] sm:block">{record.kind}</span><span className="min-w-0"><span className="block truncate text-xs font-bold text-[#172B4D]">{record.title}</span><span className="mt-1 block truncate text-[11px] text-[#74839A]">{record.subtitle}</span></span><span className="hidden truncate text-[11px] text-[#52617A] sm:block">{record.owner}</span><span className="hidden font-mono text-[10px] text-[#172B4D] sm:block">{record.value ?? record.date ?? '—'}</span><span className="rounded-md bg-[#EEF3FB] px-2 py-1 text-[9px] font-bold text-[#155EEF]">{record.status}</span></button>)}{visibleRecords.length === 0 && <div className="p-10 text-center"><Search className="mx-auto text-[#9AA8BA]" size={24} /><p className="mt-3 text-sm font-bold text-[#172B4D]">No matching records</p><button type="button" onClick={() => setGlobalSearch('')} className="mt-2 text-xs font-semibold text-[#155EEF]">Clear search</button></div>}</div>
                </section>

                <aside className="space-y-4">
                  <section className="rounded-2xl border border-[#D9E0EA] bg-white p-5 shadow-2xs"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Operating pulse</h2><Activity size={17} className="text-[#155EEF]" /></div><div className="mt-5 space-y-4"><PulseRow label="Pipeline coverage" value="72%" width="72%" /><PulseRow label="Campaign delivery" value="84%" width="84%" /><PulseRow label="Consent health" value="96%" width="96%" /></div></section>
                  <section className="rounded-2xl border border-[#D9E0EA] bg-[#061B3A] p-5 text-white shadow-2xs"><div className="flex items-center gap-2"><CircleDollarSign size={17} className="text-sky-300" /><h2 className="text-sm font-bold text-white">Commercial signal</h2></div><p className="mt-4 text-2xl font-extrabold text-white">{campaigns.length ? `${Math.round(campaigns.reduce((sum, campaign) => sum + campaign.roi, 0) / campaigns.length)}%` : '0%'}</p><p className="mt-1 text-xs leading-5 text-[#B8CAE2]">Average recorded campaign ROI across the active entity scope.</p><button type="button" onClick={() => { setActiveAreaId('analytics'); setActiveRoute('ROI'); }} className="mt-5 flex min-h-10 w-full items-center justify-center rounded-lg bg-[#155EEF] text-xs font-bold hover:bg-[#004EEB]">Inspect ROI</button></section>
                </aside>
              </div>
            </div>
          )}
          </>}
        </main>
      </section>

      {inspectedRecord && <RecordInspector record={inspectedRecord} onClose={() => setInspectedRecord(null)} />}
      {creationType && <CreationModal type={creationType} form={creationForm} companies={companies} onChange={setCreationForm} onClose={() => setCreationType(null)} onSubmit={submitCreation} />}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, warning = false }: { label: string; value: string; note: string; icon: LucideIcon; warning?: boolean }) {
  return <article className="rounded-2xl border border-[#D9E0EA] bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155EEF]/60 hover:shadow-md"><div className="flex items-start justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#74839A]">{label}</p><span className={`grid h-8 w-8 place-items-center rounded-lg ${warning ? 'bg-amber-50 text-amber-700' : 'bg-[#EEF3FB] text-[#155EEF]'}`}><Icon size={16} /></span></div><p className="mt-3 font-mono text-2xl font-semibold text-[#172B4D]">{value}</p><p className="mt-2 text-[11px] text-[#74839A]">{note}</p></article>;
}

function PulseRow({ label, value, width }: { label: string; value: string; width: string }) {
  return <div><div className="mb-2 flex justify-between text-[11px]"><span className="text-[#52617A]">{label}</span><span className="font-mono font-semibold text-[#172B4D]">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#E8EDF4]"><div className="h-full rounded-full bg-[#155EEF]" style={{ width }} /></div></div>;
}

function CreateButton({ icon: Icon, label, onClick, primary = false }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${primary ? 'border-[#155EEF] bg-[#155EEF] text-white hover:bg-[#004EEB]' : 'border-[#D4DBE6] bg-white text-[#34445E] hover:border-[#155EEF] hover:text-[#155EEF]'}`}><Icon size={14} />{label}</button>;
}

function StatePanel({ icon: Icon, title, detail, action, actionLabel, spinning = false, danger = false }: { icon: LucideIcon; title: string; detail: string; action?: () => void; actionLabel?: string; spinning?: boolean; danger?: boolean }) {
  return <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-[#D9E0EA] bg-white p-10 text-center shadow-2xs"><span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl ${danger ? 'bg-red-50 text-red-600' : 'bg-[#EEF3FB] text-[#155EEF]'}`}><Icon size={22} className={spinning ? 'animate-spin' : ''} /></span><h1 className="mt-5 text-xl font-bold">{title}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74839A]">{detail}</p>{action && <button type="button" onClick={action} className={`mt-6 min-h-10 rounded-lg px-4 text-xs font-bold text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#155EEF] hover:bg-[#004EEB]'}`}>{actionLabel}</button>}</div>;
}

function RecordInspector({ record, onClose }: { record: InspectableRecord; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] flex justify-end bg-[#061B3A]/35" role="dialog" aria-modal="true" aria-label={`${record.kind} inspector`}><button type="button" className="flex-1 cursor-default" onClick={onClose} aria-label="Close inspector" /><aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#D9E0EA] p-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#155EEF]">{record.kind} inspector</p><h2 className="mt-2 text-lg font-bold">{record.title}</h2><p className="mt-1 text-xs text-[#74839A]">{record.subtitle}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg text-[#52617A] hover:bg-[#F1F4F8]" aria-label="Close inspector"><X size={17} /></button></header><div className="flex-1 overflow-y-auto p-5"><div className="flex items-center justify-between rounded-xl border border-[#D9E0EA] bg-[#F7F9FC] p-4"><span className="text-xs font-semibold text-[#52617A]">Current status</span><span className="rounded-md bg-[#EEF3FB] px-2.5 py-1 text-[10px] font-bold text-[#155EEF]">{record.status}</span></div><dl className="mt-6 divide-y divide-[#E6EBF1] border-y border-[#E6EBF1]">{record.details.map(([label, value]) => <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-4"><dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8491A4]">{label}</dt><dd className="text-xs font-semibold text-[#263750]">{value}</dd></div>)}</dl><div className="mt-6 rounded-xl border-l-4 border-[#155EEF] bg-[#EEF3FB] p-4"><p className="text-xs font-bold text-[#172B4D]">Governed inspection</p><p className="mt-1 text-[11px] leading-5 text-[#65758B]">Opening this record is read-only. Any subsequent change is written to the COS audit stream.</p></div></div></aside></div>;
}

function CreationModal({ type, form, companies, onChange, onClose, onSubmit }: { type: CreationType; form: { title: string; company: string; owner: string; value: string; dueDate: string }; companies: Company[]; onChange: React.Dispatch<React.SetStateAction<{ title: string; company: string; owner: string; value: string; dueDate: string }>>; onClose: () => void; onSubmit: (event: React.FormEvent) => void }) {
  const titles = { deal: 'Create deal opportunity', task: 'Create commercial task', lead: 'Capture new lead' };
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-[#061B3A]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="creation-title"><form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-[#D9E0EA] bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#D9E0EA] p-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#155EEF]">Live creation workflow</p><h2 id="creation-title" className="mt-2 text-lg font-bold">{titles[type]}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg text-[#52617A] hover:bg-[#F1F4F8]" aria-label="Close creation modal"><X size={17} /></button></header><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="sm:col-span-2 text-xs font-semibold">{type === 'lead' ? 'Lead name' : type === 'deal' ? 'Opportunity name' : 'Task title'}<input required autoFocus value={form.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] px-3 text-xs focus:border-[#155EEF]" /></label><label className="text-xs font-semibold">Company<select value={form.company} onChange={(event) => onChange((current) => ({ ...current, company: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] px-3 text-xs">{companies.map((company) => <option key={company.id}>{company.name}</option>)}</select></label><label className="text-xs font-semibold">Owner<select value={form.owner} onChange={(event) => onChange((current) => ({ ...current, owner: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] px-3 text-xs"><option>Aisha Bello</option><option>Marcus Hale</option><option>Chris Allen</option><option>Daniel Kerr</option></select></label>{type === 'deal' && <label className="text-xs font-semibold">Opportunity value (NGN)<input type="number" min="0" value={form.value} onChange={(event) => onChange((current) => ({ ...current, value: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] px-3 font-mono text-xs" /></label>}<label className="text-xs font-semibold">{type === 'lead' ? 'Review date' : 'Due / close date'}<input type="date" value={form.dueDate} onChange={(event) => onChange((current) => ({ ...current, dueDate: event.target.value }))} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] px-3 font-mono text-xs" /></label></div><footer className="flex justify-end gap-2 border-t border-[#D9E0EA] p-5"><button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-[#CBD5E2] px-4 text-xs font-bold text-[#52617A]">Cancel</button><button type="submit" className="min-h-10 rounded-lg bg-[#155EEF] px-4 text-xs font-bold text-white hover:bg-[#004EEB]">Create {type}</button></footer></form></div>;
}
