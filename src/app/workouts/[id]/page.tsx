import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import WorkoutDetailClient from './WorkoutDetailClient';

export const dynamic = 'force-dynamic';

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const workoutId = parseInt(id);

  if (isNaN(workoutId)) {
    notFound();
  }

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId: session.user.id,
    },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Serializar para passar ao client component
  const serialized = {
    ...workout,
    date: workout.date.toISOString(),
    exercises: workout.exercises.map((ex) => ({
      ...ex,
      exercise: {
        name: ex.exercise.name,
        muscleGroup: ex.exercise.muscleGroup,
        type: ex.exercise.type ?? 'isolation',
      },
      sets: ex.sets.map((s) => ({
        id: s.id,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rir: s.rir,
      })),
    })),
  };

  return <WorkoutDetailClient workout={serialized} />;
}
