import { getPool } from "@/lib/database";
import { handleCalendly } from "./handler";

export function POST(request: Request): Promise<Response> {
  return handleCalendly(
    request,
    process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
    async (event) => {
      await getPool().query(
        "INSERT INTO calendly_events (delivery_hash, event, created_at, invitee_uri, email) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
        [
          event.deliveryHash,
          event.event,
          event.createdAt,
          event.inviteeUri,
          event.email,
        ],
      );
    },
  );
}
