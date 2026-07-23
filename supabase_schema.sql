-- Supabase schema for COS demo app
-- Run this in Supabase SQL Editor to create the required tables.

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text,
  customer_number text,
  industry text,
  employees text,
  annual_revenue text,
  billing_address jsonb,
  delivery_addresses jsonb,
  credit_limit numeric,
  available_credit numeric,
  payment_terms text,
  credit_status text,
  account_owner text,
  contacts jsonb
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text,
  unit text,
  bottle_sizes jsonb,
  stock_on_hand integer,
  days_cover numeric,
  reserved_stock integer,
  reorder_point integer,
  list_price numeric
);

CREATE TABLE IF NOT EXISTS deals (
  id text PRIMARY KEY,
  title text,
  company_id text,
  company_name text,
  amount numeric,
  stage text,
  probability integer,
  close_date date,
  owner text,
  health text,
  last_activity text,
  notes text
);

CREATE TABLE IF NOT EXISTS quotes (
  id text PRIMARY KEY,
  quote_number text,
  deal_id text,
  company_name text,
  valid_until date,
  items jsonb,
  discount numeric,
  subtotal numeric,
  discount_amount numeric,
  total numeric,
  margin numeric,
  status text,
  approver_needed text,
  requested_by text
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_number text,
  company_id text,
  company_name text,
  po_number text,
  date date,
  delivery_date date,
  delivery_type text,
  delivery_address text,
  items jsonb,
  status text,
  credit_hold_triggered boolean,
  assigned_driver text,
  eta text,
  stop_number integer,
  total_stops integer,
  total numeric,
  vat numeric,
  grand_total numeric
);

CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  invoice_number text,
  order_number text,
  company_id text,
  company_name text,
  due_date date,
  amount numeric,
  status text,
  pdf_url text
);

CREATE TABLE IF NOT EXISTS cylinder_balances (
  company_id text,
  gas_type text,
  bottle_size text,
  full_on_site integer,
  empty_on_site integer,
  in_transit integer,
  overdue_returns integer,
  risk_level text
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id text PRIMARY KEY,
  ticket_number text,
  company_id text,
  company_name text,
  request_type text,
  order_reference text,
  cylinder_type text,
  created_on timestamptz,
  status text,
  priority text,
  description text,
  replies jsonb
);

CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  name text,
  channel text,
  objective text,
  spend numeric,
  revenue numeric,
  roi numeric,
  leads integer,
  mqls integer,
  cac numeric,
  status text
);

CREATE TABLE IF NOT EXISTS approvals (
  id text PRIMARY KEY,
  type text,
  reference_id text,
  customer_name text,
  details text,
  impact_value text,
  requested_by text,
  request_date date,
  sla_days integer,
  status text,
  audit_trail jsonb
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  "user" text,
  action text,
  entity_type text,
  entity_name text,
  platform text,
  ip_address text,
  details text,
  before_value text,
  after_value text
);

-- Optional: add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
