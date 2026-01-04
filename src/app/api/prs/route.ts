import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');

    const where: any = {};
    if (exerciseId) {
      where.exerciseId = parseInt(exerciseId);
    }

    const prs = await prisma.personalRecord.findMany({
      where,
      include: {
        exercise: true,
      },
      orderBy: { date: 'desc' },
    });

    // Agrupar PRs por exercício para encontrar o melhor PR de cada um
    const prsByExercise: { [key: number]: any } = {};
    prs.forEach((pr) => {
      const key = pr.exerciseId;
      if (!prsByExercise[key] || pr.weight > prsByExercise[key].weight) {
        prsByExercise[key] = pr;
      }
    });

    // Calcular estatísticas
    const totalPRs = prs.length;
    const uniqueExercises = Object.keys(prsByExercise).length;
    const recentPRs = prs.slice(0, 10);

    return NextResponse.json({
      prs,
      recentPRs,
      bestPRs: Object.values(prsByExercise),
      stats: {
        totalPRs,
        uniqueExercises,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar PRs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar PRs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, weight, reps, workoutId } = body;

    if (!exerciseId || !weight || !reps) {
      return NextResponse.json(
        { error: 'exerciseId, weight e reps são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se é um PR
    const existingPRs = await prisma.personalRecord.findMany({
      where: { exerciseId },
      orderBy: { weight: 'desc' },
    });

    const isPR = existingPRs.length === 0 || weight > existingPRs[0].weight;

    if (isPR) {
      const pr = await prisma.personalRecord.create({
        data: {
          exerciseId,
          weight,
          reps,
          workoutId: workoutId || null,
        },
        include: {
          exercise: true,
        },
      });

      return NextResponse.json({ pr, isNewPR: true }, { status: 201 });
    }

    return NextResponse.json({ isNewPR: false }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao criar PR:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar PR' },
      { status: 500 }
    );
  }
}

