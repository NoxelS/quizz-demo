import { health } from "@/lib/probes.mjs";

export function GET() {
  return health();
}
