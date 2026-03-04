import { prisma } from "@/lib/prisma";
import { workoutTemplates } from "@/data/templates";

export interface TodayWorkoutData {
  hasWorkout: boolean;
  program?: { id: number; name: string };
  workouts?: Array<{
    id: number;
    template: string;
    order: number;
    isCompleted: boolean;
    exercises: Array<{
      id: number;
      name: string;
      muscleGroup: string;
      type: string;
      isSubstituted?: boolean;
      originalName?: string;
      substitutionReason?: string;
      isFavorite?: boolean;
    }>;
  }>;
  message?: string;
  error?: string;
}

/**
 * Busca o treino do dia (programa ativo + treinos agendados para hoje).
 * Usar no servidor (página ou API) para evitar segunda conexão na home.
 * @param userId - ID do usuário logado; se null, retorna sem treino (ou programa sem dono se não houver userId no programa).
 */
export async function getTodayWorkoutData(userId: string | null): Promise<TodayWorkoutData> {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const activeProgram = await prisma.workoutProgram.findFirst({
      where: {
        isActive: true,
        startDate: { lte: today },
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: today } }] },
          userId
            ? { OR: [{ userId: { equals: null } }, { userId: { equals: userId } }] }
            : { userId: { equals: null } },
        ],
      },
      include: {
        scheduledWorkouts: {
          where: { dayOfWeek, weekNumber: 1 },
          include: {
            exerciseSubstitutions: {
              include: {
                originalExercise: true,
                substitutedExercise: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        exercisePreferences: {
          include: { exercise: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeProgram || activeProgram.scheduledWorkouts.length === 0) {
      return {
        hasWorkout: false,
        message: "Nenhum treino agendado para hoje",
      };
    }

    const favoriteExercises = new Set(
      activeProgram.exercisePreferences
        .filter((p) => p.preference === "favorite")
        .map((p) => p.exercise.name)
    );
    const avoidedExercises = new Set(
      activeProgram.exercisePreferences
        .filter((p) => p.preference === "avoid")
        .map((p) => p.exercise.name)
    );

    const substitutionsMap = new Map<number, Map<string, number>>();
    activeProgram.scheduledWorkouts.forEach((scheduled) => {
      const subMap = new Map<string, number>();
      scheduled.exerciseSubstitutions.forEach((sub) => {
        subMap.set(sub.originalExercise.name, sub.substitutedExercise.id);
      });
      substitutionsMap.set(scheduled.id, subMap);
    });

    const workoutsWithExercises = await Promise.all(
      activeProgram.scheduledWorkouts.map(async (scheduled) => {
        const templateName = scheduled.template as keyof typeof workoutTemplates;
        const templateExercises = workoutTemplates[templateName] || [];

        const exercises = await Promise.all(
          templateExercises.map(async (templateEx) => {
            const substitutions = substitutionsMap.get(scheduled.id);
            const substitutedId = substitutions?.get(templateEx.name);

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

            if (avoidedExercises.has(templateEx.name)) {
              const avoidedNames: string[] = Array.from(avoidedExercises);
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
                  substitutionReason: "Exercício evitado pelo usuário",
                };
              }
            }

            const exercise = await prisma.exercise.findUnique({
              where: { name: templateEx.name },
            });

            return {
              ...exercise,
              isSubstituted: false,
              isFavorite: exercise ? favoriteExercises.has(exercise.name) : false,
            } as {
              id: number;
              name: string;
              muscleGroup: string;
              type: string;
              isSubstituted?: boolean;
              originalName?: string;
              substitutionReason?: string;
              isFavorite?: boolean;
            };
          })
        );

        return {
          id: scheduled.id,
          template: scheduled.template,
          order: scheduled.order,
          isCompleted: scheduled.isCompleted,
          exercises: exercises.filter(Boolean),
        };
      })
    );

    return {
      hasWorkout: true,
      program: { id: activeProgram.id, name: activeProgram.name },
      workouts: workoutsWithExercises,
      message:
        workoutsWithExercises.length === 1
          ? `Treino de hoje: ${workoutsWithExercises[0].template}`
          : `${workoutsWithExercises.length} treinos agendados para hoje`,
    };
  } catch (error) {
    console.error("Erro ao buscar treino do dia:", error);
    return {
      hasWorkout: false,
      error: error instanceof Error ? error.message : "Erro ao buscar treino do dia",
    };
  }
}
