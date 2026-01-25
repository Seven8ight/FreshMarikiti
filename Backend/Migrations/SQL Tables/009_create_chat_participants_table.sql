CREATE TABLE chat_participants (
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  role TEXT NOT NULL
    CHECK (role IN ('customer', 'vendor', 'rider', 'support', 'admin')),

  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (chat_id, user_id)
);
