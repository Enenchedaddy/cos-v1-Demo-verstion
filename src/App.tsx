/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState } from 'react';
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

const DATA_ERRORS: Partial<Record<PortalDataStatus, string>> = {
  unauthorized: 'You do not have access to these records. Contact your workspace administrator.',
  error: 'Records could not be loaded or saved. Please refresh and try again.',
  unavailable: 'Unable to connect. Check your connection and refresh the page.',
};

export default function App({ initialPlatform = 'gateway' }: { initialPlatform?: AppPlatform }) {
  const { canAccessWorkspace, hasPermission, permissions, profile, role } = useAuthorization();
  const [activePlatform, setActivePlatform] = useState<AppPlatform>(initialPlatform);
  const portalData = usePortalData(
    activePlatform === 'sales-marketing' && canAccessWorkspace('sales-marketing') ? 'sales-marketing'
      : activePlatform === 'management' && canAccessWorkspace('management') ? 'management' : 'inactive',
  );
  const [salesMarketingInitialArea, setSalesMarketingInitialArea] = useState('home');
  const beginPlatformTransition = (target: AppPlatform, onComplete?: () => void) => {
    setActivePlatform(target);
    onComplete?.();
  };

  const canAccessSalesMarketing = canAccessWorkspace('sales-marketing');
  const canAccessManagement = canAccessWorkspace('management');
  const canOpenDesignSystem = hasPermission('system.view');
  const canManageUsers = hasPermission('users.view');
  const userLabel = profile ? `${profile.firstName} ${profile.lastName}` : 'Authorized COS user';
  const roleLabel = role?.name ?? 'Authorized role';
  const dataError = DATA_ERRORS[portalData.status];
  const handleExitWorkspace = () => window.location.assign('/app');

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#F7F9FC] font-sans text-slate-800">
      <CardInteractionManager />

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
            onOpenDesignSystem={() => beginPlatformTransition('design-system')}
            onManageUsers={() => window.location.assign('/app/users')}
            onEnterSalesMarketing={() => {
              setSalesMarketingInitialArea('home');
              beginPlatformTransition('sales-marketing', () => {
                void portalData.addLog('Sales & Marketing Session Authorized', 'Permission', 'Commercial Workspace', 'S&M', 'Entered the unified Sales & Marketing platform through the governed gateway').catch(() => undefined);
              });
            }}
            onEnterManagement={() => {
              beginPlatformTransition('management', () => {
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
        {dataError && (activePlatform === 'sales-marketing' || activePlatform === 'management') && (
          <p role="alert" className="mx-4 my-2 text-sm text-red-800">{dataError}</p>
        )}
      </main>
    </div>
  );
}
