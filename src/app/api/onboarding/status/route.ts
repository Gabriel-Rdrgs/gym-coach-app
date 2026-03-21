import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1) Garante que o usuário está autenticado
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2) Busca (se existir) o perfil do usuário
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const completed = !!profile?.onboardingCompleted;

    // 3) Retorna o status + dados mínimos do perfil
    return NextResponse.json(
      {
        completed,
        profile: profile
          ? {
              goal: profile.goal,
              experienceLevel: profile.experienceLevel,
              trainingDaysPerWeek: profile.trainingDaysPerWeek,
              sessionDuration: profile.sessionDuration,
              preferredSplit: profile.preferredSplit,
              limitations: profile.limitations,
              weightKg: profile.weightKg,
              heightCm: profile.heightCm,
              suggestedProgram: profile.suggestedProgram,
              suggestedWeeklySets: profile.suggestedWeeklySets,
              onboardingCompleted: profile.onboardingCompleted,
              onboardingCompletedAt: profile.onboardingCompletedAt,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/onboarding/status] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
