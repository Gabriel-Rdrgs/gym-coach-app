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
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    const existing = await prisma.metric.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Métrica não encontrada' }, { status: 404 });
    }

    const metric = await prisma.metric.update({
      where: { id },
      data: {
        date: fields.date ? new Date(fields.date) : existing.date,
        weight: fields.weight ? parseFloat(fields.weight) : null,
        waist: fields.waist ? parseFloat(fields.waist) : null,
        armCircumference: fields.armCircumference ? parseFloat(fields.armCircumference) : null,
        thighCircumference: fields.thighCircumference ? parseFloat(fields.thighCircumference) : null,
        chestCircumference: fields.chestCircumference ? parseFloat(fields.chestCircumference) : null,
        bodyFatPercentage: fields.bodyFatPercentage ? parseFloat(fields.bodyFatPercentage) : null,
        sleep: fields.sleep ? parseFloat(fields.sleep) : null,
        energy: fields.energy ? parseInt(fields.energy) : null,
        stress: fields.stress ? parseInt(fields.stress) : null,
        notes: fields.notes || null,
      },
    });

    return NextResponse.json({ metric });
  } catch (error: any) {
    console.error('Erro ao atualizar métrica:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar métrica' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const existing = await prisma.metric.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Métrica não encontrada' }, { status: 404 });
    }

    await prisma.metric.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar métrica:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar métrica' },
      { status: 500 }
    );
  }
}
