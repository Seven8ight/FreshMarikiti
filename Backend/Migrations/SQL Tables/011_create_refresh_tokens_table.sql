CREATE TABLE IF NOT EXISTS refresh_tokens(
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at DATE NOT NULL
);