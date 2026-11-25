import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { handleCalendly } from "./handler.ts";

const key = "test-key";
const body = JSON.stringify({
  event: "invitee.created",
  created_at: "2026-01-01T00:00:00Z",
  payload: { uri: "https://api.calendly.com/scheduled_events/1/invitees/2" },
});
function request(content = body, valid = true) {
  const timestamp = "1793610720";
  const sig = createHmac("sha256", key)
    .update(`${timestamp}.${valid ? content : "other"}`)
    .digest("hex");
  return new Request("https://example.test/api/calendly", {
    method: "POST",
    body: content,
    headers: { "calendly-webhook-signature": `t=${timestamp},v1=${sig}` },
  });
}
test("stores an authenticated event before acknowledging it", async () => {
  const stored = [];
  const response = await handleCalendly(request(), key, async (event) =>
    stored.push(event),
  );
  assert.equal(response.status, 200);
  assert.equal(stored.length, 1);
  assert.equal(stored[0].event, "invitee.created");
});
test("does not acknowledge a failed database write", async () => {
  assert.equal(
    (
      await handleCalendly(request(), key, async () => {
        throw new Error("offline");
      })
    ).status,
    503,
  );
});
test("rejects altered signatures and invalid payloads without storing them", async () => {
  const store = async () => assert.fail("must not store");
  assert.equal(
    (await handleCalendly(request(body, false), key, store)).status,
    401,
  );
  assert.equal((await handleCalendly(request("{}"), key, store)).status, 400);
});

test("rejects missing and malformed signatures, invalid JSON and missing configuration", async () => {
  const store = async () => assert.fail("must not store");
  assert.equal(
    (
      await handleCalendly(
        new Request("https://example.test", { method: "POST", body: "{}" }),
        key,
        store,
      )
    ).status,
    401,
  );
  assert.equal((await handleCalendly(request("{"), key, store)).status, 400);
  assert.equal((await handleCalendly(request("[]"), key, store)).status, 400);
  assert.equal((await handleCalendly(request(), undefined, store)).status, 503);
});

test("rejects oversized webhook bodies without storing them", async () => {
  const response = await handleCalendly(
    request("x".repeat(65537)),
    key,
    async () => assert.fail("must not store"),
  );
  assert.equal(response.status, 413);
});
