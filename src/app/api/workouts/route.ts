import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({ workout }, { status: 201 });
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

