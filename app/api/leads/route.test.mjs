import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import test from "node:test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL;
const email = `lead-test-${randomUUID()}@example.test`;
const submission = {
  firstName: "Testläufer",
  email,
  goal: "Halbmarathon",
  frequency: "Ich laufe regelmäßig",
  weeklyTime: "2 bis 4 Stunden",
  injury: true,
  acutePain: false,
  newsletter: false,
  consent: true,
};

function rowsForEmail() {
  const result = execFileSync(
    "psql",
    [databaseUrl, "-X", "-qAt", "-v", `email=${email}`],
    {
      encoding: "utf8",
      input: "SELECT COALESCE(json_agg(row_to_json(leads)), '[]'::json) FROM (SELECT vorname, nachname, email, ziel, erfahrung, zeit_pro_woche, verletzungen, akute_schmerzen, laeufertyp, newsletter, utm_source, utm_campaign, utm_content FROM leads WHERE email = :'email') AS leads;\n",
    },
  );
  return JSON.parse(result);
}

test("lead API stores validated submissions and rejects invalid requests", async () => {
  assert.ok(databaseUrl, "DATABASE_URL must be set for the integration test");
  try {
    const response = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(submission),
    });
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.runnerType, "Ambitionierte");

    const rows = rowsForEmail();
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0], {
      vorname: "Testläufer",
      nachname: null,
      email,
      ziel: "Halbmarathon",
      erfahrung: "Ich laufe regelmäßig",
      zeit_pro_woche: "2 bis 4 Stunden",
      verletzungen: true,
      akute_schmerzen: false,
      laeufertyp: "Ambitionierte",
      newsletter: false,
      utm_source: null,
      utm_campaign: null,
      utm_content: null,
    });

    for (const body of [
      { ...submission, consent: false },
      { ...submission, goal: "not an option" },
    ]) {
      const invalid = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      assert.equal(invalid.status, 400);
      assert.equal(rowsForEmail().length, 1);
    }

    const malformed = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    assert.equal(malformed.status, 400);
    assert.equal(rowsForEmail().length, 1);
  } finally {
    execFileSync(
      "psql",
      [databaseUrl, "-X", "-q", "-v", `email=${email}`],
      {
        input: "DELETE FROM leads WHERE email = :'email';\n",
        stdio: ["pipe", "ignore", "ignore"],
      },
    );
  }
});

