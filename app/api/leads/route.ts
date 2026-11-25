import {
  evaluateQuiz,
  type QuizAnswers,
  quizOptions,
} from "@/app/quiz/evaluation";
import { getPool } from "@/lib/database";

type Submission = {
  firstName: string;
  email: string;
  answers: QuizAnswers;
  newsletter: boolean;
};

function isOption<const Options extends readonly string[]>(
  options: Options,
  value: unknown,
): value is Options[number] {
  return (
    typeof value === "string" && options.some((option) => option === value)
  );
}

function parseSubmission(input: unknown): Submission | null {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return null;
  const value = input as Record<string, unknown>;
  if (
    typeof value.firstName !== "string" ||
    !value.firstName.trim() ||
    value.firstName.length > 254 ||
    typeof value.email !== "string" ||
    value.email.length > 254
  ) {
    return null;
  }

  const firstName = value.firstName.trim();
  const email = value.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (
    !isOption(quizOptions.goal, value.goal) ||
    !isOption(quizOptions.frequency, value.frequency) ||
    !isOption(quizOptions.weeklyTime, value.weeklyTime) ||
    typeof value.injury !== "boolean" ||
    typeof value.acutePain !== "boolean" ||
    typeof value.newsletter !== "boolean" ||
    value.consent !== true
  ) {
    return null;
  }

  return {
    firstName,
    email,
    answers: {
      goal: value.goal,
      frequency: value.frequency,
      weeklyTime: value.weeklyTime,
      injury: value.injury,
      acutePain: value.acutePain,
    },
    newsletter: value.newsletter,
  };
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Angaben." }, { status: 400 });
  }

  const submission = parseSubmission(input);
  if (!submission)
    return Response.json({ error: "Ungültige Angaben." }, { status: 400 });

  const evaluation = evaluateQuiz(submission.answers);
  try {
    await getPool().query(
      "INSERT INTO leads (vorname, email, ziel, erfahrung, zeit_pro_woche, verletzungen, akute_schmerzen, laeufertyp, newsletter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        submission.firstName,
        submission.email,
        submission.answers.goal,
        submission.answers.frequency,
        submission.answers.weeklyTime,
        submission.answers.injury,
        submission.answers.acutePain,
        evaluation.runnerType,
        submission.newsletter,
      ],
    );
  } catch {
    return Response.json(
      {
        error:
          "Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 503 },
    );
  }

  return Response.json(evaluation, { status: 201 });
}
