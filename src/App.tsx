/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePortalData, type PortalDataStatus } from './app/usePortalData';
import { useAuthorization } from './auth/AuthorizationProvider';
import CardInteractionManager from './components/CardInteractionManager';
import HexLoader from './components/HexLoader';
import IdentityGateway from './components/IdentityGateway';
import { isSupabaseConfigured } from './supabaseClient';

type AppPlatform = 'gateway' | 'sales-marketing' | 'management' | 'design-system';

const DesignSystemPlatform = lazy(() => import('./components/DesignSystemPlatform'));
const ManagementPlatform = lazy(() => import('./components/ManagementPlatform'));
const SalesMarketingPlatform = lazy(() => import('./components/SalesMarketingPlatform'));

const DATA_STATUS_MESSAGE: Record<Exclude<PortalDataStatus, 'ready'>, { tone: string; text: string }> = {
  loading: { tone: 'border-[#D8D6CE] bg-white text-[#5E6872]', text: 'Loading governed business records…' },
  demo: { tone: 'border-[#8A5A12] bg-[#F5ECD8] text-[#65420D]', text: 'Development fixture mode is active. These records are not production data.' },
  empty: { tone: 'border-[#D8D6CE] bg-white text-[#5E6872]', text: 'No business records are available for this workspace yet.' },
  unauthorized: { tone: 'border-[#A63A32] bg-[#F6E3E1] text-[#7E2D28]', text: 'Business records are restricted by policy. No demo records have been shown.' },
  error: { tone: 'border-[#A63A32] bg-[#F6E3E1] text-[#7E2D28]', text: 'Business records could not be loaded. No demo records have been shown.' },
  unavailable: { tone: 'border-[#A63A32] bg-[#F6E3E1] text-[#7E2D28]', text: 'The business data service is unavailable. No demo records have been shown.' },
};

export default function App({ initialPlatform = 'gateway' }: { initialPlatform?: AppPlatform }) {
  const { canAccessWorkspace, hasPermission, permissions, profile, role } = useAuthorization();
  const portalData = usePortalData();
  const [activePlatform, setActivePlatform] = useState<AppPlatform>(initialPlatform);
  const [salesMarketingInitialArea, setSalesMarketingInitialArea] = useState('home');
  const [launchTransition, setLaunchTransition] = useState<{ target: AppPlatform; label: string } | null>(null);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  const beginPlatformTransition = (target: AppPlatform, label: string, onComplete?: () => void) => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setLaunchTransition({ target, label });
    transitionTimer.current = window.setTimeout(() => {
      setActivePlatform(target);
      setLaunchTransition(null);
      transitionTimer.current = null;
      onComplete?.();
    }, 1750);
  };

  const canAccessSalesMarketing = canAccessWorkspace('sales-marketing');
  const canAccessManagement = canAccessWorkspace('management');
  const canOpenDesignSystem = hasPermission('system.view');
  const canManageUsers = hasPermission('users.view');
  const userLabel = profile ? `${profile.firstName} ${profile.lastName}` : 'Authorized COS user';
  const roleLabel = role?.name ?? 'Authorized role';
  const dataMessage = portalData.status === 'ready' ? null : DATA_STATUS_MESSAGE[portalData.status];
  const handleExitWorkspace = () => window.location.assign('/app');

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#F7F9FC] font-sans text-slate-800">
      <CardInteractionManager />
      {launchTransition && <HexLoader fullPage size="lg" label={launchTransition.label} />}
      {dataMessage && (
        <div
          className={`relative z-30 border-b px-4 py-2 text-center text-xs font-medium sm:px-6 ${dataMessage.tone}`}
          role={portalData.status === 'loading' ? 'status' : 'alert'}
        >
          {dataMessage.text}
        </div>
      )}

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {activePlatform === 'gateway' && (
          <IdentityGateway
            isSupabaseConfigured={isSupabaseConfigured}
            canOpenDesignSystem={canOpenDesignSystem}
            canAccessSalesMarketing={canAccessSalesMarketing}
            canAccessManagement={canAccessManagement}
            canManageUsers={canManageUsers}
            userLabel={userLabel}
            roleLabel={roleLabel}
            onOpenDesignSystem={() => beginPlatformTransition('design-system', 'Opening COS Design System…')}
            onManageUsers={() => window.location.assign('/app/users')}
            onEnterSalesMarketing={() => {
              setSalesMarketingInitialArea('home');
              beginPlatformTransition('sales-marketing', 'Authenticating & Launching Sales & Marketing Platform…', () => {
                void portalData.addLog('Sales & Marketing Session Authorized', 'Permission', 'Commercial Workspace', 'S&M', 'Entered the unified Sales & Marketing platform through the governed gateway').catch(() => undefined);
              });
            }}
            onEnterManagement={() => {
              beginPlatformTransition('management', 'Authenticating & Launching Executive Management Suite…', () => {
                void portalData.addLog('Executive Session Authorized', 'Permission', 'CEO', 'Management', 'Entered Management from governed gateway').catch(() => undefined);
              });
            }}
          />
        )}

        <Suspense fallback={<HexLoader fullPage size="lg" label="Loading workspace…" />}>
          {activePlatform === 'sales-marketing' && canAccessSalesMarketing && (
            <SalesMarketingPlatform
              companies={portalData.companies}
              deals={portalData.deals}
              campaigns={portalData.campaigns}
              auditLogs={portalData.auditLogs}
              approvals={portalData.approvals}
              initialArea={salesMarketingInitialArea}
              permissions={permissions}
              userName={userLabel}
              userRole={roleLabel}
              onAddLog={portalData.addLog}
              onUpdateDeals={portalData.updateDeals}
              onExitToGateway={handleExitWorkspace}
            />
          )}

          {activePlatform === 'management' && canAccessManagement && (
            <ManagementPlatform
              companies={portalData.companies}
              orders={portalData.orders}
              auditLogs={portalData.auditLogs}
              approvals={portalData.approvals}
              onExitToGateway={handleExitWorkspace}
            />
          )}

          {activePlatform === 'design-system' && canOpenDesignSystem && (
            <DesignSystemPlatform onExitToGateway={handleExitWorkspace} />
          )}
        </Suspense>
      </main>
    </div>
  );
}
