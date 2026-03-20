import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { findAlternativeExercises } from '@/lib/exercise-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const exerciseName = searchParams.get('exerciseName');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!exerciseName) {
      return NextResponse.json(
        { error: 'Nome do exercício é obrigatório' },
        { status: 400 }
      );
    }

    const alternatives = await findAlternativeExercises(exerciseName, limit);

    return NextResponse.json({ alternatives }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar exercícios alternativos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar exercícios alternativos' },
      { status: 500 }
    );
  }
}
