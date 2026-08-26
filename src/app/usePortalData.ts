import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CAMPAIGNS,
  INITIAL_COMPANIES,
  INITIAL_CYLINDERS,
  INITIAL_DEALS,
  INITIAL_INVOICES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_SUPPORT_TICKETS,
} from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import type {
  ApprovalRequest,
  AuditLog,
  Campaign,
  Company,
  CylinderBalance,
  Deal,
  Invoice,
  Order,
  Product,
  Quote,
  SupportTicket,
} from '../types';

type CollectionUpdate<T> = T[] | ((previous: T[]) => T[]);
type AuditEntityType = AuditLog['entityType'];
type AuditPlatform = AuditLog['platform'];
type PortalTable =
  | 'companies'
  | 'products'
  | 'orders'
  | 'invoices'
  | 'cylinder_balances'
  | 'support_tickets'
  | 'deals'
  | 'quotes'
  | 'campaigns'
  | 'approvals'
  | 'audit_logs';

interface PortalDataActions {
  addLog: (action: string, entityType: AuditEntityType, entityName: string, platform: AuditPlatform, details?: string) => Promise<void>;
  updateCompanies: (value: CollectionUpdate<Company>) => Promise<void>;
  updateOrders: (value: CollectionUpdate<Order>) => Promise<void>;
  updateInvoices: (value: CollectionUpdate<Invoice>) => Promise<void>;
  updateCylinders: (value: CollectionUpdate<CylinderBalance>) => Promise<void>;
  updateTickets: (value: CollectionUpdate<SupportTicket>) => Promise<void>;
  updateDeals: (value: CollectionUpdate<Deal>) => Promise<void>;
  updateQuotes: (value: CollectionUpdate<Quote>) => Promise<void>;
  updateApprovals: (value: CollectionUpdate<ApprovalRequest>) => Promise<void>;
  addApproval: (approval: ApprovalRequest) => Promise<void>;
}

const portalEnvironment = (import.meta as any).env ?? {};
const isControlledDemoMode = Boolean(portalEnvironment.DEV && portalEnvironment.VITE_COS_ALLOW_DEMO === 'true');

function initialRecords<T>(records: T[]): T[] {
  return isControlledDemoMode ? records : [];
}

export interface PortalData extends PortalDataActions {
  companies: Company[];
  orders: Order[];
  invoices: Invoice[];
  cylinders: CylinderBalance[];
  tickets: SupportTicket[];
  products: Product[];
  deals: Deal[];
  quotes: Quote[];
  campaigns: Campaign[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
}

function resolveUpdate<T>(value: CollectionUpdate<T>, current: T[]): T[] {
  return typeof value === 'function' ? value(current) : value;
}

async function persistCollection(table: PortalTable, records: unknown[], operation: 'insert' | 'upsert' = 'upsert'): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const query = supabase.from(table);
    const { error } = operation === 'insert' ? await query.insert(records) : await query.upsert(records);
    if (error) throw error;
  } catch (error) {
    console.error(`Supabase write error (${table}):`, error);
  }
}

async function loadCollection<T>(table: PortalTable, setRecords: Dispatch<SetStateAction<T[]>>, orderBy?: string): Promise<void> {
  let query = supabase.from(table).select('*');
  if (orderBy) query = query.order(orderBy, { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  setRecords((data ?? []) as T[]);
}

/**
 * Legacy portal-data utility. Development fixtures are opt-in and never used
 * by a production build; failed Supabase reads leave explicit empty state for
 * the consuming UI instead of retaining demo records.
 */
export function usePortalData(): PortalData {
  const [companies, setCompanies] = useState<Company[]>(() => initialRecords(INITIAL_COMPANIES));
  const [orders, setOrders] = useState<Order[]>(() => initialRecords(INITIAL_ORDERS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => initialRecords(INITIAL_INVOICES));
  const [cylinders, setCylinders] = useState<CylinderBalance[]>(() => initialRecords(INITIAL_CYLINDERS));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => initialRecords(INITIAL_SUPPORT_TICKETS));
  const [products, setProducts] = useState<Product[]>(() => initialRecords(INITIAL_PRODUCTS));
  const [deals, setDeals] = useState<Deal[]>(() => initialRecords(INITIAL_DEALS));
  const [quotes, setQuotes] = useState<Quote[]>(() => initialRecords(INITIAL_QUOTES));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => initialRecords(INITIAL_CAMPAIGNS));
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => initialRecords(INITIAL_APPROVALS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => initialRecords(INITIAL_AUDIT_LOGS));

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const synchronise = async () => {
      try {
        await loadCollection<Company>('companies', setCompanies);
        await loadCollection<Product>('products', setProducts);
        await loadCollection<Order>('orders', setOrders);
        await loadCollection<Invoice>('invoices', setInvoices);
        await loadCollection<CylinderBalance>('cylinder_balances', setCylinders);
        await loadCollection<SupportTicket>('support_tickets', setTickets);
        await loadCollection<Deal>('deals', setDeals);
        await loadCollection<Quote>('quotes', setQuotes);
        await loadCollection<Campaign>('campaigns', setCampaigns);
        await loadCollection<ApprovalRequest>('approvals', setApprovals);
        await loadCollection<AuditLog>('audit_logs', setAuditLogs, 'timestamp');
      } catch (error) {
        if (portalEnvironment.DEV) console.error('Portal data synchronisation failed; no fixture fallback is used in production.', error);
      }
    };

    void synchronise();
  }, []);

  const updateCollection = async <T,>(
    value: CollectionUpdate<T>,
    current: T[],
    setRecords: Dispatch<SetStateAction<T[]>>,
    table: PortalTable,
  ) => {
    const next = resolveUpdate(value, current);
    setRecords(next);
    await persistCollection(table, next);
  };

  const addLog = async (
    action: string,
    entityType: AuditEntityType,
    entityName: string,
    platform: AuditPlatform,
    details?: string,
  ) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Corporate Portal Session',
      action,
      entityType,
      entityName,
      platform,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 250 + 1)}`,
      details,
    };
    setAuditLogs((previous) => [log, ...previous]);
    await persistCollection('audit_logs', [log], 'insert');
  };

  const addApproval = async (approval: ApprovalRequest) => {
    setApprovals((previous) => [approval, ...previous]);
    await persistCollection('approvals', [approval], 'insert');
  };

  return {
    companies,
    orders,
    invoices,
    cylinders,
    tickets,
    products,
    deals,
    quotes,
    campaigns,
    approvals,
    auditLogs,
    addLog,
    updateCompanies: (value) => updateCollection(value, companies, setCompanies, 'companies'),
    updateOrders: (value) => updateCollection(value, orders, setOrders, 'orders'),
    updateInvoices: (value) => updateCollection(value, invoices, setInvoices, 'invoices'),
    updateCylinders: (value) => updateCollection(value, cylinders, setCylinders, 'cylinder_balances'),
    updateTickets: (value) => updateCollection(value, tickets, setTickets, 'support_tickets'),
    updateDeals: (value) => updateCollection(value, deals, setDeals, 'deals'),
    updateQuotes: (value) => updateCollection(value, quotes, setQuotes, 'quotes'),
    updateApprovals: (value) => updateCollection(value, approvals, setApprovals, 'approvals'),
    addApproval,
  };
}
