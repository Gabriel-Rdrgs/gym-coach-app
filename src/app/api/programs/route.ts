import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    const programs = await prisma.workoutProgram.findMany({
      where: {
        OR: [
          { userId: { equals: null } },   // programas públicos
          { userId: { equals: userId } },  // programas do usuário
        ],
      },
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
    return NextResponse.json(
      {
        error: error.message || 'Erro ao buscar programas de treino',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const { name, description, startDate, scheduledWorkouts } = body;

    if (!name || !scheduledWorkouts || scheduledWorkouts.length === 0) {
      return NextResponse.json(
        { error: 'Nome e treinos agendados são obrigatórios' },
        { status: 400 }
      );
    }

    const program = await prisma.workoutProgram.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        userId, // sempre vincula ao usuário logado
        scheduledWorkouts: {
          create: scheduledWorkouts.map((sw: any) => ({
            template: sw.template,
            dayOfWeek: sw.dayOfWeek,
            weekNumber: sw.weekNumber || 1,
            order: sw.order || 0,
          })),
        },
      },
      include: {
        scheduledWorkouts: {
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }, { order: 'asc' }],
        },
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar programa:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao criar programa de treino',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
