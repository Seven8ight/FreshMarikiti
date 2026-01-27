CREATE TABLE IF NOT EXISTS orders(
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyerid UUID REFERENCES users(id),
    products JSON NOT NULL,
    riderid UUID REFERENCES users(id),
    status TEXT
);