-- RLS configuration for Supabase campaigns table
-- Apply this only if you enabled Row Level Security on the campaigns table.

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on campaigns" ON campaigns
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert update delete on campaigns" ON campaigns
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- If you are seeding with a Supabase service role key, RLS is bypassed.
-- Make sure SUPABASE_KEY in .env.local is the service_role key for seeding.
