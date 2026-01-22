import pg from "pg";
import {
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
} from "./Env.js";

export const pgClient = new pg.Client({
  user: POSTGRES_USERNAME,
  port: Number.parseInt(POSTGRES_PORT!),
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
});

export const connectToDatabase = async () => await pgClient.connect();
