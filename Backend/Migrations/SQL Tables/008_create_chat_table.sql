CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  context_type TEXT NOT NULL
    CHECK (context_type IN ('ride', 'order', 'vendor', 'support')),

  context_id UUID NULL,

  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (context_type, context_id)
);
