import { workoutPrograms } from "@/data/templates";

/**
 * Objetivos possíveis do usuário no onboarding.
 */
export type OnboardingGoal =
  | "hypertrophy"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "health";

/**
 * Nível de experiência declarado pelo usuário.
 */
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/**
 * Divisão de treino preferida pelo usuário.
 */
export type PreferredSplit =
  | "auto"         // deixar o app decidir
  | "full_body"
  | "abc"
  | "ppl"
  | "abcd"
  | "abcde"
  | "upper_lower"
  | "strength";

/**
 * Duração típica de cada sessão de treino.
 */
export type SessionDuration =
  | "30min"
  | "45min"
  | "1h"
  | "1h30"
  | "2h_plus";

export interface OnboardingAnswers {
  goal: OnboardingGoal;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number; // 2–6
  sessionDuration: SessionDuration;
  preferredSplit: PreferredSplit;
  limitations: string[]; // ex: ["joelho", "ombro_direito"]
  weightKg?: number;
  heightCm?: number;
}

/**
 * Resultado consolidado da sugestão do app.
 * É isso que vamos gravar no UserProfile.
 */
export interface OnboardingSuggestion {
  suggestedProgramKey: keyof typeof workoutPrograms;
  suggestedProgramName: string;
  suggestedWeeklySets: Record<string, number>;
}

/**
 * Mapeia (objetivo, nível) para uma faixa de séries semanais por grupo muscular.
 * Valores inspirados em volume efetivo (MEV/MAV), ajustados para simplicidade.
 */
function getBaseWeeklySetsPerMuscle(
  goal: OnboardingGoal,
  experience: ExperienceLevel
): number {
  // Valores "médios" por grupo muscular
  if (goal === "hypertrophy") {
    if (experience === "beginner") return 11; // 10–12
    if (experience === "intermediate") return 15; // 14–16
    return 19; // 16–22
  }

  if (goal === "fat_loss") {
    if (experience === "beginner") return 9; // 8–10
    if (experience === "intermediate") return 11; // 10–12
    return 13; // 12–15
  }

  if (goal === "strength") {
    if (experience === "beginner") return 7; // 6–8
    if (experience === "intermediate") return 9; // 8–10
    return 12; // 10–14
  }

  if (goal === "endurance") {
    if (experience === "beginner") return 13; // 12–15
    if (experience === "intermediate") return 17; // 15–20
    return 22; // 20–25
  }

  // health
  if (experience === "beginner") return 9; // 8–10
  if (experience === "intermediate") return 11; // 10–12
  return 13; // 12–15
}

/**
 * Ajusta o volume base de séries semanais considerando:
 * - número de dias disponíveis
 * - duração das sessões
 *
 * Ideia: quem treina pouco tempo e poucos dias não consegue sustentar volumes muito altos.
 */
function adjustSetsForSchedule(
  baseSets: number,
  trainingDaysPerWeek: number,
  sessionDuration: SessionDuration
): number {
  let adjusted = baseSets;

  // Poucos dias → leve redução, muitos dias → leve aumento
  if (trainingDaysPerWeek <= 2) {
    adjusted *= 0.85;
  } else if (trainingDaysPerWeek === 3) {
    adjusted *= 0.95;
  } else if (trainingDaysPerWeek >= 5) {
    adjusted *= 1.1;
  }

  // Sessões curtas → redução, muito longas → aumento
  if (sessionDuration === "30min") {
    adjusted *= 0.85;
  } else if (sessionDuration === "45min") {
    adjusted *= 0.95;
  } else if (sessionDuration === "1h30" || sessionDuration === "2h_plus") {
    adjusted *= 1.05;
  }

  // Clampa para um intervalo razoável
  if (adjusted < 6) adjusted = 6;
  if (adjusted > 24) adjusted = 24;

  return Math.round(adjusted);
}

/**
 * Dado o objetivo, nível e agenda, retorna um mapa simples
 * de séries semanais sugeridas por grupo muscular "macro".
 */
export function suggestWeeklySetsByMuscleGroup(
  answers: OnboardingAnswers
): Record<string, number> {
  const base = getBaseWeeklySetsPerMuscle(
    answers.goal,
    answers.experienceLevel
  );
  const perMuscle = adjustSetsForSchedule(
    base,
    answers.trainingDaysPerWeek,
    answers.sessionDuration
  );

  // Grupos musculares macro usados pelo app
  const groups = [
    "chest",
    "back",
    "quads",
    "hamstrings",
    "glutes",
    "side_delts",
    "rear_delts",
    "biceps",
    "triceps",
    "calves",
    "core",
  ];

  const result: Record<string, number> = {};
  for (const g of groups) {
    result[g] = perMuscle;
  }

  // Pequeno ajuste: se foco for força, um pouco mais para compostos principais
  if (answers.goal === "strength") {
    const bump = Math.round(perMuscle * 0.15);
    result["chest"] += bump;
    result["back"] += bump;
    result["quads"] += bump;
    result["posterior"] = (result["posterior"] ?? perMuscle) + bump;
  }

  return result;
}

/**
 * Escolhe o programa ideal dentre os disponíveis,
 * combinando objetivo, nível e dias de treino.
 */
export function suggestProgramKey(
  answers: OnboardingAnswers
): keyof typeof workoutPrograms {
  const days = answers.trainingDaysPerWeek;
  const goal = answers.goal;
  const split = answers.preferredSplit;

  // 1. Se o usuário escolheu um split explícito (não "auto"), respeitamos
  if (split !== "auto") {
    switch (split) {
      case "full_body":
        return "Full Body";
      case "abc":
        return "ABC";
      case "ppl":
        // Escolhe PPL padrão ou especializado por objetivo
        if (goal === "hypertrophy") return "PPL Hipertrofia";
        if (goal === "strength") return "PPL Força";
        return "PPL";
      case "abcd":
        return "ABCD";
      case "abcde":
        // Não temos ABCDE ainda, escolhemos ABCD como o mais próximo
        return "ABCD";
      case "upper_lower":
        return "Upper/Lower";
      case "strength":
        return "Força";
      default:
        return "Full Body";
    }
  }

  // 2. Split "auto": o app decide com base em dias + objetivo
  if (days <= 2) {
    return "Full Body";
  }

  if (days === 3) {
    if (goal === "strength") return "Força";
    if (goal === "health" || goal === "endurance") return "Full Body";
    return "ABC";
  }

  if (days === 4) {
    if (goal === "strength") return "Força";
    if (goal === "hypertrophy") return "Upper/Lower";
    return "ABCD";
  }

  // 5–6 dias
  if (goal === "hypertrophy") return "PPL Hipertrofia";
  if (goal === "strength") return "PPL Força";
  return "PPL";
}

/**
 * Monta o objeto completo de sugestão, combinando o programa e o volume.
 */
export function buildOnboardingSuggestion(
  answers: OnboardingAnswers
): OnboardingSuggestion {
  const programKey = suggestProgramKey(answers);
  const programDef = workoutPrograms[programKey];

  const weeklySets = suggestWeeklySetsByMuscleGroup(answers);

  return {
    suggestedProgramKey: programKey,
    suggestedProgramName: programDef.name,
    suggestedWeeklySets: weeklySets,
  };
}
