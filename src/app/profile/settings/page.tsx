// src/app/profile/settings/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsClient } from "./ProfileSettingsClient";

export const metadata = {
  title: "Configurações de Perfil | GymCoach",
};

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      goal: true,
      experienceLevel: true,
      trainingDaysPerWeek: true,
      sessionDuration: true,
      preferredSplit: true,
      limitations: true,
      weightKg: true,
      heightCm: true,
    },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Configurações de Perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Atualize seus objetivos e preferências de treino.
          </p>
        </div>

        <ProfileSettingsClient profile={profile} />
      </div>
    </main>
  );
}
