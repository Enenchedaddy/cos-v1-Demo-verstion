# COS Enterprise Portal - Supabase & Local VS Code Setup Guide

This document outlines the step-by-step process to download this project, run it locally on your computer using VS Code, publish it to GitHub, and integrate a real backend database using **Supabase** so that all operations (orders, quotes, companies, tickets, and audit logs) remain persistent and synchronized across sessions.

---

## Part 1: Download & Run Locally in VS Code

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v18 or higher is recommended) -> [Download Node.js](https://nodejs.org/)
* **VS Code** (Visual Studio Code) -> [Download VS Code](https://code.visualstudio.com/)
* **Git** (for version control and pushing to GitHub) -> [Download Git](https://git-scm.com/)

### 2. Download Project Files
You can export the project files directly from COS-V1:
1. In the top-right menu of COS-V1, open the settings/export options.
2. Select **Export as ZIP** (or export directly to GitHub if preferred).
3. Extract the downloaded ZIP file to a folder on your computer (e.g., `C:\Projects\cos-portal` or `~/Projects/cos-portal`).

### 3. Open in VS Code
1. Launch **VS Code**.
2. Go to **File > Open Folder...** and select the directory where you extracted the project.
3. Open a terminal inside VS Code by pressing `` Ctrl + ` `` (or `Cmd + \`` on macOS) or via **Terminal > New Terminal**.

### 4. Install Dependencies
Run the following command in the VS Code terminal to install all required packages:
```bash
npm install
```

### 5. Launch the Local Dev Server
Run the local Vite development server:
```bash
npm run dev
```
* The terminal will print a local URL, typically `http://localhost:3000` or `http://localhost:5173`.
* Open this URL in your web browser to view your fully functional local copy of the app.

---

## Part 2: Publish Your Code to GitHub

To store your code securely and share it, initialize a local Git repository and push it to GitHub.

1. **Sign in to GitHub**: Log in or create an account at [github.com](https://github.com).
2. **Create a New Repository**:
   * Click **New** under Repositories.
   * Name your repository (e.g., `cos-operations-portal`).
   * Set it to **Private** or **Public**.
   * Leave "Add a README", ".gitignore", and "Choose a license" **unchecked** (since your downloaded files already include them).
   * Click **Create repository**.
3. **Initialize Git in VS Code Terminal**:
   Run these commands inside your local project terminal in VS Code:
   ```bash
   # Initialize local repository
   git init

   # Stage all project files
   git add .

   # Commit files
   git commit -m "initial: cos unified operations portal"

   # Link your local repository to the GitHub repository (replace with your actual URL)
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

   # Push code to GitHub
   git push -u origin main
   ```

---

## Part 3: Setup the Database in Supabase

By default, the application runs on mock data inside `src/data.ts`. Connecting Supabase allows you to use a real relational PostgreSQL database.

### 1. Create a Supabase Project
1. Visit [Supabase](https://supabase.com) and sign in.
2. Click **New Project** and select your organization.
3. Give your project a name (e.g., `cos-portal-db`), choose a strong database password, select your closest geographical region, and click **Create New Project**.

### 2. Create the Database Schema
Once your project is created:
1. Go to the **SQL Editor** tab in the left sidebar menu of the Supabase dashboard.
2. Click **New Query**.
3. Paste the following PostgreSQL schema definitions and click **Run**:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Products Table
create table products (
  id text primary key,
  name text not null,
  unit text not null,
  bottle_sizes jsonb not null,
  stock_on_hand integer not null default 0,
  days_cover numeric not null default 0,
  reserved_stock integer not null default 0,
  reorder_point integer not null default 0,
  list_price numeric not null default 0
);

-- 2. Companies / Accounts Table
create table companies (
  id text primary key,
  name text not null,
  customer_number text unique not null,
  industry text,
  employees text,
  annual_revenue text,
  billing_address jsonb not null,
  delivery_addresses jsonb not null,
  credit_limit numeric not null,
  available_credit numeric not null,
  payment_terms text not null,
  credit_status text not null,
  account_owner text not null,
  contacts jsonb not null default '[]'::jsonb
);

-- 3. Deals Table (for S&M)
create table deals (
  id text primary key,
  company_id text references companies(id),
  company_name text not null,
  deal_name text not null,
  amount numeric not null,
  stage text not null,
  probability integer not null,
  close_date text not null,
  created_date text not null,
  owner text not null
);

-- 4. Quotes Table (for S&M)
create table quotes (
  id text primary key,
  quote_number text unique not null,
  company_id text references companies(id),
  company_name text not null,
  items jsonb not null,
  subtotal numeric not null,
  tax numeric not null,
  total numeric not null,
  margin numeric not null,
  valid_until text not null,
  status text not null,
  notes text
);

-- 5. Orders Table
create table orders (
  id text primary key,
  order_number text unique not null,
  company_id text references companies(id),
  company_name text not null,
  po_number text,
  date text not null,
  delivery_date text not null,
  delivery_type text not null,
  delivery_address text not null,
  items jsonb not null,
  status text not null,
  credit_hold_triggered boolean not null default false,
  assigned_driver text,
  eta text,
  stop_number integer,
  total_stops integer,
  total numeric not null,
  vat numeric not null,
  grand_total numeric not null
);

-- 6. Invoices Table
create table invoices (
  id text primary key,
  invoice_number text unique not null,
  order_number text not null,
  company_id text references companies(id),
  company_name text not null,
  due_date text not null,
  amount numeric not null,
  status text not null,
  pdf_url text
);

-- 7. Cylinder Balances Table
create table cylinder_balances (
  id uuid default gen_random_uuid() primary key,
  company_id text references companies(id),
  gas_type text not null,
  bottle_size text not null,
  full_on_site integer not null default 0,
  empty_on_site integer not null default 0,
  in_transit integer not null default 0,
  overdue_returns integer not null default 0,
  risk_level text not null
);

-- 8. Support Tickets Table
create table support_tickets (
  id text primary key,
  ticket_number text unique not null,
  company_id text references companies(id),
  company_name text not null,
  request_type text not null,
  order_reference text,
  cylinder_type text,
  created_on text not null,
  status text not null,
  priority text not null,
  description text not null,
  replies jsonb not null default '[]'::jsonb
);

-- 9. Campaigns Table
create table campaigns (
  id text primary key,
  name text not null,
  channel text not null,
  objective text not null,
  spend numeric not null,
  revenue numeric not null,
  roi numeric not null,
  leads integer not null,
  mqls integer not null,
  cac numeric not null,
  status text not null
);

-- 10. Approvals Table
create table approvals (
  id text primary key,
  type text not null,
  reference_id text not null,
  customer_name text not null,
  details text not null,
  impact_value text not null,
  requested_by text not null,
  request_date text not null,
  sla_days integer not null,
  status text not null,
  audit_trail jsonb not null default '[]'::jsonb
);

-- 11. Audit Logs Table
create table audit_logs (
  id text primary key,
  timestamp text not null,
  "user" text not null,
  action text not null,
  entity_type text not null,
  entity_name text not null,
  platform text not null,
  ip_address text not null,
  details text,
  before_value text,
  after_value text
);
```

### 3. Seed Initial Database Records
To populate your Supabase tables with the default system data so you have something to work with immediately, run the following seed commands in a new query window:

```sql
-- Seed Products
insert into products (id, name, unit, bottle_sizes, stock_on_hand, days_cover, reserved_stock, reorder_point, list_price) values
('prod-o2', 'Oxygen (Industrial Grade)', 'cylinder', '["Size G (930L)", "47L Cylinder", "15 kg LPG"]', 12540, 18.6, 2385, 800, 44.90),
('prod-n2', 'Nitrogen (Industrial Grade)', 'cylinder', '["Size G (930L)", "47L Cylinder"]', 2800, 21.3, 650, 500, 18.30),
('prod-ar', 'Argon (Industrial Grade)', 'cylinder', '["Size E (680L)", "47L Cylinder"]', 2150, 16.2, 300, 600, 27.60),
('prod-co2', 'Carbon Dioxide (Industrial)', 'cylinder', '["Size F (600L)", "40L Cylinder"]', 2050, 13.1, 250, 500, 16.75),
('prod-ac', 'Acetylene (Dissolved)', 'cylinder', '["Size MC (380L)", "10L Cylinder"]', 290, 4.5, 60, 300, 35.10);

-- Seed Companies
insert into companies (id, name, customer_number, industry, employees, annual_revenue, billing_address, delivery_addresses, credit_limit, available_credit, payment_terms, credit_status, account_owner, contacts) values
('comp-acme', 'Acme Manufacturing, LLC', 'CUST-100234', 'Construction', '1,001 - 5,000', '$250M - $500M', '{"city": "Sydney", "state": "NSW 2000", "address": "Level 4, 210 George Street", "country": "Australia"}', '[{"id": "addr-acme-1", "name": "Sydney Site (Default)", "address": "1 Construction Way, St Leonards NSW 2065", "isDefault": true}, {"id": "addr-acme-2", "name": "Parramatta Site", "address": "45 Junction Street, Parramatta NSW 2150", "isDefault": false}, {"id": "addr-acme-3", "name": "Newcastle Site", "address": "12 Steel Street, Mayfield NSW 2304", "isDefault": false}]', 100000, 68450, '30 Days End of Month', 'Good Standing', 'Chris Allen', '[{"id": "cont-acme-1", "name": "John Doe", "role": "Account Owner", "phone": "(02) 9876 5432", "email": "john.doe@acmeconstruction.com.au"}, {"id": "cont-acme-2", "name": "Jane Smith", "role": "Accounts Payable", "phone": "(02) 9876 5433", "email": "jane.smith@acmeconstruction.com.au"}, {"id": "cont-acme-3", "name": "Mark Wilson", "role": "Site Manager", "phone": "(02) 9876 5434", "email": "mark.wilson@acmeconstruction.com.au"}]'),
('comp-btech', 'BioTech Laboratories Inc.', 'CUST-304911', 'Medical & Pharma', '501 - 1,000', '$100M - $250M', '{"city": "Melbourne", "state": "VIC 3000", "address": "Suite 12, 456 Collins Street", "country": "Australia"}', '[{"id": "addr-btech-1", "name": "Primary Lab", "address": "Block C, 12 Science Road, Parkville VIC 3052", "isDefault": true}]', 50000, 1250, '14 Days From Invoice', 'Risk Hold Override', 'Chris Allen', '[{"id": "cont-btech-1", "name": "Dr. Sarah Lin", "role": "Laboratory Director", "phone": "(03) 9555 1212", "email": "s.lin@biotechlabs.org.au"}, {"id": "cont-btech-2", "name": "Alan Carter", "role": "Procurement Officer", "phone": "(03) 9555 1213", "email": "a.carter@biotechlabs.org.au"}]');

-- Seed Cylinder Balances
insert into cylinder_balances (company_id, gas_type, bottle_size, full_on_site, empty_on_site, in_transit, overdue_returns, risk_level) values
('comp-acme', 'Oxygen (Industrial Grade)', 'Size G (930L)', 15, 8, 4, 2, 'Medium'),
('comp-acme', 'Nitrogen (Industrial Grade)', '47L Cylinder', 5, 12, 0, 5, 'High'),
('comp-btech', 'Oxygen (Industrial Grade)', '47L Cylinder', 8, 2, 2, 0, 'Low');
```

---

## Part 4: Connect the React App to Supabase

Now, let's configure your local project to query Supabase dynamically instead of using in-memory mock lists.

### 1. Install Supabase Client SDK
In your VS Code terminal, install the official Supabase SDK:
```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables
Create a file named `.env` in the **root** folder of your local project (make sure it's in your `.gitignore` so your secrets don't leak on GitHub):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-public-key
```
*(You can retrieve these credentials from your Supabase Dashboard under **Settings > API**)*

### 3. Create Supabase Client Helper
Create a new file at `src/supabaseClient.ts` and add the following helper:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Running with local mock database mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
```

### 4. Querying and Mutating Data in `src/App.tsx`
To replace local state variables with real database synchronizations, load your state within a `useEffect` inside `src/App.tsx`. Here is an example of fetching and writing companies:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Company } from './types';

// Inside your main App component:
const [companies, setCompanies] = useState<Company[]>([]);

// 1. Fetch data on load
useEffect(() => {
  async function loadCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) {
      console.error('Error loading companies:', error);
    } else if (data) {
      setCompanies(data as Company[]);
    }
  }
  loadCompanies();
}, []);

// 2. Insert or update data
async function handleUpdateCompany(updatedCompany: Company) {
  const { error } = await supabase
    .from('companies')
    .upsert(updatedCompany);

  if (error) {
    console.error('Error updating company:', error);
  } else {
    // Sync local state UI
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  }
}
```

Repeat this pattern for orders, invoices, tickets, and audits! This ensures that your local environment, your deployment portal, and your hosted database work in beautiful alignment.
