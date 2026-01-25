CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,

  profile_image TEXT,
  oauth BOOLEAN DEFAULT FALSE,
  oauth_provider TEXT,

  biocoins INTEGER DEFAULT 0,
  goals TEXT,

  role TEXT[] NOT NULL DEFAULT ARRAY['customer'],

  market_id UUID REFERENCES market(id) ON DELETE SET NULL,
  stall_number TEXT,

  phone_number TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);
