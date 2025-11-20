// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "postgres",
  // you can set max, idleTimeoutMillis here if you want
});

// ensure every new client uses schema crm
pool.on("connect", (client) => {
  client.query("SET search_path TO crm").catch((err) => {
    console.error("Error setting search_path to crm:", err.message);
  });
});

export default pool;
