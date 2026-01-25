CREATE TABLE IF NOT EXISTS waste_collection(
    id SERIAL NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id) NOT NULL,
    location TEXT NOT NULL,
    weight DECIMAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);