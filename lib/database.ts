import "server-only";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  if (!pool) pool = new Pool({ connectionString });
  return pool;
}
