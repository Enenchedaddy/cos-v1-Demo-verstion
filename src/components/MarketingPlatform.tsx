/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import COSLogo from './COSLogo';
import { Company, Deal, Quote, Order, Invoice, CylinderBalance, SupportTicket, Campaign, AuditLog, ApprovalRequest, Product } from '../types';
import { 
  Users, TrendingUp, Percent, FileText, Activity, MessageSquare, ArrowRight, Plus, Check, AlertTriangle, 
  Search, ShieldAlert, Phone, Mail, MapPin, DollarSign, Award, Clock, FileCheck, CheckCircle2, RefreshCw, 
  Layers, Sliders, Calendar, BookOpen, AlertCircle, PlayCircle, ShieldCheck, Database, HelpCircle, HardDrive, 
  UserCheck, Shield, Sparkles, Network, Clipboard, Compass, Info, ChevronRight, Minimize2, CheckSquare, XCircle, Ban,
  Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketingPlatformProps {
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
  onLogoutToGateway?: () => void;
}

export default function MarketingPlatform({
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
  onLogoutToGateway
}: MarketingPlatformProps) {
  // Sidebar tab states
  const [activeTab, setActiveTab] = useState<'planning' | 'audience' | 'web-offers' | 'community' | 'content-studio' | 'paid-opt' | 'intelligence'>('planning');
  const [planningSubTab, setPlanningSubTab] = useState<'calendar' | 'timeline' | 'states'>('calendar');
  const [audienceSubTab, setAudienceSubTab] = useState<'profiles' | 'segments' | 'syncs'>('profiles');
  const [webOffersSubTab, setWebOffersSubTab] = useState<'pages' | 'forms' | 'offers'>('pages');
  const [communitySubTab, setCommunitySubTab] = useState<'loyalty' | 'moderation' | 'partners'>('loyalty');
  const [contentStudioSubTab, setContentStudioSubTab] = useState<'briefs' | 'ai-copy'>('briefs');
  const [paidOptSubTab, setPaidOptSubTab] = useState<'campaigns' | 'automation' | 'compliance'>('campaigns');
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<'seo' | 'blog' | 'paid-command' | 'ab-testing' | 'intel-inbox'>('paid-command');

  // Simulated state overrides ('loaded' | 'empty' | 'loading' | 'error' | 'restricted')
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

  // Floating search results memo for Marketing
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

    // 1. Campaigns
    campaigns.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q) || c.status.toLowerCase().includes(q)) {
        results.push({
          id: `campaign-${c.id}`,
          title: c.name,
          subtitle: `Channel: ${c.channel} • Spend: £${c.spend.toLocaleString()} • Status: ${c.status}`,
          category: 'Campaign',
          action: () => {
            setActiveTab('paid-opt');
            setPaidOptSubTab('campaigns');
            setSearchQuery('');
          }
        });
      }
    });

    // 2. Companies / Accounts
    companies.forEach(comp => {
      if (comp.name.toLowerCase().includes(q) || comp.customerNumber.toLowerCase().includes(q) || comp.industry.toLowerCase().includes(q)) {
        results.push({
          id: `company-${comp.id}`,
          title: comp.name,
          subtitle: `Sector: ${comp.industry} • Ref: ${comp.customerNumber}`,
          category: 'Partner Account',
          action: () => {
            setActiveTab('audience');
            setAudienceSubTab('profiles');
            setSearchQuery('');
          }
        });
      }
    });

    // 3. Custom/Audience Profiles mentioned in UI
    const targetProfiles = [
      { name: 'DELabs · Email · UK Segment', regime: 'UK GDPR/PECR', source: 'Corporate Site Onboarding', count: '4,182' },
      { name: 'Advanced Gases · WhatsApp · West Africa', regime: 'NDPR', source: 'WhatsApp Lead Capture', count: '1,264' }
    ];
    targetProfiles.forEach((p, idx) => {
      if (p.name.toLowerCase().includes(q) || p.regime.toLowerCase().includes(q) || p.source.toLowerCase().includes(q)) {
        results.push({
          id: `profile-${idx}`,
          title: p.name,
          subtitle: `Regime: ${p.regime} • Source: ${p.source} • Count: ${p.count}`,
          category: 'Audience Profile',
          action: () => {
            setActiveTab('audience');
            setAudienceSubTab('profiles');
            setSearchQuery('');
          }
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, campaigns, companies]);

  const q = searchQuery.toLowerCase().trim();

  // Campaign editor state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);

  // AI draft composer state (K17)
  const [aiComposeDraft, setAiComposeDraft] = useState('Brand: DELabs | Product: Premium Medical-Grade Oxygen Cylinders. Yes — Friday delivery is available. I’ll confirm the slot once operations releases the allocation.');

  return (
    <div className="sales-platform-theme flex h-screen overflow-hidden bg-[#F7F9FC] font-sans relative">
      
      {/* Sidebar backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-950/55 z-30 cursor-default"
          onClick={() => setIsSidebarOpen(false)}
          id="marketing-sidebar-backdrop"
          aria-label="Close marketing navigation"
        />
      )}
      
      {/* Pop-out sidebar */}
      <aside
        id="marketing-sidebar"
        aria-label="Marketing navigation"
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        className={`w-[280px] max-w-[86vw] bg-[#182A5C] text-white flex flex-col justify-between h-full fixed inset-y-0 left-0 z-40 shadow-xl transition-transform duration-300 motion-reduce:transition-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Top Branding Section */}
          <div className="p-4 border-b border-[#264288] flex items-center gap-3 shrink-0">
            <COSLogo className="w-8 h-8 shrink-0 shadow-md" variant="white" />
            <div className="text-left min-w-0">
              <h2 className="text-[10px] font-black tracking-widest text-[#AFBFDA] uppercase font-display">Central Operating System</h2>
              <p className="text-xs font-black text-white tracking-tight uppercase">Marketing Platform</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto w-11 h-11 rounded-lg grid place-items-center text-[#AFBFDA] hover:bg-[#264288] hover:text-white transition shrink-0"
              aria-label="Close marketing navigation"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1" onClick={() => setIsSidebarOpen(false)}>
            
            {/* PLANNING SECTION */}
            <div>
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Planning</div>
              <button
                onClick={() => { setActiveTab('planning'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'planning' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Calendar size={16} />
                <span>Campaign Calendar</span>
              </button>
              {activeTab === 'planning' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['calendar', 'timeline', 'states'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPlanningSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        planningSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'calendar' && '• Calendar view'}
                      {tab === 'timeline' && '• Timeline & Boards'}
                      {tab === 'states' && '• Layout States'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AUDIENCE & LIFECYCLE */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Identity & CRM</div>
              <button
                onClick={() => { setActiveTab('audience'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'audience' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span>Profiles & Syncs</span>
              </button>
              {activeTab === 'audience' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['profiles', 'segments', 'syncs'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAudienceSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        audienceSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'profiles' && '• Customer Profiles'}
                      {tab === 'segments' && '• Segment Builder'}
                      {tab === 'syncs' && '• Privacy Consent'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WEB & OFFERS */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Funnels</div>
              <button
                onClick={() => { setActiveTab('web-offers'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'web-offers' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Network size={16} />
                <span>Web & Offers</span>
              </button>
              {activeTab === 'web-offers' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['pages', 'forms', 'offers'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setWebOffersSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        webOffersSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'pages' && '• Pages & Sites'}
                      {tab === 'forms' && '• Pop-ups & Captures'}
                      {tab === 'offers' && '• Promotions & Offers'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COMMUNITY & PARTNERS */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Growth Channels</div>
              <button
                onClick={() => { setActiveTab('community'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'community' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Compass size={16} />
                <span>Growth & UGC</span>
              </button>
              {activeTab === 'community' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['loyalty', 'moderation', 'partners'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCommunitySubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        communitySubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'loyalty' && '• Loyalty Programs'}
                      {tab === 'moderation' && '• Review Moderation'}
                      {tab === 'partners' && '• Affiliates & Partners'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CONTENT STUDIO */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Creative Suite</div>
              <button
                onClick={() => { setActiveTab('content-studio'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'content-studio' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                <span>Content Studio</span>
              </button>
              {activeTab === 'content-studio' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['briefs', 'ai-copy'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setContentStudioSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        contentStudioSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'briefs' && '• Content Briefs'}
                      {tab === 'ai-copy' && '• AI Copy Studio'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PAID & OPTIMISATION */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Paid Campaigns</div>
              <button
                onClick={() => { setActiveTab('paid-opt'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'paid-opt' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <TrendingUp size={16} />
                <span>Sends & Journeys</span>
              </button>
              {activeTab === 'paid-opt' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['campaigns', 'automation', 'compliance'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPaidOptSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        paidOptSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'campaigns' && '• Active Campaigns'}
                      {tab === 'automation' && '• Lifecycle Journeys'}
                      {tab === 'compliance' && '• WA Compliance'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INTELLIGENCE & COMMS */}
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold text-[#AFBFDA]/50 uppercase tracking-widest mb-1">Intelligence</div>
              <button
                onClick={() => { setActiveTab('intelligence'); setSimulatedState('loaded'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'intelligence' ? 'bg-[#264288] text-white border-l-2 border-[#4065B3]' : 'text-[#AFBFDA] hover:bg-[#264288]/40 hover:text-white'
                }`}
              >
                <Sliders size={16} />
                <span>Search & Paid Command</span>
              </button>
              {activeTab === 'intelligence' && (
                <div className="ml-6 mt-1 space-y-1 border-l border-[#264288] pl-3">
                  {(['seo', 'blog', 'paid-command', 'ab-testing', 'intel-inbox'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setIntelligenceSubTab(tab)}
                      className={`w-full text-left text-[11px] py-1 transition ${
                        intelligenceSubTab === tab ? 'text-white font-bold' : 'text-[#AFBFDA] hover:text-white'
                      }`}
                    >
                      {tab === 'seo' && '• SEO & GEO Overview'}
                      {tab === 'blog' && '• Blog & CMS posts'}
                      {tab === 'paid-command' && '• Paid Media Command'}
                      {tab === 'ab-testing' && '• Creative Testing'}
                      {tab === 'intel-inbox' && '• Competitor Intel'}
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
              <div className="w-8 h-8 rounded-full bg-[#4065B3] text-white flex items-center justify-center font-bold text-xs">
                AB
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-none">Aisha Bello</p>
                <p className="text-[10px] text-[#AFBFDA] leading-none mt-1">Marketing Lead</p>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-[#4065B3]/20 text-[#AFBFDA] font-mono px-1.5 py-0.5 rounded tracking-wide uppercase border border-[#4065B3]/30">CO-10</span>
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
        
        {/* Top bar */}
        <header className="h-[56px] border-b border-[#D9E0EA] bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            {/* Pop-out navigation toggle */}
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="w-11 h-11 grid place-items-center text-slate-600 hover:bg-[#EEF3FB] rounded-lg transition shrink-0"
              id="marketing-sidebar-toggle"
              aria-label="Open marketing navigation"
              aria-controls="marketing-sidebar"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <span className="text-[10px] bg-[#EEF3FB] text-[#4065B3] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 hidden xs:inline">Marketing Workspace</span>
            <span className="text-slate-400 hidden xs:inline">/</span>
            <span className="text-xs font-bold text-slate-700 capitalize font-display truncate">
              {activeTab === 'planning' && `Planning (${planningSubTab})`}
              {activeTab === 'audience' && `Auditing (${audienceSubTab})`}
              {activeTab === 'web-offers' && `Funnels (${webOffersSubTab})`}
              {activeTab === 'community' && `Loyalty (${communitySubTab})`}
              {activeTab === 'content-studio' && `Studio (${contentStudioSubTab})`}
              {activeTab === 'paid-opt' && `Paid (${paidOptSubTab})`}
              {activeTab === 'intelligence' && `SEO (${intelligenceSubTab})`}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search campaigns..." 
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
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 tracking-wider shrink-0">{res.category}</span>
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
                <span>Marketing Node Active</span>
              </span>
            </div>
          </div>
        </header>

        {/* Viewport wrapper */}
        <div className="flex-1 overflow-y-auto p-6 relative">

          {/* Simulated view states */}
          {simulatedState === 'loading' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-[#D9E0EA] p-8 shadow-sm">
              <RefreshCw className="animate-spin text-[#4065B3] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-800 font-display">Loading Marketing Elements...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Reconciling campaign assets under the CO-10 release checklist.</p>
            </div>
          ) : simulatedState === 'error' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-red-200 p-8 shadow-sm">
              <div className="bg-red-50 text-red-600 p-3 rounded-full mb-4 border border-red-200">
                <XCircle size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Failed to load campaign list</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">Unmatched elements in the Shopify inventory sync. Please try re-authenticating.</p>
            </div>
          ) : simulatedState === 'restricted' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-amber-200 p-8 shadow-sm">
              <div className="bg-amber-50 text-amber-700 p-3 rounded-full mb-4 border border-amber-200">
                <Ban size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-display">•••• Gated / Restricted Dashboard</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md text-center">Your active employee security clearance level does not permit modifying campaign budgets or launching marketing broadcasts.</p>
            </div>
          ) : simulatedState === 'empty' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-xl border border-[#D9E0EA] p-8 shadow-sm">
              <Plus className="text-[#4065B3] mb-4" size={40} />
              <h3 className="text-sm font-bold text-slate-800 font-display">No campaigns created yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Click 'New Campaign' to initialize a campaign profile file.</p>
            </div>
          ) : (
            // Loaded State
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${planningSubTab}-${audienceSubTab}-${webOffersSubTab}-${communitySubTab}-${contentStudioSubTab}-${paidOptSubTab}-${intelligenceSubTab}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* PLANNING VIEW (K01) */}
                {activeTab === 'planning' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-display">Campaign Planner & Calendar</h2>
                        <p className="text-xs text-slate-500 mt-1">Govern cross-channel media assets and scheduled blasts</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="text-[11px] font-bold bg-[#EEF3FB] text-[#4065B3] px-2.5 py-1 rounded">Volume 3 • Marketing</span>
                      </div>
                    </div>

                    {planningSubTab === 'calendar' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="p-3 border border-[#D9E0EA] bg-[#F7F9FC] text-center rounded-lg min-h-[140px] flex flex-col justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800 border-b border-[#D9E0EA] pb-1.5">{day}</span>
                              {day === 'Tue' && (
                                <div className="p-1.5 bg-blue-500 text-white rounded text-[9px] font-bold leading-tight">
                                  Email Summer Launch
                                </div>
                              )}
                              {day === 'Thu' && (
                                <div className="p-1.5 bg-blue-600 text-white rounded text-[9px] font-bold leading-tight">
                                  Social Video Demo
                                </div>
                              )}
                              {day === 'Fri' && (
                                <div className="p-1.5 bg-amber-500 text-white rounded text-[9px] font-bold leading-tight">
                                  Webinar Gas Safety
                                </div>
                              )}
                              <span className="text-[10px] text-slate-400 mt-auto">16 Jul 2026</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {planningSubTab === 'timeline' && (
                      <div className="bg-white rounded-xl border border-[#D9E0EA] p-5 text-left space-y-4 shadow-sm">
                        <h4 className="text-xs font-black uppercase text-slate-900 font-display border-b border-[#D9E0EA] pb-2">Active Timeline Milestones</h4>
                        <div className="space-y-3 text-xs">
                          <p>1. <strong>Summer Campaign Blast:</strong> Scheduled for 16 Jul 2026 · 08:30 BST · Target list size: 4,182 emails</p>
                          <p>2. <strong>Shopify Sync check:</strong> Reconcile dynamic voucher codes with active coupon caps.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AUDIENCE VIEW (K02) */}
                {activeTab === 'audience' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Audience Segment & Profiling</h2>
                    <div className="bg-white rounded-xl border border-[#D9E0EA] overflow-hidden shadow-sm text-left">
                      <div className="p-5 border-b border-[#D9E0EA] bg-[#EEF3FB]/40">
                        <h4 className="font-bold text-slate-800 text-xs font-display">Target Profiles list (DELabs)</h4>
                      </div>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-xs text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#D9E0EA] font-bold text-slate-600">
                              <th className="p-4">Audience Profile</th>
                              <th className="p-4">Regime Label</th>
                              <th className="p-4">Inbound Source</th>
                              <th className="p-4 text-right">Recipient Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(!q || 'DELabs · Email · UK Segment'.toLowerCase().includes(q) || 'UK GDPR/PECR'.toLowerCase().includes(q) || 'Corporate Site Onboarding'.toLowerCase().includes(q)) && (
                              <tr className="border-b border-[#D9E0EA]">
                                <td className="p-4 font-bold">DELabs · Email · UK Segment</td>
                                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold font-mono text-[10px]">UK GDPR/PECR</span></td>
                                <td className="p-4">Corporate Site Onboarding</td>
                                <td className="p-4 text-right font-mono font-bold">4,182</td>
                              </tr>
                            )}
                            {(!q || 'Advanced Gases · WhatsApp · West Africa'.toLowerCase().includes(q) || 'NDPR'.toLowerCase().includes(q) || 'WhatsApp Lead Capture'.toLowerCase().includes(q)) && (
                              <tr className="border-b border-[#D9E0EA]">
                                <td className="p-4 font-bold">Advanced Gases · WhatsApp · West Africa</td>
                                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold font-mono text-[10px]">NDPR</span></td>
                                <td className="p-4">WhatsApp Lead Capture</td>
                                <td className="p-4 text-right font-mono font-bold">1,264</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* WEB & OFFERS VIEW (K07/K08/K09) */}
                {activeTab === 'web-offers' && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Funnels & Promotions Command</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-3">
                        <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-black font-mono">Pages List</span>
                        <h4 className="text-sm font-bold text-slate-900">Campaign Pages & Microsites</h4>
                        <p className="text-xs text-slate-500">Fast, on-brand landing pages linked directly with tracking pixels under the CO-10 guidelines.</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-3">
                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-black font-mono">Capture</span>
                        <h4 className="text-sm font-bold text-slate-900">Forms & Pop-ups</h4>
                        <p className="text-xs text-slate-500">Configure slide-out overlays and lead capture units with mapped user consent attributes.</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-3">
                        <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-black font-mono">Shopify Sync</span>
                        <h4 className="text-sm font-bold text-slate-900">Promotions & Discount Rules</h4>
                        <p className="text-xs text-slate-500">Enforce margin floor safety checks before coupon codes are pushed to Connected storefronts.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENT STUDIO (K16/K17) */}
                {activeTab === 'content-studio' && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Creative Content Studio</h2>
                    
                    {contentStudioSubTab === 'briefs' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 font-display">Active Editorial Briefs</h3>
                        <p className="text-xs text-slate-600">Brief #EB-2201: Grounded B2B Onboarding copy containing verified gas cylinder safety parameters.</p>
                      </div>
                    )}

                    {contentStudioSubTab === 'ai-copy' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-[#D9E0EA] pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">AI Copy Generator & Grounder</h3>
                            <p className="text-[10px] text-slate-500">Model v1.7 · Grounded to the active Installed Base dataset</p>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-[#4065B3] border border-blue-200 px-2.5 py-0.5 rounded font-black font-mono">DRAFT</span>
                        </div>
                        <textarea 
                          value={aiComposeDraft}
                          onChange={(e) => setAiComposeDraft(e.target.value)}
                          rows={4}
                          className="w-full bg-[#F7F9FC] border border-[#D9E0EA] rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#4065B3] transition"
                        />
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[10px] text-slate-400">AI draft — nothing sends itself. Subject to review.</span>
                          <button 
                            onClick={() => {
                              onAddLog('AI Copilot copy grounded', 'Permission', 'Aisha Bello', 'S&M', 'Grounded summer campaign copy successfully');
                              alert('Grounded draft saved to active campaign calendar asset list!');
                            }}
                            className="bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4 rounded-lg transition"
                          >
                            Save Grounded Draft
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* INTELLIGENCE & PAID COMMAND (K23) */}
                {activeTab === 'intelligence' && (
                  <div className="space-y-6 text-left">
                    <h2 className="text-2xl font-bold text-slate-900 font-display">SEO & Paid Media Command Center</h2>
                    
                    {intelligenceSubTab === 'paid-command' && (
                      <div className="space-y-6">
                        {/* KPI Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <span className="text-xs font-bold text-slate-500">Spend Pacing</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">£96,400</h3>
                            <span className="text-[10px] text-green-600 font-bold font-mono">+8.2% pacing vs target</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <span className="text-xs font-bold text-slate-500">Attributed Revenue</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">£404,880</h3>
                            <span className="text-[10px] text-green-600 font-bold font-mono">+11.4% ROI</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <span className="text-xs font-bold text-slate-500">ROAS</span>
                            <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">4.2x</h3>
                            <span className="text-[10px] text-blue-700 font-bold font-mono flex items-center space-x-0.5">
                              <Sparkles size={10} />
                              <span>Model Confirmed</span>
                            </span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm">
                            <span className="text-xs font-bold text-slate-500">Model Divergence</span>
                            <h3 className="text-3xl font-black text-[#B42318] font-mono mt-1">8.6%</h3>
                            <span className="text-[10px] text-amber-600 font-bold font-mono">Requires reconciliation</span>
                          </div>
                        </div>

                        {/* Model Divergence Warning & Reconcile Button */}
                        <div className="p-6 bg-amber-50/20 border border-amber-200 rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 font-display">Platform vs Modelled Divergence detected</h4>
                            <p className="text-xs text-slate-600">
                              Platform calculation shows £441k while modelled forecasts show £405k. Use the reconcile command to lock audit hashes.
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              onAddLog('Model Divergence Reconciled', 'Permission', 'Aisha Bello', 'S&M', 'Model divergence of 8.6% reconciled successfully');
                              alert('Audit hashes successfully updated and verified in the connected ledgers!');
                            }}
                            className="bg-[#4065B3] hover:bg-[#264288] text-white text-xs font-bold py-2 px-4.5 rounded-lg transition shadow flex items-center space-x-1.5 cursor-pointer"
                          >
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Reconcile & Align</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {intelligenceSubTab === 'intel-inbox' && (
                      <div className="bg-white p-5 rounded-xl border border-[#D9E0EA] shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 font-display">Competitor Intel Inbox</h3>
                        <p className="text-xs text-slate-600">Capturing pricing anomalies and creative shifts in regional markets (Sydney AirGas pricing cut detected).</p>
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
