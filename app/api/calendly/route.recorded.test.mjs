import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { handleCalendly } from "./handler.ts";

const fixtureDirectory = new URL(
  "../../../exercise-data/calendly-webhooks/",
  import.meta.url,
);
const handoverPath = new URL(
  "../../../exercise-data/posteingang.md",
  import.meta.url,
);

function signature(body, key, timestamp) {
  const digest = createHmac("sha256", key)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

test("replays the ten recorded deliveries with their original bodies and signatures", async () => {
  const handover = await readFile(handoverPath, "utf8").catch(() => {
    throw new Error(
      "Supply ignored exercise-data/posteingang.md to run recorded Calendly tests.",
    );
  });
  const signingKey = handover.match(
    /Calendly-Webhook, Signaturschlüssel: (\S+)/,
  )?.[1];
  assert.ok(
    signingKey,
    "Calendly signing key is missing from exercise-data/posteingang.md",
  );
  const files = (
    await readdir(fixtureDirectory).catch(() => {
      throw new Error(
        "Supply ignored exercise-data/calendly-webhooks/ to run recorded Calendly tests.",
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
  const recordings = await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(new URL(file, fixtureDirectory), "utf8")),
    ),
  );

  const originalSigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  process.env.CALENDLY_WEBHOOK_SIGNING_KEY = signingKey;
  let acceptedCreated = false;
  let acceptedCanceled = false;
  try {
    for (const delivery of recordings) {
      const recordedSignature = delivery.headers["calendly-webhook-signature"];
      const timestamp = recordedSignature.match(/^t=(\d+),v1=/)?.[1];
      const validSignature =
        timestamp &&
        signature(delivery.body, signingKey, timestamp) === recordedSignature;
      const response = await handleCalendly(
        new Request("http://localhost/api/calendly", {
          method: "POST",
          headers: { "calendly-webhook-signature": recordedSignature },
          body: delivery.body,
        }),
        signingKey,
        async () => {},
      );
      assert.equal(response.status, validSignature ? 200 : 401);
      if (validSignature) {
        if (delivery.body.includes("invitee.created")) acceptedCreated = true;
        if (delivery.body.includes("invitee.canceled")) acceptedCanceled = true;
      }
    }
  } finally {
    if (originalSigningKey === undefined)
      delete process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    else process.env.CALENDLY_WEBHOOK_SIGNING_KEY = originalSigningKey;
  }

  assert.ok(acceptedCreated, "at least one created delivery must authenticate");
  assert.ok(
    acceptedCanceled,
    "at least one canceled delivery must authenticate",
  );
});
