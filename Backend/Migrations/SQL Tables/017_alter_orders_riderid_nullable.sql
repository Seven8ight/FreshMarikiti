-- A rider is not known when an order is first placed; they are assigned later.
-- The original NOT NULL constraint made order creation impossible
-- (INSERT INTO orders(buyerid,products,status) always failed).
ALTER TABLE orders ALTER COLUMN riderid DROP NOT NULL;
