CREATE TABLE IF NOT EXISTS orders(
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyerId UUID REFERENCES users(id),
    products JSON NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    status TEXT
);