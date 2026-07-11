ALTER TABLE payments ADD COLUMN IF NOT EXISTS merchant_request_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_request_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE payments ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN transaction_reference DROP NOT NULL;
