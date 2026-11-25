import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test, { afterEach, beforeEach } from "node:test";
import { POST } from "./route.ts";

const testSigningKey = "local-test-signing-key";
const originalSigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

beforeEach(() => {
  process.env.CALENDLY_WEBHOOK_SIGNING_KEY = testSigningKey;
});

afterEach(() => {
  if (originalSigningKey === undefined)
    delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  else process.env.CALENDLY_WEBHOOK_SIGNING_KEY = originalSigningKey;
});

function request(body, signature) {
  return new Request("http://localhost/api/calendly", {
    method: "POST",
    headers: signature ? { "calendly-webhook-signature": signature } : {},
    body,
  });
}

function signature(body, timestamp = "1793610720") {
  const digest = createHmac("sha256", testSigningKey)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

test("returns 503 for authenticated events until they can be persisted", async () => {
  const body = JSON.stringify({ event: "invitee.created" });
  assert.equal((await POST(request(body, signature(body)))).status, 503);
});

test("rejects a changed body or signature", async () => {
  const body = JSON.stringify({ event: "invitee.created" });
  assert.equal((await POST(request(`${body} `, signature(body)))).status, 401);
  const changedSignature = signature(body).replace(
    /v1=([a-f\d])/,
    (_, first) => `v1=${first === "0" ? "1" : "0"}`,
  );
  assert.equal((await POST(request(body, changedSignature))).status, 401);
});

test("rejects missing and malformed signatures", async () => {
  assert.equal((await POST(request("{}"))).status, 401);
  assert.equal((await POST(request("{}", "t=1,v1=not-hex"))).status, 401);
});

test("reports unavailable signing configuration", async () => {
  delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  assert.equal(
    (await POST(request("{}", `t=1,v1=${"0".repeat(64)}`))).status,
    503,
  );
});

test("rejects authenticated invalid JSON and non-object JSON", async () => {
  assert.equal((await POST(request("{", signature("{")))).status, 400);
  assert.equal((await POST(request("[]", signature("[]")))).status, 400);
});
