import assert from "node:assert/strict";
import test from "node:test";
import { readLimitedBody } from "./request-body.mjs";

function request(body, headers = {}) {
  return new Request("https://example.test", { method: "POST", body, headers });
}

test("reads a body at the byte limit", async () => {
  assert.equal(await readLimitedBody(request("éé"), 4), "éé");
});

test("rejects bodies over the byte limit even without a content length", async () => {
  await assert.rejects(readLimitedBody(request("ééé"), 4), {
    name: "BodyTooLargeError",
  });
});

test("rejects an oversized declared content length before reading", async () => {
  const req = {
    headers: new Headers({ "content-length": "100" }),
    get body() {
      throw new Error("body was read");
    },
  };
  await assert.rejects(readLimitedBody(req, 4), { name: "BodyTooLargeError" });
});
