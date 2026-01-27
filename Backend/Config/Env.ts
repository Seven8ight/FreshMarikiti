import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const SERVER_PORT = process.env.PORT,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN,
  GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_SIGNUP_REDIRECT_URI = process.env.GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_LOGIN_REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI,
  MPESA_CONSUMER_KEY = process.env.MPESA_CKEY,
  MPESA_CONSUMER_SECRET = process.env.MPESA_CSECRET,
  MPESA_PASSKEY = process.env.MPESA_PASSKEY,
  MPESA_SHORTCODE = process.env.MPESA_SHORTCODE,
  MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;
