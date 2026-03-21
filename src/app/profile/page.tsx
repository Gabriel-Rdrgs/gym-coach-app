import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  const userId = (session as { user?: { id?: string } })?.user?.id;

  let userProfile = null;
  let activeProgramName: string | null = null;

  if (userId) {
    const raw = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        goal: true,
        experienceLevel: true,
        trainingDaysPerWeek: true,
        preferredSplit: true,
        limitations: true,
        weightKg: true,
        heightCm: true,
        suggestedProgram: true,
        suggestedWeeklySets: true,
        onboardingCompleted: true,
      },
    });

    if (raw) {
      // suggestedWeeklySets é um objeto JSON { back: 12, chest: 10, ... }
      // Somamos todos os valores para obter o total de séries semanais
      let weeklySetGoal: number | null = null;
      if (raw.suggestedWeeklySets && typeof raw.suggestedWeeklySets === "object") {
        const values = Object.values(raw.suggestedWeeklySets as Record<string, number>);
        const total = values.reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
        weeklySetGoal = total > 0 ? total : null;
      }

      userProfile = {
        goal: raw.goal,
        experienceLevel: raw.experienceLevel,
        trainingDaysPerWeek: raw.trainingDaysPerWeek,
        preferredSplit: raw.preferredSplit,
        limitations: raw.limitations,
        weightKg: raw.weightKg,
        heightCm: raw.heightCm,
        suggestedProgram: raw.suggestedProgram,
        weeklySetGoal,
        onboardingCompleted: raw.onboardingCompleted,
      };
    }

    const activeProgram = await prisma.workoutProgram.findFirst({
      where: { userId, isActive: true },
      select: { name: true },
      orderBy: { startDate: "desc" },
    });

    activeProgramName = activeProgram?.name ?? null;
  }

  return (
    <ProfileClient
      userProfile={userProfile}
      activeProgramName={activeProgramName}
    />
  );
}
