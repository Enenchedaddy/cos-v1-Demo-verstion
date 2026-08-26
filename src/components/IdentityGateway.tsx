import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Sliders,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import COSLogo from './COSLogo';
import COSLogoWatermark from './COSLogoWatermark';

interface IdentityGatewayProps {
  isSupabaseConfigured: boolean;
  canOpenDesignSystem: boolean;
  canAccessSalesMarketing: boolean;
  canAccessManagement: boolean;
  canManageUsers: boolean;
  userLabel: string;
  roleLabel: string;
  onOpenDesignSystem: () => void;
  onManageUsers: () => void;
  onEnterSalesMarketing: () => void;
  onEnterManagement: () => void;
}

const workspaces = [
  {
    id: 'sales-marketing',
    volume: 'Volume 2 & 3 · Unified',
    title: 'Sales & Marketing Platform',
    description:
      'Unified commercial execution and growth platform. Manage client deals, CPQ margin quotes, consent-aware campaigns, content briefs, and cross-channel media ROI analysis.',
    fieldLabel: 'Authenticated identity',
    contextLabel: 'Commercial & campaign scope',
    context: 'Sales + Marketing controls unified',
    icon: TrendingUp,
    accent: '#335AA8',
    tint: '#EEF3FB',
  },
  {
    id: 'management',
    volume: 'Volume 1 · Management',
    title: 'CEO & Management Suite',
    description:
      'Command Centre oversight for group executives. Monitor business performance matrices, OKR strategy mapping, policy overrides, and entity registries.',
    fieldLabel: 'Authenticated identity',
    contextLabel: 'Authorisation clearance',
    context: 'Level 5 · Global executive',
    icon: Building2,
    accent: '#183153',
    tint: '#EDF1F6',
  },
] as const;

export default function IdentityGateway({
  isSupabaseConfigured,
  canOpenDesignSystem,
  canAccessSalesMarketing,
  canAccessManagement,
  canManageUsers,
  userLabel,
  roleLabel,
  onOpenDesignSystem,
  onManageUsers,
  onEnterSalesMarketing,
  onEnterManagement,
}: IdentityGatewayProps) {
  const actions = {
    'sales-marketing': onEnterSalesMarketing,
    management: onEnterManagement,
  };

  const systemNodes = [
    ['Database Spine', isSupabaseConfigured ? 'ONLINE' : 'DEMO ACTIVE'],
    ['SOX Audit Ledger', 'SECURED'],
    ['GPS Logistics', 'ACTIVE'],
  ];
  const availableWorkspaces = workspaces.filter((workspace) => (
    workspace.id === 'sales-marketing' ? canAccessSalesMarketing : canAccessManagement
  ));

  return (
    <div className="relative isolate flex-1 overflow-y-auto bg-[#F3F6FA]">
      <COSLogoWatermark />
      <div className="mx-auto min-h-full w-full max-w-[1540px] px-4 pb-10 sm:px-7 lg:px-10">
        <header className="flex min-h-[76px] items-center justify-between gap-3 border-b border-[#D7DEE8]">
          <div className="flex min-w-0 items-center gap-3">
            <COSLogo className="h-9 w-9" variant="full" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#335AA8]">
                Central Operating System
              </p>
              <p className="truncate text-sm font-semibold text-[#111C33]">Identity gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[#77839A] sm:block">
              Internal access · CO-10
            </span>
            {canOpenDesignSystem && <button
              onClick={onOpenDesignSystem}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-[#C9D3E2] bg-white px-3 text-xs font-semibold text-[#26344F] shadow-[0_1px_2px_rgba(15,29,55,0.06)] transition hover:border-[#335AA8] hover:text-[#335AA8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#335AA8]"
            >
              <Sliders size={15} strokeWidth={1.8} />
              <span className="hidden sm:inline">Design system</span>
            </button>}
            {canManageUsers && <button
              onClick={onManageUsers}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-[#C9D3E2] bg-white px-3 text-xs font-semibold text-[#26344F] shadow-[0_1px_2px_rgba(15,29,55,0.06)] transition hover:border-[#C84F2A] hover:text-[#C84F2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C84F2A]"
            >
              <UserCog size={15} strokeWidth={1.8} />
              <span className="hidden sm:inline">User provisioning</span>
            </button>}
          </div>
        </header>

        <section
          className="mx-auto max-w-4xl pb-8 pt-11 text-center sm:pt-14 lg:pt-16"
          aria-labelledby="gateway-title"
        >
          <div className="mx-auto inline-flex items-center gap-3 rounded-xl border border-[#C9D3E2] bg-white px-4 py-3 text-left shadow-[0_5px_14px_rgba(20,36,64,0.08)]">
            <COSLogo className="h-8 w-8" variant="full" />
            <div className="border-l border-[#D7DEE8] pl-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#335AA8]">
                Authorised entry point
              </p>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.04em] text-[#111C33]">
                COS V1 Portal Gateway
              </p>
            </div>
          </div>
          <h1
            id="gateway-title"
            className="mt-7 text-[36px] font-bold leading-[1.02] tracking-[-0.04em] text-[#10192D] sm:text-[58px] sm:leading-[0.98] lg:text-[68px]"
          >
            Central Operating System
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-7 text-[#5A6A84] sm:text-lg sm:leading-8">
            A single identity gateway for commercial operations, consent-aware growth, and
            leadership oversight—governed through one shared operating spine.
          </p>
        </section>

        <section
          className="mx-auto max-w-[980px] rounded-2xl border border-[#CAD4E1] bg-white p-4 shadow-[0_7px_20px_rgba(20,36,64,0.08)] sm:p-5"
          aria-labelledby="live-nodes-title"
        >
          <div className="flex items-center justify-between border-b border-[#E1E6EE] pb-3">
            <h2
              id="live-nodes-title"
              className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#73809A]"
            >
              Live system nodes
            </h2>
            <span className="rounded-md bg-[#EEF3FB] px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.09em] text-[#335AA8]">
              CO-10 secure
            </span>
          </div>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {systemNodes.map(([label, status]) => (
              <div
                key={label}
                className="flex min-h-12 items-center justify-between rounded-lg border border-[#E4E9F0] bg-[#F8FAFC] px-3.5"
              >
                <dt className="text-xs font-medium text-[#52617A]">{label}</dt>
                <dd className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[#14213A]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#31B88A]"
                    aria-hidden="true"
                  />
                  {status}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="mx-auto mt-8 max-w-[1280px]"
          aria-labelledby="workspace-destinations-title"
        >
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#7B879B]">
                Authorised destinations
              </p>
              <h2
                id="workspace-destinations-title"
                className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#111C33]"
              >
                Choose your operating workspace
              </h2>
            </div>
            <p className="hidden text-xs text-[#7B879B] sm:block">
              Role and scope are recorded on entry.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {availableWorkspaces.map((workspace) => {
              const Icon = workspace.icon;
              return (
                <article
                  key={workspace.id}
                  data-workspace={workspace.id}
                  className="gateway-workspace-card group flex flex-col rounded-2xl border border-[#C9D3E2] p-5 shadow-[0_7px_18px_rgba(20,36,64,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9BAAC0] hover:shadow-[0_12px_28px_rgba(20,36,64,0.1)] sm:p-6 lg:min-h-[410px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl border"
                      style={{
                        color: workspace.accent,
                        backgroundColor: workspace.tint,
                        borderColor: `${workspace.accent}35`,
                      }}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <span
                      className="rounded-md border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.09em]"
                      style={{
                        color: workspace.accent,
                        backgroundColor: workspace.tint,
                        borderColor: `${workspace.accent}30`,
                      }}
                    >
                      {workspace.volume}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-[21px] font-bold tracking-[-0.025em] text-[#111C33]">
                      {workspace.title}
                    </h3>
                    <p className="mt-3 min-h-[66px] text-sm leading-[1.65] text-[#5B6B84]">
                      {workspace.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4 border-t border-[#DCE3EC] pt-5">
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#78859B]">
                        {workspace.fieldLabel}
                      </span>
                      <div className="flex min-h-11 items-center rounded-lg border border-[#CBD5E2] bg-[#F9FBFD] px-3 text-xs font-semibold text-[#18243A]">{userLabel}</div>
                    </label>
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#78859B]">
                        {workspace.contextLabel}
                      </p>
                      <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#D7DFEA] bg-[#F3F6FA] px-3 font-mono text-[10px] uppercase tracking-[0.05em] text-[#46556E]">
                        <ShieldCheck size={14} style={{ color: workspace.accent }} />
                        {workspace.context} · {roleLabel}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      actions[workspace.id]();
                      window.setTimeout(() => window.location.assign(workspace.id === 'management' ? '/app/management' : '/app/sales-marketing'), 1750);
                    }}
                    className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold text-white shadow-[0_5px_12px_rgba(19,39,71,0.14)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      backgroundColor: workspace.accent,
                      outlineColor: workspace.accent,
                    }}
                    aria-label={`Authenticate and enter ${workspace.title}`}
                  >
                    Authenticate & launch
                    <ArrowRight
                      size={15}
                      strokeWidth={1.8}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </article>
              );
            })}
            {availableWorkspaces.length === 0 && <div className="rounded-2xl border border-[#D7DFEA] bg-white p-8 text-center text-sm text-[#5B6B84]">Your account has no approved business workspace. Contact an administrator if you believe this is incorrect.</div>}
          </div>
        </section>

        <footer className="mx-auto mt-8 flex max-w-[1280px] flex-col gap-2 border-t border-[#D7DEE8] py-5 text-[10px] text-[#758197] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Access, changes, and recommendations are recorded against your active identity.
          </p>
          <p className="font-mono uppercase tracking-[0.08em]">
            TLS 1.3 · Session monitored · Internal & confidential
          </p>
        </footer>
      </div>
    </div>
  );
}
