import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildOnboardingSuggestion,
  type OnboardingAnswers,
} from "@/lib/onboarding-utils";

function validateOnboardingBody(body: unknown): body is OnboardingAnswers {
  if (!body || typeof body !== "object") return false;

  const b = body as Record<string, unknown>;

  const goals = ["hypertrophy", "fat_loss", "strength", "endurance", "health"];
  const levels = ["beginner", "intermediate", "advanced"];
  const durations = ["30min", "45min", "1h", "1h30", "2h_plus"];
  const splits = [
    "auto",
    "full_body",
    "abc",
    "ppl",
    "abcd",
    "abcde",
    "upper_lower",
    "strength",
  ];

  if (!goals.includes(b.goal as string)) return false;
  if (!levels.includes(b.experienceLevel as string)) return false;
  if (typeof b.trainingDaysPerWeek !== "number") return false;
  if ((b.trainingDaysPerWeek as number) < 2 || (b.trainingDaysPerWeek as number) > 6) return false;
  if (!durations.includes(b.sessionDuration as string)) return false;
  if (!splits.includes(b.preferredSplit as string)) return false;
  if (!Array.isArray(b.limitations)) return false;
  if (!b.limitations.every((item: unknown) => typeof item === "string")) return false;
  if (b.weightKg !== undefined && typeof b.weightKg !== "number") return false;
  if (b.heightCm !== undefined && typeof b.heightCm !== "number") return false;

  return true;
}

export async function POST(req: Request) {
  try {
    // 1) Verifica autenticação
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2) Lê e valida o corpo da requisição
    const body = await req.json();

    if (!validateOnboardingBody(body)) {
      return NextResponse.json(
        { error: "Dados inválidos. Verifique os campos enviados." },
        { status: 400 }
      );
    }

    const answers: OnboardingAnswers = {
      goal: body.goal,
      experienceLevel: body.experienceLevel,
      trainingDaysPerWeek: body.trainingDaysPerWeek,
      sessionDuration: body.sessionDuration,
      preferredSplit: body.preferredSplit,
      limitations: body.limitations,
      weightKg: body.weightKg,
      heightCm: body.heightCm,
    };

    // 3) Calcula a sugestão com o algoritmo
    const suggestion = buildOnboardingSuggestion(answers);

    const now = new Date();

    // 4) Salva (ou atualiza) o UserProfile no banco
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        goal: answers.goal,
        experienceLevel: answers.experienceLevel,
        trainingDaysPerWeek: answers.trainingDaysPerWeek,
        sessionDuration: answers.sessionDuration,
        preferredSplit: answers.preferredSplit,
        limitations: answers.limitations,
        weightKg: answers.weightKg,
        heightCm: answers.heightCm,
        suggestedProgram: suggestion.suggestedProgramKey,
        suggestedWeeklySets: suggestion.suggestedWeeklySets,
      },
      update: {
        onboardingCompleted: true,
        onboardingCompletedAt: now,
        goal: answers.goal,
        experienceLevel: answers.experienceLevel,
        trainingDaysPerWeek: answers.trainingDaysPerWeek,
        sessionDuration: answers.sessionDuration,
        preferredSplit: answers.preferredSplit,
        limitations: answers.limitations,
        weightKg: answers.weightKg,
        heightCm: answers.heightCm,
        suggestedProgram: suggestion.suggestedProgramKey,
        suggestedWeeklySets: suggestion.suggestedWeeklySets,
      },
    });

    // 5) Retorna o perfil salvo + sugestão
    return NextResponse.json(
      {
        success: true,
        profile: {
          goal: profile.goal,
          experienceLevel: profile.experienceLevel,
          trainingDaysPerWeek: profile.trainingDaysPerWeek,
          sessionDuration: profile.sessionDuration,
          preferredSplit: profile.preferredSplit,
          limitations: profile.limitations,
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          onboardingCompleted: profile.onboardingCompleted,
          onboardingCompletedAt: profile.onboardingCompletedAt,
          suggestedProgram: profile.suggestedProgram,
          suggestedWeeklySets: profile.suggestedWeeklySets,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/onboarding/complete] error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
