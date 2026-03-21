// src/components/onboarding/OnboardingGate.tsx
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingGate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Rotas públicas / sem sessão: não interferir
  if (!session || !session.user || !session.user.id) {
    return <>{children}</>;
  }

  const userId = session.user.id;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const completed = !!profile?.onboardingCompleted;

  if (completed) {
    return <>{children}</>;
  }

  // Se não completou, renderiza o wizard por cima
  return (
    <>
      {children}
      <OnboardingWizard />
    </>
  );
}
