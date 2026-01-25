CREATE TABLE IF NOT EXISTS products(
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    market_name TEXT NOT NULL UNIQUE,
    sellerId UUID NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image TEXT,
    amount INT NOT NULL,
    category TEXT NOT NULL
);