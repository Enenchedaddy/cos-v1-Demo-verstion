import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  INITIAL_COMPANIES,
  INITIAL_PRODUCTS,
  INITIAL_DEALS,
  INITIAL_QUOTES,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_CYLINDERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CAMPAIGNS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
} from "../src/data";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_KEY (or VITE_SUPABASE_ equivalents). See .env.local.example",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upsert(table: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  console.log(`Upserting ${rows.length} rows into ${table}...`);
  const { error } = await supabase.from(table).upsert(rows);
  if (error) {
    console.error(`Error upserting ${table}:`, error.message);
  } else {
    console.log(`Finished ${table}`);
  }
}

async function run() {
  try {
    await upsert("companies", INITIAL_COMPANIES as any);
    await upsert("products", INITIAL_PRODUCTS as any);
    await upsert("deals", INITIAL_DEALS as any);
    await upsert("quotes", INITIAL_QUOTES as any);
    await upsert("orders", INITIAL_ORDERS as any);
    await upsert("invoices", INITIAL_INVOICES as any);
    await upsert("cylinder_balances", INITIAL_CYLINDERS as any);
    await upsert("support_tickets", INITIAL_SUPPORT_TICKETS as any);
    await upsert("campaigns", INITIAL_CAMPAIGNS as any);
    await upsert("approvals", INITIAL_APPROVALS as any);
    await upsert("audit_logs", INITIAL_AUDIT_LOGS as any);
    console.log("Seeding completed.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

run();
