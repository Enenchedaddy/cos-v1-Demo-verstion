import { useCallback, useEffect, useRef, useState } from 'react';
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
import { fromPortalDatabase, toPortalDatabase } from './portalDataCodec';

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

export type PortalDataStatus = 'loading' | 'ready' | 'demo' | 'empty' | 'unauthorized' | 'error' | 'unavailable';

interface PortalCollections {
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

export interface PortalData extends PortalCollections, PortalDataActions {
  status: PortalDataStatus;
  error: string | null;
  reload: () => Promise<void>;
}

const portalEnvironment = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env ?? {};
export const isPortalDemoEnabled = Boolean(
  portalEnvironment.DEV && portalEnvironment.VITE_COS_ALLOW_DEMO === 'true',
);

const EMPTY_COLLECTIONS: PortalCollections = {
  companies: [], orders: [], invoices: [], cylinders: [], tickets: [], products: [],
  deals: [], quotes: [], campaigns: [], approvals: [], auditLogs: [],
};

const DEMO_COLLECTIONS: PortalCollections = {
  companies: INITIAL_COMPANIES,
  orders: INITIAL_ORDERS,
  invoices: INITIAL_INVOICES,
  cylinders: INITIAL_CYLINDERS,
  tickets: INITIAL_SUPPORT_TICKETS,
  products: INITIAL_PRODUCTS,
  deals: INITIAL_DEALS,
  quotes: INITIAL_QUOTES,
  campaigns: INITIAL_CAMPAIGNS,
  approvals: INITIAL_APPROVALS,
  auditLogs: INITIAL_AUDIT_LOGS,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function classifyPortalDataError(error: unknown): PortalDataStatus {
  const message = errorMessage(error).toLowerCase();
  if (/permission|policy|row-level|not authorized|42501/.test(message)) return 'unauthorized';
  if (/fetch|network|offline|timeout|unavailable/.test(message)) return 'unavailable';
  return 'error';
}

async function readCollection<T>(table: PortalTable, orderBy?: string): Promise<T[]> {
  let query = supabase.from(table).select('*');
  if (orderBy) query = query.order(orderBy, { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return fromPortalDatabase<T[]>(data ?? []);
}

async function persistCollection(
  table: PortalTable,
  records: unknown[],
  operation: 'insert' | 'upsert' = 'upsert',
): Promise<void> {
  const payload = records.map(toPortalDatabase);
  const query = supabase.from(table);
  const { error } = operation === 'insert' ? await query.insert(payload) : await query.upsert(payload);
  if (error) throw error;
}

function recordCount(collections: PortalCollections): number {
  return Object.values(collections).reduce((count, records) => count + records.length, 0);
}

/**
 * Owns the legacy business-record boundary. Fixtures require an explicit
 * development-only flag, live rows are mapped from PostgreSQL naming, and
 * every failed mutation is rolled back and exposed through the hook state.
 */
export type PortalDataScope = 'all' | 'sales-marketing' | 'management' | 'inactive';
const SCOPE_TABLES: Record<PortalDataScope, readonly PortalTable[]> = {
  all: ['companies', 'products', 'orders', 'invoices', 'cylinder_balances', 'support_tickets', 'deals', 'quotes', 'campaigns', 'approvals', 'audit_logs'],
  'sales-marketing': ['companies', 'deals', 'campaigns', 'approvals', 'audit_logs'],
  management: ['companies', 'orders', 'approvals', 'audit_logs'],
  inactive: [],
};

export function usePortalData(scope: PortalDataScope = 'all'): PortalData {
  const requestVersion = useRef(0);
  const [collections, setCollections] = useState<PortalCollections>(() => (
    isPortalDemoEnabled ? DEMO_COLLECTIONS : EMPTY_COLLECTIONS
  ));
  const [status, setStatus] = useState<PortalDataStatus>(() => (
    isPortalDemoEnabled ? 'demo' : 'loading'
  ));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const version = ++requestVersion.current;
    if (scope === 'inactive') return;
    const read = <T,>(table: PortalTable, orderBy?: string): Promise<T[]> => (
      SCOPE_TABLES[scope].includes(table) ? readCollection<T>(table, orderBy) : Promise.resolve([])
    );
    if (!isSupabaseConfigured) {
      setCollections(isPortalDemoEnabled ? DEMO_COLLECTIONS : EMPTY_COLLECTIONS);
      setStatus(isPortalDemoEnabled ? 'demo' : 'unavailable');
      setError(isPortalDemoEnabled ? null : 'Supabase is not configured.');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const [companies, products, orders, invoices, cylinders, tickets, deals, quotes, campaigns, approvals, auditLogs] = await Promise.all([
        read<Company>('companies'),
        read<Product>('products'),
        read<Order>('orders'),
        read<Invoice>('invoices'),
        read<CylinderBalance>('cylinder_balances'),
        read<SupportTicket>('support_tickets'),
        read<Deal>('deals'),
        read<Quote>('quotes'),
        read<Campaign>('campaigns'),
        read<ApprovalRequest>('approvals'),
        read<AuditLog>('audit_logs', 'timestamp'),
      ]);
      if (version !== requestVersion.current) return;
      const next = { companies, products, orders, invoices, cylinders, tickets, deals, quotes, campaigns, approvals, auditLogs };
      setCollections(next);
      setStatus(recordCount(next) === 0 ? 'empty' : 'ready');
    } catch (loadError) {
      if (version !== requestVersion.current) return;
      setCollections(isPortalDemoEnabled ? DEMO_COLLECTIONS : EMPTY_COLLECTIONS);
      setStatus(isPortalDemoEnabled ? 'demo' : classifyPortalDataError(loadError));
      setError(errorMessage(loadError));
    }
  }, [scope]);

  useEffect(() => {
    void reload();
    return () => { requestVersion.current += 1; };
  }, [reload]);

  const mutateCollection = async <K extends keyof PortalCollections>(
    key: K,
    table: PortalTable,
    value: CollectionUpdate<PortalCollections[K][number]>,
    operation: 'insert' | 'upsert' = 'upsert',
    recordsToPersist?: unknown[],
  ): Promise<void> => {
    if (!isSupabaseConfigured && !isPortalDemoEnabled) {
      setStatus('unavailable');
      setError('Supabase is not configured; the change was not applied.');
      return;
    }

    const current = collections[key];
    const next = typeof value === 'function' ? value(current) : value;
    setCollections((previous) => ({ ...previous, [key]: next }));

    if (status === 'demo') return;

    try {
      await persistCollection(table, recordsToPersist ?? next, operation);
      setStatus('ready');
      setError(null);
    } catch (writeError) {
      setCollections((previous) => ({ ...previous, [key]: current }));
      setStatus(classifyPortalDataError(writeError));
      setError(errorMessage(writeError));
    }
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
    await mutateCollection('auditLogs', 'audit_logs', (previous) => [log, ...previous], 'insert', [log]);
  };

  const addApproval = async (approval: ApprovalRequest) => {
    await mutateCollection('approvals', 'approvals', (previous) => [approval, ...previous], 'insert', [approval]);
  };

  return {
    ...collections,
    status,
    error,
    reload,
    addLog,
    updateCompanies: (value) => mutateCollection('companies', 'companies', value),
    updateOrders: (value) => mutateCollection('orders', 'orders', value),
    updateInvoices: (value) => mutateCollection('invoices', 'invoices', value),
    updateCylinders: (value) => mutateCollection('cylinders', 'cylinder_balances', value),
    updateTickets: (value) => mutateCollection('tickets', 'support_tickets', value),
    updateDeals: (value) => mutateCollection('deals', 'deals', value),
    updateQuotes: (value) => mutateCollection('quotes', 'quotes', value),
    updateApprovals: (value) => mutateCollection('approvals', 'approvals', value),
    addApproval,
  };
}
