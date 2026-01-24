CREATE TABLE IF NOT EXISTS waste_collection(
    id BIGINT NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id) NOT NULL,
    location TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);