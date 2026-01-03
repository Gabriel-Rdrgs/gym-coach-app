import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'ID do exercício inválido' },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      // Nota: Após executar a migração do Prisma, podemos incluir as relações
      // include: {
      //   alternatives: {
      //     include: {
      //       alternative: true,
      //     },
      //     orderBy: {
      //       similarity: 'desc',
      //     },
      //   },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar exercício' },
      { status: 500 }
    );
  }
}

