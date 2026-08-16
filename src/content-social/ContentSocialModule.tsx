import { useMemo, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Inbox,
  Library,
  Link2,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { ZodError } from 'zod';
import { allowedTransitions, can, formatLifecycle, searchState } from './domain';
import {
  EXCEPTION_FLAGS,
  LIFECYCLE_STATES,
  type AssetInput,
  type BriefInput,
  type CommunityInput,
  type ContentApproval,
  type ContentItem,
  type ContentPriority,
  type IdeaInput,
  type LifecycleState,
  type ListeningInput,
  type MetricInput,
  type PublishInput,
  type ScheduleInput,
  type ScopeContext,
  type VersionInput,
} from './model';
import { DELABS_SCOPE } from './seed';
import { useContentSocial } from './useContentSocial';
import { PageTitleBar, SectionTitleBar } from '../components/Typography';

type WorkspaceState = 'loaded' | 'empty' | 'loading' | 'error' | 'restricted';
type ModalType = 'idea' | 'brief' | 'version' | 'schedule' | 'publish' | 'asset' | 'community' | 'listening' | 'metric' | null;

export const CONTENT_SOCIAL_ROUTES = ['Overview', 'Planning & Briefs', 'Production Pipeline', 'Content Calendar', 'Approvals', 'Asset Library', 'Social Publisher', 'Community Inbox', 'Social Listening', 'Performance', 'Module Settings'] as const;

interface ContentSocialModuleProps {
  activeRoute: string;
  globalSearch: string;
  forcedState?: WorkspaceState;
  scopeMode: 'company' | 'group';
  notificationOpen: boolean;
  onNotificationClose: () => void;
  onRouteChange: (route: string) => void;
}

const defaultBrief: BriefInput = { title: '', objective: '', audience: '', keyMessage: '', callToAction: '', owner: 'Aisha Bello', dueDate: '2026-08-31', channels: ['LinkedIn'], formats: ['Short video'] };
const defaultIdea: IdeaInput = { title: '', summary: '', source: 'Planning session', owner: 'Aisha Bello', priority: 'MEDIUM' };
const defaultVersion: VersionInput = { copy: '', changeSummary: '', externalAssetUrl: '' };
const defaultSchedule: ScheduleInput = { plannedAt: '2026-08-20T10:00', timezone: 'Europe/London' };
const defaultPublish: PublishInput = { externalUrl: '', publishedAt: '2026-08-20T10:05', proofNote: '' };
const defaultAsset: AssetInput = { name: '', sourceUrl: '', owner: 'Aisha Bello', sourceProvider: 'Drive', type: 'IMAGE' };
const defaultCommunity: CommunityInput = { channel: 'LinkedIn', externalThreadUrl: '', contactName: '', summary: '', owner: 'Aisha Bello', classification: 'ENQUIRY', priority: 'MEDIUM' };
const defaultListening: ListeningInput = { channel: 'LinkedIn', sourceUrl: '', topic: '', summary: '', owner: 'Aisha Bello', severity: 'MEDIUM', sentiment: 'NEUTRAL' };
const defaultMetric: MetricInput = { contentItemId: '', channel: 'LinkedIn', metric: 'IMPRESSIONS', value: 0, periodStart: '2026-08-01', periodEnd: '2026-08-13', sourceType: 'MANUAL', sourceReference: '' };

const statusTone: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200', PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200', VALID: 'bg-emerald-50 text-emerald-700 border-emerald-200', RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200', EXPIRING: 'bg-amber-50 text-amber-800 border-amber-200', HIGH: 'bg-amber-50 text-amber-800 border-amber-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200', FAILED: 'bg-red-50 text-red-700 border-red-200', QUARANTINED: 'bg-red-50 text-red-700 border-red-200', EXPIRED: 'bg-red-50 text-red-700 border-red-200', STALE: 'bg-red-50 text-red-700 border-red-200',
};

function cx(...values: Array<string | false | undefined | null>): string { return values.filter(Boolean).join(' '); }

function errorMessage(error: unknown): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? 'Check the highlighted information.';
  return error instanceof Error ? error.message : 'The action could not be completed.';
}

export default function ContentSocialModule({ activeRoute, globalSearch, forcedState = 'loaded', scopeMode, notificationOpen, onNotificationClose, onRouteChange }: ContentSocialModuleProps) {
  const scope: ScopeContext = DELABS_SCOPE;
  const module = useContentSocial(scope);
  const { state, session, actions } = module;
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [approvalLink, setApprovalLink] = useState<string | undefined>();
  const [decisionComment, setDecisionComment] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [forms, setForms] = useState({ idea: defaultIdea, brief: defaultBrief, version: defaultVersion, schedule: defaultSchedule, publish: defaultPublish, asset: defaultAsset, community: defaultCommunity, listening: defaultListening, metric: defaultMetric });

  const effectiveState: WorkspaceState = module.status === 'loaded' ? forcedState : module.status;
  const selectedItem = state.contentItems.find((item) => item.id === selectedItemId) ?? null;
  const searchResults = useMemo(() => searchState(state, globalSearch), [globalSearch, state]);
  const unreadNotifications = state.notifications.filter((notification) => !notification.readAt);

  const run = async (work: () => Promise<unknown>, message: string) => {
    setFormError(undefined);
    setSuccess(undefined);
    try {
      await work();
      setSuccess(message);
      setModal(null);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  const openForItem = (type: ModalType, itemId: string) => {
    setSelectedItemId(itemId);
    setFormError(undefined);
    setModal(type);
  };

  const createApprovalLink = async (approvalId: string) => {
    setFormError(undefined);
    try {
      const link = await actions.issueApprovalLink(approvalId);
      setApprovalLink(link);
      if (navigator.clipboard) await navigator.clipboard.writeText(link);
      setSuccess('A seven-day client approval link was created and copied. Creating another link revokes this one.');
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  if (effectiveState === 'restricted') {
    return <SignInPanel
      detail={module.error ?? 'Sign in with an invited account that has a DELabs Content & Social membership.'}
      credentials={credentials}
      busy={module.mutating}
      onChange={setCredentials}
      onSubmit={() => void run(() => module.signIn(credentials.email, credentials.password), 'Signed in successfully.')}
    />;
  }

  if (effectiveState !== 'loaded') {
    const panels: Record<Exclude<WorkspaceState, 'loaded'>, { icon: LucideIcon; title: string; detail: string; action?: () => void; label?: string }> = {
      loading: { icon: LoaderCircle, title: 'Loading Content & Social', detail: 'Resolving your DELabs scope, permissions, workflow records, and audit context.' },
      empty: { icon: Sparkles, title: 'No records in this view', detail: 'Start with a governed content idea or brief.', action: () => setModal('idea'), label: 'Create an idea' },
      error: { icon: AlertTriangle, title: 'Content & Social could not be loaded', detail: module.error ?? 'No records were changed. Retry the scoped query.', action: module.reload, label: 'Retry' },
      restricted: { icon: LockKeyhole, title: 'Restricted Content & Social scope', detail: module.error ?? 'Your account does not have a membership for this DELabs brand.' },
    };
    const panel = panels[effectiveState];
    return <StatePanel {...panel} spinning={effectiveState === 'loading'} />;
  }

  return (
    <div className="content-social-module mx-auto w-full max-w-[1500px] space-y-5">
      <div className="lg:hidden">
        <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#68778D]">Content & Social area
          <select value={activeRoute} onChange={(event) => onRouteChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#CBD5E2] bg-white px-3 text-sm text-[#172B4D]">
            {CONTENT_SOCIAL_ROUTES.map((route) => <option key={route}>{route}</option>)}
          </select>
        </label>
      </div>

      {module.warning && <InlineNotice tone="warning" title="Persistence mode" detail={module.warning} />}
      {module.error && <InlineNotice tone="danger" title="Save failed" detail={module.error} />}
      {success && <InlineNotice tone="success" title="Change recorded" detail={success} onDismiss={() => setSuccess(undefined)} />}
      {approvalLink && <InlineNotice tone="success" title="Secure client link" detail={approvalLink} onDismiss={() => setApprovalLink(undefined)} />}
      {module.mutating && <div className="fixed bottom-5 right-5 z-[85] flex items-center gap-2 rounded-lg bg-[#061B3A] px-4 py-3 text-xs font-semibold text-white shadow-xl"><LoaderCircle size={15} className="animate-spin" />Saving governed change…</div>}

      {globalSearch.trim() && <SearchResults results={searchResults} onOpen={(result) => { if (result.kind === 'Content') setSelectedItemId(result.id); }} />}

      {!globalSearch.trim() && activeRoute === 'Overview' && <OverviewView state={state} onRouteChange={onRouteChange} onInspect={setSelectedItemId} />}
      {!globalSearch.trim() && activeRoute === 'Planning & Briefs' && <PlanningView state={state} onNewIdea={() => setModal('idea')} onNewBrief={() => setModal('brief')} onConvert={(id) => void run(() => actions.convertIdea(id), 'Idea converted to a governed draft brief.')} onBriefStatus={(id, status) => void run(() => actions.setBriefStatus(id, status), `Brief moved to ${status}.`)} onCreateContent={(id) => void run(() => actions.createContentFromBrief(id), 'Production work created from the approved brief.')} />}
      {!globalSearch.trim() && activeRoute === 'Production Pipeline' && <PipelineView state={state} onInspect={setSelectedItemId} />}
      {!globalSearch.trim() && activeRoute === 'Content Calendar' && <CalendarView state={state} onSchedule={(id) => openForItem('schedule', id)} />}
      {!globalSearch.trim() && activeRoute === 'Approvals' && <ApprovalsView approvals={state.approvals} canDecide={session ? can(session.role, 'approval.decide') : false} canShare={session ? can(session.role, 'approval.request') : false} decisionComment={decisionComment} onComment={setDecisionComment} onShare={(id) => void createApprovalLink(id)} onDecide={(id, action) => void run(() => actions.decideApproval(id, action, decisionComment), `Approval decision ${action.toLowerCase()} was recorded against the exact version.`)} />}
      {!globalSearch.trim() && activeRoute === 'Asset Library' && <AssetView state={state} onAdd={() => setModal('asset')} onRights={(id, status) => void run(() => actions.setAssetRights(id, status), `Asset rights set to ${status}.`)} />}
      {!globalSearch.trim() && activeRoute === 'Social Publisher' && <PublisherView state={state} onPublish={(scheduleId) => { setSelectedScheduleId(scheduleId); setFormError(undefined); setModal('publish'); }} />}
      {!globalSearch.trim() && activeRoute === 'Community Inbox' && <CommunityView state={state} onAdd={() => setModal('community')} onStatus={(id, status) => void run(() => actions.updateCommunityStatus(id, status), `Community record moved to ${status}.`)} />}
      {!globalSearch.trim() && activeRoute === 'Social Listening' && <ListeningView state={state} onAdd={() => setModal('listening')} onConvert={(id) => void run(() => actions.convertListeningSignal(id), 'Listening signal converted to a traceable content idea.')} />}
      {!globalSearch.trim() && activeRoute === 'Performance' && <PerformanceView state={state} onAdd={() => setModal('metric')} />}
      {!globalSearch.trim() && activeRoute === 'Module Settings' && <SettingsView state={state} session={session} scopeMode={scopeMode} onReset={() => void run(module.resetDemo, 'Development demo data restored.')} />}

      {selectedItem && <ContentInspector item={selectedItem} state={state} onClose={() => setSelectedItemId(null)} onTransition={(target) => void run(() => actions.transitionContent(selectedItem.id, target), `Content moved to ${formatLifecycle(target)}.`)} onVersion={() => openForItem('version', selectedItem.id)} onApproval={() => void run(() => actions.requestApproval(selectedItem.id), 'Approval request created for the exact current version.')} onSchedule={() => openForItem('schedule', selectedItem.id)} />}

      {notificationOpen && <NotificationDrawer notifications={state.notifications} onClose={onNotificationClose} onRead={(id) => void actions.markNotificationRead(id)} />}

      {modal && <ActionModal title={modalTitle(modal)} onClose={() => { setModal(null); setFormError(undefined); }} error={formError}>
        {modal === 'idea' && <IdeaForm value={forms.idea} onChange={(idea) => setForms((current) => ({ ...current, idea }))} onSubmit={() => void run(() => actions.createIdea(forms.idea), 'Content idea created.')} />}
        {modal === 'brief' && <BriefForm value={forms.brief} onChange={(brief) => setForms((current) => ({ ...current, brief }))} onSubmit={() => void run(() => actions.createBrief(forms.brief), 'Draft brief created.')} />}
        {modal === 'version' && selectedItem && <VersionForm value={forms.version} onChange={(version) => setForms((current) => ({ ...current, version }))} onSubmit={() => void run(() => actions.createVersion(selectedItem.id, forms.version), 'Immutable content version created; superseded approvals are stale.')} />}
        {modal === 'schedule' && selectedItem && <ScheduleForm value={forms.schedule} onChange={(schedule) => setForms((current) => ({ ...current, schedule }))} onSubmit={() => void run(() => actions.scheduleContent(selectedItem.id, forms.schedule), 'Approved version added to the manual publishing queue.')} />}
        {modal === 'publish' && selectedScheduleId && <PublishForm value={forms.publish} onChange={(publish) => setForms((current) => ({ ...current, publish }))} onSubmit={() => void run(() => actions.confirmManualPublish(selectedScheduleId, forms.publish), 'Manual publication proof recorded and lifecycle updated.')} />}
        {modal === 'asset' && <AssetForm value={forms.asset} onChange={(asset) => setForms((current) => ({ ...current, asset }))} onSubmit={() => void run(() => actions.addAsset(forms.asset), 'External asset linked; rights verification remains required.')} />}
        {modal === 'community' && <CommunityForm value={forms.community} onChange={(community) => setForms((current) => ({ ...current, community }))} onSubmit={() => void run(() => actions.addCommunityRecord(forms.community), 'Community record captured with source evidence.')} />}
        {modal === 'listening' && <ListeningForm value={forms.listening} onChange={(listening) => setForms((current) => ({ ...current, listening }))} onSubmit={() => void run(() => actions.addListeningSignal(forms.listening), 'Listening signal captured.')} />}
        {modal === 'metric' && <MetricForm value={{ ...forms.metric, contentItemId: forms.metric.contentItemId || state.contentItems[0]?.id || '' }} items={state.contentItems} onChange={(metric) => setForms((current) => ({ ...current, metric }))} onSubmit={() => void run(() => actions.addMetric({ ...forms.metric, contentItemId: forms.metric.contentItemId || state.contentItems[0]?.id || '' }), 'Sourced metric recorded.')} />}
      </ActionModal>}
    </div>
  );
}

function OverviewView({ state, onRouteChange, onInspect }: { state: ReturnType<typeof useContentSocial>['state']; onRouteChange: (route: string) => void; onInspect: (id: string) => void }) {
  const pending = state.approvals.filter((item) => item.status === 'PENDING');
  const overdue = state.contentItems.filter((item) => new Date(item.dueDate) < new Date('2026-08-13') && !['PUBLISHED', 'ARCHIVED', 'CANCELLED'].includes(item.lifecycleState));
  const scheduled = state.schedules.filter((item) => item.status === 'READY');
  const published = state.publishRecords.filter((item) => item.status === 'PUBLISHED');
  const owners = [...new Set(state.contentItems.map((item) => item.owner))];
  return <>
    <PageHeading eyebrow="Command centre" title="Content operations at a glance" detail="One governed view of DELabs planning, production, approval, publishing, response, and learning." actions={<button className="cs-button-primary" onClick={() => onRouteChange('Planning & Briefs')}><Plus size={15} />Plan content</button>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Active production" value={String(state.contentItems.filter((item) => ['ASSIGNED', 'IN_PRODUCTION', 'INTERNAL_REVIEW'].includes(item.lifecycleState)).length)} note="Assigned through internal review" icon={ClipboardCheck} />
      <MetricCard label="Awaiting approval" value={String(pending.length)} note="Exact-version decisions" icon={ShieldCheck} tone="amber" />
      <MetricCard label="Ready to publish" value={String(scheduled.length)} note="Manual evidence queue" icon={Send} />
      <MetricCard label="Published with proof" value={String(published.length)} note="Verified external records" icon={CheckCircle2} tone="green" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
      <Surface title="Attention queue" detail="Items that need an owner or a decision" action={<button className="cs-link" onClick={() => onRouteChange('Production Pipeline')}>Open pipeline <ArrowRight size={13} /></button>}>
        <div className="divide-y divide-[#E8EDF4]">
          {[...overdue, ...state.contentItems.filter((item) => item.exceptions.length > 0)].filter((item, index, all) => all.findIndex((match) => match.id === item.id) === index).slice(0, 5).map((item) => <button key={item.id} onClick={() => onInspect(item.id)} className="cs-record-row"><div><p className="font-semibold text-[#172B4D]">{item.title}</p><p className="mt-1 text-[11px] text-[#74839A]">{item.contentNumber} · {item.owner}</p></div><Status value={item.exceptions[0]?.flag ?? 'OVERDUE'} /></button>)}
          {overdue.length === 0 && <EmptyInline label="No overdue or exception work." />}
        </div>
      </Surface>
      <Surface title="Team workload" detail="Open items by accountable owner">
        <div className="space-y-4 p-5">{owners.map((owner) => { const count = state.contentItems.filter((item) => item.owner === owner && !['PUBLISHED', 'ARCHIVED', 'CANCELLED'].includes(item.lifecycleState)).length; return <div key={owner}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-[#34445E]">{owner}</span><span className="font-tabular-nums text-[#65758B]">{count} open</span></div><div className="h-1.5 rounded-full bg-[#E8EDF4]"><div className="h-full rounded-full bg-[#155EEF]" style={{ width: `${Math.min(100, count * 24)}%` }} /></div></div>; })}</div>
      </Surface>
    </div>
    <Surface title="Upcoming publication register" detail="Scheduled records do not become Published without proof" action={<button className="cs-link" onClick={() => onRouteChange('Social Publisher')}>Open publisher <ArrowRight size={13} /></button>}>
      <RecordTable headers={['Planned', 'Content', 'Channel', 'Method', 'Status']} rows={state.schedules.slice(0, 5).map((schedule) => { const item = state.contentItems.find((content) => content.id === schedule.contentItemId); return [formatDateTime(schedule.plannedAt), item?.title ?? 'Unknown content', schedule.channel, schedule.publishMethod, <Status value={schedule.status} />]; })} />
    </Surface>
  </>;
}

function PlanningView({ state, onNewIdea, onNewBrief, onConvert, onBriefStatus, onCreateContent }: { state: ReturnType<typeof useContentSocial>['state']; onNewIdea: () => void; onNewBrief: () => void; onConvert: (id: string) => void; onBriefStatus: (id: string, status: 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED') => void; onCreateContent: (id: string) => void }) {
  return <>
    <PageHeading eyebrow="Planning & briefs" title="Turn evidence into production-ready work" detail="Capture the source, agree the objective, and approve requirements before production begins." actions={<><button className="cs-button-secondary" onClick={onNewIdea}><Sparkles size={15} />New idea</button><button className="cs-button-primary" onClick={onNewBrief}><Plus size={15} />New brief</button></>} />
    <div className="grid gap-5 xl:grid-cols-2">
      <Surface title="Idea register" detail="Source-backed opportunities before commitment"><div className="divide-y divide-[#E8EDF4]">{state.ideas.map((idea) => <article key={idea.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{idea.title}</h3><p className="mt-2 text-xs leading-5 text-[#65758B]">{idea.summary}</p></div><Status value={idea.priority} /></div><div className="mt-4 flex items-center justify-between text-[10px] text-[#74839A]"><span>{idea.source} · {idea.owner}</span>{idea.status === 'OPEN' ? <button className="cs-link" onClick={() => onConvert(idea.id)}>Convert to brief <ArrowRight size={12} /></button> : <Status value={idea.status} />}</div></article>)}</div></Surface>
      <Surface title="Brief register" detail="Required fields, review state, and production conversion"><div className="divide-y divide-[#E8EDF4]">{state.briefs.map((brief) => <article key={brief.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] text-[#155EEF]">{brief.briefNumber}</p><h3 className="mt-1 text-sm font-bold">{brief.title}</h3><p className="mt-2 text-xs leading-5 text-[#65758B]">{brief.objective}</p></div><Status value={brief.status} /></div><div className="mt-4 flex flex-wrap gap-2">{brief.status === 'DRAFT' && <button className="cs-button-small" onClick={() => onBriefStatus(brief.id, 'SUBMITTED')}>Submit</button>}{brief.status === 'SUBMITTED' && <><button className="cs-button-small" onClick={() => onBriefStatus(brief.id, 'APPROVED')}>Approve brief</button><button className="cs-button-small-muted" onClick={() => onBriefStatus(brief.id, 'CHANGES_REQUESTED')}>Request changes</button></>}{brief.status === 'APPROVED' && <button className="cs-button-small" onClick={() => onCreateContent(brief.id)}>Create production work</button>}</div></article>)}</div></Surface>
    </div>
  </>;
}

function PipelineView({ state, onInspect }: { state: ReturnType<typeof useContentSocial>['state']; onInspect: (id: string) => void }) {
  const visibleStates: LifecycleState[] = ['ASSIGNED', 'IN_PRODUCTION', 'INTERNAL_REVIEW', 'CLIENT_APPROVAL', 'SCHEDULED', 'PUBLISHED'];
  return <>
    <PageHeading eyebrow="Production pipeline" title="Move work through governed lifecycle gates" detail="Every state change checks role, prerequisites, current version, approval, and publication evidence." />
    <div className="overflow-x-auto pb-3"><div className="grid min-w-[1120px] grid-cols-6 gap-3">{visibleStates.map((column) => <section key={column} className="rounded-2xl border border-[#D9E0EA] bg-[#EEF2F7]/70 p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#52617A]">{formatLifecycle(column)}</h2><span className="font-mono text-[10px] text-[#74839A]">{state.contentItems.filter((item) => item.lifecycleState === column).length}</span></div><div className="space-y-3">{state.contentItems.filter((item) => item.lifecycleState === column).map((item) => <button key={item.id} onClick={() => onInspect(item.id)} className="w-full rounded-xl border border-[#D9E0EA] bg-white p-3 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-[#155EEF]/60 hover:shadow-md"><p className="font-mono text-[9px] text-[#74839A]">{item.contentNumber}</p><h3 className="mt-2 text-xs font-bold leading-5">{item.title}</h3><p className="mt-2 text-[10px] text-[#65758B]">{item.owner} · due {formatDate(item.dueDate)}</p>{item.exceptions.length > 0 && <div className="mt-3"><Status value={item.exceptions[0].flag} /></div>}</button>)}</div></section>)}</div></div>
    <p className="text-[11px] text-[#65758B]">Keyboard alternative: open any card and choose an allowed lifecycle action. Dragging is not required.</p>
  </>;
}

function CalendarView({ state, onSchedule }: { state: ReturnType<typeof useContentSocial>['state']; onSchedule: (id: string) => void }) {
  const unscheduled = state.contentItems.filter((item) => ['INTERNAL_REVIEW', 'CLIENT_APPROVAL'].includes(item.lifecycleState));
  return <>
    <PageHeading eyebrow="Content calendar" title="Schedule the approved version—not just the idea" detail="Times are stored in UTC and displayed with the configured brand timezone." />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Surface title="Publication agenda" detail="DELabs · Europe/London"><RecordTable headers={['Date & time', 'Content', 'Channel', 'Version', 'Status']} rows={state.schedules.map((schedule) => { const item = state.contentItems.find((record) => record.id === schedule.contentItemId); const version = state.versions.find((record) => record.id === schedule.versionId); return [formatDateTime(schedule.plannedAt), item?.title ?? 'Unknown', schedule.channel, `v${version?.versionNumber ?? '?'}`, <Status value={schedule.status} />]; })} /></Surface>
      <Surface title="Unscheduled tray" detail="Eligible work awaiting a slot"><div className="divide-y divide-[#E8EDF4]">{unscheduled.map((item) => <div key={item.id} className="p-4"><p className="text-xs font-bold">{item.title}</p><p className="mt-1 text-[10px] text-[#74839A]">{formatLifecycle(item.lifecycleState)} · {item.primaryChannel}</p><button className="cs-button-small mt-3" onClick={() => onSchedule(item.id)}><CalendarDays size={12} />Schedule</button></div>)}{unscheduled.length === 0 && <EmptyInline label="No eligible unscheduled work." />}</div></Surface>
    </div>
  </>;
}

function ApprovalsView({ approvals, canDecide, canShare, decisionComment, onComment, onShare, onDecide }: { approvals: ContentApproval[]; canDecide: boolean; canShare: boolean; decisionComment: string; onComment: (value: string) => void; onShare: (id: string) => void; onDecide: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => void }) {
  return <>
    <PageHeading eyebrow="Approvals" title="Decisions bound to exact immutable versions" detail="A content edit creates a new version and makes any affected approval stale." />
    <div className="space-y-4">{approvals.map((approval) => <article key={approval.id} className="rounded-2xl border border-[#D9E0EA] bg-white p-5 shadow-2xs"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-mono text-[9px] text-[#155EEF]">{approval.approvalNumber}</p><h2 className="mt-2 text-base font-bold">{approval.title}</h2><p className="mt-2 text-xs text-[#65758B]">{approval.routeName} · {approval.stepName} · due {formatDateTime(approval.dueAt)}</p></div><div className="flex flex-wrap items-center gap-2"><Status value={approval.status} />{approval.status === 'PENDING' && approval.clientVisible && canShare && <button className="cs-button-small-muted" onClick={() => onShare(approval.id)}><Link2 size={12} />Create client link</button>}</div></div><div className="mt-4 overflow-hidden rounded-xl border border-[#E0E6EF]"><RecordTable headers={['Channel', 'Variant', 'Exact version']} rows={approval.targets.map((target) => [target.channel, target.variantId.slice(0, 8), `v${target.versionNumber} · ${target.versionId.slice(0, 8)}`])} /></div>{approval.status === 'PENDING' && canDecide && <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"><label className="text-xs font-semibold">Decision comment<input value={decisionComment} onChange={(event) => onComment(event.target.value)} className="cs-input mt-2" placeholder="Evidence or requested change" /></label><div className="flex flex-wrap items-end gap-2"><button className="cs-button-secondary" onClick={() => onDecide(approval.id, 'CHANGES_REQUESTED')}>Request changes</button><button className="cs-button-primary" onClick={() => onDecide(approval.id, 'APPROVED')}><Check size={14} />Approve exact versions</button></div></div>}{approval.decisions.map((decision) => <div key={decision.id} className="mt-4 rounded-lg border-l-4 border-[#155EEF] bg-[#F3F6FB] p-3 text-xs"><strong>{decision.actorName}</strong> · {decision.action} · {formatDateTime(decision.decidedAt)}<p className="mt-1 text-[#65758B]">{decision.comment || 'No additional comment.'}</p></div>)}</article>)}</div>
  </>;
}

function AssetView({ state, onAdd, onRights }: { state: ReturnType<typeof useContentSocial>['state']; onAdd: () => void; onRights: (id: string, status: ReturnType<typeof useContentSocial>['state']['assets'][number]['rightsStatus']) => void }) {
  return <>
    <PageHeading eyebrow="Linked asset library" title="Govern source, rights, and usage without duplicating media" detail="Launch stores metadata and secure links; native storage and renditions remain later-phase capabilities." actions={<button className="cs-button-primary" onClick={onAdd}><Link2 size={15} />Link asset</button>} />
    <Surface title="Asset register" detail="External source of truth with COS rights controls"><RecordTable headers={['Asset', 'Provider', 'Type', 'Rights', 'Usage', 'Source']} rows={state.assets.map((asset) => [<div><p className="font-semibold">{asset.name}</p><p className="font-mono text-[9px] text-[#74839A]">{asset.assetNumber}</p></div>, asset.sourceProvider, asset.type, <select aria-label={`Rights for ${asset.name}`} value={asset.rightsStatus} onChange={(event) => onRights(asset.id, event.target.value as typeof asset.rightsStatus)} className="rounded-md border border-[#CBD5E2] bg-white px-2 py-1 text-[10px]"><option>VALID</option><option>EXPIRING</option><option>EXPIRED</option><option>MISSING</option><option>QUARANTINED</option></select>, `${asset.usageContentItemIds.length} items`, <a href={asset.sourceUrl} target="_blank" rel="noreferrer" className="cs-link">Open <ExternalLink size={12} /></a>])} /></Surface>
  </>;
}

function PublisherView({ state, onPublish }: { state: ReturnType<typeof useContentSocial>['state']; onPublish: (scheduleId: string) => void }) {
  return <>
    <PageHeading eyebrow="Manual social publisher" title="Publication status follows evidence" detail="Passing the planned time does not mark a record Published. An authorised user must capture the live result." />
    <InlineNotice tone="warning" title="Launch adapter" detail="Publishing remains manual for all ten canonical channels. COS stores the approved version, planned time, external action, proof, result, and failure history." />
    <div className="grid gap-5 xl:grid-cols-2">
      <Surface title="Ready queue" detail="Approved versions awaiting external publication"><div className="divide-y divide-[#E8EDF4]">{state.schedules.filter((item) => item.status === 'READY').map((schedule) => { const item = state.contentItems.find((record) => record.id === schedule.contentItemId); return <article key={schedule.id} className="p-5"><div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">{item?.title}</h3><p className="mt-1 text-xs text-[#65758B]">{schedule.channel} · {formatDateTime(schedule.plannedAt)}</p></div><Status value={schedule.status} /></div><button className="cs-button-primary mt-4" onClick={() => onPublish(schedule.id)}><Send size={14} />Record publication proof</button></article>; })}{state.schedules.every((item) => item.status !== 'READY') && <EmptyInline label="Nothing is ready for manual publication." />}</div></Surface>
      <Surface title="Publication evidence" detail="Truthful external result register"><div className="divide-y divide-[#E8EDF4]">{state.publishRecords.map((record) => { const item = state.contentItems.find((content) => content.id === record.contentItemId); return <article key={record.id} className="p-5"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-bold">{item?.title}</h3><p className="mt-1 text-xs text-[#65758B]">{record.channel} · {formatDateTime(record.publishedAt ?? '')}</p></div><Status value={record.status} /></div><p className="mt-3 text-xs leading-5 text-[#65758B]">{record.proofNote}</p>{record.externalUrl && <a href={record.externalUrl} target="_blank" rel="noreferrer" className="cs-link mt-3">Inspect live proof <ExternalLink size={12} /></a>}</article>; })}</div></Surface>
    </div>
  </>;
}

function CommunityView({ state, onAdd, onStatus }: { state: ReturnType<typeof useContentSocial>['state']; onAdd: () => void; onStatus: (id: string, status: ReturnType<typeof useContentSocial>['state']['communityRecords'][number]['status']) => void }) {
  return <>
    <PageHeading eyebrow="Manual community inbox" title="Keep every message owned and traceable" detail="Capture the external thread, classify it, assign an owner, draft a response, and record escalation or resolution." actions={<button className="cs-button-primary" onClick={onAdd}><Plus size={15} />Capture message</button>} />
    <div className="grid gap-4 lg:grid-cols-2">{state.communityRecords.map((record) => <article key={record.id} className="rounded-2xl border border-[#D9E0EA] bg-white p-5 shadow-2xs"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#155EEF]">{record.channel} · {record.classification}</p><h2 className="mt-2 text-base font-bold">{record.contactName}</h2></div><Status value={record.priority} /></div><p className="mt-3 text-xs leading-5 text-[#65758B]">{record.summary}</p>{record.responseDraft && <div className="mt-4 rounded-lg bg-[#F3F6FB] p-3 text-xs"><strong>Draft response</strong><p className="mt-1 text-[#65758B]">{record.responseDraft}</p></div>}<div className="mt-4 flex items-center justify-between"><select value={record.status} onChange={(event) => onStatus(record.id, event.target.value as typeof record.status)} className="rounded-lg border border-[#CBD5E2] bg-white px-2 py-2 text-xs"><option>NEW</option><option>ASSIGNED</option><option>IN_PROGRESS</option><option>ESCALATED</option><option>RESOLVED</option></select><a className="cs-link" href={record.externalThreadUrl} target="_blank" rel="noreferrer">External thread <ExternalLink size={12} /></a></div></article>)}</div>
  </>;
}

function ListeningView({ state, onAdd, onConvert }: { state: ReturnType<typeof useContentSocial>['state']; onAdd: () => void; onConvert: (id: string) => void }) {
  return <>
    <PageHeading eyebrow="Manual social listening" title="Turn market signals into owned action" detail="Launch captures watchlist observations and evidence manually; connected feeds remain a measured Scale decision." actions={<button className="cs-button-primary" onClick={onAdd}><Radio size={15} />Capture signal</button>} />
    <Surface title="Signal register" detail="Source, severity, sentiment, owner, and conversion lineage"><RecordTable headers={['Topic', 'Channel', 'Sentiment', 'Severity', 'Owner', 'Action']} rows={state.listeningSignals.map((signal) => [<div><p className="font-semibold">{signal.topic}</p><p className="mt-1 max-w-sm text-[10px] text-[#74839A]">{signal.summary}</p></div>, signal.channel, signal.sentiment, <Status value={signal.severity} />, signal.owner, signal.status === 'CONVERTED' ? <Status value="CONVERTED" /> : <button className="cs-button-small" onClick={() => onConvert(signal.id)}>Convert to idea</button>])} /></Surface>
  </>;
}

function PerformanceView({ state, onAdd }: { state: ReturnType<typeof useContentSocial>['state']; onAdd: () => void }) {
  const sum = (metric: string) => state.metrics.filter((item) => item.metric === metric).reduce((total, item) => total + item.value, 0);
  const impressions = sum('IMPRESSIONS'); const engagements = sum('ENGAGEMENTS'); const engagementRate = impressions ? (engagements / impressions) * 100 : 0;
  return <>
    <PageHeading eyebrow="Content performance" title="Measure with explicit source confidence" detail="Verified, imported, manual, and estimated values remain distinguishable in every report." actions={<button className="cs-button-primary" onClick={onAdd}><Plus size={15} />Record metric</button>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Impressions" value={formatNumber(impressions)} note="Sourced observations" icon={Eye} /><MetricCard label="Engagements" value={formatNumber(engagements)} note={`${engagementRate.toFixed(1)}% engagement rate`} icon={TrendingUp} /><MetricCard label="Leads" value={formatNumber(sum('LEADS'))} note="Reconciled campaign source" icon={Users} /><MetricCard label="Conversions" value={formatNumber(sum('CONVERSIONS'))} note="Verified outcomes" icon={CheckCircle2} tone="green" /></div>
    <Surface title="Metric evidence ledger" detail="Exact period and source are retained"><RecordTable headers={['Content', 'Metric', 'Value', 'Period', 'Confidence', 'Source']} rows={state.metrics.map((metric) => { const item = state.contentItems.find((content) => content.id === metric.contentItemId); return [item?.title ?? 'Unknown', metric.metric, <span className="font-tabular-nums font-semibold">{formatNumber(metric.value)}</span>, `${formatDate(metric.periodStart)}–${formatDate(metric.periodEnd)}`, <Status value={metric.sourceType} />, metric.sourceReference]; })} /></Surface>
  </>;
}

function SettingsView({ state, session, scopeMode, onReset }: { state: ReturnType<typeof useContentSocial>['state']; session: ReturnType<typeof useContentSocial>['session']; scopeMode: 'company' | 'group'; onReset: () => void }) {
  return <>
    <PageHeading eyebrow="Module settings" title="Govern workflow, access, and operational evidence" detail="Production permissions are enforced by Supabase Auth, scoped membership, RLS, and append-only audit." />
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="space-y-5"><Surface title="Active security context" detail="Resolved for every request"><dl className="divide-y divide-[#E8EDF4] px-5 py-2"><KeyValue label="Identity" value={session?.displayName ?? 'Unavailable'} /><KeyValue label="Role" value={session?.role ?? 'None'} /><KeyValue label="Persistence" value={session?.mode === 'supabase' ? 'Tenant-secured Supabase' : 'Development demo'} /><KeyValue label="Scope" value={`DELabs · ${scopeMode}`} /></dl></Surface><Surface title="Launch adapter policy" detail="No variable-cost dependency"><div className="space-y-3 p-5 text-xs text-[#65758B]"><p>Assets: secure external links</p><p>Publishing: manual proof register</p><p>Community: external-thread register</p><p>Listening: manual signals and CSV</p><p>Analytics: verified/manual/CSV observations</p></div></Surface>{session?.mode === 'demo' && <button className="cs-button-secondary w-full justify-center" onClick={onReset}><RotateCcw size={14} />Restore demo data</button>}</div>
      <Surface title="Immutable audit stream" detail={`${state.auditEvents.length} scoped events retained`}><RecordTable headers={['Time', 'Actor', 'Action', 'Target', 'Evidence']} rows={state.auditEvents.slice(0, 50).map((event) => [formatDateTime(event.occurredAt), event.actorName, event.action, `${event.targetType} · ${event.targetId.slice(0, 8)}`, event.summary])} /></Surface>
    </div>
  </>;
}

function ContentInspector({ item, state, onClose, onTransition, onVersion, onApproval, onSchedule }: { item: ContentItem; state: ReturnType<typeof useContentSocial>['state']; onClose: () => void; onTransition: (target: LifecycleState) => void; onVersion: () => void; onApproval: () => void; onSchedule: () => void }) {
  const versions = state.versions.filter((version) => version.contentItemId === item.id).sort((a, b) => b.versionNumber - a.versionNumber);
  const transitions = allowedTransitions(item, state);
  const currentApproval = state.approvals.find((approval) => approval.contentItemId === item.id && ['PENDING', 'APPROVED'].includes(approval.status));
  return <div className="fixed inset-0 z-[70] flex justify-end bg-[#061B3A]/45" role="dialog" aria-modal="true" aria-labelledby="content-inspector-title"><button className="flex-1 cursor-default" onClick={onClose} aria-label="Close inspector" /><aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#D9E0EA] p-5"><div><p className="font-mono text-[9px] text-[#155EEF]">{item.contentNumber}</p><h2 id="content-inspector-title" className="mt-2 text-lg font-bold">{item.title}</h2><p className="mt-1 text-xs text-[#65758B]">{item.owner} · due {formatDate(item.dueDate)}</p></div><button className="cs-icon-button" onClick={onClose} aria-label="Close content inspector"><X size={17} /></button></header><div className="flex-1 overflow-y-auto p-5"><div className="flex flex-wrap items-center gap-2"><Status value={item.lifecycleState} />{item.exceptions.map((exception) => <span key={`${exception.flag}-${exception.openedAt}`}><Status value={exception.flag} /></span>)}</div><section className="mt-6"><h3 className="text-xs font-bold uppercase tracking-[.06em] text-[#52617A]">Allowed workflow actions</h3><div className="mt-3 flex flex-wrap gap-2">{transitions.map((target) => <button key={target} className="cs-button-small" onClick={() => onTransition(target)}>{formatLifecycle(target)}</button>)}{transitions.length === 0 && <p className="text-xs text-[#74839A]">This record is in a terminal state.</p>}</div></section><section className="mt-7"><div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-[.06em] text-[#52617A]">Immutable versions</h3><button className="cs-link" onClick={onVersion}><Plus size={12} />New version</button></div><div className="mt-3 divide-y divide-[#E8EDF4] border-y border-[#E8EDF4]">{versions.map((version) => <article key={version.id} className="py-4"><div className="flex justify-between"><p className="font-mono text-xs font-semibold">v{version.versionNumber}</p>{version.id === item.currentVersionId && <Status value="CURRENT" />}</div><p className="mt-2 text-xs text-[#52617A]">{version.copy}</p><p className="mt-2 text-[10px] text-[#74839A]">{version.changeSummary} · {formatDateTime(version.submittedAt ?? version.createdAt)}</p>{version.externalAssetUrl && <a className="cs-link mt-2" href={version.externalAssetUrl} target="_blank" rel="noreferrer">Open source asset <ExternalLink size={11} /></a>}</article>)}</div></section><section className="mt-7"><h3 className="text-xs font-bold uppercase tracking-[.06em] text-[#52617A]">Approval and scheduling</h3><div className="mt-3 rounded-xl border border-[#D9E0EA] bg-[#F7F9FC] p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Current approval</span>{currentApproval ? <Status value={currentApproval.status} /> : <Status value="NOT_REQUESTED" />}</div><div className="mt-4 flex flex-wrap gap-2">{item.currentVersionId && (!currentApproval || currentApproval.status === 'STALE') && <button className="cs-button-secondary" onClick={onApproval}>Request approval</button>}{item.lifecycleState !== 'SCHEDULED' && <button className="cs-button-primary" onClick={onSchedule}><CalendarDays size={13} />Schedule current version</button>}</div></div></section></div></aside></div>;
}

function NotificationDrawer({ notifications, onClose, onRead }: { notifications: ReturnType<typeof useContentSocial>['state']['notifications']; onClose: () => void; onRead: (id: string) => void }) {
  return <div className="fixed inset-0 z-[75] flex justify-end bg-[#061B3A]/35" role="dialog" aria-modal="true" aria-label="Content and Social notifications"><button className="flex-1 cursor-default" onClick={onClose} aria-label="Close notifications" /><aside className="h-full w-full max-w-md bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-[#D9E0EA] p-5"><div><p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#155EEF]">Notification centre</p><h2 className="mt-1 text-lg font-bold">Content & Social</h2></div><button className="cs-icon-button" onClick={onClose} aria-label="Close notifications"><X size={17} /></button></header><div className="divide-y divide-[#E8EDF4]">{notifications.map((notification) => <button key={notification.id} onClick={() => onRead(notification.id)} className={cx('w-full p-5 text-left', !notification.readAt && 'bg-[#F5F8FE]')}><div className="flex items-start gap-3"><span className={cx('mt-1 h-2 w-2 rounded-full', notification.critical ? 'bg-red-500' : notification.readAt ? 'bg-[#B7C2D0]' : 'bg-[#155EEF]')} /><div><p className="text-xs font-bold">{notification.title}</p><p className="mt-1 text-xs leading-5 text-[#65758B]">{notification.message}</p><p className="mt-2 font-mono text-[9px] text-[#8491A4]">{formatDateTime(notification.createdAt)}</p></div></div></button>)}</div></aside></div>;
}

function SearchResults({ results, onOpen }: { results: ReturnType<typeof searchState>; onOpen: (result: ReturnType<typeof searchState>[number]) => void }) {
  return <><PageHeading eyebrow="Scoped search" title="Search results" detail="Results are limited to the active DELabs entity scope." /><Surface title={`${results.length} matching records`} detail="Ideas, briefs, content, assets, community, and listening"><div className="divide-y divide-[#E8EDF4]">{results.map((result) => <button key={`${result.kind}-${result.id}`} onClick={() => onOpen(result)} className="cs-record-row"><div><p className="text-[9px] font-bold uppercase tracking-[.06em] text-[#155EEF]">{result.kind}</p><p className="mt-1 font-semibold">{result.title}</p></div><span className="text-[10px] text-[#74839A]">{result.detail}</span></button>)}{results.length === 0 && <EmptyInline label="No scoped records match this search." />}</div></Surface></>;
}

function PageHeading({ eyebrow, title, detail, actions }: { eyebrow: string; title: string; detail: string; actions?: ReactNode }) { return <PageTitleBar eyebrow={eyebrow} title={title} subtitle={detail} actions={actions} />; }
function Surface({ title, detail, action, children }: { title: string; detail?: string; action?: ReactNode; children: ReactNode }) { return <section className="overflow-hidden rounded-2xl border border-[#D9E0EA] bg-white shadow-2xs" data-card-ignore><SectionTitleBar title={title} detail={detail} action={action} />{children}</section>; }
function MetricCard({ label, value, note, icon: Icon, tone = 'blue' }: { label: string; value: string; note: string; icon: LucideIcon; tone?: 'blue' | 'amber' | 'green' }) { const tones = { blue: 'bg-[#EEF3FB] text-[#155EEF]', amber: 'bg-amber-50 text-amber-700', green: 'bg-emerald-50 text-emerald-700' }; return <article className="rounded-2xl border border-[#D9E0EA] bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155EEF]/60 hover:shadow-md"><div className="flex items-start justify-between"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#74839A]">{label}</p><span className={cx('grid h-8 w-8 place-items-center rounded-lg', tones[tone])}><Icon size={16} /></span></div><p className="mt-3 font-tabular-nums text-2xl font-semibold text-[#172B4D]">{value}</p><p className="mt-2 text-[11px] text-[#74839A]">{note}</p></article>; }
function RecordTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) { return <div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="bg-[#F7F9FC]">{headers.map((header) => <th key={header} className="border-b border-[#E2E8F0] px-5 py-3 text-[9px] font-bold uppercase tracking-[.07em] text-[#74839A]">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-b border-[#E8EDF4] last:border-b-0 hover:bg-[#FAFBFD]">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-3 text-xs text-[#44546B]">{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <EmptyInline label="No records in this view." />}</div>; }
function Status({ value }: { value: string }) { return <span className={cx('inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[.05em]', statusTone[value] ?? 'border-[#D8E0EA] bg-[#F3F6FA] text-[#52617A]')}>{formatLifecycle(value)}</span>; }
function EmptyInline({ label }: { label: string }) { return <div className="p-8 text-center text-xs text-[#74839A]">{label}</div>; }
function KeyValue({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[110px_1fr] gap-4 py-4"><dt className="text-[10px] font-bold uppercase tracking-[.06em] text-[#8491A4]">{label}</dt><dd className="text-xs font-semibold text-[#263750]">{value}</dd></div>; }
function InlineNotice({ tone, title, detail, onDismiss }: { tone: 'warning' | 'danger' | 'success'; title: string; detail: string; onDismiss?: () => void }) { const config = { warning: ['border-amber-300 bg-amber-50 text-amber-950', CircleAlert], danger: ['border-red-300 bg-red-50 text-red-950', AlertTriangle], success: ['border-emerald-300 bg-emerald-50 text-emerald-950', CheckCircle2] } as const; const [classes, Icon] = config[tone]; return <div className={cx('flex items-start gap-3 rounded-xl border-l-4 p-4', classes)}><Icon size={17} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-xs font-bold">{title}</p><p className="mt-1 text-xs leading-5 opacity-80">{detail}</p></div>{onDismiss && <button onClick={onDismiss} className="cs-icon-button" aria-label="Dismiss notice"><X size={14} /></button>}</div>; }
function StatePanel({ icon: Icon, title, detail, action, label, spinning }: { icon: LucideIcon; title: string; detail: string; action?: () => void; label?: string; spinning?: boolean }) { return <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-[#D9E0EA] bg-white p-10 text-center shadow-2xs"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#EEF3FB] text-[#155EEF]"><Icon size={22} className={spinning ? 'animate-spin' : ''} /></span><h1 className="mt-5 text-xl font-bold">{title}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74839A]">{detail}</p>{action && <button className="cs-button-primary mt-6" onClick={action}>{label}</button>}</div>; }

function SignInPanel({ detail, credentials, busy, onChange, onSubmit }: { detail: string; credentials: { email: string; password: string }; busy: boolean; onChange: (value: { email: string; password: string }) => void; onSubmit: () => void }) {
  return <form className="mx-auto mt-16 max-w-md rounded-2xl border border-[#D9E0EA] bg-white p-8 shadow-2xs" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#EEF3FB] text-[#155EEF]"><LockKeyhole size={22} /></span><h1 className="mt-5 text-xl font-bold">Sign in to Content & Social</h1><p className="mt-2 text-sm leading-6 text-[#74839A]">{detail}</p><label className="mt-6 block text-xs font-semibold text-[#344054]">Work email<input className="cs-input mt-2" type="email" autoComplete="username" required value={credentials.email} onChange={(event) => onChange({ ...credentials, email: event.target.value })} /></label><label className="mt-4 block text-xs font-semibold text-[#344054]">Password<input className="cs-input mt-2" type="password" autoComplete="current-password" required minLength={8} value={credentials.password} onChange={(event) => onChange({ ...credentials, password: event.target.value })} /></label><button className="cs-button-primary mt-6 w-full justify-center" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={15} className="animate-spin" />Signing in…</> : 'Sign in securely'}</button><p className="mt-4 text-[11px] leading-5 text-[#74839A]">Access is invite-only. A module administrator must assign your workspace, client, brand, and role before you can open records.</p></form>;
}

function ActionModal({ title, onClose, error, children }: { title: string; onClose: () => void; error?: string; children: ReactNode }) { return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#061B3A]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="cs-modal-title"><div className="my-6 w-full max-w-2xl rounded-2xl border border-[#D9E0EA] bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-[#D9E0EA] p-5"><div><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#155EEF]">Governed workflow</p><h2 id="cs-modal-title" className="mt-2 text-lg font-bold">{title}</h2></div><button className="cs-icon-button" onClick={onClose} aria-label="Close dialog"><X size={17} /></button></header>{error && <div className="mx-5 mt-5"><InlineNotice tone="danger" title="Action blocked" detail={error} /></div>}{children}</div></div>; }
function FormShell({ onSubmit, children, submitLabel }: { onSubmit: () => void; children: ReactNode; submitLabel: string }) { return <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div><footer className="flex justify-end border-t border-[#D9E0EA] p-5"><button type="submit" className="cs-button-primary">{submitLabel}</button></footer></form>; }
function Field({ label, children, span = false }: { label: string; children: ReactNode; span?: boolean }) { return <label className={cx('text-xs font-semibold text-[#34445E]', span && 'sm:col-span-2')}>{label}{children}</label>; }
function TextInput(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className="cs-input mt-2" />; }
function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className="cs-input mt-2 min-h-24 resize-y" />; }
function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className="cs-input mt-2">{props.children}</select>; }

function IdeaForm({ value, onChange, onSubmit }: { value: IdeaInput; onChange: (value: IdeaInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Create idea"><Field label="Idea title" span><TextInput autoFocus required value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field><Field label="Summary" span><TextArea required value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></Field><Field label="Source"><TextInput required value={value.source} onChange={(e) => onChange({ ...value, source: e.target.value })} /></Field><Field label="Owner"><TextInput required value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })} /></Field><Field label="Priority"><SelectInput value={value.priority} onChange={(e) => onChange({ ...value, priority: e.target.value as ContentPriority })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></SelectInput></Field></FormShell>; }
function BriefForm({ value, onChange, onSubmit }: { value: BriefInput; onChange: (value: BriefInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Create draft brief"><Field label="Brief title" span><TextInput autoFocus required value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field><Field label="Objective" span><TextArea required value={value.objective} onChange={(e) => onChange({ ...value, objective: e.target.value })} /></Field><Field label="Audience"><TextArea required value={value.audience} onChange={(e) => onChange({ ...value, audience: e.target.value })} /></Field><Field label="Key message"><TextArea required value={value.keyMessage} onChange={(e) => onChange({ ...value, keyMessage: e.target.value })} /></Field><Field label="Call to action"><TextInput required value={value.callToAction} onChange={(e) => onChange({ ...value, callToAction: e.target.value })} /></Field><Field label="Owner"><TextInput required value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })} /></Field><Field label="Due date"><TextInput type="date" required value={value.dueDate} onChange={(e) => onChange({ ...value, dueDate: e.target.value })} /></Field><Field label="Primary channel"><SelectInput value={value.channels[0]} onChange={(e) => onChange({ ...value, channels: [e.target.value] })}>{['Instagram','Facebook','TikTok','LinkedIn','YouTube','X','Pinterest','Threads','Snapchat','Google Business Profile'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Primary format"><SelectInput value={value.formats[0]} onChange={(e) => onChange({ ...value, formats: [e.target.value] })}>{['Static','Carousel','Short video','Long video','Story','Text/thread','Article/newsletter','Live/event','Poll/interactive','Repost/UGC'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field></FormShell>; }
function VersionForm({ value, onChange, onSubmit }: { value: VersionInput; onChange: (value: VersionInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Create immutable version"><Field label="Platform copy" span><TextArea autoFocus required value={value.copy} onChange={(e) => onChange({ ...value, copy: e.target.value })} /></Field><Field label="Change summary" span><TextInput required value={value.changeSummary} onChange={(e) => onChange({ ...value, changeSummary: e.target.value })} /></Field><Field label="External asset URL" span><TextInput type="url" value={value.externalAssetUrl} onChange={(e) => onChange({ ...value, externalAssetUrl: e.target.value })} placeholder="https://drive.google.com/..." /></Field></FormShell>; }
function ScheduleForm({ value, onChange, onSubmit }: { value: ScheduleInput; onChange: (value: ScheduleInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Add to manual queue"><Field label="Planned date and time"><TextInput type="datetime-local" required value={value.plannedAt} onChange={(e) => onChange({ ...value, plannedAt: e.target.value })} /></Field><Field label="Brand timezone"><SelectInput value={value.timezone} onChange={(e) => onChange({ ...value, timezone: e.target.value })}><option>Europe/London</option><option>Africa/Lagos</option><option>UTC</option></SelectInput></Field><div className="sm:col-span-2"><InlineNotice tone="warning" title="Manual publication" detail="Scheduling does not publish content. A live URL, actual time, and evidence note are required later." /></div></FormShell>; }
function PublishForm({ value, onChange, onSubmit }: { value: PublishInput; onChange: (value: PublishInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Confirm published with proof"><Field label="Live post URL" span><TextInput type="url" autoFocus required value={value.externalUrl} onChange={(e) => onChange({ ...value, externalUrl: e.target.value })} /></Field><Field label="Actual publication time"><TextInput type="datetime-local" required value={value.publishedAt} onChange={(e) => onChange({ ...value, publishedAt: e.target.value })} /></Field><Field label="Evidence note" span><TextArea required value={value.proofNote} onChange={(e) => onChange({ ...value, proofNote: e.target.value })} /></Field></FormShell>; }
function AssetForm({ value, onChange, onSubmit }: { value: AssetInput; onChange: (value: AssetInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Link asset"><Field label="Asset name" span><TextInput autoFocus required value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></Field><Field label="Source URL" span><TextInput type="url" required value={value.sourceUrl} onChange={(e) => onChange({ ...value, sourceUrl: e.target.value })} /></Field><Field label="Provider"><SelectInput value={value.sourceProvider} onChange={(e) => onChange({ ...value, sourceProvider: e.target.value as AssetInput['sourceProvider'] })}>{['Drive','OneDrive','Dropbox','Canva','Adobe','CapCut','Other'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Asset type"><SelectInput value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value as AssetInput['type'] })}>{['IMAGE','VIDEO','DOCUMENT','AUDIO','OTHER'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Owner"><TextInput required value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })} /></Field></FormShell>; }
function CommunityForm({ value, onChange, onSubmit }: { value: CommunityInput; onChange: (value: CommunityInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Capture community record"><Field label="Channel"><SelectInput value={value.channel} onChange={(e) => onChange({ ...value, channel: e.target.value })}>{['Instagram','Facebook','TikTok','LinkedIn','YouTube','X','Pinterest','Threads','Snapchat','Google Business Profile'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Contact name"><TextInput required value={value.contactName} onChange={(e) => onChange({ ...value, contactName: e.target.value })} /></Field><Field label="External thread URL" span><TextInput type="url" required value={value.externalThreadUrl} onChange={(e) => onChange({ ...value, externalThreadUrl: e.target.value })} /></Field><Field label="Summary" span><TextArea required value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></Field><Field label="Classification"><SelectInput value={value.classification} onChange={(e) => onChange({ ...value, classification: e.target.value as CommunityInput['classification'] })}>{['ENQUIRY','COMPLAINT','PRAISE','LEAD','SUPPORT','RISK'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Priority"><SelectInput value={value.priority} onChange={(e) => onChange({ ...value, priority: e.target.value as ContentPriority })}>{['LOW','MEDIUM','HIGH','CRITICAL'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Owner"><TextInput required value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })} /></Field></FormShell>; }
function ListeningForm({ value, onChange, onSubmit }: { value: ListeningInput; onChange: (value: ListeningInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Capture signal"><Field label="Topic" span><TextInput autoFocus required value={value.topic} onChange={(e) => onChange({ ...value, topic: e.target.value })} /></Field><Field label="Channel"><SelectInput value={value.channel} onChange={(e) => onChange({ ...value, channel: e.target.value })}>{['Instagram','Facebook','TikTok','LinkedIn','YouTube','X','Pinterest','Threads','Snapchat','Google Business Profile'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Source URL"><TextInput type="url" required value={value.sourceUrl} onChange={(e) => onChange({ ...value, sourceUrl: e.target.value })} /></Field><Field label="Summary" span><TextArea required value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} /></Field><Field label="Severity"><SelectInput value={value.severity} onChange={(e) => onChange({ ...value, severity: e.target.value as ContentPriority })}>{['LOW','MEDIUM','HIGH','CRITICAL'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Sentiment"><SelectInput value={value.sentiment} onChange={(e) => onChange({ ...value, sentiment: e.target.value as ListeningInput['sentiment'] })}>{['POSITIVE','NEUTRAL','NEGATIVE','MIXED'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Owner"><TextInput required value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })} /></Field></FormShell>; }
function MetricForm({ value, items, onChange, onSubmit }: { value: MetricInput; items: ContentItem[]; onChange: (value: MetricInput) => void; onSubmit: () => void }) { return <FormShell onSubmit={onSubmit} submitLabel="Record metric"><Field label="Content item" span><SelectInput value={value.contentItemId || items[0]?.id} onChange={(e) => onChange({ ...value, contentItemId: e.target.value })}>{items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput></Field><Field label="Metric"><SelectInput value={value.metric} onChange={(e) => onChange({ ...value, metric: e.target.value as MetricInput['metric'] })}>{['IMPRESSIONS','REACH','ENGAGEMENTS','CLICKS','LEADS','CONVERSIONS','REVENUE'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Value"><TextInput type="number" min="0" required value={value.value} onChange={(e) => onChange({ ...value, value: Number(e.target.value) })} /></Field><Field label="Period start"><TextInput type="date" required value={value.periodStart} onChange={(e) => onChange({ ...value, periodStart: e.target.value })} /></Field><Field label="Period end"><TextInput type="date" required value={value.periodEnd} onChange={(e) => onChange({ ...value, periodEnd: e.target.value })} /></Field><Field label="Source confidence"><SelectInput value={value.sourceType} onChange={(e) => onChange({ ...value, sourceType: e.target.value as MetricInput['sourceType'] })}>{['VERIFIED','IMPORTED','MANUAL','ESTIMATED'].map((item) => <option key={item}>{item}</option>)}</SelectInput></Field><Field label="Source reference" span><TextInput required value={value.sourceReference} onChange={(e) => onChange({ ...value, sourceReference: e.target.value })} /></Field></FormShell>; }

function modalTitle(modal: Exclude<ModalType, null>): string { return { idea: 'Capture content idea', brief: 'Create governed brief', version: 'Create immutable version', schedule: 'Schedule approved version', publish: 'Record manual publication proof', asset: 'Link external asset', community: 'Capture community message', listening: 'Capture listening signal', metric: 'Record sourced metric' }[modal]; }
function formatDate(value: string): string { if (!value) return '—'; const date = new Date(value.includes('T') ? value : `${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date); }
function formatDateTime(value: string): string { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date); }
function formatNumber(value: number): string { return new Intl.NumberFormat('en-GB', { notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }
