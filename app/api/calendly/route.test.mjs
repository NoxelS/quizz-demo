import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test, { afterEach, beforeEach } from "node:test";
import { POST } from "./route.ts";

const fixtureDirectory = new URL(
  "../../../exercise-data/calendly-webhooks/",
  import.meta.url,
);
const handoverPath = new URL(
  "../../../exercise-data/posteingang.md",
  import.meta.url,
);
const originalSigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
let signingKey;
let recordings;

beforeEach(async () => {
  const handover = await readFile(handoverPath, "utf8").catch(() => {
    throw new Error(
      "Supply ignored exercise-data/posteingang.md to run Calendly webhook tests.",
    );
  });
  signingKey = handover.match(
    /Calendly-Webhook, Signaturschlüssel: (\S+)/,
  )?.[1];
  assert.ok(
    signingKey,
    "Calendly signing key is missing from exercise-data/posteingang.md",
  );
  const files = (
    await readdir(fixtureDirectory).catch(() => {
      throw new Error(
        "Supply ignored exercise-data/calendly-webhooks/ to run Calendly webhook tests.",
      );
    })
  )
    .filter((file) => /^\d{2}-.*\.json$/.test(file))
    .sort();
  assert.equal(
    files.length,
    10,
    "Supply all ten recorded Calendly webhook fixtures in exercise-data/calendly-webhooks/",
  );
  recordings = await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(new URL(file, fixtureDirectory), "utf8")),
    ),
  );
  process.env.CALENDLY_WEBHOOK_SIGNING_KEY = signingKey;
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
  const digest = createHmac("sha256", signingKey)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

test("authenticates valid recordings and rejects recordings with mismatched signatures", async () => {
  let acceptedCreated = false;
  let acceptedCanceled = false;
  for (const delivery of recordings) {
    const recordedSignature = delivery.headers["calendly-webhook-signature"];
    const timestamp = recordedSignature.match(/^t=(\d+),v1=/)?.[1];
    const validSignature =
      timestamp && signature(delivery.body, timestamp) === recordedSignature;
    const status = (await POST(request(delivery.body, recordedSignature)))
      .status;
    assert.equal(status, validSignature ? 503 : 401);
    if (validSignature) {
      if (delivery.body.includes("invitee.created")) acceptedCreated = true;
      if (delivery.body.includes("invitee.canceled")) acceptedCanceled = true;
    }
  }
  assert.ok(acceptedCreated, "at least one created delivery must authenticate");
  assert.ok(
    acceptedCanceled,
    "at least one canceled delivery must authenticate",
  );
});

test("rejects a changed body or signature", async () => {
  const delivery = recordings[0];
  assert.equal(
    (
      await POST(
        request(
          `${delivery.body} `,
          delivery.headers["calendly-webhook-signature"],
        ),
      )
    ).status,
    401,
  );
  const changedSignature = signature(delivery.body).replace(
    /v1=([a-f\d])/,
    (_, first) => `v1=${first === "0" ? "1" : "0"}`,
  );
  assert.equal(
    (await POST(request(delivery.body, changedSignature))).status,
    401,
  );
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
