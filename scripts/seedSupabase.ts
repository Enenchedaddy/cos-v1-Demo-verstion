import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
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
} from '../src/data';
import { toPortalDatabase } from '../src/app/portalDataCodec';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const expectedProjectRef = process.env.COS_EXPECTED_SUPABASE_PROJECT_REF;
const confirmation = process.env.COS_SEED_CONFIRMATION;

if (!supabaseUrl || !supabaseKey || !expectedProjectRef) {
  throw new Error('SUPABASE_URL, SUPABASE_KEY, and COS_EXPECTED_SUPABASE_PROJECT_REF are required. See .env.example.');
}

const actualProjectRef = new URL(supabaseUrl).hostname.split('.')[0];
if (actualProjectRef !== expectedProjectRef) {
  throw new Error(`Refusing to seed project ${actualProjectRef}; expected ${expectedProjectRef}.`);
}
if (confirmation !== 'SEED_COS_DEMO_DATA') {
  throw new Error('Refusing to seed without COS_SEED_CONFIRMATION=SEED_COS_DEMO_DATA.');
}

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const collections = [
  ['companies', INITIAL_COMPANIES],
  ['products', INITIAL_PRODUCTS],
  ['deals', INITIAL_DEALS],
  ['quotes', INITIAL_QUOTES],
  ['orders', INITIAL_ORDERS],
  ['invoices', INITIAL_INVOICES],
  ['cylinder_balances', INITIAL_CYLINDERS],
  ['support_tickets', INITIAL_SUPPORT_TICKETS],
  ['campaigns', INITIAL_CAMPAIGNS],
  ['approvals', INITIAL_APPROVALS],
  ['audit_logs', INITIAL_AUDIT_LOGS],
] as const;

async function assertTargetsAreEmpty(): Promise<void> {
  for (const [table] of collections) {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Could not inspect ${table}: ${error.message}`);
    if (count !== 0) throw new Error(`Refusing to seed: ${table} already contains ${count ?? 'unknown'} rows.`);
  }
}

async function run(): Promise<void> {
  await assertTargetsAreEmpty();
  for (const [table, records] of collections) {
    if (records.length === 0) continue;
    const { error } = await client.from(table).insert(records.map(toPortalDatabase));
    if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
    console.log(`Seeded ${records.length} rows into ${table}.`);
  }
  console.log(`Seeding completed for ${actualProjectRef}.`);
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
