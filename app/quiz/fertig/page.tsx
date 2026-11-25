import Link from "next/link";

export default function QuizFinished() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-5 px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
        Jana Pohl Running
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Danke fürs Mitmachen
      </h1>
      <p className="text-lg leading-8 text-slate-700">
        Deine Antworten wurden nicht gespeichert oder versendet. Die Auswertung
        erscheint direkt nach dem Quizabschluss.
      </p>
      <Link
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        href="/quiz"
      >
        Quiz erneut starten
      </Link>
    </main>
  );
}
