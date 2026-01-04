import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workoutId = parseInt(id);

    if (isNaN(workoutId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o treino existe
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'Treino não encontrado' },
        { status: 404 }
      );
    }

    // Deletar manualmente os registros relacionados na ordem correta usando transação
    // Isso é necessário porque as foreign keys estão com ON DELETE RESTRICT
    await prisma.$transaction(async (tx) => {
      // 1. Primeiro, deletar todos os Sets (que referenciam WorkoutExercise)
      const workoutExerciseIds = workout.exercises.map((ex) => ex.id);
      if (workoutExerciseIds.length > 0) {
        await tx.set.deleteMany({
          where: { 
            workoutExerciseId: { 
              in: workoutExerciseIds 
            } 
          },
        });
      }

      // 2. Deletar WorkoutExercises (que referenciam Workout)
      await tx.workoutExercise.deleteMany({
        where: { workoutId: workoutId },
      });

      // 3. Deletar PRs relacionados (se houver) - workoutId é opcional, então não bloqueia
      // Mas vamos deletar para manter o banco limpo
      await tx.personalRecord.deleteMany({
        where: { workoutId: workoutId },
      });

      // 4. Finalmente, deletar o workout
      await tx.workout.delete({
        where: { id: workoutId },
      });
    });

    return NextResponse.json(
      { message: 'Treino excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir treino:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    
    // Retornar mensagem de erro mais detalhada
    const errorMessage = error.meta?.cause || error.message || 'Erro ao excluir treino';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

