import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAndSavePR } from '@/lib/exercise-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, notes, exercises } = body;

    if (!template || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Template e exercícios são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar o treino com todos os exercícios e séries
    const workout = await prisma.workout.create({
      data: {
        template,
        notes: notes || null,
        exercises: {
          create: await Promise.all(
            exercises.map(async (ex: any) => {
              // Buscar o exercício pelo nome
              const exercise = await prisma.exercise.findUnique({
                where: { name: ex.exerciseName } as any,
              });

              if (!exercise) {
                throw new Error(`Exercício "${ex.exerciseName}" não encontrado`);
              }

              return {
                exerciseId: exercise.id,
                order: ex.order,
                sets: {
                  create: ex.sets.map((set: any) => ({
                    setNumber: set.setNumber || 1,
                    weight: set.weight,
                    reps: set.reps,
                    rir: set.rir || null,
                  })),
                },
              };
            })
          ),
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

    // Verificar PRs para cada exercício
    const prsDetected: any[] = [];
    for (const ex of exercises) {
      const exercise = await prisma.exercise.findUnique({
        where: { name: ex.exerciseName } as any,
      });

      if (exercise) {
        // Encontrar o maior peso e reps para este exercício no treino
        const sets = ex.sets.filter((s: any) => s.weight > 0 && s.reps > 0);
        if (sets.length > 0) {
          const maxWeightSet = sets.reduce((max: any, set: any) =>
            set.weight > max.weight ? set : max
          );

          const prResult = await checkAndSavePR(
            exercise.id,
            maxWeightSet.weight,
            maxWeightSet.reps,
            workout.id
          );

          if (prResult?.isPR) {
            prsDetected.push({
              exercise: exercise.name,
              weight: maxWeightSet.weight,
              reps: maxWeightSet.reps,
            });
          }
        }
      }
    }

    return NextResponse.json(
      { workout, prsDetected },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar treino:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar treino' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const workouts = await prisma.workout.findMany({
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ workouts });
  } catch (error: any) {
    console.error('Erro ao buscar treinos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar treinos' },
      { status: 500 }
    );
  }
}

