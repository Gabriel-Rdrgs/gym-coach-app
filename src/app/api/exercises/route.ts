import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

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
