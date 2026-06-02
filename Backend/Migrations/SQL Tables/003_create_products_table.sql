CREATE TABLE IF NOT EXISTS products(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    market_id UUID REFERENCES market(id) ON DELETE CASCADE NOT NULL,
    sellerId UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image TEXT,
    amount INT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL
);