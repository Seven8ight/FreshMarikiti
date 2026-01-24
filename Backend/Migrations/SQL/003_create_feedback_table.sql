CREATE TABLE IF NOT EXISTS feedback(
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    productid TEXT NOT NULL REFERENCES feedback(id)
    rating INT CHECK(rating <= 5) NOT NULL DEFAULT 0
);