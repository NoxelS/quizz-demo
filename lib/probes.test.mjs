import assert from "node:assert/strict";
import test from "node:test";
import { health, readiness } from "./probes.mjs";

test("health reports success without checking dependencies", async () => {
  const response = health();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("readiness reports success when its dependency check succeeds", async () => {
  const response = await readiness(async () => {});

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ready" });
});

test("readiness reports unavailable when its dependency check fails", async () => {
  const response = await readiness(async () => {
    throw new Error("database unavailable");
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "not ready" });
});
