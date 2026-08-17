/**
 * Application shell: selects the active workspace and owns only shell-level
 * UI state. Portal data and Supabase synchronisation live in app/usePortalData.
 */
import { useEffect, useRef, useState } from 'react';
import { Activity, Database } from 'lucide-react';
import { usePortalData } from './app/usePortalData';
import CardInteractionManager from './components/CardInteractionManager';
import DesignSystemPlatform from './components/DesignSystemPlatform';
import HexLoader from './components/HexLoader';
import IdentityGateway from './components/IdentityGateway';
import ManagementPlatform from './components/ManagementPlatform';
import SalesMarketingPlatform from './components/SalesMarketingPlatform';
import ClientApprovalPortal from './content-social/ClientApprovalPortal';
import { isSupabaseConfigured } from './supabaseClient';

type PlatformId = 'gateway' | 'sales-marketing' | 'management' | 'design-system';

export default function App() {
  const {
    companies, orders, invoices, cylinders, tickets, products, deals, quotes, campaigns, approvals, auditLogs,
    addLog, updateCompanies, updateDeals, updateOrders, updateQuotes, updateApprovals,
  } = usePortalData();
  const [showSimulatorLogs, setShowSimulatorLogs] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformId>('gateway');
  const [isInitializing, setIsInitializing] = useState(() => {
    try {
      return sessionStorage.getItem('cos-portal-initialized') !== 'true';
    } catch {
      return true;
    }
  });
  const [launchTransition, setLaunchTransition] = useState<{ target: PlatformId; label: string } | null>(null);
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isInitializing) return;
    const timer = window.setTimeout(() => {
      setIsInitializing(false);
      try {
        sessionStorage.setItem('cos-portal-initialized', 'true');
      } catch {
        // Storage may be unavailable in privacy-restricted browsers.
      }
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [isInitializing]);

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  const beginPlatformTransition = (target: PlatformId, label: string, onComplete?: () => void) => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setLaunchTransition({ target, label });
    transitionTimer.current = window.setTimeout(() => {
      setActivePlatform(target);
      setLaunchTransition(null);
      transitionTimer.current = null;
      onComplete?.();
    }, 1750);
  };

  const clientApprovalToken = new URLSearchParams(window.location.search).get('client_approval');
  if (clientApprovalToken) return <ClientApprovalPortal token={clientApprovalToken} />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F7F9FC] font-sans text-slate-800">
      <CardInteractionManager />
      {isInitializing && <HexLoader fullPage size="lg" label="Initializing core security contexts & database spine…" />}
      {launchTransition && !isInitializing && <HexLoader fullPage size="lg" label={launchTransition.label} />}

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {activePlatform === 'gateway' && (
          <IdentityGateway
            isSupabaseConfigured={isSupabaseConfigured}
            onOpenDesignSystem={() => beginPlatformTransition('design-system', 'Opening COS Design System…')}
            onEnterSalesMarketing={() => {
              beginPlatformTransition('sales-marketing', 'Authenticating & Launching Sales & Marketing Platform…', () => {
                void addLog('Sales & Marketing Session Authorized', 'Permission', 'Commercial Workspace', 'S&M', 'Entered unified Sales & Marketing platform from governed gateway');
              });
            }}
            onEnterManagement={() => {
              beginPlatformTransition('management', 'Authenticating & Launching Executive Management Suite…', () => {
                void addLog('Executive Session Authorized', 'Permission', 'CEO', 'Management', 'Entered Management from governed gateway');
              });
            }}
          />
        )}

        {activePlatform === 'sales-marketing' && (
          <SalesMarketingPlatform
            companies={companies}
            deals={deals}
            campaigns={campaigns}
            auditLogs={auditLogs}
            approvals={approvals}
            initialArea="home"
            onAddLog={addLog}
            onUpdateDeals={updateDeals}
            onLogoutToGateway={() => beginPlatformTransition('gateway', 'Returning to the Identity Gateway…')}
          />
        )}

        {activePlatform === 'management' && (
          <ManagementPlatform
            companies={companies}
            deals={deals}
            quotes={quotes}
            orders={orders}
            invoices={invoices}
            cylinders={cylinders}
            tickets={tickets}
            auditLogs={auditLogs}
            approvals={approvals}
            products={products}
            currentRole="CEO / Executive Director"
            onAddLog={addLog}
            onUpdateOrders={updateOrders}
            onUpdateQuotes={updateQuotes}
            onUpdateCompanies={updateCompanies}
            onUpdateApprovals={updateApprovals}
            onLogoutToGateway={() => beginPlatformTransition('gateway', 'Returning to the Identity Gateway…')}
          />
        )}

        {activePlatform === 'design-system' && (
          <DesignSystemPlatform onLogoutToGateway={() => beginPlatformTransition('gateway', 'Returning to the Identity Gateway…')} />
        )}
      </main>

      {showSimulatorLogs && (
        <div className="relative z-20 flex h-[150px] shrink-0 flex-col border-t border-slate-800 bg-[#081730] text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#050f21] px-6 py-2 text-xs">
            <div className="flex items-center space-x-2">
              <Database size={14} className="text-[#0066CC]" />
              <span className="font-extrabold uppercase tracking-wider">Enterprise SOX Auditing Log Stream (Real-Time Spine Feed)</span>
            </div>
            <button onClick={() => setShowSimulatorLogs(false)} className="text-xs font-bold text-slate-400 hover:text-white">
              Hide Stream
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4 font-mono text-[11px]">
            {auditLogs.length > 0 ? auditLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 border-b border-slate-900 pb-1.5 leading-relaxed last:border-b-0">
                <span className="text-slate-500">[{log.timestamp.split(' ')[1]}]</span>
                <span className="font-[#0066CC] text-[#0066CC]">[{log.entityType.toUpperCase()}]</span>
                <span className="font-bold text-blue-300">{log.action}:</span>
                <span className="text-slate-300">{log.details}</span>
                <span className="ml-auto text-slate-600">IP: {log.ipAddress}</span>
              </div>
            )) : <p className="py-4 text-center italic text-slate-500">Logs stream is active. Interact with the platform to generate compliance logs.</p>}
          </div>
        </div>
      )}

      {!showSimulatorLogs && (
        <button
          onClick={() => setShowSimulatorLogs(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-lg border border-slate-700 bg-[#0B1E3F] p-2.5 text-[10px] font-bold text-slate-200 shadow-xl transition hover:bg-[#153463]"
        >
          <Activity size={12} className="animate-pulse text-[#0066CC]" />
          <span>Expose Spine Log Stream</span>
        </button>
      )}
    </div>
  );
}
