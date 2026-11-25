import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  BodyTooLargeError,
  readLimitedBody,
} from "../../../lib/request-body.mjs";

export type CalendlyEvent = {
  deliveryHash: string;
  event: string;
  createdAt: string;
  inviteeUri: string;
  email: string | null;
};

export async function handleCalendly(
  request: Request,
  signingKey: string | undefined,
  store: (event: CalendlyEvent) => Promise<unknown>,
): Promise<Response> {
  if (!signingKey) return new Response(null, { status: 503 });
  let rawBody: string;
  try {
    rawBody = await readLimitedBody(request, 64 * 1024);
  } catch (error) {
    return new Response(null, {
      status: error instanceof BodyTooLargeError ? 413 : 400,
    });
  }
  const match = request.headers
    .get("calendly-webhook-signature")
    ?.match(/^t=(\d+),v1=([\da-fA-F]{64})$/);
  if (!match) return new Response(null, { status: 401 });
  const expected = createHmac("sha256", signingKey)
    .update(`${match[1]}.${rawBody}`)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(match[2], "hex")))
    return new Response(null, { status: 401 });
  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return new Response(null, { status: 400 });
  const data = value as Record<string, unknown>;
  if (
    (data.event !== "invitee.created" && data.event !== "invitee.canceled") ||
    typeof data.created_at !== "string" ||
    Number.isNaN(Date.parse(data.created_at)) ||
    typeof data.payload !== "object" ||
    data.payload === null ||
    Array.isArray(data.payload)
  )
    return new Response(null, { status: 400 });
  const payload = data.payload as Record<string, unknown>;
  if (
    typeof payload.uri !== "string" ||
    !payload.uri.startsWith("https://api.calendly.com/scheduled_events/") ||
    (payload.email !== undefined && typeof payload.email !== "string")
  )
    return new Response(null, { status: 400 });
  try {
    await store({
      deliveryHash: createHash("sha256").update(rawBody).digest("hex"),
      event: data.event,
      createdAt: data.created_at,
      inviteeUri: payload.uri,
      email: typeof payload.email === "string" ? payload.email : null,
    });
  } catch {
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 200 });
}
