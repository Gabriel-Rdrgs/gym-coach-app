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

  return (
    <>
      {children}
      <OnboardingWizard />
    </>
  );
}
