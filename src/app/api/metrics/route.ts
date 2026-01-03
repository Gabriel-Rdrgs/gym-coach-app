import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, weight, waist, sleep, energy, stress, notes } = body;

    const metric = await prisma.metric.create({
      data: {
        date: date ? new Date(date) : new Date(),
        weight: weight ? parseFloat(weight) : null,
        waist: waist ? parseFloat(waist) : null,
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
    const metrics = await prisma.metric.findMany({
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

