import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const workoutId = parseInt(id);

    if (isNaN(workoutId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { notes, date, exercises } = body;

    await prisma.$transaction(async (tx) => {
      // 1. Atualizar dados básicos do treino
      await tx.workout.update({
        where: { id: workoutId },
        data: {
          notes: notes ?? existing.notes,
          date: date ? new Date(date) : existing.date,
        },
      });

      // 2. Atualizar séries de cada exercício
      if (exercises && exercises.length > 0) {
        for (const ex of exercises) {
          for (const set of ex.sets) {
            await tx.set.update({
              where: { id: set.id },
              data: {
                weight: set.weight,
                reps: set.reps,
                rir: set.rir ?? null,
              },
            });
          }
        }
      }
    });

    const updated = await prisma.workout.findFirst({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ workout: updated });
  } catch (error: any) {
    console.error("Erro ao atualizar treino:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar treino" },
      { status: 500 }
    );
  }
}

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

    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId,
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

    await prisma.$transaction(async (tx) => {
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

      await tx.workoutExercise.deleteMany({
        where: { workoutId },
      });

      await tx.personalRecord.deleteMany({
        where: { workoutId },
      });

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
