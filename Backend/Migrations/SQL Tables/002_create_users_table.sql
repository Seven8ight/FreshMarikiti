CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  -- Minor fix: It's usually better to use a true BOOLEAN here instead of TEXT 'true'
  on_shift BOOLEAN DEFAULT TRUE, 
  profile_image TEXT,
  oauth BOOLEAN DEFAULT FALSE,
  oauth_provider TEXT,

  -- --- NEW REWARDS & STATS FIELDS (Replaces biocoins) ---
  available_chillings DECIMAL(10,2) DEFAULT 0.00,
  pending_chillings DECIMAL(10,2) DEFAULT 0.00,
  total_chillings_earned DECIMAL(10,2) DEFAULT 0.00,
  
  total_waste_submitted DECIMAL(10,2) DEFAULT 0.00,
  total_waste_processed DECIMAL(10,2) DEFAULT 0.00,
  
  co2_saved DECIMAL(10,2) DEFAULT 0.00,
  trees_equivalent INTEGER DEFAULT 0,
  -- ------------------------------------------------------

  goals TEXT,

  role TEXT[] NOT NULL DEFAULT ARRAY['customer'],

  market_id UUID REFERENCES market(id) ON DELETE SET NULL,
  stall_number TEXT,

  phone_number TEXT UNIQUE,

  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);