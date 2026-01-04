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

export async function PATCH(
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

    const body = await request.json();
    const { imageUrl, videoUrl, equipment, difficulty, notes } = body;

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(equipment !== undefined && { equipment: equipment || null }),
        ...(difficulty !== undefined && { difficulty: difficulty || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao atualizar exercício:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar exercício' },
      { status: 500 }
    );
  }
}

