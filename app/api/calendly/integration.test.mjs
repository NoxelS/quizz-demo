import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";

const databaseUrl = process.env.DATABASE_URL;
const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

test("webhook stores an event once across duplicate deliveries", async () => {
  assert.ok(databaseUrl);
  assert.ok(key);
  const email = `calendly-${randomUUID()}@example.test`;
  const body = JSON.stringify({
    event: "invitee.created",
    created_at: new Date().toISOString(),
    payload: {
      uri: `https://api.calendly.com/scheduled_events/test/invitees/${randomUUID()}`,
      email,
    },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const digest = createHmac("sha256", key)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const sql = (query) =>
    execFileSync("psql", [databaseUrl, "-X", "-qAt", "-v", `email=${email}`], {
      input: query,
      encoding: "utf8",
    }).trim();
  try {
    for (let i = 0; i < 2; i++) {
      const response = await fetch(`${baseUrl}/api/calendly`, {
        method: "POST",
        headers: {
          "calendly-webhook-signature": `t=${timestamp},v1=${digest}`,
        },
        body,
      });
      assert.equal(response.status, 200);
    }
    assert.equal(
      sql("SELECT count(*) FROM calendly_events WHERE email = :'email';"),
      "1",
    );
  } finally {
    sql("DELETE FROM calendly_events WHERE email = :'email';");
  }
});
