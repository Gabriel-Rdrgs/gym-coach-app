import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { muscleGroup: 'asc' },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar exercícios' },
      { status: 500 }
    );
  }
}

