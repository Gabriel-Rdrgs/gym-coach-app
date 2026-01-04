import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { workoutTemplates } from '@/data/templates';

/**
 * GET /api/programs/today
 * Retorna o treino agendado para hoje baseado no programa ativo
 */
export async function GET() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Buscar programa ativo
    const activeProgram = await prisma.workoutProgram.findFirst({
      where: {
        isActive: true,
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
      include: {
        scheduledWorkouts: {
          where: {
            dayOfWeek: dayOfWeek,
            weekNumber: 1, // Por enquanto, apenas semana 1
          },
          include: {
            exerciseSubstitutions: {
              include: {
                originalExercise: true,
                substitutedExercise: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        exercisePreferences: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeProgram || activeProgram.scheduledWorkouts.length === 0) {
      return NextResponse.json({
        hasWorkout: false,
        message: 'Nenhum treino agendado para hoje',
      });
    }

    // Criar mapa de preferências (exercícios favoritos e evitados)
    const favoriteExercises = new Set(
      activeProgram.exercisePreferences
        .filter((p) => p.preference === 'favorite')
        .map((p) => p.exercise.name)
    );
    const avoidedExercises = new Set(
      activeProgram.exercisePreferences
        .filter((p) => p.preference === 'avoid')
        .map((p) => p.exercise.name)
    );

    // Criar mapa de substituições por treino
    const substitutionsMap = new Map<number, Map<string, number>>();
    activeProgram.scheduledWorkouts.forEach((scheduled) => {
      const subMap = new Map<string, number>();
      scheduled.exerciseSubstitutions.forEach((sub) => {
        subMap.set(sub.originalExercise.name, sub.substitutedExercise.id);
      });
      substitutionsMap.set(scheduled.id, subMap);
    });

    // Buscar exercícios do template para cada treino agendado
    const workoutsWithExercises = await Promise.all(
      activeProgram.scheduledWorkouts.map(async (scheduled) => {
        // Buscar exercícios do template
        const templateName = scheduled.template as keyof typeof workoutTemplates;
        const templateExercises = workoutTemplates[templateName] || [];

        // Buscar exercícios no banco e aplicar substituições/preferências
        const exercises = await Promise.all(
          templateExercises.map(async (templateEx) => {
            const substitutions = substitutionsMap.get(scheduled.id);
            const substitutedId = substitutions?.get(templateEx.name);

            // Se houver substituição, usar o exercício substituído
            if (substitutedId) {
              const exercise = await prisma.exercise.findUnique({
                where: { id: substitutedId },
              });
              if (exercise) {
                return {
                  ...exercise,
                  isSubstituted: true,
                  originalName: templateEx.name,
                };
              }
            }

            // Se o exercício está na lista de evitados, buscar alternativa
            if (avoidedExercises.has(templateEx.name)) {
              // Buscar exercício alternativo do mesmo grupo muscular
              const avoidedNames = Array.from(avoidedExercises);
              const alternative = await prisma.exercise.findFirst({
                where: {
                  muscleGroup: templateEx.muscleGroup,
                  name: { 
                    not: templateEx.name,
                    notIn: avoidedNames,
                  },
                },
              });
              if (alternative) {
                return {
                  ...alternative,
                  isSubstituted: true,
                  originalName: templateEx.name,
                  substitutionReason: 'Exercício evitado pelo usuário',
                };
              }
            }

            // Buscar exercício original
            const exercise = await prisma.exercise.findUnique({
              where: { name: templateEx.name } as any,
            });

            return {
              ...exercise,
              isSubstituted: false,
              isFavorite: exercise ? favoriteExercises.has(exercise.name) : false,
            };
          })
        );

        return {
          id: scheduled.id,
          template: scheduled.template,
          order: scheduled.order,
          isCompleted: scheduled.isCompleted,
          exercises: exercises.filter((ex) => ex !== null),
        };
      })
    );

    return NextResponse.json({
      hasWorkout: true,
      program: {
        id: activeProgram.id,
        name: activeProgram.name,
      },
      workouts: workoutsWithExercises,
      message: workoutsWithExercises.length === 1
        ? `Treino de hoje: ${workoutsWithExercises[0].template}`
        : `${workoutsWithExercises.length} treinos agendados para hoje`,
    });
  } catch (error: any) {
    console.error('Erro ao buscar treino do dia:', error);
    return NextResponse.json(
      {
        hasWorkout: false,
        error: error.message || 'Erro ao buscar treino do dia',
      },
      { status: 500 }
    );
  }
}

