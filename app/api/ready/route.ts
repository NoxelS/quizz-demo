import { getPool } from "@/lib/database";
import { readiness } from "@/lib/probes.mjs";

export function GET() {
  return readiness(() => getPool().query("SELECT 1"));
}
