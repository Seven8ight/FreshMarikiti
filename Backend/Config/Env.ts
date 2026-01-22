import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const POSTGRES_USERNAME = process.env.PG_USERNAME,
  POSTGRES_DATABASE = process.env.PG_DATABASE,
  POSTGRES_PASSWORD = process.env.PG_PASSWORD,
  POSTGRES_PORT = process.env.PG_PORT;

export const SERVER_PORT = process.env.SERVER_PORT,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN,
  GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_SIGNUP_REDIRECT_URI = process.env.GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI;
