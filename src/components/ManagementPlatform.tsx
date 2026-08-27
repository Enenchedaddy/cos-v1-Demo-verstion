/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import COSLogoWatermark from './COSLogoWatermark';
import HexLoader from './HexLoader';
import SidebarEntityScope from './SidebarEntityScope';
import { MANAGEMENT_RAIL_AREAS } from '../navigation/management';
import ManagementSidebar from './ManagementSidebar';
import { ContextRailHeader, ContextRailSearch, ExpandedSidebarNavigation, GlobalIconRail } from './DualRailNavigation';
import { Company, Deal, Quote, Order, Invoice, CylinderBalance, SupportTicket, Campaign, AuditLog, ApprovalRequest, Product } from '../types';
import { 
  Users, TrendingUp, Percent, FileText, Activity, MessageSquare, ArrowRight, Plus, Check, AlertTriangle, 
  Search, ShieldAlert, Phone, Mail, MapPin, DollarSign, Award, Clock, FileCheck, CheckCircle2, RefreshCw, 
  Layers, Sliders, Calendar, BookOpen, AlertCircle, PlayCircle, ShieldCheck, Database, HelpCircle, HardDrive, 
  UserCheck, Shield, Sparkles, Network, Clipboard, Compass, Info, ChevronRight, Minimize2, CheckSquare, XCircle, Ban,
  FolderOpen, Settings, UserPlus, Building, BarChart2, Briefcase, Zap, GitPullRequest, Globe, Users2, Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManagementPlatformProps {
  companies: Company[];
  deals: Deal[];
  quotes: Quote[];
  orders: Order[];
  invoices: Invoice[];
  cylinders: CylinderBalance[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  approvals: ApprovalRequest[];
  products: Product[];
  currentRole: string;
  onAddLog: (action: string, entityType: any, entityName: string, platform: 'Customer' | 'S&M' | 'Management' | 'Shared', details?: string) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateQuotes: (quotes: Quote[]) => void;
  onUpdateCompanies: (companies: Company[]) => void;
  onUpdateApprovals: (approvals: ApprovalRequest[]) => void;
  onExitToGateway?: () => void;
}

export default function ManagementPlatform({
  companies,
  deals,
  quotes,
  orders,
  invoices,
  cylinders,
  tickets,
  auditLogs,
  approvals,
  products,
  currentRole,
  onAddLog,
  onUpdateOrders,
  onUpdateQuotes,
  onUpdateCompanies,
  onUpdateApprovals,
  onExitToGateway
}: ManagementPlatformProps) {
  // Sidebar Tabs States (Morally mapped to Volume 1 PDF hierarchy)
  const [activeTab, setActiveTab] = useState<'home' | 'performance' | 'governance' | 'strategy' | 'organisation' | 'acquisitions' | 'alerts' | 'group-admin'>('home');
  const [homeSubTab, setHomeSubTab] = useState<'functional' | 'company' | 'ceo'>('functional');
  const [performanceSubTab, setPerformanceSubTab] = useState<'bu' | 'dictionary' | 'reports' | 'leaderboard' | 'finance' | 'inventory'>('bu');
  const [governanceSubTab, setGovernanceSubTab] = useState<'policy' | 'console' | 'access' | 'oversight'>('policy');
  const [strategySubTab, setStrategySubTab] = useState<'goals' | 'strategy-map' | 'meetings' | 'budgets'>('goals');
  const [organisationSubTab, setOrganisationSubTab] = useState<'org-chart' | 'plan-role'>('org-chart');
  const [acquisitionsSubTab, setAcquisitionsSubTab] = useState<'pipeline' | 'day-100'>('pipeline');
  const [alertsSubTab, setAlertsSubTab] = useState<'rules' | 'knowledge' | 'feed'>('rules');
  const [groupAdminSubTab, setGroupAdminSubTab] = useState<'registry' | 'profile' | 'evidence' | 'offtake' | 'hub'>('registry');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarMode, setSidebarMode] = useState<'global' | 'contextual'>('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    if (!isSidebarOpen || typeof window === 'undefined' || !window.matchMedia('(max-width: 1023px)').matches) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isSidebarOpen]);

  // Simulated view state overrides ('loaded' | 'empty' | 'loading' | 'error' | 'restricted')
  const [simulatedState, setSimulatedState] = useState<'loaded' | 'empty' | 'loading' | 'error' | 'restricted'>('loaded');
  const activeRailArea = MANAGEMENT_RAIL_AREAS.find((area) => area.id === activeTab) ?? MANAGEMENT_RAIL_AREAS[0];
  const activeManagementChild = activeTab === 'home' ? homeSubTab
    : activeTab === 'performance' ? performanceSubTab
      : activeTab === 'governance' ? governanceSubTab
        : activeTab === 'strategy' ? strategySubTab
          : activeTab === 'organisation' ? organisationSubTab
            : activeTab === 'acquisitions' ? acquisitionsSubTab
              : activeTab === 'alerts' ? alertsSubTab
                : groupAdminSubTab;

  const selectManagementArea = (id: string) => {
    if (!MANAGEMENT_RAIL_AREAS.some((area) => area.id === id)) return;
    setActiveTab(id as typeof activeTab);
    setSimulatedState('loaded');
    setSidebarSearch('');
    setSidebarMode('contextual');
  };

  const selectManagementChild = (parentId: string, childId: string) => {
    const parent = MANAGEMENT_RAIL_AREAS.find((area) => area.id === parentId);
    if (!parent?.children?.some((child) => child.id === childId)) return;
    setActiveTab(parentId as typeof activeTab);
    setSimulatedState('loaded');
    setSidebarSearch('');
    if (parentId === 'home') setHomeSubTab(childId as typeof homeSubTab);
    if (parentId === 'performance') setPerformanceSubTab(childId as typeof performanceSubTab);
    if (parentId === 'governance') setGovernanceSubTab(childId as typeof governanceSubTab);
    if (parentId === 'strategy') setStrategySubTab(childId as typeof strategySubTab);
    if (parentId === 'organisation') setOrganisationSubTab(childId as typeof organisationSubTab);
    if (parentId === 'acquisitions') setAcquisitionsSubTab(childId as typeof acquisitionsSubTab);
    if (parentId === 'alerts') setAlertsSubTab(childId as typeof alertsSubTab);
    if (parentId === 'group-admin') setGroupAdminSubTab(childId as typeof groupAdminSubTab);
  };

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Floating search results memo for Management
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      action: () => void;
    }> = [];

    // 1. Approvals
    approvals.forEach(appr => {
      if ((appr.customerName && appr.customerName.toLowerCase().includes(q)) || appr.type.toLowerCase().includes(q) || appr.requestedBy.toLowerCase().includes(q) || appr.status.toLowerCase().includes(q)) {
        results.push({
          id: `approval-${appr.id}`,
          title: `Approval: ${appr.customerName || 'Pending'}`,
          subtitle: `Type: ${appr.type} • Req: ${appr.requestedBy} • Status: ${appr.status}`,
          category: 'Audit / Approval',
          action: () => {
            setActiveTab('home');
            setHomeSubTab('ceo');
            setSearchQuery('');
          }
        });
      }
    });

    // 2. Audit Logs
    auditLogs.forEach(log => {
      if (log.action.toLowerCase().includes(q) || log.entityName.toLowerCase().includes(q) || log.user.toLowerCase().includes(q) || (log.details && log.details.toLowerCase().includes(q))) {
        results.push({
          id: `log-${log.id}`,
          title: log.action,
          subtitle: `Op: ${log.user} • Entity: ${log.entityName} • Platform: ${log.platform}`,
          category: 'Compliance Log',
          action: () => {
            setActiveTab('governance');
            setGovernanceSubTab('oversight');
            setSearchQuery('');
          }
        });
      }
    });

    // 3. Companies / Accounts
    companies.forEach(comp => {
      if (comp.name.toLowerCase().includes(q) || comp.customerNumber.toLowerCase().includes(q) || comp.industry.toLowerCase().includes(q)) {
        results.push({
          id: `company-${comp.id}`,
          title: comp.name,
          subtitle: `Sector: ${comp.industry} • Ref: ${comp.customerNumber}`,
          category: 'Corporate Entity',
          action: () => {
            setActiveTab('performance');
            setPerformanceSubTab('inventory');
            setSearchQuery('');
          }
        });
      }
    });

    // 4. Orders
    orders.forEach(ord => {
      if (ord.orderNumber.toLowerCase().includes(q) || ord.companyName.toLowerCase().includes(q) || ord.status.toLowerCase().includes(q)) {
        results.push({
          id: `order-${ord.id}`,
          title: `Order ${ord.orderNumber}`,
          subtitle: `${ord.companyName} • Status: ${ord.status} • Total: £${ord.grandTotal.toLocaleString()}`,
          category: 'Order Record',
          action: () => {
            setActiveTab('performance');
            setPerformanceSubTab('inventory');
            setSearchQuery('');
          }
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, approvals, auditLogs, companies, orders]);

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="management-platform sales-platform-theme relative flex h-[100dvh] min-w-0 overflow-hidden bg-[#F7F9FC] font-sans">
      
      {/* Standardized dual-rail navigation */}
      <ManagementSidebar
        activeArea={activeRailArea}
        activeChildId={activeManagementChild}
        mode={sidebarMode}
        onAreaSelect={selectManagementArea}
        onChildSelect={selectManagementChild}
        onBackToMain={() => setSidebarMode('global')}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onExit={onExitToGateway}
      />
      <aside
        id="management-legacy-sidebar"
        aria-label="Management navigation"
        className="dual-rail-sidebar cos-workspace-sidebar h-full w-[66px] shrink-0 overflow-visible border-r border-[#082B5B] text-white md:w-[382px]"
        aria-hidden="true"
        style={{ display: 'none' }}
      >
        <GlobalIconRail
          areas={MANAGEMENT_RAIL_AREAS}
          activeId={activeTab}
          initials="OR"
          onSelect={selectManagementArea}
          onExit={onExitToGateway}
        />
        <div className="contextual-rail hidden min-h-0 w-[316px] flex-1 flex-col bg-[#0B3672] md:flex">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Top Branding Section */}
          <ContextRailHeader area={activeRailArea} />

          <SidebarEntityScope
            workspaceName="Management"
            companyScopes={[
              'DL • DELabs Ltd (UK Hub)',
              'AG • Advanced Gases Nigeria',
            ]}
            groupScopes={['OG • Operating Group', 'COS • Consolidated Group']}
          />

          <ContextRailSearch value={sidebarSearch} onChange={setSidebarSearch} />

          <ExpandedSidebarNavigation
            items={MANAGEMENT_RAIL_AREAS}
            activeParentId={activeTab}
            activeChildId={activeManagementChild}
            query={sidebarSearch}
            ariaLabel="Management modules and views"
            onParentSelect={selectManagementArea}
            onChildSelect={selectManagementChild}
          />

          {/* Navigation Items */}
          {false && <nav id="management-context-routes" className="dual-rail-context-nav flex-1 p-4">
            
            {/* HOME CATEGORY */}
            <div className={activeTab === 'home' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Command Views</div>
              <button
                onClick={() => { setActiveTab('home'); setSimulatedState('loaded'); }}
                className={`hidden w-full items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'home' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Activity size={16} />
                <span>Command Home</span>
              </button>
              {activeTab === 'home' && (
                <div className="space-y-1">
                  {(['functional', 'company', 'ceo'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setHomeSubTab(tab)}
                      className={`w-full min-h-11 rounded-xl border-l-4 px-3 text-left text-sm transition-all duration-200 ${
                        homeSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'functional' && 'Functional Home'}
                      {tab === 'company' && 'Company Home'}
                      {tab === 'ceo' && 'Main CEO Dashboard'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PERFORMANCE CATEGORY */}
            <div className={activeTab === 'performance' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Performance Views</div>
              <button
                onClick={() => { setActiveTab('performance'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'performance' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <BarChart2 size={16} />
                <span>Performance & BUs</span>
              </button>
              {activeTab === 'performance' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['bu', 'dictionary', 'reports', 'leaderboard', 'finance', 'inventory'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPerformanceSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        performanceSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'bu' && '• Overview & BU matrix'}
                      {tab === 'dictionary' && '• Metric Dictionary'}
                      {tab === 'reports' && '• Reports Centre'}
                      {tab === 'leaderboard' && '• Team & Leaderboard'}
                      {tab === 'finance' && '• Finance & Cash'}
                      {tab === 'inventory' && '• Inventory / Stock'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GOVERNANCE CATEGORY */}
            <div className={activeTab === 'governance' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Governance Views</div>
              <button
                onClick={() => { setActiveTab('governance'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'governance' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Shield size={16} />
                <span>Governance & Audit</span>
              </button>
              {activeTab === 'governance' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['policy', 'console', 'access', 'oversight'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setGovernanceSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        governanceSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'policy' && '• Approval Policy'}
                      {tab === 'console' && '• Governance Console'}
                      {tab === 'access' && '• Access & Elevation'}
                      {tab === 'oversight' && '• AI Oversight Control'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STRATEGY & PLANNING */}
            <div className={activeTab === 'strategy' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Strategy Views</div>
              <button
                onClick={() => { setActiveTab('strategy'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'strategy' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Sliders size={16} />
                <span>Strategy & Planning</span>
              </button>
              {activeTab === 'strategy' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['goals', 'strategy-map', 'meetings', 'budgets'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStrategySubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        strategySubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'goals' && '• OKRs & Goals'}
                      {tab === 'strategy-map' && '• Strategy map'}
                      {tab === 'meetings' && '• Meetings & Cadence'}
                      {tab === 'budgets' && '• Budgets & Scenario'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ORGANISATION */}
            <div className={activeTab === 'organisation' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Organisation Views</div>
              <button
                onClick={() => { setActiveTab('organisation'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'organisation' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span>Org & Headcount</span>
              </button>
              {activeTab === 'organisation' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['org-chart', 'plan-role'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setOrganisationSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        organisationSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'org-chart' && '• Org Chart'}
                      {tab === 'plan-role' && '• Plan / Role map'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACQUISITIONS */}
            <div className={activeTab === 'acquisitions' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Acquisition Views</div>
              <button
                onClick={() => { setActiveTab('acquisitions'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'acquisitions' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Briefcase size={16} />
                <span>M&A Acquisitions</span>
              </button>
              {activeTab === 'acquisitions' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['pipeline', 'day-100'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAcquisitionsSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        acquisitionsSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'pipeline' && '• M&A Pipeline Board'}
                      {tab === 'day-100' && '• Day-100 Workspace'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ALERTS & KNOWLEDGE */}
            <div className={activeTab === 'alerts' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Alert Views</div>
              <button
                onClick={() => { setActiveTab('alerts'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'alerts' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <AlertCircle size={16} />
                <span>Alerts & Policies</span>
              </button>
              {activeTab === 'alerts' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['rules', 'knowledge', 'feed'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAlertsSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        alertsSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'rules' && '• Notification Rules'}
                      {tab === 'knowledge' && '• Policy Hub & SOP'}
                      {tab === 'feed' && '• Announcements Feed'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GROUP ADMIN */}
            <div className={activeTab === 'group-admin' ? '' : 'hidden'}>
              <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FB0E1]">Registry Views</div>
              <button
                onClick={() => { setActiveTab('group-admin'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'group-admin' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Settings size={16} />
                <span>Entity Registry</span>
              </button>
              {activeTab === 'group-admin' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['registry', 'profile', 'evidence', 'offtake', 'hub'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setGroupAdminSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        groupAdminSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'registry' && '• Legal Registry'}
                      {tab === 'profile' && '• Capability Profiles'}
                      {tab === 'evidence' && '• Transfer-pricing'}
                      {tab === 'offtake' && '• Offtake-contract'}
                      {tab === 'hub' && '• Intercompany Hub'}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </nav>}
        </div>

        {/* Bottom profile info */}
        <div className="min-h-[67px] shrink-0 border-t border-[#2A4E82] bg-[#082B5B] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#5B91FF] bg-[#155EEF] text-xs font-bold text-white">
                OR
              </div>
              <div className="text-left">
                <p className="text-sm font-bold leading-none">Olivia Reed</p>
                <p className="mt-1 text-[11px] leading-none text-[#AFC8F2]">Group CEO</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </aside>

      {/* Main View Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-[#F7F9FC]">
        
        {/* Top bar (56px) */}
        <header className="cos-global-topbar px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <button type="button" className="workspace-sidebar-toggle" aria-controls="management-sidebar" aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setIsSidebarOpen((open) => !open)}><Menu size={20} aria-hidden="true" /></button>
            <span className="text-[10px] bg-[#EEF3FB] text-[#4065B3] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono shrink-0 hidden xs:inline">Governed Command Node</span>
            <span className="text-slate-400 hidden xs:inline">/</span>
            <span className="text-xs font-bold text-slate-700 capitalize font-display truncate">
              {activeTab === 'home' && `Home (${homeSubTab})`}
              {activeTab === 'performance' && `Perf (${performanceSubTab})`}
              {activeTab === 'governance' && `Gov (${governanceSubTab})`}
              {activeTab === 'strategy' && `OKRs (${strategySubTab})`}
              {activeTab === 'organisation' && `Org (${organisationSubTab})`}
              {activeTab === 'acquisitions' && `M&A (${acquisitionsSubTab})`}
              {activeTab === 'alerts' && `Policies (${alertsSubTab})`}
              {activeTab === 'group-admin' && `Legal (${groupAdminSubTab})`}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Audit index search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg px-3 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-600 focus:outline-none focus:border-[#4065B3] w-28 xs:w-36 sm:w-48 md:w-64 transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={12} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <XCircle size={12} />
                </button>
              )}

              {/* Floating Dropdown Results */}
              <AnimatePresence>
                {searchQuery.trim() !== '' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-xl border border-[#D9E0EA] shadow-xl z-50 overflow-hidden max-h-96 flex flex-col"
                  >
                    <div className="p-2.5 bg-slate-50 border-b border-[#D9E0EA] flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Results ({searchResults.length})</span>
                      <button onClick={() => setSearchQuery('')} className="text-[10px] text-[#4065B3] hover:text-[#264288] font-bold">Clear</button>
                    </div>
                    <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin">
                      {searchResults.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium">
                          No records matched "{searchQuery}"
                        </div>
                      ) : (
                        searchResults.map(res => (
                          <button
                            key={res.id}
                            onClick={res.action}
                            className="w-full text-left p-3 hover:bg-slate-50 transition flex flex-col space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</span>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#EEF3FB] text-[#4065B3] tracking-wider shrink-0">{res.category}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 line-clamp-1 font-medium">{res.subtitle}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                <span>Audit Sync Enabled</span>
              </span>
            </div>
          </div>
        </header>

        {/* Viewport content */}
        <div className="management-canvas flex-1 overflow-y-auto p-4 sm:p-6 relative isolate">
          <COSLogoWatermark />
          
          {/* Simulated view states */}
          {simulatedState === 'loading' ? (
            <HexLoader
              size="lg"
              label="Loading corporate entities & executive controls…"
            />
          ) : simulatedState === 'error' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-red-200 p-8 shadow-sm">
              <div className="bg-red-50 text-red-600 p-3 rounded-full mb-4 border border-red-200">
                <XCircle size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Contract Violation Detected · Code COS-7F2A</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">The DSCR ratio dropped below the required 1.5x on-plan limit. Covenant breach forecast trigger activated.</p>
            </div>
          ) : simulatedState === 'restricted' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
              <div className="bg-amber-50 text-amber-700 p-3 rounded-full mb-4 border border-amber-200">
                <Ban size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">•••• Access Forbidden</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md text-center">Access to this registry entity requires GATED board-director clearance or multifactor token verification.</p>
            </div>
          ) : simulatedState === 'empty' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-[#D9E0EA] p-8 shadow-sm">
              <Plus className="text-[#4065B3] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-800 font-display">No intercompany agreements filed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Click 'Add Agreement' to define counterparty flows.</p>
            </div>
          ) : (
            // Loaded State
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${homeSubTab}-${performanceSubTab}-${governanceSubTab}-${strategySubTab}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* USE CASE HOME: MORNING RECONCILIATIONS */}
                {activeTab === 'home' && (
                  <div className="space-y-6 text-left">
                    
                    {homeSubTab === 'functional' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-display">Functional Morning briefing</h1>
                            <p className="text-xs text-slate-500 mt-1">Cross-company Sales & Marketing morning overview with explicit entity scope</p>
                          </div>
                          <span className="text-[11px] font-bold bg-[#EEF3FB] text-[#4065B3] px-2.5 py-1 rounded">Group Mode Active</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Group Pipeline</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">£3,842,000</h3>
                            <span className="text-[10px] text-[#4065B3] font-bold">External opportunities scope</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">DELabs ROAS</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">4.2x</h3>
                            <span className="text-[10px] text-slate-500">UK company proof strip</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Offtake Cover</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">72%</h3>
                            <span className="text-[10px] text-slate-500">Advanced Gases proof strip</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Open Approvals</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">14</h3>
                            <span className="text-[10px] text-amber-600 font-bold">3 urgent · entity-labelled</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {homeSubTab === 'company' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-display">Advanced Gases MD Morning Briefing</h1>
                            <p className="text-xs text-slate-500 mt-1">Company-mode morning across all six Operating Group functions</p>
                          </div>
                          <span className="text-[11px] font-bold bg-[#EEF3FB] text-[#4065B3] px-2.5 py-1 rounded">Advanced Gases Ltd</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">R&D Validation</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">2 trials</h3>
                            <span className="text-[10px] text-slate-500">Product and process validation</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Operations & Logistics</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">96.2%</h3>
                            <span className="text-[10px] text-slate-500 font-bold">Plant uptime & delivery</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Sales & Marketing</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">72%</h3>
                            <span className="text-[10px] text-slate-500">Contracted offtake demand</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-1">
                            <span className="text-xs font-bold text-slate-500">Accounting & Finance</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono">1.62x</h3>
                            <span className="text-[10px] text-amber-600 font-bold">Stressed DSCR case</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {homeSubTab === 'ceo' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-display">Executive Command Centre</h1>
                            <p className="text-xs text-slate-500 mt-1">Single action-oriented operating screen for revenue, margin, cash, and approvals</p>
                          </div>
                        </div>

                        {/* Exceptions bar */}
                        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg flex justify-between items-center text-xs">
                          <p className="font-semibold text-slate-800">4 support SLA breaches detected · £184,000 overdue receivables · 7 deals need forecast review</p>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold font-mono">URGENT ACTIONS</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">YTD GROUP REVENUE</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">£24,840,000</p>
                            <p className="text-[10px] text-green-600 mt-1 font-bold">↑ 12.4% vs last week</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">GROSS MARGIN %</p>
                            <p className="text-2xl font-black text-[#4065B3] mt-1">31.7%</p>
                            <p className="text-[10px] text-slate-500 mt-1">Net Margin: 9.8%</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">OUTSTANDING RECEIVABLES</p>
                            <p className="text-2xl font-black text-[#B42318] mt-1">£184,000</p>
                            <p className="text-[10px] text-slate-500 mt-1">Average DSO: 48 days</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400">ACTIVE ACTION ITEMS</p>
                            <p className="text-2xl font-black text-orange-600 mt-1">14 approvals</p>
                            <p className="text-[10px] text-slate-500 mt-1">3 urgent exceptions</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* PERFORMANCE Monitor (M02-M13) */}
                {activeTab === 'performance' && (
                  <div className="space-y-6 text-left">
                    
                    {performanceSubTab === 'bu' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-display">Business Unit Matrix & Oversight</h1>
                            <p className="text-xs text-slate-500 mt-1">Comparative performance, consolidation, and variance overview per operating unit</p>
                          </div>
                        </div>

                        {/* BU List */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {[
                            { name: 'Electronics', rev: '£468,300', margin: '34.7%', risk: 'Low' },
                            { name: 'Industrial Gases', rev: '£392,600', margin: '31.2%', risk: 'High' },
                            { name: 'Manufacturing', rev: '£196,800', margin: '28.4%', risk: 'Medium' },
                            { name: 'Imports', rev: '£143,700', margin: '30.1%', risk: 'Low' },
                            { name: 'Agency', rev: '£83,200', margin: '33.2%', risk: 'Medium' }
                          ].map(bu => (
                            <div key={bu.name} className="bg-white p-4 rounded-xl border border-[#D9E0EA] shadow-sm space-y-2">
                              <h4 className="text-xs font-bold text-slate-900 font-display">{bu.name}</h4>
                              <p className="text-lg font-black text-slate-800 font-mono">{bu.rev}</p>
                              <div className="flex justify-between text-[10px] font-semibold">
                                <span className="text-slate-500">Margin: {bu.margin}</span>
                                <span className={`font-bold ${bu.risk === 'Low' ? 'text-green-600' : bu.risk === 'High' ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>{bu.risk}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {performanceSubTab === 'dictionary' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-[#D9E0EA] bg-[#EEF3FB]/40">
                          <h4 className="font-bold text-slate-800 text-xs font-display">Pillar Metric Dictionary</h4>
                        </div>
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-xs text-left min-w-[650px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#D9E0EA] font-bold text-slate-600">
                              <th className="p-4">Metric</th>
                              <th className="p-4">Calculation Definition</th>
                              <th className="p-4">Owner Profile</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { m: 'MTD Revenue', def: 'Revenue recognised in period from billing ledgers', owner: 'Idris Khan · Data Analyst' },
                              { m: 'ROAS', def: 'Attributed digital campaign revenue ÷ total media spend', owner: 'Daniel Kerr · Marketing Ops' },
                              { m: 'DSO (Days Sales Outstanding)', def: 'Receivables days based on Net-30 payment logs', owner: 'Clara Evans · Finance Director' },
                              { m: 'SLA Breach Count', def: 'Elapsed ticketing clock > defined support policy limits', owner: 'Helen Shaw · Support Lead' }
                            ].map((row, idx) => (
                              <tr key={idx} className="border-b border-[#D9E0EA] font-semibold text-slate-700">
                                <td className="p-4 font-bold text-slate-900">{row.m}</td>
                                <td className="p-4 font-mono">{row.def}</td>
                                <td className="p-4">{row.owner}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                    {performanceSubTab === 'reports' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Reports Centre & Board Operating Packs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-green-200 bg-green-50/20 rounded-lg">
                            <h4 className="text-xs font-bold text-slate-950 font-display">Board operating pack (FY2026)</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Status: Active · Generated & signed-off by Olivia Reed</p>
                          </div>
                          <div className="p-4 border border-[#D9E0EA] bg-[#F7F9FC] rounded-lg">
                            <h4 className="text-xs font-bold text-slate-950 font-display">Newcastle Depot Productivity Log</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Status: Complete · Verified by Peter Cole</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* GOVERNANCE CONTROL (M17-M20) */}
                {activeTab === 'governance' && (
                  <div className="space-y-6 text-left">
                    
                    {governanceSubTab === 'policy' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Approval Policy & Delegation matrix</h3>
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-xs text-left border-collapse font-medium text-slate-700 min-w-[600px]">
                          <thead>
                            <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] font-bold text-slate-800">
                              <th className="p-4">Limit Band</th>
                              <th className="p-4">Delegated Approver</th>
                              <th className="p-4">Required Governance Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#D9E0EA]">
                              <td className="p-4 font-mono font-bold">&lt; £5,000</td>
                              <td className="p-4">Marcus Hale (Sales Manager)</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded">Manager</span></td>
                            </tr>
                            <tr className="border-b border-[#D9E0EA]">
                              <td className="p-4 font-mono font-bold">£5,000 – £25,000</td>
                              <td className="p-4">Clara Evans (Finance Director)</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-[#EEF3FB] text-[#4065B3] font-bold rounded">Director</span></td>
                            </tr>
                            <tr className="border-b border-[#D9E0EA]">
                              <td className="p-4 font-mono font-bold">£25,000 – £100,000</td>
                              <td className="p-4">Olivia Reed (Group CEO)</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-purple-50 text-[#6B21A8] border border-purple-200 font-bold rounded">Executive CEO</span></td>
                            </tr>
                            <tr>
                              <td className="p-4 font-mono font-bold">&gt; £100,000</td>
                              <td className="p-4">Board of Directors</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-red-50 text-[#B42318] border border-red-200 font-bold rounded">Board Approval</span></td>
                            </tr>
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                    {governanceSubTab === 'console' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Audit Log & Governance Console</h3>
                        <div className="p-4 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg text-xs font-semibold leading-relaxed">
                          <p className="text-slate-500 font-mono">System event timestamp: 16 Jul 2026 · 14:22 BST</p>
                          <p className="text-slate-900 font-bold mt-1">Audit Record ID: AUD-1029-X81A</p>
                          <p className="text-slate-700 mt-1">"User Olivia Reed (Group CEO) approved the Net-30 credit limit expansion of £184k for Northwind Industrial Ltd."</p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* GROUP ADMIN (M30-M31) */}
                {activeTab === 'group-admin' && (
                  <div className="space-y-6 text-left">
                    
                    {groupAdminSubTab === 'registry' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-[#D9E0EA] bg-[#EEF3FB]/40">
                          <h4 className="font-bold text-slate-800 text-xs font-display">Legal Entity Registry & Structure</h4>
                        </div>
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-xs text-left min-w-[650px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#D9E0EA] font-bold text-slate-600">
                              <th className="p-4">Entity</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Jurisdiction</th>
                              <th className="p-4">Identity</th>
                              <th className="p-4 text-right">Effective Ownership</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'OG Holdings Ltd', type: 'ParentCo', jur: 'Nigeria (NG)', id: 'OG', own: '100% Group' },
                              { name: 'Advanced Gases Nigeria Ltd', type: 'OpCo', jur: 'Nigeria (NG)', id: 'AG - teal', own: '100% Group' },
                              { name: 'DELabs Ltd (United Kingdom)', type: 'OpCo', jur: 'United Kingdom (UK)', id: 'DL - blue', own: '100% Group' },
                              { name: 'OG Operating Services Ltd', type: 'ServiceCo', jur: 'Nigeria (NG)', id: 'OS', own: '100% Group' }
                            ].filter(row => !q || row.name.toLowerCase().includes(q) || row.type.toLowerCase().includes(q) || row.jur.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)).map((row, idx) => (
                              <tr key={idx} className="border-b border-[#D9E0EA] font-semibold text-slate-700">
                                <td className="p-4 font-bold text-slate-900">{row.name}</td>
                                <td className="p-4">{row.type}</td>
                                <td className="p-4 font-mono">{row.jur}</td>
                                <td className="p-4 font-mono font-bold text-[#4065B3]">{row.id}</td>
                                <td className="p-4 text-right font-mono font-bold">{row.own}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                    {groupAdminSubTab === 'evidence' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Transfer-pricing Evidence Register</h3>
                        <div className="p-4 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg text-xs leading-relaxed space-y-3 font-semibold text-slate-700">
                          <p>1. <strong>Management Fee Flow:</strong> Cost-plus method. OG Operating Services → Advanced Gases. FY2026 Complete.</p>
                          <p>2. <strong>Supply/Offtake Flow:</strong> Comparable-price method. Advanced Gases → DECity zones. Review Due.</p>
                          <p>3. <strong>IP/Brand Licence:</strong> Royalty benchmark method. OG IP Holdings → DELabs. Draft status.</p>
                        </div>
                      </div>
                    )}

                    {groupAdminSubTab === 'offtake' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Offtake-contract tracker</h3>
                        <div className="p-4 bg-[#EEF3FB]/40 border border-[#D9E0EA] rounded-lg text-xs space-y-1">
                          <p className="font-bold text-slate-800">Contracted Group Capacity: 25 t/day across three active lines</p>
                          <p className="text-slate-600 font-mono text-[11px]">DECity-zone contracts roll capacity, start dates, and status parameters.</p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}

        </div>

      </section>

    </div>
  );
}
