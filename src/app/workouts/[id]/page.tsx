import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { calculateValidSetsForWorkout } from '@/lib/progress-utils';

// Forçar renderização dinâmica (não pré-renderizar durante build)
export const dynamic = 'force-dynamic';

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params;
  const workoutId = parseInt(id);

  if (isNaN(workoutId)) {
    notFound();
  }

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calcular séries válidas usando a função utilitária
  const workoutFormatted = {
    date: workout.date,
    exercises: workout.exercises.map((ex) => ({
      exercise: {
        muscleGroup: ex.exercise?.muscleGroup || '',
        name: ex.exercise?.name || '',
        type: ex.exercise?.type || 'isolation',
      },
      sets: ex.sets.map((set) => ({
        rir: set.rir,
        weight: set.weight,
        reps: set.reps,
      })),
    })),
  };
  const validSetsResult = calculateValidSetsForWorkout(workoutFormatted);
  const totalValidSets = validSetsResult.totalValidSets;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl font-bold mb-6 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Detalhes do Treino
          </h1>
        </div>

        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>

      <div className="mb-8">
        <Link
          href="/workouts"
          className="btn-secondary mb-4 inline-block"
        >
          ← Voltar para Treinos
        </Link>
      </div>

      {/* Espaçamento vertical */}
      <div style={{ height: '24px' }}></div>

      <div className="card-neon mb-10 neon-glow" style={{ padding: '40px' }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-3 text-glow" style={{ color: 'var(--accent-primary)' }}>
              {workout.template}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {formatDate(workout.date)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Séries Válidas</div>
            <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
              {totalValidSets.toFixed(1)}
            </div>
          </div>
        </div>

        {workout.notes && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid var(--accent-primary)' }}>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-secondary)' }}>Notas:</h3>
            <p className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{workout.notes}</p>
          </div>
        )}

        {/* Espaçamento vertical */}
        <div style={{ height: '24px' }}></div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-6 text-center mb-6 pt-6" style={{ borderTop: '2px solid var(--accent-primary)' }}>
          <div>
            <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
              {workout.exercises.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Exercícios</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>{totalSets}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
              {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries Totais</div>
          </div>
        </div>
      </div>

      {/* Espaçamento vertical */}
      <div style={{ height: '32px' }}></div>

      <div className="space-y-6">
        {workout.exercises.map((workoutExercise, index) => {
          const exercise = workoutExercise.exercise;
          const sets = workoutExercise.sets;
          
          // Calcular séries válidas para este exercício
          const exerciseValidSets = sets.reduce((sum, set) => {
            const rir = set.rir;
            if (rir === null || rir === undefined) return sum + 1.0;
            if (rir > 3) return sum + 0.0; // Aquecimento
            if (rir >= 2 && rir <= 3) return sum + 0.5; // Ajuste
            return sum + 1.0; // Válida
          }, 0);

          return (
            <div
              key={workoutExercise.id}
              className="card-neon"
              style={{ padding: '32px' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>
                    {index + 1}. {exercise.name}
                  </h2>
                  <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                    {exercise.muscleGroup.replace('_', ' ')} • {exercise.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries Válidas</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>
                    {exerciseValidSets.toFixed(1)}
                  </div>
                </div>
              </div>

              {workoutExercise.notes && (
                <div className="mb-4 p-3 rounded text-sm" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid var(--accent-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--accent-secondary)' }}>Notas:</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{workoutExercise.notes}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table-neon">
                  <thead>
                    <tr>
                      <th>Série</th>
                      <th className="text-right">Peso (kg)</th>
                      <th className="text-right">Reps</th>
                      <th className="text-right">RIR</th>
                      <th className="text-right">Válida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sets.map((set) => {
                      const rir = set.rir;
                      let validValue = 1.0;
                      let validLabel = '✓';
                      if (rir !== null && rir !== undefined) {
                        if (rir > 3) {
                          validValue = 0.0;
                          validLabel = '-';
                        } else if (rir >= 2 && rir <= 3) {
                          validValue = 0.5;
                          validLabel = '0.5';
                        }
                      }
                      return (
                        <tr key={set.id}>
                          <td className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {set.setNumber}
                          </td>
                          <td className="text-right" style={{ color: 'var(--text-primary)' }}>
                            {set.weight.toFixed(1)}
                          </td>
                          <td className="text-right" style={{ color: 'var(--text-primary)' }}>{set.reps}</td>
                          <td className="text-right" style={{ color: 'var(--text-primary)' }}>
                            {rir !== null && rir !== undefined
                              ? rir.toFixed(1)
                              : '-'}
                          </td>
                          <td className="text-right font-medium" style={{ 
                            color: validValue > 0 ? 'var(--accent-success)' : 'var(--text-muted)' 
                          }}>
                            {validLabel}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
