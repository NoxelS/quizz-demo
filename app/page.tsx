import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
        Jana Pohl Running
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Welcher Läufertyp bist du?
      </h1>
      <p className="max-w-xl text-lg leading-8 text-slate-700">
        Beantworte ein paar Fragen zu deinen Laufzielen und finde heraus, was
        dich beim Laufen bewegt.
      </p>
      <Link
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        href="/quiz"
      >
        Quiz starten
      </Link>
    </main>
  );
}
