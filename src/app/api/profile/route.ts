// src/app/api/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// GET /api/profile
// Retorna os dados de perfil do usuário logado
// ─────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
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
      suggestedProgram: true,
      suggestedWeeklySets: true,
      onboardingCompleted: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

// ─────────────────────────────────────────────
// PATCH /api/profile
// Atualiza parcialmente os dados de perfil
// ─────────────────────────────────────────────
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();

  // Campos permitidos — só esses podem ser atualizados por essa rota
  const {
    goal,
    experienceLevel,
    trainingDaysPerWeek,
    sessionDuration,
    preferredSplit,
    limitations,
    weightKg,
    heightCm,
    onboardingBannerDismissed,
  } = body;


  // Validações básicas
  if (trainingDaysPerWeek !== undefined) {
    if (
      typeof trainingDaysPerWeek !== "number" ||
      trainingDaysPerWeek < 1 ||
      trainingDaysPerWeek > 7
    ) {
      return NextResponse.json(
        { error: "trainingDaysPerWeek deve ser um número entre 1 e 7" },
        { status: 400 }
      );
    }
  }

  if (weightKg !== undefined && (typeof weightKg !== "number" || weightKg <= 0)) {
    return NextResponse.json(
      { error: "weightKg deve ser um número positivo" },
      { status: 400 }
    );
  }

  if (heightCm !== undefined && (typeof heightCm !== "number" || heightCm <= 0)) {
    return NextResponse.json(
      { error: "heightCm deve ser um número positivo" },
      { status: 400 }
    );
  }

  // Monta o objeto de atualização só com os campos que vieram no body
  // Campos undefined são ignorados pelo Prisma automaticamente
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: {
      ...(goal !== undefined && { goal }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(trainingDaysPerWeek !== undefined && { trainingDaysPerWeek }),
      ...(sessionDuration !== undefined && { sessionDuration }),
      ...(preferredSplit !== undefined && { preferredSplit }),
      ...(limitations !== undefined && { limitations }),
      ...(weightKg !== undefined && { weightKg }),
      ...(heightCm !== undefined && { heightCm }),
      ...(onboardingBannerDismissed !== undefined && { onboardingBannerDismissed }),
    },
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

  return NextResponse.json({ profile: updatedProfile });
}
