CREATE TABLE IF NOT EXISTS reverse_funds(
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);