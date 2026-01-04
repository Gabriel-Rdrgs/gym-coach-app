import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programs/[id]
 * Obtém um programa específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programId = parseInt(id);

    if (isNaN(programId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const program = await prisma.workoutProgram.findUnique({
      where: { id: programId },
      include: {
        scheduledWorkouts: {
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }, { order: 'asc' }],
        },
        weeks: {
          orderBy: { weekNumber: 'asc' },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Programa não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Erro ao buscar programa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar programa' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/programs/[id]
 * Atualiza um programa
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programId = parseInt(id);
    const body = await request.json();

    if (isNaN(programId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { name, description, isActive, endDate, scheduledWorkouts } = body;

    // Se houver scheduledWorkouts, atualizar ou criar
    if (scheduledWorkouts) {
      // Deletar treinos agendados existentes
      await prisma.scheduledWorkout.deleteMany({
        where: { programId },
      });

      // Criar novos treinos agendados
      await prisma.scheduledWorkout.createMany({
        data: scheduledWorkouts.map((sw: any) => ({
          programId,
          template: sw.template,
          dayOfWeek: sw.dayOfWeek,
          weekNumber: sw.weekNumber,
          order: sw.order || 0,
        })),
      });
    }

    // Atualizar programa
    const program = await prisma.workoutProgram.update({
      where: { id: programId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
      include: {
        scheduledWorkouts: true,
      },
    });

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Erro ao atualizar programa:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar programa' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programs/[id]
 * Deleta um programa
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programId = parseInt(id);

    if (isNaN(programId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.workoutProgram.delete({
      where: { id: programId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar programa:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar programa' },
      { status: 500 }
    );
  }
}

