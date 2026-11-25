"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const questions = [
  {
    legend: "Was ist dein Ziel?",
    options: ["Fit werden", "Erste 5 km", "10 km unter einer Stunde", "Halbmarathon"],
  },
  {
    legend: "Wie viel läufst du gerade?",
    options: ["Ich fange gerade an", "Ich laufe ab und zu", "Ich laufe regelmäßig"],
  },
  {
    legend: "Wie viel Zeit hast du pro Woche?",
    options: ["1 bis 2 Stunden", "2 bis 4 Stunden", "Mehr als 4 Stunden"],
  },
];

export default function Quiz() {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/quiz/fertig");
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
        Dies ist eine Frontend-Demo: Deine Angaben werden nicht gespeichert oder
        versendet und gehen beim Neuladen oder Verlassen der Seite verloren.
      </p>

      <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
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
            <label className="block font-medium text-slate-800" htmlFor="email">
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
            5. Möchtest du Janas Newsletter erhalten?
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

        <button
          className="min-h-12 w-full rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:w-auto"
          type="submit"
        >
          Quiz abschließen
        </button>
      </form>
    </main>
  );
}
