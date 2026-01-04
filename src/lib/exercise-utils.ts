import { prisma } from './prisma';

/**
 * Encontra exercícios alternativos/similares baseado em:
 * - Mesmo grupo muscular
 * - Mesmo tipo (compound/isolation)
 * - Equipamento similar
 */
export async function findAlternativeExercises(
  exerciseName: string,
  limit: number = 5
) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { name: exerciseName } as any,
    });

    if (!exercise) {
      return [];
    }

    // Buscar alternativas diretas na tabela de relacionamentos
    // Nota: Após a migração, usar prisma.exerciseAlternative
    const directAlternatives: any[] = [];
    
    // Por enquanto, buscar por similaridade direta
    const similarExercises = await prisma.exercise.findMany({
      where: {
        AND: [
          { id: { not: exercise.id } },
          { muscleGroup: exercise.muscleGroup },
          { type: exercise.type },
        ],
      },
      take: limit,
    });

    return similarExercises;
  } catch (error) {
    console.error('Erro ao buscar exercícios alternativos:', error);
    return [];
  }
}

/**
 * Sugere exercícios baseado no histórico do usuário
 */
export async function suggestExercises(
  muscleGroup?: string,
  excludeIds: number[] = [],
  limit: number = 10
) {
  try {
    const where: any = {
      id: { notIn: excludeIds },
    };

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    return await prisma.exercise.findMany({
      where,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Erro ao sugerir exercícios:', error);
    return [];
  }
}

/**
 * Verifica se um PR foi batido e salva se for
 */
export async function checkAndSavePR(
  exerciseId: number,
  weight: number,
  reps: number,
  workoutId?: number
) {
  try {
    // Buscar o melhor PR atual para este exercício
    const existingPRs = await prisma.personalRecord.findMany({
      where: { exerciseId },
      orderBy: { weight: 'desc' },
      take: 1,
    });

    const currentBestPR = existingPRs.length > 0 ? existingPRs[0] : null;
    const isPR = !currentBestPR || weight > currentBestPR.weight;

    if (isPR) {
      // Salvar novo PR
      const newPR = await prisma.personalRecord.create({
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

      return {
        isPR: true,
        currentPR: newPR,
        previousPR: currentBestPR,
      };
    }

    return {
      isPR: false,
      currentPR: currentBestPR,
      previousPR: null,
    };
  } catch (error) {
    console.error('Erro ao verificar PR:', error);
    return null;
  }
}

