CREATE TABLE IF NOT EXISTS reverse_funds(
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);