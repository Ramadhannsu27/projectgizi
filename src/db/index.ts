import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Parse URL manually — mysql2 doesn't support connectionString directly
function parseMySqlUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname || "localhost",
    port: parseInt(u.port) || 3306,
    user: u.username || "root",
    password: u.password || "",
    database: u.pathname.slice(1) || "projectgizi",
  };
}

const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/projectgizi";
const dbConfig = parseMySqlUrl(dbUrl);

let pool: mysql.Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectTimeout: 30000,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      timezone: "+07:00", // XAMPP MySQL uses UTC+7 (Indonesia WITA/WIB)
      dateStrings: true,  // Return dates as strings instead of JS Date objects
    });
  }
  return drizzle(pool, { schema, mode: "default" });
}
