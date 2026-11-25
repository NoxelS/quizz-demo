export type QuizAnswers = {
  goal: "Fit werden" | "Erste 5 km" | "10 km unter einer Stunde" | "Halbmarathon";
  frequency: "Ich fange gerade an" | "Ich laufe ab und zu" | "Ich laufe regelmäßig";
  weeklyTime: "1 bis 2 Stunden" | "2 bis 4 Stunden" | "Mehr als 4 Stunden";
  injury: boolean;
  acutePain: boolean;
};

export type QuizEvaluation = {
  runnerType: "Wiedereinsteiger" | "Zielläufer" | "Genussläufer" | "Ambitionierte";
  explanation: string;
  weeklyTime: QuizAnswers["weeklyTime"];
  blocks: string[];
  advice: string[];
};

export function evaluateQuiz(answers: QuizAnswers): QuizEvaluation {
  const { goal, frequency, injury, acutePain } = answers;
  const beginner = frequency === "Ich fange gerade an";
  const runnerType: QuizEvaluation["runnerType"] =
    frequency === "Ich laufe regelmäßig" && goal === "Halbmarathon"
      ? "Ambitionierte"
      : goal !== "Fit werden"
        ? "Zielläufer"
        : beginner
          ? "Wiedereinsteiger"
          : "Genussläufer";
  const explanation = `${runnerType}: Du möchtest ${goal} und ${frequency === "Ich fange gerade an" ? "fängst gerade an" : frequency === "Ich laufe ab und zu" ? "läufst ab und zu" : "läufst regelmäßig"}.`;
  const blocks: string[] = [];

  if (!acutePain) blocks.push("Lockerer Dauerlauf (30 bis 60 Min)");
  if (!acutePain && (beginner || injury)) blocks.push("Lauf-Geh-Wechsel");
  if (!acutePain && !injury && frequency === "Ich laufe regelmäßig") blocks.push("Steigerungsläufe (4 bis 6 mal 80 m)");
  if (!acutePain && !injury && frequency === "Ich laufe regelmäßig" && (goal === "10 km unter einer Stunde" || goal === "Halbmarathon")) blocks.push("Intervalle (z. B. 6 mal 400 m)");
  if (!acutePain && !injury && runnerType === "Ambitionierte") blocks.push("Bergläufe");
  if (!acutePain && goal === "Halbmarathon" && !beginner) blocks.push("Langer Lauf (bis 2 Std)");
  blocks.push("Kraft für Läufer (20 Min, zu Hause)", "Mobilität und Dehnen (15 Min)", "Radfahren oder Schwimmen als Ausgleich", "Ruhetag");

  const advice: string[] = [];
  if (injury) advice.push("Stimme das Training nach einer Verletzung oder Operation in den letzten 12 Monaten mit einer Ärztin oder einem Arzt ab.");
  if (acutePain) advice.push("Vermeide schmerzhafte Aktivitäten und lass die akuten Schmerzen ärztlich abklären.");
  return { runnerType, explanation, weeklyTime: answers.weeklyTime, blocks, advice };
}
