/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Company, Deal, Quote, Order, Invoice, CylinderBalance, SupportTicket, Campaign, AuditLog, ApprovalRequest, Product, UserRole } from './types';
import { 
  INITIAL_COMPANIES, INITIAL_ORDERS, 
  INITIAL_INVOICES, INITIAL_CYLINDERS, INITIAL_SUPPORT_TICKETS, 
  INITIAL_PRODUCTS, INITIAL_DEALS, INITIAL_QUOTES,
  INITIAL_CAMPAIGNS, INITIAL_APPROVALS, INITIAL_AUDIT_LOGS
} from './data';

import SalesMarketingPlatform from './components/SalesMarketingPlatform';
import ManagementPlatform from './components/ManagementPlatform';
import DesignSystemPlatform from './components/DesignSystemPlatform';
import IdentityGateway from './components/IdentityGateway';
import COSLogo from './components/COSLogo';
import CardInteractionManager from './components/CardInteractionManager';
import ClientApprovalPortal from './content-social/ClientApprovalPortal';
import HexLoader from './components/HexLoader';
import { 
  Database, Activity, Users, TrendingUp, Building2, ShieldAlert, KeyRound, ArrowRight,
  ShieldCheck, HelpCircle, Sparkles, Sliders, Globe, MessageSquare
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export default function App() {
  // Shared Database States (The Spine)
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [cylinders, setCylinders] = useState<CylinderBalance[]>(INITIAL_CYLINDERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [showSimulatorLogs, setShowSimulatorLogs] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'gateway' | 'sales-marketing' | 'management' | 'design-system'>(() => {
    const requestedWorkspace = new URLSearchParams(window.location.search).get('workspace');
    if (requestedWorkspace === 'sales' || requestedWorkspace === 'marketing') return 'sales-marketing';
    if (requestedWorkspace === 'management') return 'management';
    return 'gateway';
  });
  const [salesMarketingInitialArea, setSalesMarketingInitialArea] = useState(() => {
    const requestedWorkspace = new URLSearchParams(window.location.search).get('workspace');
    if (requestedWorkspace === 'sales') return 'sales-execution';
    if (requestedWorkspace === 'marketing') return 'campaigns';
    return 'home';
  });
  const [isInitializing, setIsInitializing] = useState(() => {
    try {
      return sessionStorage.getItem('cos-portal-initialized') !== 'true';
    } catch {
      return true;
    }
  });
  const [launchTransition, setLaunchTransition] = useState<{
    target: 'gateway' | 'sales-marketing' | 'management' | 'design-system';
    label: string;
  } | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const [gatewaySelectedCompanyId, setGatewaySelectedCompanyId] = useState<string>('comp-acme');

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

  const beginPlatformTransition = (
    target: 'gateway' | 'sales-marketing' | 'management' | 'design-system',
    label: string,
    onComplete?: () => void,
  ) => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setLaunchTransition({ target, label });
    transitionTimer.current = window.setTimeout(() => {
      setActivePlatform(target);
      setLaunchTransition(null);
      transitionTimer.current = null;
      onComplete?.();
    }, 1750);
  };

  // Fetch real-time data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log('Using local memory mock database (Supabase is not configured in .env)');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Companies
        const { data: companiesData, error: companiesError } = await supabase.from('companies').select('*');
        if (companiesError) throw companiesError;
        if (companiesData && companiesData.length > 0) setCompanies(companiesData as Company[]);

        // 2. Fetch Products
        const { data: productsData, error: productsError } = await supabase.from('products').select('*');
        if (productsError) throw productsError;
        if (productsData && productsData.length > 0) setProducts(productsData as Product[]);

        // 3. Fetch Orders
        const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*');
        if (ordersError) throw ordersError;
        if (ordersData && ordersData.length > 0) setOrders(ordersData as Order[]);

        // 4. Fetch Invoices
        const { data: invoicesData, error: invoicesError } = await supabase.from('invoices').select('*');
        if (invoicesError) throw invoicesError;
        if (invoicesData && invoicesData.length > 0) setInvoices(invoicesData as Invoice[]);

        // 5. Fetch Cylinder Balances
        const { data: cylindersData, error: cylindersError } = await supabase.from('cylinder_balances').select('*');
        if (cylindersError) throw cylindersError;
        if (cylindersData && cylindersData.length > 0) setCylinders(cylindersData as CylinderBalance[]);

        // 6. Fetch Support Tickets
        const { data: ticketsData, error: ticketsError } = await supabase.from('support_tickets').select('*');
        if (ticketsError) throw ticketsError;
        if (ticketsData && ticketsData.length > 0) setTickets(ticketsData as SupportTicket[]);

        // 7. Fetch Deals
        const { data: dealsData, error: dealsError } = await supabase.from('deals').select('*');
        if (dealsError) throw dealsError;
        if (dealsData && dealsData.length > 0) setDeals(dealsData as Deal[]);

        // 8. Fetch Quotes
        const { data: quotesData, error: quotesError } = await supabase.from('quotes').select('*');
        if (quotesError) throw quotesError;
        if (quotesData && quotesData.length > 0) setQuotes(quotesData as Quote[]);

        // 9. Fetch Campaigns
        const { data: campaignsData, error: campaignsError } = await supabase.from('campaigns').select('*');
        if (campaignsError) throw campaignsError;
        if (campaignsData && campaignsData.length > 0) setCampaigns(campaignsData as Campaign[]);

        // 10. Fetch Approvals
        const { data: approvalsData, error: approvalsError } = await supabase.from('approvals').select('*');
        if (approvalsError) throw approvalsError;
        if (approvalsData && approvalsData.length > 0) setApprovals(approvalsData as ApprovalRequest[]);

        // 11. Fetch Audit Logs
        const { data: auditLogsData, error: auditLogsError } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (auditLogsError) throw auditLogsError;
        if (auditLogsData && auditLogsData.length > 0) setAuditLogs(auditLogsData as AuditLog[]);

        console.log('Successfully synchronized state with Supabase Cloud Relational Database');
      } catch (err) {
        console.error('Failed to sync tables from Supabase, reverting to local state:', err);
      }
    };

    fetchData();
  }, []);

  // Sync selectedCustomerId once companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !companies.some(c => c.id === gatewaySelectedCompanyId)) {
      setGatewaySelectedCompanyId(companies[0].id);
    }
  }, [companies, gatewaySelectedCompanyId]);

  // Shared Helper: Log System Activity
  const handleAddLog = async (
    action: string, 
    entityType: 'Order' | 'Quote' | 'Invoice' | 'Cylinder' | 'Customer' | 'Payment' | 'Permission', 
    entityName: string, 
    platform: 'Customer' | 'S&M' | 'Management' | 'Shared', 
    details?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Corporate Portal Session',
      action,
      entityType,
      entityName,
      platform,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 250 + 1),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert(newLog);
      } catch (err) {
        console.error('Supabase write error (audit_logs):', err);
      }
    }
  };

  // State Write Wrappers for Database Synchronization
  const handleUpdateCompanies = async (val: Company[] | ((prev: Company[]) => Company[])) => {
    const next = typeof val === 'function' ? val(companies) : val;
    setCompanies(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('companies').upsert(next);
      } catch (err) {
        console.error('Supabase write error (companies):', err);
      }
    }
  };

  const handleUpdateOrders = async (val: Order[] | ((prev: Order[]) => Order[])) => {
    const next = typeof val === 'function' ? val(orders) : val;
    setOrders(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('orders').upsert(next);
      } catch (err) {
        console.error('Supabase write error (orders):', err);
      }
    }
  };

  const handleUpdateInvoices = async (val: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    const next = typeof val === 'function' ? val(invoices) : val;
    setInvoices(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('invoices').upsert(next);
      } catch (err) {
        console.error('Supabase write error (invoices):', err);
      }
    }
  };

  const handleUpdateCylinders = async (val: CylinderBalance[] | ((prev: CylinderBalance[]) => CylinderBalance[])) => {
    const next = typeof val === 'function' ? val(cylinders) : val;
    setCylinders(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('cylinder_balances').upsert(next);
      } catch (err) {
        console.error('Supabase write error (cylinder_balances):', err);
      }
    }
  };

  const handleUpdateTickets = async (val: SupportTicket[] | ((prev: SupportTicket[]) => SupportTicket[])) => {
    const next = typeof val === 'function' ? val(tickets) : val;
    setTickets(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('support_tickets').upsert(next);
      } catch (err) {
        console.error('Supabase write error (support_tickets):', err);
      }
    }
  };

  const handleUpdateDeals = async (val: Deal[] | ((prev: Deal[]) => Deal[])) => {
    const next = typeof val === 'function' ? val(deals) : val;
    setDeals(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('deals').upsert(next);
      } catch (err) {
        console.error('Supabase write error (deals):', err);
      }
    }
  };

  const handleUpdateQuotes = async (val: Quote[] | ((prev: Quote[]) => Quote[])) => {
    const next = typeof val === 'function' ? val(quotes) : val;
    setQuotes(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('quotes').upsert(next);
      } catch (err) {
        console.error('Supabase write error (quotes):', err);
      }
    }
  };

  const handleUpdateApprovals = async (val: ApprovalRequest[] | ((prev: ApprovalRequest[]) => ApprovalRequest[])) => {
    const next = typeof val === 'function' ? val(approvals) : val;
    setApprovals(next);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('approvals').upsert(next);
      } catch (err) {
        console.error('Supabase write error (approvals):', err);
      }
    }
  };

  const handleAddApproval = async (newAppr: ApprovalRequest) => {
    setApprovals(prev => [newAppr, ...prev]);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('approvals').insert(newAppr);
      } catch (err) {
        console.error('Supabase write error (approvals):', err);
      }
    }
  };

  const clientApprovalToken = new URLSearchParams(window.location.search).get('client_approval');
  if (clientApprovalToken) return <ClientApprovalPortal token={clientApprovalToken} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-800 bg-[#F7F9FC]">
      <CardInteractionManager />
      {isInitializing && (
        <HexLoader
          fullPage
          size="lg"
          label="Initializing core security contexts & database spine…"
        />
      )}
      {launchTransition && !isInitializing && (
        <HexLoader fullPage size="lg" label={launchTransition.label} />
      )}
      
      {/* Primary Workspace */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {activePlatform === 'gateway' && (
          <IdentityGateway
            isSupabaseConfigured={isSupabaseConfigured}
            onOpenDesignSystem={() => beginPlatformTransition('design-system', 'Opening COS Design System…')}
            onEnterSales={() => {
              setSalesMarketingInitialArea('sales-execution');
              beginPlatformTransition('sales-marketing', 'Authenticating & Launching Sales Platform…', () => {
                handleAddLog('Sales Session Authorized', 'Customer', 'Chris Allen', 'S&M', 'Entered Sales through the unified commercial platform');
              });
            }}
            onEnterMarketing={() => {
              setSalesMarketingInitialArea('campaigns');
              beginPlatformTransition('sales-marketing', 'Authenticating & Launching Marketing Suite…', () => {
                handleAddLog('Marketing Session Authorized', 'Customer', 'Aisha Bello', 'S&M', 'Entered Marketing through the unified commercial platform');
              });
            }}
            onEnterManagement={() => {
              beginPlatformTransition('management', 'Authenticating & Launching Executive Management Suite…', () => {
                handleAddLog('Executive Session Authorized', 'Permission', 'CEO', 'Management', 'Entered Management from governed gateway');
              });
            }}
          />
        )}

        {false && activePlatform === 'gateway' && (
          <div className="flex-1 overflow-y-auto bg-[#FCFBF7]">
            <div className="mx-auto flex min-h-full w-full max-w-[1520px] flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
              <header className="flex items-center justify-between border-b border-[#D8D6CE] pb-5">
                <div className="flex items-center gap-3">
                  <COSLogo className="h-10 w-10" variant="full" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5E6872]">Central Operating System</p>
                    <p className="text-sm font-semibold text-[#15202B]">Identity gateway</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePlatform('design-system')}
                  className="hidden min-h-11 items-center gap-2 border-b border-[#15202B] text-xs font-semibold text-[#15202B] transition hover:border-[#C84F2A] hover:text-[#C84F2A] sm:flex"
                >
                  <Sliders size={16} strokeWidth={1.75} />
                  Open design system
                </button>
              </header>

              <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-14 lg:py-16">
                <section className="lg:col-span-5">
                  <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#C84F2A]">
                    Governed access · CO-10
                  </p>
                  <h1 className="max-w-3xl text-[42px] font-semibold leading-[0.98] text-[#15202B] sm:text-[56px] lg:text-[72px]">
                    One governed view of the business.
                  </h1>
                  <p className="mt-7 max-w-xl text-base leading-7 text-[#5E6872] sm:text-lg sm:leading-8">
                    Enter the workspace that matches your responsibility. Access, operational changes, and recommendations are recorded against your identity.
                  </p>
                  <div className="mt-10 max-w-xl border-l-2 border-[#C84F2A] pl-5">
                    <p className="text-sm font-semibold text-[#15202B]">Session responsibility</p>
                    <p className="mt-1 text-sm leading-6 text-[#5E6872]">
                      You are entering a controlled demo environment. Decisions made here are written to the shared audit ledger.
                    </p>
                  </div>
                </section>

                <section className="lg:col-span-7" aria-labelledby="workspace-index-title">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5E6872]">Authorised destinations</p>
                      <h2 id="workspace-index-title" className="mt-1 text-3xl font-semibold text-[#15202B]">Workspace index</h2>
                    </div>
                    <span className="font-mono text-[11px] text-[#5E6872]">03 workspaces</span>
                  </div>

                  <div className="grid gap-3 border-t border-[#15202B] pt-3 sm:grid-cols-2">
                    {[
                      {
                        id: 'management',
                        volume: '01',
                        name: 'Management',
                        purpose: 'Decisions, approvals, group performance',
                        role: 'Olivia Reed · Group CEO',
                        icon: Building2,
                        lead: true,
                        action: () => {
                          setActivePlatform('management');
                          handleAddLog('Executive Session Authorized', 'Permission', 'CEO', 'Management', 'Entered Management from governed gateway');
                        }
                      },
                      {
                        id: 'sales',
                        volume: '02',
                        name: 'Sales',
                        purpose: 'Accounts, pipeline, quotes, controls',
                        role: 'Marcus Hale · Sales Manager',
                        icon: TrendingUp,
                        lead: false,
                        action: () => {
                          setActivePlatform('sales');
                          handleAddLog('Sales Session Authorized', 'Customer', 'Marcus Hale', 'S&M', 'Entered Sales from governed gateway');
                        }
                      },
                      {
                        id: 'marketing',
                        volume: '03',
                        name: 'Marketing',
                        purpose: 'Campaigns, consent, attribution',
                        role: 'Aisha Bello · Marketing Lead',
                        icon: MessageSquare,
                        lead: false,
                        action: () => {
                          setActivePlatform('marketing');
                          handleAddLog('Marketing Session Authorized', 'Customer', 'Aisha Bello', 'S&M', 'Entered Marketing from governed gateway');
                        }
                      }
                    ].map((workspace) => {
                      const Icon = workspace.icon;
                      return (
                        <button
                          key={workspace.id}
                          onClick={workspace.action}
                          className={`group relative flex min-h-[190px] w-full flex-col justify-between overflow-hidden border bg-white p-5 text-left transition-colors hover:border-[#C84F2A] focus-visible:border-[#C84F2A] ${
                            workspace.lead
                              ? 'border-[#183153] sm:col-span-2 sm:min-h-[176px]'
                              : 'border-[#D8D6CE]'
                          }`}
                          aria-label={`Enter ${workspace.name} workspace`}
                        >
                          <span className="flex w-full items-start justify-between">
                            <span className="flex h-10 w-10 items-center justify-center border border-[#D8D6CE] text-[#183153]">
                              <Icon size={20} strokeWidth={1.75} />
                            </span>
                            <span className="font-mono text-[10px] tracking-[0.12em] text-[#C84F2A]">VOL {workspace.volume}</span>
                          </span>

                          <span className="mt-7 block w-full">
                            <span className="flex items-end justify-between gap-4">
                              <span>
                                <span className="block text-xl font-semibold text-[#15202B]">{workspace.name}</span>
                                <span className="mt-1 block text-sm leading-5 text-[#5E6872]">{workspace.purpose}</span>
                              </span>
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#183153] text-white transition-colors group-hover:bg-[#C84F2A]">
                                <ArrowRight size={17} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </span>
                            <span className="mt-5 block border-t border-[#D8D6CE] pt-3 font-mono text-[10px] text-[#7A838C]">
                              AUTHORISED ROLE · {workspace.role}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <dl className="evidence-rail mt-auto" aria-label="Gateway evidence">
                <div><dt>Identity</dt><dd>Corporate SSO</dd></div>
                <div><dt>Policy</dt><dd>CO-10 enforced</dd></div>
                <div><dt>Data spine</dt><dd>{isSupabaseConfigured ? 'Supabase connected' : 'Demo ledger active'}</dd></div>
                <div><dt>Session</dt><dd>TLS 1.3 · audited</dd></div>
              </dl>
            </div>
          </div>
        )}

        {false && activePlatform === 'gateway' && (
          <div className="flex-1 overflow-y-auto bg-[#F7F9FC] flex flex-col justify-between p-6">
            
            {/* Top Branding Section */}
            <div className="max-w-6xl mx-auto w-full text-center pt-8 pb-4 shrink-0 flex flex-col items-center">
              <div className="inline-flex items-center space-x-3.5 mb-6 bg-white px-5 py-2.5 rounded-xl border border-[#D9E0EA] shadow-sm">
                <COSLogo className="w-10 h-10 shadow-sm" variant="full" />
                <div className="text-left">
                  <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-display">Central Operating System</h2>
                  <p className="text-base font-black text-slate-900 tracking-tight uppercase">COS_V1_Demo</p>
                </div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none sm:text-4xl max-w-2xl mx-auto font-display">
                Secure Unified Identity Gateway
              </h1>
              <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
                Select your designated platform workspace below. Your identity profiles, SSO permissions, and color contrast tokens are fully audited for compliance under the CO-10 security mandate.
              </p>

              {/* Design System Spec Link Card */}
              <div className="mt-6 max-w-xl w-full bg-white border border-[#D9E0EA] p-4 rounded-xl flex items-center justify-between text-left hover:border-[#4065B3]/60 hover:shadow-lg transition group">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#4065B3]/10 border border-[#4065B3]/20 p-2 rounded-lg text-[#4065B3]">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] bg-[#EEF3FB] text-[#4065B3] font-black px-1.5 py-0.5 rounded tracking-wider uppercase font-mono">Living Spec</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1 font-display">COS V1.0 Design System & Live Sandbox</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Explore color tokens, WCAG AA contrast logs, and interactive controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePlatform('design-system')}
                  className="bg-[#4065B3] hover:bg-[#264288] text-white text-[10px] font-black py-2 px-3.5 rounded-lg shadow-sm transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Launch Spec</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch my-6">
              
              {/* Option A: Sales Platform */}
              <div className="bg-white rounded-2xl p-6 border border-[#D9E0EA] shadow-md shadow-slate-200/50 flex flex-col justify-between transition-all hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5 duration-200">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                      <TrendingUp size={22} className="text-emerald-600" />
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-md font-bold px-2 py-0.5 tracking-wider uppercase">
                      Volume 2 • Sales
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-slate-900">Sales Platform</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Track the commercial pipeline, manage client deals, issue pricing quotes with margin analyses, and enforce pre-agreed pricing rules.
                  </p>

                  <div className="space-y-3.5 mt-6 pt-5 border-t border-[#D9E0EA]">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sales Rep Profile</label>
                      <select 
                        className="w-full bg-slate-50 border border-[#D9E0EA] rounded-lg p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 transition"
                        defaultValue="chris"
                      >
                        <option value="chris">Chris Allen (Senior Sales Representative)</option>
                        <option value="emily">Emily Johnson (Regional Accounts Manager)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Region Oversight</label>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 font-mono border border-[#D9E0EA]">
                        <span>EMEA / UK Regional Hub</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setActivePlatform('sales');
                      handleAddLog('Sales Rep Authenticated', 'Customer', 'Chris Allen', 'S&M', 'Logged in via secure Identity Gateway');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Authenticate & Launch</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Option B: Marketing Platform */}
              <div className="bg-white rounded-2xl p-6 border border-[#D9E0EA] shadow-md shadow-slate-200/50 flex flex-col justify-between transition-all hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-0.5 duration-200">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                      <MessageSquare size={22} className="text-purple-600" />
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/50 rounded-md font-bold px-2 py-0.5 tracking-wider uppercase">
                      Volume 3 • Marketing
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-slate-900">Marketing Platform</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Govern cross-channel media planning, campaign calendars, segmented privacy consents, AI creative briefs, and media spend ROI analysis.
                  </p>

                  <div className="space-y-3.5 mt-6 pt-5 border-t border-[#D9E0EA]">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Marketer Profile</label>
                      <select 
                        className="w-full bg-slate-50 border border-[#D9E0EA] rounded-lg p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-600 transition"
                        defaultValue="aisha"
                      >
                        <option value="aisha">Aisha Bello (Marketing Director)</option>
                        <option value="daniel">Daniel Kerr (Ad Campaigns Lead)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Consent Scope</label>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 font-mono border border-[#D9E0EA]">
                        <span>GDPR / PECR Compliance Enforcement</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setActivePlatform('marketing');
                      handleAddLog('Marketer Session Authorized', 'Customer', 'Aisha Bello', 'S&M', 'Logged in to Marketing volume via gateway');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-purple-950/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Authenticate & Launch</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Option C: CEO / Management Suite */}
              <div className="bg-white rounded-2xl p-6 border border-[#D9E0EA] shadow-md shadow-slate-200/50 flex flex-col justify-between transition-all hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-0.5 duration-200">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#4065B3]/10 p-3 rounded-xl border border-[#4065B3]/20">
                      <Building2 size={22} className="text-[#4065B3]" />
                    </div>
                    <span className="text-[10px] bg-blue-50 text-[#4065B3] border border-blue-200/50 rounded-md font-bold px-2 py-0.5 tracking-wider uppercase">
                      Volume 1 • Management
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-slate-900">CEO & Management Suite</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Command Centre oversight for group executives. Monitor business performance matrices, OKR strategy mapping, policy overrides, and entity registries.
                  </p>

                  <div className="space-y-3.5 mt-6 pt-5 border-t border-[#D9E0EA]">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Executive Role Profile</label>
                      <select 
                        className="w-full bg-slate-50 border border-[#D9E0EA] rounded-lg p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#4065B3] transition"
                        defaultValue="ceo"
                      >
                        <option value="ceo">Olivia Reed (Group CEO & Executive Director)</option>
                        <option value="clara">Clara Evans (Chief Financial Officer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Authorization Clearance</label>
                      <div className="bg-[#EEF3FB] rounded-lg p-2.5 text-xs text-[#264288] font-mono border border-[#D9E0EA] font-bold flex items-center space-x-1.5">
                        <ShieldCheck size={13} className="text-[#4065B3]" />
                        <span>Level-5 Global Executive</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setActivePlatform('management');
                      handleAddLog('Executive Session Authorized', 'Permission', 'CEO', 'Management', 'Logged in via secure Level-5 Gateway override');
                    }}
                    className="w-full bg-[#182A5C] hover:bg-[#264288] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-slate-950/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Authenticate & Launch</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Operations Bar */}
            <div className="max-w-6xl mx-auto w-full pt-4 border-t border-[#D9E0EA] shrink-0 grid grid-cols-1 sm:grid-cols-4 gap-4 text-[11px] text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="font-bold">Database Spine:</span>
                <span className="text-slate-500">ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="font-bold">SOX Audit Ledger:</span>
                <span className="text-slate-500">SECURE & DEPLOYED</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="font-bold">GPS Logistics Feed:</span>
                <span className="text-slate-500">ACTIVE</span>
              </div>
              <div className="flex items-center space-x-2 sm:justify-end">
                <span className="text-slate-500 font-semibold font-mono">Gateway Node: v1.0.0-TLS1.3</span>
              </div>
            </div>

          </div>
        )}

        {activePlatform === 'sales-marketing' && (
          <SalesMarketingPlatform
            companies={companies}
            deals={deals}
            campaigns={campaigns}
            auditLogs={auditLogs}
            approvals={approvals}
            initialArea={salesMarketingInitialArea}
            onAddLog={handleAddLog}
            onUpdateDeals={handleUpdateDeals}
            onLogoutToGateway={() => {
              beginPlatformTransition('gateway', 'Returning to the Identity Gateway…');
            }}
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
            onAddLog={handleAddLog}
            onUpdateOrders={handleUpdateOrders}
            onUpdateQuotes={handleUpdateQuotes}
            onUpdateCompanies={handleUpdateCompanies}
            onUpdateApprovals={handleUpdateApprovals}
            onLogoutToGateway={() => {
              beginPlatformTransition('gateway', 'Returning to the Identity Gateway…');
            }}
          />
        )}

        {activePlatform === 'design-system' && (
          <DesignSystemPlatform
            onLogoutToGateway={() => {
              beginPlatformTransition('gateway', 'Returning to the Identity Gateway…');
            }}
          />
        )}
      </main>

      {/* Enterprise Audit Log stream (Collapsible) */}
      {showSimulatorLogs && (
        <div className="bg-[#081730] border-t border-slate-800 text-slate-300 h-[150px] shrink-0 flex flex-col relative z-20">
          <div className="bg-[#050f21] px-6 py-2 border-b border-slate-800 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <Database size={14} className="text-[#0066CC]" />
              <span className="font-extrabold uppercase tracking-wider">Enterprise SOX Auditing Log Stream (Real-Time Spine Feed)</span>
            </div>
            <button 
              onClick={() => setShowSimulatorLogs(false)}
              className="text-slate-400 hover:text-white font-bold text-xs"
            >
              Hide Stream
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px]">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="flex space-x-3 border-b border-slate-900 pb-1.5 last:border-b-0 leading-relaxed items-start">
                  <span className="text-slate-500">[{log.timestamp.split(' ')[1]}]</span>
                  <span className="text-[#0066CC] font-[#0066CC]">[{log.entityType.toUpperCase()}]</span>
                  <span className="text-blue-300 font-bold">{log.action}:</span>
                  <span className="text-slate-300">{log.details}</span>
                  <span className="text-slate-600 ml-auto">IP: {log.ipAddress}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-4">Logs stream is active. Interact with the platform to generate compliance logs.</p>
            )}
          </div>
        </div>
      )}

      {/* Minimized stream trigger badge */}
      {!showSimulatorLogs && (
        <button
          onClick={() => setShowSimulatorLogs(true)}
          className="fixed bottom-4 right-4 bg-[#0B1E3F] hover:bg-[#153463] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-[10px] font-bold shadow-xl z-50 flex items-center space-x-2 transition"
        >
          <Activity size={12} className="text-[#0066CC] animate-pulse" />
          <span>Expose Spine Log Stream</span>
        </button>
      )}

    </div>
  );
}
