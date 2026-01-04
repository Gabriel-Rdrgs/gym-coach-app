import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateWeeklyValidSetsByMuscleGroup,
  validateOMSRecommendations,
  getWeekRange,
  getWeekNumber,
} from '@/lib/program-utils';

/**
 * GET /api/programs/[id]/weekly-stats
 * Calcula estatísticas semanais de séries válidas por grupo muscular
 * e valida conforme recomendações OMS (10-20 séries válidas/semana)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    if (isNaN(programId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Determinar período da semana
    const weekRange = weekStart
      ? getWeekRange(new Date(weekStart))
      : getWeekRange();

    // Buscar treinos da semana
    const workouts = await prisma.workout.findMany({
      where: {
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

    // Formatar treinos para cálculo
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

    // Calcular séries válidas por grupo muscular
    const validSetsByGroup = calculateWeeklyValidSetsByMuscleGroup(formattedWorkouts);

    // Validar conforme recomendações OMS
    const omsStatus = validateOMSRecommendations(validSetsByGroup);

    // Buscar ou criar registro da semana no programa
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

