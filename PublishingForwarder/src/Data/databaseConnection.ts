import { config } from "dotenv";
import { Pool } from "pg";

config();

export function connectDB() {
  const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  return client;
}

connectDB()
  .connect()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log(`Error connecting to database: ${err}`));
