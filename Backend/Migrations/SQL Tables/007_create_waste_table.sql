CREATE TABLE IF NOT EXISTS waste_collection(
    id SERIAL NOT NULL PRIMARY KEY,
    userid UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    conversion INT,
    status TEXT NOT NULL,
    dry_weight DECIMAL(2,16) NOT NULL,
    image TEXT,
    reward_weight DECIMAL(2,16) NOT NULL,
    chillings DECIMAL(2,16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);