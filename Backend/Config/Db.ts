import pg from "pg";

export const pgClient = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://muchiri:Davidwan1*@localhost:5432/marikiti",
  ssl:
    process.env.NODE_ENV == "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export const connectToDatabase = async () => await pgClient.connect();
