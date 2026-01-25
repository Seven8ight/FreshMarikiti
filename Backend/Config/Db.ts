import pg from "pg";

export const pgClient = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV == "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export const connectToDatabase = async () => await pgClient.connect();
