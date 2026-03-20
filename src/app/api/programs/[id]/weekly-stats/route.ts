import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  calculateWeeklyValidSetsByMuscleGroup,
  validateOMSRecommendations,
  getWeekRange,
  getWeekNumber,
} from '@/lib/program-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    const { id } = await params;
    const programId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    if (isNaN(programId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const weekRange = weekStart
      ? getWeekRange(new Date(weekStart))
      : getWeekRange();

    // Buscar treinos da semana APENAS do usuário logado
    const workouts = await prisma.workout.findMany({
      where: {
        userId, // <- filtro por usuário
        date: {
          gte: weekRange.start,
          lte: weekRange.end,
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    const formattedWorkouts = workouts.map((workout) => ({
      date: workout.date,
      exercises: workout.exercises.map((ex) => ({
        exercise: {
          muscleGroup: ex.exercise.muscleGroup,
          name: ex.exercise.name,
          type: ex.exercise.type || 'isolation',
        },
        sets: ex.sets.map((set) => ({
          rir: set.rir,
          weight: set.weight,
          reps: set.reps,
        })),
      })),
    }));

    const validSetsByGroup = calculateWeeklyValidSetsByMuscleGroup(formattedWorkouts);
    const omsStatus = validateOMSRecommendations(validSetsByGroup);
    const weekNumber = getWeekNumber(weekRange.start);

    await prisma.programWeek.upsert({
      where: {
        programId_weekNumber: {
          programId,
          weekNumber: weekNumber > 0 ? weekNumber : 1,
        },
      },
      update: {
        startDate: weekRange.start,
        endDate: weekRange.end,
        validSetsByGroup: validSetsByGroup as any,
        omsStatus: omsStatus as any,
      },
      create: {
        programId,
        weekNumber: weekNumber > 0 ? weekNumber : 1,
        startDate: weekRange.start,
        endDate: weekRange.end,
        validSetsByGroup: validSetsByGroup as any,
        omsStatus: omsStatus as any,
      },
    });

    return NextResponse.json({
      weekRange: {
        start: weekRange.start.toISOString(),
        end: weekRange.end.toISOString(),
      },
      validSetsByGroup,
      omsStatus,
      workoutsCount: workouts.length,
    });
  } catch (error: any) {
    console.error('Erro ao calcular estatísticas semanais:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao calcular estatísticas semanais' },
      { status: 500 }
    );
  }
}
