import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const exerciseName = searchParams.get('name');

    if (!exerciseName) {
      return NextResponse.json(
        { error: 'Nome do exercício é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar exercício
    const exercise = await prisma.exercise.findUnique({
      where: { name: decodeURIComponent(exerciseName) },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      );
    }

    // Buscar TODO o histórico do usuário para este exercício
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        exerciseId: exercise.id,
        workout: { userId },
      },
      include: {
        workout: { select: { date: true } },
        sets: { orderBy: { setNumber: 'asc' } },
      },
      orderBy: { workout: { date: 'asc' } },
    });

    // Montar histórico por sessão
    const history = workoutExercises
      .map((we) => {
        const validSets = we.sets.filter((s) => s.weight > 0 && s.reps > 0);
        if (validSets.length === 0) return null;

        const maxWeight = Math.max(...validSets.map((s) => s.weight));
        const totalVolume = validSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const avgWeight = validSets.reduce((sum, s) => sum + s.weight, 0) / validSets.length;
        const avgReps = Math.round(
          validSets.reduce((sum, s) => sum + s.reps, 0) / validSets.length
        );

        return {
          date: we.workout.date.toISOString().split('T')[0],
          maxWeight,
          avgWeight: parseFloat(avgWeight.toFixed(1)),
          totalVolume: parseFloat(totalVolume.toFixed(1)),
          avgReps,
          sets: validSets.length,
        };
      })
      .filter(Boolean);

    // PR do usuário para este exercício
    const pr = await prisma.personalRecord.findFirst({
      where: { exerciseId: exercise.id, userId },
      orderBy: { weight: 'desc' },
    });

    // Estatísticas gerais
    const totalSessions = history.length;
    const avgWeight =
      totalSessions > 0
        ? history.reduce((sum, h) => sum + h!.maxWeight, 0) / totalSessions
        : 0;

    // Tendência: comparar primeira e última sessão
    const trend =
      history.length >= 2
        ? history[history.length - 1]!.maxWeight - history[0]!.maxWeight
        : null;

    // Dias desde o último treino
    const daysSinceLast =
      history.length > 0
        ? Math.floor(
            (Date.now() -
              new Date(history[history.length - 1]!.date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

    return NextResponse.json({
      exercise: {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        type: exercise.type,
      },
      history,
      pr: pr
        ? { weight: pr.weight, reps: pr.reps, date: pr.date.toISOString() }
        : null,
      stats: {
        totalSessions,
        avgWeight: parseFloat(avgWeight.toFixed(1)),
        trend: trend !== null ? parseFloat(trend.toFixed(1)) : null,
        daysSinceLast,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar evolução do exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar evolução' },
      { status: 500 }
    );
  }
}
