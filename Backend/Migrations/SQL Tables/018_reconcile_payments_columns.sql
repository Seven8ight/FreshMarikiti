-- Reconcile the payments table with what the code actually writes.
-- The live DB was built by an older migration 006 that lacked some columns
-- (e.g. user_id), so we cannot assume they exist. ADD COLUMN IF NOT EXISTS is
-- a no-op where the column is already present, making this safe on any schema.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS means_of_payment TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS merchant_request_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_request_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- These are filled in later (or absent for wallet top-ups), so they must be
-- nullable. DROP NOT NULL is a no-op if the column is already nullable.
ALTER TABLE payments ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN transaction_reference DROP NOT NULL;
