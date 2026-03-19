import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { id } = await params;
    const workoutId = parseInt(id);

    if (isNaN(workoutId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se o treino existe E pertence ao usuário
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId, // <- garante que o treino é do usuário logado
      },
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
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }

    // Deletar manualmente os registros relacionados na ordem correta usando transação
    await prisma.$transaction(async (tx) => {
      // 1. Deletar todos os Sets
      const workoutExerciseIds = workout.exercises.map((ex) => ex.id);
      if (workoutExerciseIds.length > 0) {
        await tx.set.deleteMany({
          where: {
            workoutExerciseId: {
              in: workoutExerciseIds,
            },
          },
        });
      }

      // 2. Deletar WorkoutExercises
      await tx.workoutExercise.deleteMany({
        where: { workoutId },
      });

      // 3. Deletar PRs relacionados a este treino (se houver)
      await tx.personalRecord.deleteMany({
        where: { workoutId },
      });

      // 4. Finalmente, deletar o workout
      await tx.workout.delete({
        where: { id: workoutId },
      });
    });

    return NextResponse.json(
      { message: "Treino excluído com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir treino:", error);
    const errorMessage =
      error.meta?.cause || error.message || "Erro ao excluir treino";

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
