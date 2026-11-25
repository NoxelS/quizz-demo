import assert from "node:assert/strict";
import test from "node:test";
import { evaluateQuiz } from "./evaluation.ts";

const sourceBlocks = [
  "Lockerer Dauerlauf (30 bis 60 Min)",
  "Lauf-Geh-Wechsel",
  "Steigerungsläufe (4 bis 6 mal 80 m)",
  "Intervalle (z. B. 6 mal 400 m)",
  "Bergläufe",
  "Langer Lauf (bis 2 Std)",
  "Kraft für Läufer (20 Min, zu Hause)",
  "Mobilität und Dehnen (15 Min)",
  "Radfahren oder Schwimmen als Ausgleich",
  "Ruhetag",
];

const regularHalfMarathon = {
  goal: "Halbmarathon",
  frequency: "Ich laufe regelmäßig",
  weeklyTime: "2 bis 4 Stunden",
  injury: false,
  acutePain: false,
};

test("regular half-marathon runner receives eligible recommendations in source list", () => {
  const result = evaluateQuiz(regularHalfMarathon);
  assert.equal(result.runnerType, "Ambitionierte");
  assert.ok(result.blocks.includes("Intervalle (z. B. 6 mal 400 m)"));
  assert.ok(result.blocks.includes("Bergläufe"));
  assert.ok(result.blocks.includes("Langer Lauf (bis 2 Std)"));
  assert.deepEqual(result.blocks, result.blocks.filter((block, index) => result.blocks.indexOf(block) === index));
  assert.ok(result.blocks.every((block) => sourceBlocks.includes(block)));
  assert.deepEqual(result, evaluateQuiz(regularHalfMarathon));
});

test("recent injury excludes intense blocks and advises medical consultation", () => {
  const result = evaluateQuiz({ ...regularHalfMarathon, injury: true });
  assert.ok(result.advice.some((advice) => advice.includes("Ärztin") && advice.includes("Arzt")));
  assert.ok(!result.blocks.some((block) => ["Steigerungsläufe (4 bis 6 mal 80 m)", "Intervalle (z. B. 6 mal 400 m)", "Bergläufe"].includes(block)));
});

test("beginner with half-marathon goal gets run-walk but not long run or intervals", () => {
  const result = evaluateQuiz({ ...regularHalfMarathon, frequency: "Ich fange gerade an" });
  assert.equal(result.runnerType, "Zielläufer");
  assert.ok(result.blocks.includes("Lauf-Geh-Wechsel"));
  assert.ok(!result.blocks.includes("Langer Lauf (bis 2 Std)"));
  assert.ok(!result.blocks.includes("Intervalle (z. B. 6 mal 400 m)"));
});

test("fitness goal distinguishes starting and occasional runners", () => {
  assert.equal(evaluateQuiz({ ...regularHalfMarathon, goal: "Fit werden", frequency: "Ich fange gerade an" }).runnerType, "Wiedereinsteiger");
  assert.equal(evaluateQuiz({ ...regularHalfMarathon, goal: "Fit werden", frequency: "Ich laufe ab und zu" }).runnerType, "Genussläufer");
});

test("acute pain excludes all running blocks and gives explicit advice", () => {
  const result = evaluateQuiz({ ...regularHalfMarathon, acutePain: true });
  assert.ok(!result.blocks.some((block) => ["Lockerer Dauerlauf (30 bis 60 Min)", "Lauf-Geh-Wechsel", "Steigerungsläufe (4 bis 6 mal 80 m)", "Intervalle (z. B. 6 mal 400 m)", "Bergläufe", "Langer Lauf (bis 2 Std)"].includes(block)));
  assert.ok(result.advice.some((advice) => advice.includes("Vermeide schmerzhafte Aktivitäten")));
});
