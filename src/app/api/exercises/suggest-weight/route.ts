import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseName = searchParams.get('exerciseName');

    if (!exerciseName) {
      return NextResponse.json(
        { error: 'exerciseName é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o exercício
    const exercise = await prisma.exercise.findUnique({
      where: { name: exerciseName } as any,
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      );
    }

    // Buscar histórico de treinos com este exercício
    // Primeiro buscar os workouts ordenados por data
    const recentWorkouts = await prisma.workout.findMany({
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        exercises: {
          where: {
            exerciseId: exercise.id,
          },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });

    // Filtrar apenas os workoutExercises que têm o exercício
    const workoutExercises = recentWorkouts
      .flatMap((w) => w.exercises)
      .filter((ex) => ex.exerciseId === exercise.id);

    if (workoutExercises.length === 0) {
      return NextResponse.json({
        suggestedWeight: null,
        suggestedReps: null,
        message: 'Nenhum histórico encontrado para este exercício',
      });
    }

    // Calcular média dos últimos treinos para referência
    const allSets = workoutExercises.flatMap((we) => we.sets);
    const validSets = allSets.filter((s) => s.weight > 0 && s.reps > 0);

    if (validSets.length === 0) {
      return NextResponse.json({
        suggestedWeight: null,
        suggestedReps: null,
        message: 'Nenhum dado válido encontrado',
      });
    }

    // Pegar o último treino (mais recente) deste exercício
    const lastWorkoutExercise = workoutExercises[0]; // Já ordenado por data desc
    const lastWorkoutSets = lastWorkoutExercise.sets.filter((s) => s.weight > 0 && s.reps > 0);
    
    if (lastWorkoutSets.length === 0) {
      return NextResponse.json({
        suggestedWeight: null,
        suggestedReps: null,
        message: 'Nenhum dado válido no último treino',
      });
    }

    // Usar a primeira série válida do último treino como referência (ou média das séries)
    const lastSet = lastWorkoutSets[0];
    const lastWeight = lastSet.weight;
    const lastReps = lastSet.reps;

    // Calcular média para exibição
    const recentSets = validSets.slice(0, 9); // Últimos 9 sets
    const totalWeight = recentSets.reduce((sum, set) => sum + set.weight, 0);
    const totalReps = recentSets.reduce((sum, set) => sum + set.reps, 0);
    const avgWeight = totalWeight / recentSets.length;
    const avgReps = Math.round(totalReps / recentSets.length);

    // Progressão baseada em porcentagem (2.5% de aumento)
    const progressPercentage = 0.025; // 2.5%
    const suggestedWeightRaw = lastWeight * (1 + progressPercentage);
    
    // Arredondar para múltiplos práticos (2.5kg para pesos maiores, 0.5kg para menores)
    let suggestedWeight: number;
    if (lastWeight >= 50) {
      // Para pesos >= 50kg, arredondar para múltiplos de 2.5kg
      suggestedWeight = Math.round(suggestedWeightRaw / 2.5) * 2.5;
    } else if (lastWeight >= 20) {
      // Para pesos entre 20-50kg, arredondar para múltiplos de 1kg
      suggestedWeight = Math.round(suggestedWeightRaw);
    } else {
      // Para pesos < 20kg, arredondar para múltiplos de 0.5kg
      suggestedWeight = Math.round(suggestedWeightRaw * 2) / 2;
    }
    
    // Garantir que a sugestão seja pelo menos um pouco maior que o último
    if (suggestedWeight <= lastWeight) {
      if (lastWeight >= 50) {
        suggestedWeight = lastWeight + 2.5;
      } else if (lastWeight >= 20) {
        suggestedWeight = lastWeight + 1;
      } else {
        suggestedWeight = lastWeight + 0.5;
      }
    }

    const suggestedReps = lastReps; // Manter o mesmo número de reps

    // Buscar PR atual
    const currentPR = await prisma.personalRecord.findFirst({
      where: { exerciseId: exercise.id },
      orderBy: { weight: 'desc' },
    });

    return NextResponse.json({
      suggestedWeight: suggestedWeight > 0 ? suggestedWeight : null,
      suggestedReps: suggestedReps > 0 ? suggestedReps : null,
      lastWeight: lastWeight, // Peso usado como base
      lastReps: lastReps, // Reps usado como base
      averageWeight: avgWeight,
      averageReps: avgReps,
      currentPR: currentPR
        ? {
            weight: currentPR.weight,
            reps: currentPR.reps,
            date: currentPR.date,
          }
        : null,
      historyCount: workoutExercises.length,
    });
  } catch (error) {
    console.error('Erro ao sugerir peso:', error);
    return NextResponse.json(
      { error: 'Erro ao sugerir peso' },
      { status: 500 }
    );
  }
}

