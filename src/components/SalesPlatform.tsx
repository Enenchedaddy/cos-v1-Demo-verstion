/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import COSLogo from './COSLogo';
import SidebarEntityScope from './SidebarEntityScope';
import { Company, Deal, Quote, Order, Invoice, CylinderBalance, SupportTicket, Campaign, AuditLog, ApprovalRequest, Product } from '../types';
import { 
  Users, TrendingUp, Percent, FileText, Activity, MessageSquare, ArrowRight, Plus, Check, AlertTriangle, 
  Search, ShieldAlert, Phone, Mail, MapPin, DollarSign, Award, Clock, FileCheck, CheckCircle2, RefreshCw, 
  Layers, Sliders, Calendar, BookOpen, AlertCircle, PlayCircle, ShieldCheck, Database, HelpCircle, HardDrive, 
  UserCheck, Shield, Sparkles, Network, Clipboard, Compass, Info, ChevronRight, Minimize2, CheckSquare, XCircle, Ban,
  Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalesPlatformProps {
  companies: Company[];
  deals: Deal[];
  quotes: Quote[];
  orders: Order[];
  invoices: Invoice[];
  cylinders: CylinderBalance[];
  tickets: SupportTicket[];
  campaigns: Campaign[];
  auditLogs: AuditLog[];
  approvals: ApprovalRequest[];
  products: Product[];
  currentRole: string;
  onAddLog: (action: string, entityType: any, entityName: string, platform: 'Customer' | 'S&M' | 'Management' | 'Shared', details?: string) => void;
  onUpdateQuotes: (quotes: Quote[]) => void;
  onUpdateDeals: (deals: Deal[]) => void;
  onAddApproval: (approval: ApprovalRequest) => void;
  onLogoutToGateway?: () => void;
}

export default function SalesPlatform({
  companies,
  deals,
  quotes,
  orders,
  invoices,
  cylinders,
  tickets,
  campaigns,
  auditLogs,
  approvals,
  products,
  currentRole,
  onAddLog,
  onUpdateQuotes,
  onUpdateDeals,
  onAddApproval,
  onLogoutToGateway
}: SalesPlatformProps) {
  // Sidebar State
  const [activeTab, setActiveTab] = useState<'home' | 'crm' | 'pipeline' | 'engagement' | 'forecast' | 'enablement' | 'support' | 'admin'>('home');
  const [crmSubTab, setCrmSubTab] = useState<'accounts' | 'contacts' | 'lifecycle' | 'my-book' | 'relationships'>('accounts');
  const [pipelineSubTab, setPipelineSubTab] = useState<'board' | 'forecast' | 'won-lost' | 'templates'>('board');
  const [engagementSubTab, setEngagementSubTab] = useState<'leads' | 'rules' | 'availability' | 'team-routing'>('leads');
  const [forecastSubTab, setForecastSubTab] = useState<'my-forecast' | 'roll-up' | 'waterfall' | 'territories'>('my-forecast');
  const [enablementSubTab, setEnablementSubTab] = useState<'library' | 'battlecards' | 'signal-inbox' | 'balances' | 'heat-grid'>('library');
  const [supportSubTab, setSupportSubTab] = useState<'applications' | 'tickets' | 'terms'>('applications');
  const [adminSubTab, setAdminSubTab] = useState<'registry' | 'integrations' | 'states'>('registry');

  // Interactive Account Detail Drawer
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'overview' | 'deals' | 'contacts' | 'notes' | 'history'>('overview');
  
  // Lead Simulator state
  const [leadComposeReply, setLeadComposeReply] = useState('Yes — Friday delivery is available. I’ll confirm the slot once operations releases the allocation.');
  const [showReplyUndo, setShowReplyUndo] = useState(false);
  const [isReplyGated, setIsReplyGated] = useState(false);

  // States toggle helper ('empty' | 'loading' | 'error' | 'restricted' | 'loaded')
  const [simulatedState, setSimulatedState] = useState<'loaded' | 'empty' | 'loading' | 'error' | 'restricted'>('loaded');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!isSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Floating search results memo
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

    // 1. Companies
    companies.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.customerNumber.toLowerCase().includes(q)) {
        results.push({
          id: `company-${c.id}`,
          title: c.name,
          subtitle: `${c.industry} • Owner: ${c.accountOwner} • Ref: ${c.customerNumber}`,
          category: 'Account',
          action: () => {
            setActiveTab('crm');
            setCrmSubTab('accounts');
            setSelectedCompanyId(c.id);
            setSearchQuery('');
          }
        });
      }
    });

    // 2. Contacts
    companies.forEach(c => {
      c.contacts.forEach(con => {
        if (con.name.toLowerCase().includes(q) || con.role.toLowerCase().includes(q) || con.email.toLowerCase().includes(q)) {
          results.push({
            id: `contact-${con.id}`,
            title: con.name,
            subtitle: `${con.role} @ ${c.name} • ${con.email}`,
            category: 'Contact',
            action: () => {
              setActiveTab('crm');
              setCrmSubTab('contacts');
              setSelectedCompanyId(c.id);
              setSearchQuery('');
            }
          });
        }
      });
    });

    // 3. Deals
    deals.forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q)) {
        results.push({
          id: `deal-${d.id}`,
          title: d.title,
          subtitle: `Amount: £${d.amount.toLocaleString()} • Stage: ${d.stage}`,
          category: 'Deal',
          action: () => {
            setActiveTab('pipeline');
            setPipelineSubTab('board');
            setSearchQuery('');
          }
        });
      }
    });

    // 4. Support Tickets
    tickets.forEach(t => {
      if (t.description.toLowerCase().includes(q) || t.status.toLowerCase().includes(q) || t.requestType.toLowerCase().includes(q)) {
        results.push({
          id: `ticket-${t.id}`,
          title: `${t.ticketNumber} - ${t.requestType}`,
          subtitle: `Status: ${t.status} • Priority: ${t.priority} • Desc: ${t.description}`,
          category: 'Support Ticket',
          action: () => {
            setActiveTab('support');
            setSupportSubTab('tickets');
            setSearchQuery('');
          }
        });
      }
    });

    // 5. Cylinder Balances
    cylinders.forEach((cyl, idx) => {
      if (cyl.gasType.toLowerCase().includes(q) || cyl.bottleSize.toLowerCase().includes(q)) {
        results.push({
          id: `cylinder-${idx}`,
          title: `${cyl.gasType} Cylinder (${cyl.bottleSize})`,
          subtitle: `Risk: ${cyl.riskLevel} • Full Onsite: ${cyl.fullOnSite} • In Transit: ${cyl.inTransit}`,
          category: 'Cylinder Balance',
          action: () => {
            setActiveTab('enablement');
            setEnablementSubTab('balances');
            setSearchQuery('');
          }
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, companies, deals, tickets, cylinders]);

  const q = searchQuery.toLowerCase().trim();

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Filter deals
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const totalPipelineAmount = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="sales-platform-theme flex h-screen overflow-hidden bg-[#F7F9FC] font-sans relative">
      
      {/* Sidebar backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-950/55 z-30 cursor-default"
          onClick={() => setIsSidebarOpen(false)}
          id="sidebar-backdrop"
          aria-label="Close sales navigation"
        />
      )}
      
      {/* Pop-out sidebar */}
      <aside
        id="sales-sidebar"
        aria-label="Sales navigation"
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        className={`cos-workspace-sidebar w-[280px] max-w-[86vw] bg-[#182A5C] text-white flex flex-col justify-between h-full fixed inset-y-0 left-0 z-40 shadow-xl transition-transform duration-300 motion-reduce:transition-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Top Branding Section */}
          <div className="p-4 border-b border-[#264288] flex items-center gap-3 shrink-0">
            <COSLogo className="w-8 h-8 shrink-0 shadow-md" variant="white" />
            <div className="text-left min-w-0">
              <h2 className="text-[10px] font-black tracking-widest text-[#AFBFDA] uppercase font-display">Central Operating System</h2>
              <p className="text-xs font-black text-white tracking-tight uppercase">Sales V1.0 Platform</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto w-11 h-11 rounded-lg grid place-items-center text-[#AFBFDA] hover:bg-[#264288] hover:text-white transition shrink-0"
              aria-label="Close sales navigation"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <SidebarEntityScope
            workspaceName="Sales"
            companyScopes={[
              'DL • DELabs Ltd (UK Hub)',
              'AG • Advanced Gases Nigeria',
            ]}
            groupScopes={['OG • Operating Group', 'COS • Consolidated Group']}
          />

          {/* Navigation Items */}
          <nav className="p-3 space-y-1" onClick={() => setIsSidebarOpen(false)}>
            
            {/* HOME TAB */}
            <button
              onClick={() => { setActiveTab('home'); setSimulatedState('loaded'); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'home' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
              }`}
            >
              <Activity size={16} />
              <span>Functional Home</span>
            </button>

            {/* CRM SECTION */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">CRM Suite</div>
              <button
                onClick={() => { setActiveTab('crm'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'crm' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span>Client Accounts</span>
              </button>
              {activeTab === 'crm' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['accounts', 'contacts', 'lifecycle', 'my-book', 'relationships'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCrmSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        crmSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'accounts' && '• Accounts Table'}
                      {tab === 'contacts' && '• Contacts Registry'}
                      {tab === 'lifecycle' && '• Lifecycle Board'}
                      {tab === 'my-book' && '• My Owned Book'}
                      {tab === 'relationships' && '• Global Relationships'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PIPELINE SECTION */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Deal Management</div>
              <button
                onClick={() => { setActiveTab('pipeline'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'pipeline' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <TrendingUp size={16} />
                <span>Sales Pipeline</span>
              </button>
              {activeTab === 'pipeline' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['board', 'forecast', 'won-lost', 'templates'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPipelineSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        pipelineSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'board' && '• Pipeline Board'}
                      {tab === 'forecast' && '• Manager Forecast'}
                      {tab === 'won-lost' && '• Won/Lost Analytics'}
                      {tab === 'templates' && '• Pipeline Templates'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ENGAGEMENT */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Outreach</div>
              <button
                onClick={() => { setActiveTab('engagement'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'engagement' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <MessageSquare size={16} />
                <span>Engagement Hub</span>
              </button>
              {activeTab === 'engagement' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['leads', 'rules', 'availability', 'team-routing'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setEngagementSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        engagementSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'leads' && '• Lead Inbox'}
                      {tab === 'rules' && '• Routing Rules'}
                      {tab === 'availability' && '• My Availability'}
                      {tab === 'team-routing' && '• Team Routing'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FORECAST & CAPACITY */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Intelligence</div>
              <button
                onClick={() => { setActiveTab('forecast'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'forecast' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Sliders size={16} />
                <span>Forecasting & Comp</span>
              </button>
              {activeTab === 'forecast' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['my-forecast', 'roll-up', 'waterfall', 'territories'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setForecastSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        forecastSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'my-forecast' && '• My Forecast'}
                      {tab === 'roll-up' && '• Team Roll-up'}
                      {tab === 'waterfall' && '• Waterfall Variance'}
                      {tab === 'territories' && '• Territory Matrix'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ENABLEMENT & SIGNALS */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Playbooks</div>
              <button
                onClick={() => { setActiveTab('enablement'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'enablement' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                <span>Enablement & Signals</span>
              </button>
              {activeTab === 'enablement' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['library', 'battlecards', 'signal-inbox', 'balances', 'heat-grid'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setEnablementSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        enablementSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'library' && '• Reusable Library'}
                      {tab === 'battlecards' && '• Comp. Battlecards'}
                      {tab === 'signal-inbox' && '• Reorder Signal Inbox'}
                      {tab === 'balances' && '• Cylinder Balances'}
                      {tab === 'heat-grid' && '• Account Heat Grid'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PARTNERS & SUPPORT */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Operations</div>
              <button
                onClick={() => { setActiveTab('support'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'support' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Network size={16} />
                <span>Support & Partners</span>
              </button>
              {activeTab === 'support' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['applications', 'tickets', 'terms'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setSupportSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        supportSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'applications' && '• Partner Application'}
                      {tab === 'tickets' && '• Support Tickets'}
                      {tab === 'terms' && '• Terms & Pricing'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ADMIN */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">System</div>
              <button
                onClick={() => { setActiveTab('admin'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'admin' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Sliders size={16} />
                <span>Governance & Admin</span>
              </button>
              {activeTab === 'admin' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['registry', 'integrations', 'states'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAdminSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        adminSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'registry' && '• Automation Registry'}
                      {tab === 'integrations' && '• System Integrations'}
                      {tab === 'states' && '• Design View States'}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </nav>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-[#264288] bg-[#0B1E3F]/80 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                MH
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-none">Marcus Hale</p>
                <p className="text-[10px] text-[#AFBFDA] leading-none mt-1">Sales Manager</p>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-[#6B21A8]/20 text-purple-300 font-mono px-1.5 py-0.5 rounded tracking-wide uppercase border border-[#6B21A8]/30">CO-10</span>
          </div>
          {onLogoutToGateway && (
            <button 
              onClick={onLogoutToGateway}
              className="w-full bg-[#264288] hover:bg-[#4065B3] text-white text-[11px] font-bold py-1.5 px-3 rounded-md transition cursor-pointer text-center"
            >
              Exit Workspace
            </button>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-[#F7F9FC]">
        
        {/* Top bar (56px) */}
        <header className="h-[56px] border-b border-[#D9E0EA] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            {/* Pop-out navigation toggle */}
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="w-11 h-11 grid place-items-center text-slate-600 hover:bg-[#EEF3FB] rounded-lg transition shrink-0"
              id="sales-sidebar-toggle"
              aria-label="Open sales navigation"
              aria-controls="sales-sidebar"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <span className="text-[10px] bg-[#EEF3FB] text-[#4065B3] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 hidden xs:inline">Active Workspace</span>
            <span className="text-slate-400 hidden xs:inline">/</span>
            <span className="text-xs font-bold text-slate-700 capitalize font-display truncate">
              {activeTab === 'home' && 'Functional Home'}
              {activeTab === 'crm' && `CRM (${crmSubTab})`}
              {activeTab === 'pipeline' && `Pipeline (${pipelineSubTab})`}
              {activeTab === 'engagement' && `Engagement (${engagementSubTab})`}
              {activeTab === 'forecast' && `Forecasts (${forecastSubTab})`}
              {activeTab === 'enablement' && `Enablement (${enablementSubTab})`}
              {activeTab === 'support' && `Support (${supportSubTab})`}
              {activeTab === 'admin' && `Admin (${adminSubTab})`}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search records... (⌘K)" 
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
              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                <span>Audit Stream Live</span>
              </span>
            </div>
          </div>
        </header>

        {/* Active viewport content wrapper */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          
          {/* STATE CONTROLLER OVERRIDES FOR HIGHEST FIDELITY COMPLIANCE */}
          {simulatedState === 'loading' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-[#D9E0EA] p-8 shadow-sm">
              <RefreshCw className="animate-spin text-[#4065B3] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-800 font-display">Loading Workspace Elements...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Preserving the exact frozen shell viewport according to the CO-10 release checklist.</p>
            </div>
          ) : simulatedState === 'error' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-red-200 p-8 shadow-sm">
              <div className="bg-red-50 text-red-600 p-3 rounded-full mb-4 border border-red-200">
                <XCircle size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">System Over-limit / Error Code: Trace COS-7F2A</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">An audit mismatch was found in the color contrast matrix tokens. Re-authenticate via Identity Gateway to restore compliance.</p>
              <button 
                onClick={() => setSimulatedState('loaded')}
                className="mt-6 bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4 rounded-lg transition"
              >
                Perform System Recovery & Retry
              </button>
            </div>
          ) : simulatedState === 'restricted' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
              <div className="bg-amber-50 text-amber-700 p-3 rounded-full mb-4 border border-amber-200">
                <Ban size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">•••• Restricted Access Profile</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md text-center">Your active security clearance level does not permit viewing full raw data shapes under the CO-10 protocol. Request elevation in M19 Workspace.</p>
              <button 
                onClick={() => setSimulatedState('loaded')}
                className="mt-6 bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4 rounded-lg transition"
              >
                Simulate Gated Access Override
              </button>
            </div>
          ) : simulatedState === 'empty' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-[#D9E0EA] p-8 shadow-sm">
              <Plus className="text-[#4065B3] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-800 font-display">No Active Data Records Listed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">This pipeline segment is currently empty of matching customer records or compliance entities.</p>
              <button 
                onClick={() => setSimulatedState('loaded')}
                className="mt-6 bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4 rounded-lg transition"
              >
                Generate Fictional Records
              </button>
            </div>
          ) : (
            // NORMAL LOADED STATE RENDERING
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${crmSubTab}-${pipelineSubTab}-${engagementSubTab}-${forecastSubTab}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* 1. HOME VIEW */}
                {activeTab === 'home' && (
                  <div className="space-y-6">
                    {/* Header Spec Block */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Sales Command Dashboard</h2>
                        <p className="text-xs text-slate-500 mt-1">Real-time MTD commercial pipeline & system compliance log</p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span className="text-[11px] font-bold bg-[#EEF3FB] text-[#4065B3] px-2.5 py-1 rounded">Volume 2 • Sales</span>
                        <span className="text-[11px] font-bold bg-purple-50 text-[#6B21A8] border border-purple-200 px-2.5 py-1 rounded flex items-center space-x-1">
                          <Sparkles size={12} />
                          <span>CO-10 Audited</span>
                        </span>
                      </div>
                    </div>

                    {/* KPI metrics strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                        <span className="text-xs font-bold text-slate-500">MTD Revenue</span>
                        <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">£1,284,600</h3>
                        <span className="text-[10px] text-green-600 mt-2 font-bold font-mono">+7.4% vs Prior Period</span>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                        <span className="text-xs font-bold text-slate-500">Active Pipeline</span>
                        <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">£3,842,000</h3>
                        <span className="text-[10px] text-slate-500 mt-2 font-bold font-mono">10 Accounts Configured</span>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                        <span className="text-xs font-bold text-slate-500">Weighted Pipeline</span>
                        <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">£2,116,000</h3>
                        <span className="text-[10px] text-[#4065B3] mt-2 font-bold font-mono">Reconciled to Ledger</span>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm flex flex-col justify-between min-h-[7.5rem]">
                        <span className="text-xs font-bold text-slate-500">Open Approvals</span>
                        <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">14</h3>
                        <span className="text-[10px] text-amber-600 mt-2 font-bold font-mono animate-pulse">3 Gated Exceptions Pending</span>
                      </div>
                    </div>

                    {/* Quick Launch Spec Map */}
                    <div className="bg-gradient-to-r from-[#182A5C] to-[#264288] text-white p-6 rounded-xl border border-[#4065B3] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-1 max-w-xl">
                        <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded tracking-wide font-mono uppercase">living spec overview</span>
                        <h3 className="text-base font-bold font-display">Sales v1.0 Living Prototype Interface</h3>
                        <p className="text-xs text-[#AFBFDA] leading-relaxed">
                          Click any navigation tab or client account in the sidebar to review verified screens from the Volume 2 design system handbook. Try simulated view states using the controller below.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2 shrink-0">
                        <span className="text-xs font-bold text-[#AFBFDA]">Simulate View States:</span>
                        <div className="flex flex-wrap bg-[#0B1E3F]/60 p-1.5 rounded-lg border border-[#264288] gap-1">
                          {(['loaded', 'empty', 'loading', 'error', 'restricted'] as const).map(st => (
                            <button
                              key={st}
                              onClick={() => setSimulatedState(st)}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition uppercase ${
                                simulatedState === st ? 'bg-white text-slate-900' : 'text-[#AFBFDA] hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Split layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Accounts At Risk */}
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">High Priority Accounts Oversight</h4>
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold font-mono">Action Needed</span>
                        </div>
                        
                        <div className="space-y-3">
                          {companies.slice(0, 3).map(comp => (
                            <div 
                              key={comp.id} 
                              onClick={() => { setSelectedCompanyId(comp.id); setActiveTab('crm'); setCrmSubTab('accounts'); }}
                              className="p-3 border border-[#D9E0EA] rounded-lg flex items-center justify-between hover:bg-[#EEF3FB]/50 hover:border-[#4065B3] transition cursor-pointer group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] text-[#4065B3] flex items-center justify-center font-bold text-xs font-mono">
                                  {comp.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#4065B3] transition">{comp.name}</h5>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Owner: {comp.accountOwner} · {comp.industry}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] bg-green-50 text-green-700 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-green-200">
                                  {comp.creditStatus}
                                </span>
                                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Compliance Overview */}
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">CO-10 Compliance Audits</h4>
                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between items-start border-b border-[#D9E0EA] pb-3">
                            <div className="space-y-0.5 text-left">
                              <p className="font-bold text-slate-800">Contrast Release Gate</p>
                              <p className="text-[10px] text-slate-500">WCAG AA Level verified (17.74:1)</p>
                            </div>
                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-black font-mono">PASS</span>
                          </div>
                          <div className="flex justify-between items-start border-b border-[#D9E0EA] pb-3">
                            <div className="space-y-0.5 text-left">
                              <p className="font-bold text-slate-800">Two-Family Font Contract</p>
                              <p className="text-[10px] text-slate-500">Montserrat and Inter checked</p>
                            </div>
                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-black font-mono">PASS</span>
                          </div>
                          <div className="flex justify-between items-start pb-1">
                            <div className="space-y-0.5 text-left">
                              <p className="font-bold text-slate-800">AI Recommendation Rule</p>
                              <p className="text-[10px] text-[#6B21A8]">DRAFT mode for all replies enabled</p>
                            </div>
                            <span className="text-[10px] bg-purple-50 text-[#6B21A8] border border-purple-200 px-2 py-0.5 rounded font-black font-mono">ACTIVE</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. CRM VIEW */}
                {activeTab === 'crm' && (
                  <div className="space-y-6">
                    {/* CRM Header with view switcher */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Client Accounts CRM</h2>
                        <p className="text-xs text-slate-500 mt-1">Manage corporate entity records, contacts, and relationship parameters</p>
                      </div>

                      {/* Tab Selectors */}
                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setCrmSubTab('accounts')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${crmSubTab === 'accounts' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Accounts Table
                        </button>
                        <button 
                          onClick={() => setCrmSubTab('contacts')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${crmSubTab === 'contacts' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Contacts Registry
                        </button>
                        <button 
                          onClick={() => setCrmSubTab('lifecycle')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${crmSubTab === 'lifecycle' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Lifecycle Board
                        </button>
                        <button 
                          onClick={() => setCrmSubTab('my-book')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${crmSubTab === 'my-book' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          My Book
                        </button>
                        <button 
                          onClick={() => setCrmSubTab('relationships')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${crmSubTab === 'relationships' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Global Relationships
                        </button>
                      </div>
                    </div>

                    {/* Tab contents */}
                    {crmSubTab === 'accounts' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse text-xs text-left min-w-[800px]">
                            <thead>
                              <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] text-slate-700 font-bold uppercase tracking-wider">
                                <th className="p-4">Customer Entity Name</th>
                                <th className="p-4">Account Reference</th>
                                <th className="p-4">Industry Sector</th>
                                <th className="p-4">Credit status</th>
                                <th className="p-4">Account executive</th>
                                <th className="p-4 text-right">Available Credit</th>
                                <th className="p-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(searchQuery.trim() !== '' ? companies.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.customerNumber.toLowerCase().includes(q) || c.accountOwner.toLowerCase().includes(q)) : companies).map(comp => (
                                <tr 
                                  key={comp.id} 
                                  className="border-b border-[#D9E0EA] hover:bg-slate-50/80 transition cursor-pointer font-medium text-slate-700"
                                  onClick={() => setSelectedCompanyId(comp.id)}
                                >
                                  <td className="p-4 font-bold text-slate-900">{comp.name}</td>
                                  <td className="p-4 font-mono font-bold text-[#4065B3]">{comp.customerNumber}</td>
                                  <td className="p-4">{comp.industry}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                                      comp.creditStatus === 'Good Standing' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}>
                                      {comp.creditStatus}
                                    </span>
                                  </td>
                                  <td className="p-4 font-bold">{comp.accountOwner}</td>
                                  <td className="p-4 text-right font-mono font-bold">£{comp.availableCredit.toLocaleString()}</td>
                                  <td className="p-4 text-[#4065B3] font-bold hover:underline">View File</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {crmSubTab === 'contacts' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse text-xs text-left min-w-[600px]">
                            <thead>
                              <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] text-slate-700 font-bold uppercase tracking-wider">
                                <th className="p-4">Contact name</th>
                                <th className="p-4">Designated Role</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {companies.flatMap(c => c.contacts.filter(con => !q || con.name.toLowerCase().includes(q) || con.role.toLowerCase().includes(q) || con.email.toLowerCase().includes(q)).map(con => (
                                <tr key={con.id} className="border-b border-[#D9E0EA] hover:bg-slate-50/80 transition font-medium text-slate-700">
                                  <td className="p-4 font-bold text-slate-900">{con.name}</td>
                                  <td className="p-4">{con.role}</td>
                                  <td className="p-4 font-mono">{con.email}</td>
                                  <td className="p-4 font-mono">{con.phone}</td>
                                </tr>
                              )))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {crmSubTab === 'lifecycle' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {(['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] as const).map(stage => {
                          const stageDeals = deals.filter(d => d.stage === stage && (!q || d.title.toLowerCase().includes(q) || d.companyName.toLowerCase().includes(q)));
                          return (
                            <div key={stage} className="bg-white rounded-xl border border-[#D9E0EA] p-4 flex flex-col space-y-3 min-h-[400px]">
                              <div className="flex justify-between items-center border-b border-[#D9E0EA] pb-2">
                                <h4 className="font-bold text-slate-800 font-display text-xs capitalize">{stage}</h4>
                                <span className="bg-[#EEF3FB] text-[#4065B3] font-black font-mono text-[10px] px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                              </div>
                              <div className="flex-1 space-y-3 overflow-y-auto">
                                {stageDeals.map(deal => (
                                  <div key={deal.id} className="p-3 border border-[#D9E0EA] rounded-lg bg-[#F7F9FC] space-y-2 hover:border-[#4065B3] transition cursor-pointer">
                                    <div className="flex justify-between items-start">
                                      <p className="font-bold text-slate-900 text-xs">{deal.companyName}</p>
                                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                        deal.health === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                      }`}>{deal.health}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-semibold">{deal.title}</p>
                                    <div className="flex justify-between items-center pt-2 border-t border-[#D9E0EA]/60 text-[10px] font-mono">
                                      <span className="font-bold text-slate-700">£{deal.amount.toLocaleString()}</span>
                                      <span className="text-slate-500">{deal.probability}% Prob.</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {crmSubTab === 'my-book' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">My Managed Account Portfolio</h3>
                          <span className="text-xs font-bold text-slate-500 font-mono">Owner Account ID: chris-allen-APAC</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {companies.slice(0, 3).map(comp => (
                            <div key={comp.id} className="p-4 border border-[#D9E0EA] rounded-xl flex justify-between items-start hover:border-[#4065B3] transition">
                              <div className="text-left space-y-2">
                                <span className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-wider">Cos-Live Account</span>
                                <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                                <p className="text-xs text-slate-500 font-semibold">{comp.industry} · {comp.employees} employees</p>
                                <p className="text-[11px] text-[#4065B3] font-mono font-bold">Credit Limit: £{comp.creditLimit.toLocaleString()}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedCompanyId(comp.id)}
                                className="bg-[#EEF3FB] text-[#4065B3] hover:bg-[#4065B3] hover:text-white transition text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                              >
                                Open File
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {crmSubTab === 'relationships' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4 text-left">
                          <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Advanced Gases Corporate Hierarchy</h3>
                          <div className="p-4 bg-[#EEF3FB]/40 border border-[#D9E0EA] rounded-lg space-y-3">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                              <Network size={16} className="text-[#4065B3]" />
                              <span>Global Parent: OG Holdings Ltd</span>
                            </div>
                            <div className="ml-6 border-l-2 border-[#D9E0EA] pl-4 space-y-2.5">
                              <div className="p-2.5 bg-white border border-[#D9E0EA] rounded text-xs font-semibold">
                                <p className="text-slate-900 font-bold">Advanced Gases Nigeria Ltd</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Asset Registry: Approved · NGN 18.5m Contract Value</p>
                              </div>
                              <div className="p-2.5 bg-white border border-[#D9E0EA] rounded text-xs font-semibold">
                                <p className="text-slate-900 font-bold">DELabs Ltd (United Kingdom Hub)</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Privacy: NDPR & WhatsApp Consent Verified</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4 text-left">
                          <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Installed base hardware (DELabs)</h3>
                          <div className="space-y-3 text-xs">
                            <div className="p-3 border border-green-200 bg-green-50/20 rounded-lg flex justify-between items-center">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">O2 Oxygen High-Pressure Cylinder</p>
                                <p className="text-[10px] text-slate-500">Serial ID: O2-HP-28190 · Inspection due in 28 days</p>
                              </div>
                              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Inspected</span>
                            </div>
                            <div className="p-3 border border-[#D9E0EA] bg-[#F7F9FC] rounded-lg flex justify-between items-center">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">Argon Welding Canister Unit</p>
                                <p className="text-[10px] text-slate-500">Serial ID: AR-WC-11029 · In warranty</p>
                              </div>
                              <span className="text-[10px] bg-[#EEF3FB] text-[#4065B3] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. PIPELINE VIEW */}
                {activeTab === 'pipeline' && (
                  <div className="space-y-6">
                    {/* Pipeline view selectors */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Sales Pipeline Command</h2>
                        <p className="text-xs text-slate-500 mt-1">Track target opportunities, manager forecasts, and conversion curves</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setPipelineSubTab('board')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${pipelineSubTab === 'board' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Pipeline Board
                        </button>
                        <button 
                          onClick={() => setPipelineSubTab('forecast')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${pipelineSubTab === 'forecast' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Forecast & Target
                        </button>
                        <button 
                          onClick={() => setPipelineSubTab('won-lost')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${pipelineSubTab === 'won-lost' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Won/Lost Analytics
                        </button>
                        <button 
                          onClick={() => setPipelineSubTab('templates')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${pipelineSubTab === 'templates' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Pipeline Templates
                        </button>
                      </div>
                    </div>

                    {pipelineSubTab === 'board' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {(['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] as const).map(stage => {
                          const stageDeals = deals.filter(d => d.stage === stage && (!q || d.title.toLowerCase().includes(q) || d.companyName.toLowerCase().includes(q)));
                          return (
                            <div key={stage} className="bg-white rounded-xl border border-[#D9E0EA] p-4 flex flex-col space-y-3 min-h-[400px]">
                              <div className="flex justify-between items-center border-b border-[#D9E0EA] pb-2">
                                <h4 className="font-bold text-slate-800 font-display text-xs capitalize">{stage}</h4>
                                <span className="bg-[#EEF3FB] text-[#4065B3] font-black font-mono text-[10px] px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                              </div>
                              <div className="flex-1 space-y-3 overflow-y-auto">
                                {stageDeals.map(deal => (
                                  <div key={deal.id} className="p-3 border border-[#D9E0EA] rounded-lg bg-[#F7F9FC] space-y-2 hover:border-[#4065B3] transition cursor-pointer">
                                    <div className="flex justify-between items-start">
                                      <p className="font-bold text-slate-900 text-xs">{deal.companyName}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-semibold">{deal.title}</p>
                                    <div className="flex justify-between items-center pt-2 border-t border-[#D9E0EA]/60 text-[10px] font-mono">
                                      <span className="font-bold text-slate-700">£{deal.amount.toLocaleString()}</span>
                                      <span className="text-slate-500">{deal.probability}% Prob.</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {pipelineSubTab === 'forecast' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] shadow-sm space-y-6 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-black uppercase text-slate-900 font-display tracking-wider">Pipeline Performance Tracking to Target</h3>
                            <p className="text-xs text-slate-500 mt-1">Weekly actuals compared against plan-baseline bands</p>
                          </div>
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold font-mono">MTD On Track</span>
                        </div>

                        <div className="h-64 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg flex items-center justify-center p-4">
                          {/* Rich inline mock graph */}
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-slate-300">
                              <div className="w-12 bg-slate-200 hover:bg-[#4065B3] transition h-[20%] rounded-t-md text-center relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 hidden group-hover:block font-mono">£250k</span>
                              </div>
                              <div className="w-12 bg-slate-200 hover:bg-[#4065B3] transition h-[35%] rounded-t-md text-center relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 hidden group-hover:block font-mono">£430k</span>
                              </div>
                              <div className="w-12 bg-[#4065B3] h-[61%] rounded-t-md text-center relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-800 font-mono">£1.28m</span>
                              </div>
                              <div className="w-12 bg-[#182A5C] h-[85%] rounded-t-md text-center relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#182A5C] font-mono">£3.84m</span>
                              </div>
                            </div>
                            <div className="flex justify-between px-4 pt-2 text-[10px] font-bold text-slate-500">
                              <span>Q1 Actuals</span>
                              <span>Q2 Forecast</span>
                              <span>MTD Revenue</span>
                              <span>Active Pipeline</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {pipelineSubTab === 'won-lost' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                        <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">Category Revenue Share</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800">Industrial Gases</span>
                              <span className="font-mono font-bold">£520,000 (43%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#4065B3] h-full rounded-full" style={{ width: '43%' }}></div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs pt-1">
                              <span className="font-bold text-slate-800">Electronics</span>
                              <span className="font-mono font-bold">£390,000 (32%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-purple-600 h-full rounded-full" style={{ width: '32%' }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">Sales Conversion Pipeline</h4>
                          <div className="space-y-2 text-xs font-semibold text-slate-700">
                            <div className="p-2 bg-[#EEF3FB]/50 border-l-4 border-[#4065B3] rounded flex justify-between">
                              <span>Prospecting to Proposal</span>
                              <span className="font-mono font-bold">84% Conversion</span>
                            </div>
                            <div className="p-2 bg-[#EEF3FB]/50 border-l-4 border-[#4065B3] rounded flex justify-between">
                              <span>Proposal to Closed Won</span>
                              <span className="font-mono font-bold">61% Conversion</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {pipelineSubTab === 'templates' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm p-6 text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Governed Pipeline Templates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-[#D9E0EA] bg-[#F7F9FC] rounded-lg">
                            <h4 className="text-xs font-bold text-slate-900 font-display">Tenant Leasing Pipeline</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Required fields: Area · rent · term · start · entity</p>
                            <span className="inline-block mt-3 text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono uppercase">Enforced Gate: 61% pre-let target</span>
                          </div>
                          <div className="p-4 border border-[#D9E0EA] bg-[#F7F9FC] rounded-lg">
                            <h4 className="text-xs font-bold text-slate-900 font-display">Offtake Contract Pipeline</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Required fields: Capacity · product · term · start · entity</p>
                            <span className="inline-block mt-3 text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold font-mono uppercase">Enforced Gate: 78.1% cover</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 4. ENGAGEMENT VIEW */}
                {activeTab === 'engagement' && (
                  <div className="space-y-6">
                    {/* View selectors */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Engagement Suite</h2>
                        <p className="text-xs text-slate-500 mt-1">Triage inbound leads, edit routing rules, and schedule customer calls</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setEngagementSubTab('leads')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${engagementSubTab === 'leads' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Lead Inbox
                        </button>
                        <button 
                          onClick={() => setEngagementSubTab('rules')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${engagementSubTab === 'rules' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Routing Rules
                        </button>
                        <button 
                          onClick={() => setEngagementSubTab('availability')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${engagementSubTab === 'availability' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          My Availability
                        </button>
                        <button 
                          onClick={() => setEngagementSubTab('team-routing')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${engagementSubTab === 'team-routing' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Team Routing
                        </button>
                      </div>
                    </div>

                    {engagementSubTab === 'leads' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* Sidebar: Inbound Queue */}
                        <div className="bg-white rounded-xl border border-[#D9E0EA] p-4 space-y-4 text-left">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display border-b border-[#D9E0EA] pb-2">Active Notifications</h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded uppercase">Critical SLA</span>
                              </div>
                              <p className="font-bold text-xs text-slate-900">4 support SLA breaches</p>
                              <p className="text-[10px] text-slate-500">Escalated to Helen Shaw</p>
                            </div>
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                              <p className="font-bold text-xs text-slate-900">Discount approval due</p>
                              <p className="text-[10px] text-slate-500 font-mono">Northwind Industrial · 1h 42m remaining</p>
                            </div>
                            <div className="p-3 border border-[#D9E0EA] rounded-lg space-y-1 bg-slate-50">
                              <p className="font-bold text-xs text-slate-900">6 low-stock alerts rolled up</p>
                              <p className="text-[10px] text-slate-500">Industrial Gases · Manchester depot</p>
                            </div>
                          </div>
                        </div>

                        {/* Middle/Right: Thread and DRAFT Composer */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-[#D9E0EA] p-5 flex flex-col justify-between text-left space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-[#D9E0EA] pb-3">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">Northwind Industrial Lead Triage</h3>
                                <p className="text-[10px] text-slate-500 font-mono">SLA · 01:42:18 BST · Client: Priya Shah</p>
                              </div>
                              <span className="text-[10px] bg-purple-50 text-[#6B21A8] border border-purple-200 px-2.5 py-0.5 rounded font-bold font-mono">DRAFT MODE</span>
                            </div>

                            {/* Message Thread */}
                            <div className="space-y-3 bg-[#F7F9FC] p-4 rounded-lg border border-[#D9E0EA]">
                              <div className="text-xs">
                                <p className="font-bold text-[#4065B3]">Customer Message:</p>
                                <p className="text-slate-700 mt-1 font-semibold bg-white p-2.5 rounded border border-[#D9E0EA]">Could you confirm delivery of the Argon welding units by Friday morning?</p>
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-slate-500">Internal Operations Note:</p>
                                <p className="text-slate-600 mt-1 font-semibold italic bg-amber-50/50 p-2.5 rounded border border-amber-200">Check cylinder allocation before replying. Melbourne depot shows healthy stock.</p>
                              </div>
                            </div>
                          </div>

                          {/* Composer */}
                          <div className="space-y-3 pt-4 border-t border-[#D9E0EA]">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">Compose Reply (Grounded with AI):</span>
                              <span className="text-[9px] bg-[#6B21A8]/10 text-[#6B21A8] px-1.5 py-0.5 rounded font-black font-mono">Grounded to Asset serials</span>
                            </div>
                            <textarea 
                              value={leadComposeReply}
                              onChange={(e) => setLeadComposeReply(e.target.value)}
                              rows={3}
                              className="w-full bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#4065B3] transition"
                            />

                            <div className="flex justify-between items-center">
                              {showReplyUndo ? (
                                <button 
                                  onClick={() => {
                                    setShowReplyUndo(false);
                                    setLeadComposeReply('Yes — Friday delivery is available. I’ll confirm the slot once operations releases the allocation.');
                                    onAddLog('Reply Undo Triggered', 'Customer', 'Northwind Industrial', 'S&M', 'Reverted message send draft within the 8s window');
                                  }}
                                  className="text-[10px] text-[#B42318] hover:underline font-bold"
                                >
                                  Undo Message Send (8s window active)
                                </button>
                              ) : <span className="text-[10px] text-slate-400">AI draft — nothing sends itself.</span>}

                              <button 
                                onClick={() => {
                                  setShowReplyUndo(true);
                                  onAddLog('Customer Reply Sent', 'Customer', 'Northwind Industrial', 'S&M', `Message payload: ${leadComposeReply}`);
                                  setTimeout(() => setShowReplyUndo(false), 8000);
                                }}
                                className="bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Send Message</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {engagementSubTab === 'rules' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Lead Routing Rules</h3>
                        <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#D9E0EA] space-y-3 text-xs font-semibold text-slate-700">
                          <p className="border-b border-[#D9E0EA] pb-2 font-bold text-slate-900">Active Routing: APAC Region Hub</p>
                          <p>1. Inbound Lead → Evaluate company size & region oversight</p>
                          <p>2. Assign to: Regional Account Manager DRAFT task</p>
                          <p>3. If unassigned over 48h → Auto-flag trigger to Sales Manager (Marcus Hale)</p>
                          <p className="text-[11px] text-[#6B21A8]">4. Grounded AI pre-fills personalized onboarding welcome kit</p>
                        </div>
                      </div>
                    )}

                    {engagementSubTab === 'availability' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">My Calendar Availability</h3>
                        <p className="text-xs text-slate-500">Configure conflict-free meeting links for corporate client booking pages.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="p-3 border border-[#D9E0EA] bg-[#F7F9FC] text-center rounded-lg flex flex-col justify-between min-h-[4.5rem]">
                              <span className="text-xs font-bold text-slate-800">{day}</span>
                              <div className="mt-2 text-[9px] font-black text-green-700 bg-green-50 rounded py-0.5 border border-green-200 uppercase">Available</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 5. FORECAST VIEW */}
                {activeTab === 'forecast' && (
                  <div className="space-y-6">
                    {/* View Selector header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Forecasting & Compensation</h2>
                        <p className="text-xs text-slate-500 mt-1">Review regional quotas, commission payout schedules, and territory models</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setForecastSubTab('my-forecast')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${forecastSubTab === 'my-forecast' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          My Forecast
                        </button>
                        <button 
                          onClick={() => setForecastSubTab('waterfall')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${forecastSubTab === 'waterfall' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Waterfall Diff
                        </button>
                        <button 
                          onClick={() => setForecastSubTab('territories')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${forecastSubTab === 'territories' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Territory map
                        </button>
                      </div>
                    </div>

                    {forecastSubTab === 'my-forecast' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] shadow-sm text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Weekly Forecast Ritual</h3>
                        <div className="p-4 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg text-xs leading-relaxed space-y-2">
                          <p className="font-bold text-slate-900">Current Forecast Attainment Quota: £1,476,000</p>
                          <p className="text-slate-600">Weekly actuals are compiled every Friday at 17:00. Overrides must include an explicit reasoning note to be captured in the immutable audit trail.</p>
                          <p className="text-[#6B21A8] font-bold">AI projection predicts a 4.2x ROAS based on active Q3 pipeline velocity.</p>
                        </div>
                      </div>
                    )}

                    {forecastSubTab === 'waterfall' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] shadow-sm text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Forecast Variance Waterfall</h3>
                        <p className="text-xs text-slate-500">Uncertainty ranges mapped using 95% Credible Interval (CI) bands: £378k - £432k.</p>
                        <div className="p-4 bg-[#EEF3FB]/40 border border-[#D9E0EA] rounded-lg text-xs">
                          <p className="font-bold text-slate-800">Variance reasons tracked:</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-[11px] text-slate-600">
                            <li>+£128k from Advanced Gases Nigeria Ltd (re-negotiated bulk supply)</li>
                            <li>-£45k from Harborline Fabrications (onboarding delay)</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {forecastSubTab === 'territories' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse text-xs text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] text-slate-700 font-bold uppercase tracking-wider">
                              <th className="p-4">Owner / Executive</th>
                              <th className="p-4">Electronics</th>
                              <th className="p-4">Industrial Gases</th>
                              <th className="p-4">Manufacturing</th>
                              <th className="p-4">Imports</th>
                              <th className="p-4">Agency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'Olivia Reed', e: 'Locked', ig: 'Active', m: 'Active', imp: 'Locked', a: 'Active' },
                              { name: 'Marcus Hale', e: 'Active', ig: 'Active', m: 'Locked', imp: 'Active', a: 'Active' },
                              { name: 'Priya Shah', e: 'Active', ig: 'Locked', m: 'Active', imp: 'Active', a: 'Locked' }
                            ].map((row, idx) => (
                              <tr key={idx} className="border-b border-[#D9E0EA] font-medium text-slate-700">
                                <td className="p-4 font-bold text-slate-900">{row.name}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.e === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{row.e}</span></td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.ig === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{row.ig}</span></td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.m === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{row.m}</span></td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.imp === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{row.imp}</span></td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${row.a === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{row.a}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 6. ENABLEMENT VIEW */}
                {activeTab === 'enablement' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Enablement & Signals</h2>
                        <p className="text-xs text-slate-500 mt-1">Review active competitor battlecards, cylinder assets, and reorder signals</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setEnablementSubTab('library')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${enablementSubTab === 'library' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Reusable Library
                        </button>
                        <button 
                          onClick={() => setEnablementSubTab('battlecards')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${enablementSubTab === 'battlecards' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Battlecards
                        </button>
                        <button 
                          onClick={() => setEnablementSubTab('signal-inbox')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${enablementSubTab === 'signal-inbox' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Signal Inbox
                        </button>
                        <button 
                          onClick={() => setEnablementSubTab('balances')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${enablementSubTab === 'balances' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Cylinder Balances
                        </button>
                        <button 
                          onClick={() => setEnablementSubTab('heat-grid')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${enablementSubTab === 'heat-grid' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Account Heat Grid
                        </button>
                      </div>
                    </div>

                    {enablementSubTab === 'library' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                        {['COS asset 01', 'COS asset 02', 'COS asset 03', 'COS asset 04'].map((asset, index) => (
                          <div key={asset} className="bg-white rounded-xl border border-[#D9E0EA] p-4 space-y-3">
                            <div className="w-full h-24 bg-[#EEF3FB]/50 rounded-lg flex items-center justify-center text-[#4065B3]">
                              <HardDrive size={32} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 font-display">{asset}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Rights expire · {index === 0 ? '7 days' : '28 days'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {enablementSubTab === 'battlecards' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Competitor Battlecards</h3>
                        <div className="p-4 bg-purple-50/20 border border-purple-100 rounded-lg space-y-2">
                          <h4 className="text-xs font-bold text-[#6B21A8] font-display">Competitor pricing page change detected</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Oxygen price was cut by 12% in the Sydney region by competitor AirGas. Use the direct discount pre-fill quote builder to respond with the GATED 14% override when appropriate.
                          </p>
                        </div>
                      </div>
                    )}

                    {enablementSubTab === 'signal-inbox' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Reorder Signals</h3>
                        <div className="p-3 border border-amber-200 bg-amber-50/20 rounded-lg flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">Overdue Cylinder Return Signal (Calder Gas)</p>
                            <p className="text-[10px] text-slate-500">14 empty cylinders over return cycle policy limit</p>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">Alert</span>
                        </div>
                      </div>
                    )}

                    {enablementSubTab === 'balances' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse text-xs text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] text-slate-700 font-bold uppercase tracking-wider">
                              <th className="p-4">Gas Type</th>
                              <th className="p-4">Full On-Site</th>
                              <th className="p-4">Empty On-Site</th>
                              <th className="p-4">In Transit</th>
                              <th className="p-4 text-right">Overdue Returns</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cylinders.filter(cyl => !q || cyl.gasType.toLowerCase().includes(q)).map((cyl, idx) => (
                              <tr key={idx} className="border-b border-[#D9E0EA] font-medium text-slate-700">
                                <td className="p-4 font-bold text-slate-900">{cyl.gasType}</td>
                                <td className="p-4 font-mono font-bold">{cyl.fullOnSite} units</td>
                                <td className="p-4 font-mono">{cyl.emptyOnSite} units</td>
                                <td className="p-4 font-mono">{cyl.inTransit} units</td>
                                <td className="p-4 text-right font-mono font-bold text-red-600">{cyl.overdueReturns} units</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 7. SUPPORT VIEW */}
                {activeTab === 'support' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Operations & Customer Support</h2>
                        <p className="text-xs text-slate-500 mt-1">Review active support tickets, delivery issues, and account terms</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setSupportSubTab('applications')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${supportSubTab === 'applications' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Partner Applications
                        </button>
                        <button 
                          onClick={() => setSupportSubTab('tickets')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${supportSubTab === 'tickets' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Support Tickets
                        </button>
                      </div>
                    </div>

                    {supportSubTab === 'applications' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Trade Partner Onboarding</h3>
                        <p className="text-xs text-slate-500">Track and authorize B2B dealer and distributorship application files.</p>
                        <div className="p-4 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg text-xs leading-relaxed">
                          <p className="font-bold text-slate-900">Application #APP-1029: Harborline Fabrication Ltd</p>
                          <p className="text-slate-600 mt-1">Status: Pending GATED credit review with terms of Net-30 payment cycle.</p>
                        </div>
                      </div>
                    )}

                    {supportSubTab === 'tickets' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full border-collapse text-xs text-left min-w-[700px]">
                          <thead>
                            <tr className="bg-[#EEF3FB] border-b border-[#D9E0EA] text-slate-700 font-bold uppercase tracking-wider">
                              <th className="p-4">Ticket ID</th>
                              <th className="p-4">Customer Account</th>
                              <th className="p-4">Issue Category</th>
                              <th className="p-4">Priority</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.filter(t => !q || t.description.toLowerCase().includes(q) || t.companyName.toLowerCase().includes(q) || t.requestType.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q)).map(ticket => (
                              <tr key={ticket.id} className="border-b border-[#D9E0EA] font-medium text-slate-700">
                                <td className="p-4 font-mono font-bold text-[#4065B3]">{ticket.ticketNumber}</td>
                                <td className="p-4 font-bold text-slate-900">{ticket.companyName}</td>
                                <td className="p-4">{ticket.requestType}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                                    ticket.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'
                                  }`}>{ticket.priority}</span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                    ticket.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                  }`}>{ticket.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 8. ADMIN VIEW */}
                {activeTab === 'admin' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E0EA] pb-4">
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900 font-display">System Governance</h2>
                        <p className="text-xs text-slate-500 mt-1">Review active system registry, API connections, and viewport states</p>
                      </div>

                      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-[#EEF3FB] p-1 rounded-lg border border-[#D9E0EA] text-xs font-semibold max-w-full shrink-0">
                        <button 
                          onClick={() => setAdminSubTab('registry')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${adminSubTab === 'registry' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Automation Registry
                        </button>
                        <button 
                          onClick={() => setAdminSubTab('integrations')}
                          className={`px-3 py-1.5 rounded-md transition shrink-0 ${adminSubTab === 'integrations' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Integrations
                        </button>
                      </div>
                    </div>

                    {adminSubTab === 'registry' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Automations Registry</h3>
                        <div className="p-4 bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg text-xs leading-relaxed space-y-2">
                          <p className="font-bold text-slate-900">1. Shopify Catalog Sync</p>
                          <p className="text-slate-600">Reconciles pricing matrices across 10 active accounts every night at 02:00 BST.</p>
                          <p className="font-bold text-slate-900 mt-3">2. Gorgias Ticket Router</p>
                          <p className="text-slate-600">Converts incoming urgent delivery issues directly to CRM timeline notifications.</p>
                        </div>
                      </div>
                    )}

                    {adminSubTab === 'integrations' && (
                      <div className="bg-white p-6 rounded-xl border border-[#D9E0EA] text-left space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-900 font-display tracking-wider">Connected Infrastructure APIs</h3>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center p-3 border border-[#D9E0EA] rounded-lg">
                            <span className="font-bold text-slate-800">Shopify API Gateway</span>
                            <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded font-mono">Connected</span>
                          </div>
                          <div className="flex justify-between items-center p-3 border border-[#D9E0EA] rounded-lg">
                            <span className="font-bold text-slate-800">Gorgias Helpdesk Bridge</span>
                            <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded font-mono">Connected</span>
                          </div>
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

      {/* Interactive slide-out CRM Account Detail Drawer */}
      <AnimatePresence>
        {selectedCompanyId && selectedCompany && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-[500px] bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#D9E0EA]"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#D9E0EA] bg-[#EEF3FB] flex justify-between items-start shrink-0">
                <div className="text-left space-y-1">
                  <span className="text-[9px] bg-[#4065B3] text-white font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Corporate Account Profile</span>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">{selectedCompany.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Account Ref: {selectedCompany.customerNumber} · Terms: {selectedCompany.paymentTerms}</p>
                </div>
                <button 
                  onClick={() => setSelectedCompanyId(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  <Minimize2 size={16} />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="border-b border-[#D9E0EA] px-4 flex space-x-4 bg-slate-50 text-xs shrink-0 font-semibold text-slate-600">
                {(['overview', 'deals', 'contacts', 'notes', 'history'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDetailActiveTab(tab)}
                    className={`py-3 border-b-2 transition ${
                      detailActiveTab === tab ? 'border-[#4065B3] text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Drawer Body Scroll Content */}
              <div className="flex-1 overflow-y-auto p-5 text-xs text-left">
                
                {detailActiveTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="space-y-2 border-b border-[#D9E0EA] pb-4">
                      <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3]">Entity Information</h4>
                      <p className="font-semibold text-slate-700">Account Owner: <span className="font-bold text-slate-900">{selectedCompany.accountOwner}</span></p>
                      <p className="font-semibold text-slate-700">Oversight Office: APAC Regional Hub</p>
                      <p className="font-semibold text-slate-700">Billing City: {selectedCompany.billingAddress.city}, {selectedCompany.billingAddress.country}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3]">Cylinder Balances On-site</h4>
                      <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="p-3 bg-slate-50 rounded-lg border border-[#D9E0EA]">
                          <p className="text-[10px] text-slate-500">Oxygen Gas Cylinders</p>
                          <p className="text-lg font-bold text-slate-800 mt-1">45 units</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-[#D9E0EA]">
                          <p className="text-[10px] text-slate-500">Argon Gas Cylinders</p>
                          <p className="text-lg font-bold text-slate-800 mt-1">12 units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'deals' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3] mb-2">Active Opportunities</h4>
                    {deals.filter(d => d.companyId === selectedCompany.id).map(deal => (
                      <div key={deal.id} className="p-3 border border-[#D9E0EA] rounded-lg space-y-1">
                        <p className="font-bold text-slate-900 text-xs">{deal.title}</p>
                        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-1 border-t border-[#D9E0EA]/40">
                          <span className="font-bold text-[#4065B3]">£{deal.amount.toLocaleString()}</span>
                          <span>Stage: {deal.stage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detailActiveTab === 'contacts' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3] mb-2">Assigned Personnel</h4>
                    {selectedCompany.contacts.map(con => (
                      <div key={con.id} className="p-3 border border-[#D9E0EA] rounded-lg flex justify-between items-center">
                        <div className="text-left">
                          <p className="font-bold text-slate-900 text-xs">{con.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{con.role}</p>
                        </div>
                        <div className="text-right text-[10px] font-mono">
                          <p className="text-slate-600">{con.email}</p>
                          <p className="text-slate-500 mt-0.5">{con.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detailActiveTab === 'notes' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3] mb-2">Account Activity Notes</h4>
                    <div className="p-3 bg-slate-50 border border-[#D9E0EA] rounded-lg space-y-1.5">
                      <p className="text-[10px] text-slate-500 font-mono">Author: {selectedCompany.accountOwner} · 16 Jul 2026 · 14:22 BST</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">"Priya Shah requested a review of their current Net-30 credit limits. Outstanding invoices are in good standing."</p>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'history' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest text-[#4065B3] mb-2">Audit History Ledger</h4>
                    <div className="border-l-2 border-[#D9E0EA] ml-3 pl-4 space-y-4">
                      {auditLogs.filter(log => log.entityName.includes(selectedCompany.name) || log.details?.includes(selectedCompany.name)).slice(0, 3).map(log => (
                        <div key={log.id} className="relative space-y-1">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#4065B3] rounded-full border border-white"></div>
                          <p className="text-[10px] text-slate-500 font-mono">{log.timestamp} · User: {log.user}</p>
                          <p className="font-bold text-slate-800 text-xs">{log.action}</p>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer actions */}
              <div className="p-4 border-t border-[#D9E0EA] bg-[#EEF3FB] flex space-x-3 shrink-0">
                <button 
                  onClick={() => setSelectedCompanyId(null)}
                  className="flex-1 bg-white hover:bg-slate-100 text-[#182A5C] border border-[#D9E0EA] text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-center"
                >
                  Close Profile File
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
