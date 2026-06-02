CREATE TABLE IF NOT EXISTS payments(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    means_of_payment TEXT NOT NULL,
    order_id UUID  REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    phone_number TEXT NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    amount INT NOT NULL,
    transaction_reference TEXT NOT NULL,
    status TEXT NOT NULL
);