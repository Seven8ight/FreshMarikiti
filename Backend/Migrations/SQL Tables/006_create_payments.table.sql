CREATE TABLE IF NOT EXISTS payments(
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    means_of_payment TEXT NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    phone_number TEXT NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    amount INT NOT NULL,
    stripe_payment_intent_id TEXT,
    merchant_request_id TEXT,
    checkout_request_id TEXT,
    status TEXT NOT NULL
);