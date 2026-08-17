import {
  ArrowRight,
  Building2,
  MessageSquare,
  ShieldCheck,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import COSLogo from './COSLogo';
import COSLogoWatermark from './COSLogoWatermark';

interface IdentityGatewayProps {
  isSupabaseConfigured: boolean;
  onOpenDesignSystem: () => void;
  onEnterSales: () => void;
  onEnterMarketing: () => void;
  onEnterManagement: () => void;
}

const workspaces = [
  {
    id: 'sales',
    volume: 'Volume 2 · Sales',
    title: 'Sales Platform',
    description:
      'Manage accounts, pipeline, governed quotes, customer signals, and commercial controls.',
    fieldLabel: 'Sales profile',
    options: [
      'Chris Allen · Senior Sales Representative',
      'Emily Johnson · Regional Accounts Manager',
    ],
    contextLabel: 'Region oversight',
    context: 'EMEA / UK regional hub',
    icon: TrendingUp,
    accent: '#0A9B72',
    tint: '#EAF8F3',
  },
  {
    id: 'marketing',
    volume: 'Volume 3 · Marketing',
    title: 'Marketing Platform',
    description:
      'Govern campaign planning, consent-aware audiences, creative production, and measured growth.',
    fieldLabel: 'Marketer profile',
    options: [
      'Aisha Bello · Marketing Director',
      'Daniel Kerr · Ad Campaigns Lead',
    ],
    contextLabel: 'Consent scope',
    context: 'GDPR / PECR policy enforced',
    icon: MessageSquare,
    accent: '#3F67B5',
    tint: '#EEF3FC',
  },
  {
    id: 'management',
    volume: 'Volume 1 · Management',
    title: 'CEO & Management Suite',
    description:
      'Review group performance, material exceptions, approvals, policy, and entity governance.',
    fieldLabel: 'Executive role profile',
    options: [
      'Olivia Reed · Group CEO & Executive Director',
      'Clara Evans · Chief Financial Officer',
    ],
    contextLabel: 'Authorisation clearance',
    context: 'Level 5 · Global executive',
    icon: Building2,
    accent: '#183153',
    tint: '#EDF1F6',
  },
] as const;

export default function IdentityGateway({
  isSupabaseConfigured,
  onOpenDesignSystem,
  onEnterSales,
  onEnterMarketing,
  onEnterManagement,
}: IdentityGatewayProps) {
  const actions = {
    sales: onEnterSales,
    marketing: onEnterMarketing,
    management: onEnterManagement,
  };

  const systemNodes = [
    ['Identity provider', 'Verified'],
    ['Policy engine', 'Enforced'],
    ['Database spine', isSupabaseConfigured ? 'Connected' : 'Demo active'],
    ['Audit ledger', 'Recording'],
  ];

  return (
    <div className="relative isolate flex-1 overflow-y-auto bg-[#F3F6FA]">
      <COSLogoWatermark />
      <div className="mx-auto min-h-full w-full max-w-[1540px] px-4 pb-10 sm:px-7 lg:px-10">
        <header className="flex min-h-[76px] items-center justify-between border-b border-[#D7DEE8]">
          <div className="flex items-center gap-3">
            <COSLogo className="h-9 w-9" variant="full" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#335AA8]">
                Central Operating System
              </p>
              <p className="text-sm font-semibold text-[#111C33]">Identity gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[#77839A] sm:block">
              Internal access · CO-10
            </span>
            <button
              onClick={onOpenDesignSystem}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-[#C9D3E2] bg-white px-3 text-xs font-semibold text-[#26344F] shadow-[0_1px_2px_rgba(15,29,55,0.06)] transition hover:border-[#335AA8] hover:text-[#335AA8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#335AA8]"
            >
              <Sliders size={15} strokeWidth={1.8} />
              <span className="hidden sm:inline">Design system</span>
            </button>
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
            className="mt-7 text-[42px] font-bold leading-[0.98] tracking-[-0.045em] text-[#10192D] sm:text-[58px] lg:text-[68px]"
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

          <div className="grid gap-4 lg:grid-cols-3">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;
              return (
                <article
                  key={workspace.id}
                  data-workspace={workspace.id}
                  className="gateway-workspace-card group flex min-h-[410px] flex-col rounded-2xl border border-[#C9D3E2] p-5 shadow-[0_7px_18px_rgba(20,36,64,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9BAAC0] hover:shadow-[0_12px_28px_rgba(20,36,64,0.1)] sm:p-6"
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
                      <select className="min-h-11 w-full rounded-lg border border-[#CBD5E2] bg-[#F9FBFD] px-3 text-xs font-semibold text-[#18243A] outline-none transition focus:border-[#335AA8] focus:ring-2 focus:ring-[#335AA8]/15">
                        {workspace.options.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#78859B]">
                        {workspace.contextLabel}
                      </p>
                      <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#D7DFEA] bg-[#F3F6FA] px-3 font-mono text-[10px] uppercase tracking-[0.05em] text-[#46556E]">
                        <ShieldCheck size={14} style={{ color: workspace.accent }} />
                        {workspace.context}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={actions[workspace.id]}
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
