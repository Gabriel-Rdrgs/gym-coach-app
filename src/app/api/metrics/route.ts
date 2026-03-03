import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      date,
      weight,
      waist,
      armCircumference,
      thighCircumference,
      chestCircumference,
      bodyFatPercentage,
      sleep,
      energy,
      stress,
      notes,
    } = body;

    const metric = await prisma.metric.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        weight: weight ? parseFloat(weight) : null,
        waist: waist ? parseFloat(waist) : null,
        armCircumference: armCircumference ? parseFloat(armCircumference) : null,
        thighCircumference: thighCircumference ? parseFloat(thighCircumference) : null,
        chestCircumference: chestCircumference ? parseFloat(chestCircumference) : null,
        bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
        sleep: sleep ? parseFloat(sleep) : null,
        energy: energy ? parseInt(energy) : null,
        stress: stress ? parseInt(stress) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ metric }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar métrica:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar métrica' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const metrics = await prisma.metric.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}

