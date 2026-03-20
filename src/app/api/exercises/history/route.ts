import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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

    const decodedName = decodeURIComponent(exerciseName);

    const exercise = await prisma.exercise.findUnique({
      where: { name: decodedName },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      );
    }

    // Buscar histórico apenas dos treinos do usuário logado
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        exerciseId: exercise.id,
        workout: { userId }, // <- filtro por usuário
      },
      include: {
        workout: true,
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: { id: 'desc' },
      take: 5,
    });

    type WorkoutExerciseWithRelations = Prisma.WorkoutExerciseGetPayload<{
      include: { workout: true; sets: true };
    }>;

    const workoutExercisesSorted: WorkoutExerciseWithRelations[] = [...workoutExercises].sort(
      (a, b) => b.workout.date.getTime() - a.workout.date.getTime()
    );

    // Buscar PR apenas do usuário logado
    const pr = await prisma.personalRecord.findFirst({
      where: { exerciseId: exercise.id, userId }, // <- filtro por usuário
      orderBy: { weight: 'desc' },
    });

    let lastSet = null;
    if (workoutExercisesSorted.length > 0) {
      const lastWorkoutExercise = workoutExercisesSorted[0];
      if (lastWorkoutExercise.sets.length > 0) {
        const sets = lastWorkoutExercise.sets;
        lastSet = sets[sets.length - 1];
      }
    }

    let averageWeight = null;
    let averageReps = null;
    let averageRir = null;
    if (workoutExercisesSorted.length > 0 && workoutExercisesSorted[0].sets.length > 0) {
      const lastWorkoutSets = workoutExercisesSorted[0].sets;
      const validSets = lastWorkoutSets.filter(s => s.weight > 0 && s.reps > 0);
      if (validSets.length > 0) {
        averageWeight = validSets.reduce((sum, s) => sum + s.weight, 0) / validSets.length;
        averageReps = Math.round(validSets.reduce((sum, s) => sum + s.reps, 0) / validSets.length);
        const setsWithRir = validSets.filter(s => s.rir !== null && s.rir !== undefined);
        if (setsWithRir.length > 0) {
          averageRir = setsWithRir.reduce((sum, s) => sum + (s.rir || 0), 0) / setsWithRir.length;
        }
      }
    }

    let trendData = null;
    if (workoutExercisesSorted.length >= 2) {
      const recentWorkouts = workoutExercisesSorted.slice(0, Math.min(5, workoutExercisesSorted.length));
      const workoutAverages = recentWorkouts.map(we => {
        const validSets = we.sets.filter(s => s.weight > 0 && s.reps > 0);
        if (validSets.length === 0) return null;
        return {
          weight: validSets.reduce((sum, s) => sum + s.weight, 0) / validSets.length,
          reps: validSets.reduce((sum, s) => sum + s.reps, 0) / validSets.length,
          date: we.workout.date,
        };
      }).filter(w => w !== null);

      if (workoutAverages.length >= 2) {
        const first = workoutAverages[workoutAverages.length - 1];
        const last = workoutAverages[0];
        const weightChange = last.weight - first.weight;
        const repsChange = last.reps - first.reps;
        const daysBetween = Math.floor(
          (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        trendData = {
          weightChange,
          repsChange,
          daysBetween,
          workoutsCount: workoutAverages.length,
          isImproving: weightChange > 0 || (weightChange === 0 && repsChange > 0),
        };
      }
    }

    const daysSinceLastWorkout = workoutExercisesSorted.length > 0
      ? Math.floor(
          (Date.now() - workoutExercisesSorted[0].workout.date.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return NextResponse.json({
      exercise: {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        type: exercise.type,
      },
      lastSet: lastSet
        ? {
            weight: lastSet.weight,
            reps: lastSet.reps,
            rir: lastSet.rir,
            date: workoutExercisesSorted[0].workout.date,
          }
        : null,
      averageSet: averageWeight
        ? { weight: averageWeight, reps: averageReps, rir: averageRir }
        : null,
      trendData,
      daysSinceLastWorkout,
      pr: pr
        ? { weight: pr.weight, reps: pr.reps, date: pr.date }
        : null,
      recentWorkouts: workoutExercisesSorted.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico do exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
