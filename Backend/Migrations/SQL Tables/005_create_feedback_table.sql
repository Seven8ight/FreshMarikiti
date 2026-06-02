CREATE TABLE IF NOT EXISTS feedback(
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    productid UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK(rating <= 5) NOT NULL DEFAULT 0
);