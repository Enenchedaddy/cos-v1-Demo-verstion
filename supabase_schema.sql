-- Supabase schema for COS demo app
-- Run this in Supabase SQL Editor to create the required tables.
--
-- This schema uses camelCase column names to match the application model exactly.

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  name text,
  customerNumber text,
  industry text,
  employees text,
  annualRevenue text,
  billingAddress jsonb,
  deliveryAddresses jsonb,
  creditLimit numeric,
  availableCredit numeric,
  paymentTerms text,
  creditStatus text,
  accountOwner text,
  contacts jsonb
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text,
  unit text,
  bottleSizes jsonb,
  stockOnHand integer,
  daysCover numeric,
  reservedStock integer,
  reorderPoint integer,
  listPrice numeric
);

CREATE TABLE IF NOT EXISTS deals (
  id text PRIMARY KEY,
  title text,
  companyId text,
  companyName text,
  amount numeric,
  stage text,
  probability integer,
  closeDate text,
  owner text,
  health text,
  lastActivity text,
  notes text
);

CREATE TABLE IF NOT EXISTS quotes (
  id text PRIMARY KEY,
  quoteNumber text,
  dealId text,
  companyName text,
  validUntil text,
  items jsonb,
  discount numeric,
  subtotal numeric,
  discountAmount numeric,
  total numeric,
  margin numeric,
  status text,
  approverNeeded text,
  requestedBy text
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  orderNumber text,
  companyId text,
  companyName text,
  poNumber text,
  date text,
  deliveryDate text,
  deliveryType text,
  deliveryAddress text,
  items jsonb,
  status text,
  creditHoldTriggered boolean,
  assignedDriver text,
  eta text,
  stopNumber integer,
  totalStops integer,
  total numeric,
  vat numeric,
  grandTotal numeric
);

CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  invoiceNumber text,
  orderNumber text,
  companyId text,
  companyName text,
  dueDate text,
  amount numeric,
  status text,
  pdfUrl text
);

CREATE TABLE IF NOT EXISTS cylinder_balances (
  companyId text,
  gasType text,
  bottleSize text,
  fullOnSite integer,
  emptyOnSite integer,
  inTransit integer,
  overdueReturns integer,
  riskLevel text
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id text PRIMARY KEY,
  ticketNumber text,
  companyId text,
  companyName text,
  requestType text,
  orderReference text,
  cylinderType text,
  createdOn text,
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
  referenceId text,
  customerName text,
  details text,
  impactValue text,
  requestedBy text,
  requestDate text,
  slaDays integer,
  status text,
  auditTrail jsonb
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY,
  timestamp text,
  "user" text,
  action text,
  entityType text,
  entityName text,
  platform text,
  ipAddress text,
  details text,
  beforeValue text,
  afterValue text
);

-- Optional: add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(companyId);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(companyId);
CREATE INDEX IF NOT EXISTS idx_quotes_deal_id ON quotes(dealId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
