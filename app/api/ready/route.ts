import { getPool } from "@/lib/database";

export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return Response.json({ status: "ready" });
  } catch {
    return Response.json({ status: "not ready" }, { status: 503 });
  }
}
