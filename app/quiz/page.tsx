"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  type QuizAnswers,
  type QuizEvaluation,
  quizOptions,
} from "./evaluation";

const questions: { legend: string; options: readonly string[] }[] = [
  {
    legend: "Was ist dein Ziel?",
    options: quizOptions.goal,
  },
  {
    legend: "Wie viel läufst du gerade?",
    options: quizOptions.frequency,
  },
  {
    legend: "Wie viel Zeit hast du pro Woche?",
    options: quizOptions.weeklyTime,
  },
];

export default function Quiz() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<QuizEvaluation | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const goal = data.get("question-1");
    const frequency = data.get("question-2");
    const weeklyTime = data.get("question-3");
    const answers: QuizAnswers | null =
      typeof goal === "string" &&
      questions[0].options.includes(goal) &&
      typeof frequency === "string" &&
      questions[1].options.includes(frequency) &&
      typeof weeklyTime === "string" &&
      questions[2].options.includes(weeklyTime) &&
      (data.get("acutePain") === "yes" || data.get("acutePain") === "no")
        ? {
            goal: goal as QuizAnswers["goal"],
            frequency: frequency as QuizAnswers["frequency"],
            weeklyTime: weeklyTime as QuizAnswers["weeklyTime"],
            injury: data.has("injuries"),
            acutePain: data.get("acutePain") === "yes",
          }
        : null;

    if (!answers) {
      setError(
        "Bitte prüfe deine Antworten und wähle auch eine Antwort zu akuten Schmerzen.",
      );
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          email: data.get("email"),
          ...answers,
          newsletter: data.has("newsletter"),
          consent: data.has("consent"),
        }),
      });
      if (response.status !== 201) {
        setError(
          "Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.",
        );
        return;
      }
      setResult((await response.json()) as QuizEvaluation);
    } catch {
      setError(
        "Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function restart() {
    formRef.current?.reset();
    setError("");
    setResult(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        className="rounded-sm text-sm font-semibold text-emerald-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        href="/"
      >
        Zur Startseite
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Welcher Läufertyp bist du?
      </h1>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4 leading-6 text-slate-800">
        Beim Absenden speichern wir deine Kontaktdaten, deine Quizantworten
        einschließlich Angaben zu Verletzungen und akuten Schmerzen sowie deinen
        berechneten Läufertyp. Dafür ist deine ausdrückliche Einwilligung nötig.
      </p>
      {result ? (
        <section aria-live="polite" className="mt-8 space-y-5">
          <h2 className="text-2xl font-bold text-slate-950">
            {result.runnerType}
          </h2>
          <p className="leading-7 text-slate-700">{result.explanation}</p>
          <p className="leading-7 text-slate-700">
            Deine verfügbare Zeit pro Woche: {result.weeklyTime}. Sie dient hier
            als Kontext; daraus wird kein Wochenplan abgeleitet.
          </p>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Passende Trainingsbausteine
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-700">
              {result.blocks.map((block) => (
                <li key={block}>{block}</li>
              ))}
            </ul>
          </div>
          {result.advice.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-amber-300 bg-amber-50 p-4"
            >
              <h3 className="font-semibold text-slate-950">
                Wichtiger Hinweis
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-slate-800">
                {result.advice.map((advice) => (
                  <li key={advice}>{advice}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            className="min-h-12 rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            onClick={restart}
            type="button"
          >
            Quiz neu starten
          </button>
        </section>
      ) : (
        <form
          className="mt-8 space-y-8"
          method="post"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          {questions.map(({ legend, options }, questionIndex) => (
            <fieldset className="space-y-3" key={legend}>
              <legend className="mb-3 text-lg font-semibold text-slate-950">
                {questionIndex + 1}. {legend}
              </legend>
              {options.map((option) => (
                <label
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 text-slate-800 hover:bg-slate-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-800"
                  key={option}
                >
                  <input
                    className="size-5 accent-emerald-800"
                    name={`question-${questionIndex + 1}`}
                    required
                    type="radio"
                    value={option}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-semibold text-slate-950">
              4. Hattest du in den letzten 12 Monaten eine Verletzung oder
              Operation?
            </legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-slate-800">
              <input
                className="size-5 accent-emerald-800"
                name="injuries"
                type="checkbox"
              />
              Ja, ich hatte eine Verletzung oder Operation.
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-semibold text-slate-950">
              5. Hast du aktuell akute Schmerzen? (erforderlich)
            </legend>
            {[
              ["yes", "Ja"],
              ["no", "Nein"],
            ].map(([value, label]) => (
              <label
                className="flex min-h-12 cursor-pointer items-center gap-3 text-slate-800"
                key={value}
              >
                <input
                  className="size-5 accent-emerald-800"
                  name="acutePain"
                  required
                  type="radio"
                  value={value}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-3 text-lg font-semibold text-slate-950">
              Deine Kontaktdaten
            </legend>
            <div>
              <label
                className="block font-medium text-slate-800"
                htmlFor="first-name"
              >
                Vorname
              </label>
              <input
                autoComplete="given-name"
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-400 bg-white px-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                id="first-name"
                name="firstName"
                required
                type="text"
              />
            </div>
            <div>
              <label
                className="block font-medium text-slate-800"
                htmlFor="email"
              >
                E-Mail-Adresse
              </label>
              <input
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-400 bg-white px-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                id="email"
                name="email"
                required
                type="email"
              />
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-semibold text-slate-950">
              Einwilligung zur Speicherung
            </legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-slate-800">
              <input
                className="size-5 accent-emerald-800"
                name="consent"
                required
                type="checkbox"
              />
              Ich willige ein, dass meine Kontaktdaten und Quizantworten
              einschließlich Gesundheitsangaben zur Erstellung meiner Auswertung
              gespeichert werden.
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-lg font-semibold text-slate-950">
              6. Möchtest du Janas Newsletter erhalten?
            </legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-slate-800">
              <input
                className="size-5 accent-emerald-800"
                name="newsletter"
                type="checkbox"
              />
              Ja, ich möchte Janas Newsletter erhalten.
            </label>
          </fieldset>

          {error && (
            <p className="text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            className="min-h-12 w-full rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Wird gespeichert…" : "Quiz abschließen"}
          </button>
        </form>
      )}
    </main>
  );
}
