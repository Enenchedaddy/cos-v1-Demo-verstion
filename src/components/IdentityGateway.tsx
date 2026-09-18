import type { SVGProps } from 'react';
import { Network, Sliders, UserCog } from 'lucide-react';
import COSLogo from './COSLogo';
import './IdentityGateway.css';

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

function SalesGrowthIcon({ size = 76, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 76" fill="none" stroke="currentColor" {...props} strokeWidth={3.5}>
      <rect x="5" y="39" width="15" height="23" rx="2.5" />
      <rect x="29" y="23" width="15" height="39" rx="2.5" />
      <rect x="53" y="7" width="15" height="55" rx="2.5" />
      <path d="M3 71h68" strokeLinecap="round" />
    </svg>
  );
}

const workspaces = [
  { id: 'sales-marketing', title: 'Sales and Marketing', accessibleTitle: 'Sales & Marketing Platform', icon: SalesGrowthIcon },
  { id: 'management', title: 'Management', accessibleTitle: 'CEO & Management Suite', icon: Network },
] as const;

export default function IdentityGateway({
  canOpenDesignSystem,
  canAccessSalesMarketing,
  canAccessManagement,
  canManageUsers,
  onOpenDesignSystem,
  onManageUsers,
  onEnterSalesMarketing,
  onEnterManagement,
}: IdentityGatewayProps) {
  const actions = {
    'sales-marketing': onEnterSalesMarketing,
    management: onEnterManagement,
  };
  const availableWorkspaces = workspaces.filter((workspace) => (
    workspace.id === 'sales-marketing' ? canAccessSalesMarketing : canAccessManagement
  ));

  return (
    <div className="cos-gateway">
      <div className="cos-gateway__utilities">
        {canOpenDesignSystem && <button hidden onClick={onOpenDesignSystem}>
          <Sliders size={16} aria-hidden="true" />
          Design system
        </button>}
        {canManageUsers && <button className="cos-gateway__users" onClick={onManageUsers}>
          <UserCog size={16} aria-hidden="true" />
          User provisioning
        </button>}
      </div>
      <section className="cos-gateway__content" aria-labelledby="gateway-title">
        <h1 id="gateway-title" className="sr-only">Choose your operating workspace</h1>
        <div className="cos-gateway__brand" aria-label="Central Operating System">
          <COSLogo className="cos-gateway__logo" variant="monochrome" />
          <span aria-hidden="true">COS</span>
        </div>
        <div className="cos-gateway__workspaces">
          {availableWorkspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <article key={workspace.id} data-workspace={workspace.id} className="cos-gateway__card">
                <Icon className="cos-gateway__icon" size={76} strokeWidth={1.25} aria-hidden="true" />
                <h2>{workspace.title}<br />platform</h2>
                <button
                  className="cos-gateway__enter"
                  onClick={() => {
                    actions[workspace.id]();
                    window.setTimeout(() => window.location.assign(workspace.id === 'management' ? '/app/management' : '/app/sales-marketing'), 1750);
                  }}
                  aria-label={`Authenticate and enter ${workspace.accessibleTitle}`}
                >
                  Enter
                </button>
              </article>
            );
          })}
          {availableWorkspaces.length === 0 && <div className="cos-gateway__empty">Your account has no approved business workspace. Contact an administrator if you believe this is incorrect.</div>}
        </div>
      </section>
    </div>
  );
}
