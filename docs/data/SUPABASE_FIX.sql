-- Supabase Table Setup - Run these commands in order

-- Step 1: Check if table exists and what it looks like
SELECT * FROM information_schema.tables 
WHERE table_name = 'leech_data';

-- Step 2: If you want to start fresh, drop the existing table
-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS leech_data CASCADE;

-- Step 3: Create the table (run this after dropping, or skip if table structure is correct)
CREATE TABLE leech_data (
  id BIGSERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  n1 JSONB,
  n2 JSONB,
  n3 JSONB,
  n4 JSONB,
  n5 JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create index for fast queries
CREATE INDEX idx_leech_data_timestamp ON leech_data(timestamp DESC);

-- Step 5: Enable Row Level Security
ALTER TABLE leech_data ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies (drop existing ones first if they exist)
DROP POLICY IF EXISTS "Public read access" ON leech_data;
DROP POLICY IF EXISTS "Public insert access" ON leech_data;

CREATE POLICY "Public read access" ON leech_data
  FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON leech_data
  FOR INSERT WITH CHECK (true);

-- Step 7: Enable realtime (this might fail if already enabled, that's okay)
-- If it fails with "already exists", you can ignore it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'leech_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE leech_data;
  END IF;
END $$;

-- Step 8: Verify everything is set up correctly
SELECT 
  'Table exists' as status,
  COUNT(*) as row_count
FROM leech_data;

SELECT 
  'Policies' as type,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'leech_data';
