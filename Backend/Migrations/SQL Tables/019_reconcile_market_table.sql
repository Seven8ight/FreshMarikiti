-- The live DB has a `markets` (plural) table from an older migration 001,
-- while the code and newer migrations use `market` (singular). Rename it so
-- both databases converge on `market`. A table rename keeps existing foreign
-- keys valid (they reference the table by identity, not name).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'markets')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_schema = 'public' AND table_name = 'market') THEN
    ALTER TABLE markets RENAME TO market;
  END IF;
END $$;

-- If neither table exists yet, create it (matches migration 001).
CREATE TABLE IF NOT EXISTS market(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  vendors INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
