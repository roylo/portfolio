-- Quick fix: Update RLS policies to allow anon inserts during setup
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Stories are manageable by authenticated users" ON stories;

-- Create a more permissive policy for development/setup
CREATE POLICY "Stories are manageable by anon and authenticated" ON stories
  FOR ALL USING (true) WITH CHECK (true);

-- Alternative: Temporarily disable RLS for setup (re-enable after population)
-- ALTER TABLE stories DISABLE ROW LEVEL SECURITY;

-- After populating, you can optionally re-enable with stricter policies:
-- ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- DROP POLICY "Stories are manageable by anon and authenticated" ON stories;
-- CREATE POLICY "Stories are readable by everyone" ON stories FOR SELECT USING (true);
-- CREATE POLICY "Stories are manageable by service role only" ON stories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');