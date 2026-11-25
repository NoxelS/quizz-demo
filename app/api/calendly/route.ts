import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) return new Response(null, { status: 503 });

  const match = request.headers
    .get("calendly-webhook-signature")
    ?.match(/^t=(\d+),v1=([\da-fA-F]{64})$/);
  if (!match) return new Response(null, { status: 401 });

  const expected = createHmac("sha256", signingKey)
    .update(`${match[1]}.${rawBody}`)
    .digest();
  const supplied = Buffer.from(match[2], "hex");
  if (!timingSafeEqual(expected, supplied))
    return new Response(null, { status: 401 });

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 503 });
}
