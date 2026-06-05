CREATE TABLE IF NOT EXISTS waste_collection(
    id SERIAL NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    location TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    conversion INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);