// src/components/onboarding/types.ts

export type OnboardingGoal =
  | "hypertrophy"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "health";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type PreferredSplit =
  | "auto"
  | "full_body"
  | "abc"
  | "ppl"
  | "abcd"
  | "abcde"
  | "upper_lower"
  | "strength";

export type SessionDuration =
  | "30min"
  | "45min"
  | "1h"
  | "1h30"
  | "2h_plus";

export interface OnboardingFormState {
  goal: OnboardingGoal | null;
  experienceLevel: ExperienceLevel | null;
  trainingDaysPerWeek: number | null;
  sessionDuration: SessionDuration | null;
  preferredSplit: PreferredSplit | null;
  limitations: string[]; // vamos guardar como array
  weightKg: number | null;
  heightCm: number | null;
}
