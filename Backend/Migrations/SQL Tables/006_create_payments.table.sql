CREATE TABLE IF NOT EXISTS payments(
    id BIGINT PRIMARY KEY NOT NULL,
    order UUID REFERENCES orders(id),
    executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    total_amount INT NOT NULL
);