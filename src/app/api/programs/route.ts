import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programs
 * Lista todos os programas de treino
 */
export async function GET() {
  try {
    const programs = await prisma.workoutProgram.findMany({
      include: {
        scheduledWorkouts: {
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }, { order: 'asc' }],
        },
        weeks: {
          orderBy: { weekNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programs });
  } catch (error: any) {
    console.error('Erro ao buscar programas:', error);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao buscar programas de treino',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/programs
 * Cria um novo programa de treino
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startDate, scheduledWorkouts } = body;

    if (!name || !scheduledWorkouts || scheduledWorkouts.length === 0) {
      return NextResponse.json(
        { error: 'Nome e treinos agendados são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar dados antes de criar
    console.log('Dados recebidos:', { name, description, startDate, scheduledWorkoutsCount: scheduledWorkouts?.length });
    
    // Criar programa com treinos agendados
    const programData: any = {
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate) : new Date(),
    };

    // Adicionar scheduledWorkouts apenas se houver dados
    if (scheduledWorkouts && scheduledWorkouts.length > 0) {
      programData.scheduledWorkouts = {
        create: scheduledWorkouts.map((sw: any) => ({
          template: sw.template,
          dayOfWeek: sw.dayOfWeek,
          weekNumber: sw.weekNumber || 1,
          order: sw.order || 0,
        })),
      };
    }

    const program = await prisma.workoutProgram.create({
      data: programData,
      include: {
        scheduledWorkouts: {
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }, { order: 'asc' }],
        },
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar programa:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao criar programa de treino',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

