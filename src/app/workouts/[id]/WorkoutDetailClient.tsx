'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { calculateValidSetsForWorkout } from '@/lib/progress-utils';

interface Set {
  id: number;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
}

interface WorkoutExercise {
  id: number;
  order: number;
  notes: string | null;
  exercise: {
    name: string;
    muscleGroup: string;
    type: string;
  };
  sets: Set[];
}

interface Workout {
  id: number;
  template: string;
  date: string;
  notes: string | null;
  exercises: WorkoutExercise[];
}

interface Props {
  workout: Workout;
}

export default function WorkoutDetailClient({ workout }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editDate, setEditDate] = useState(
    new Date(workout.date).toISOString().split('T')[0]
  );
  const [editNotes, setEditNotes] = useState(workout.notes ?? '');
  const [editExercises, setEditExercises] = useState<WorkoutExercise[]>(
    workout.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s })),
    }))
  );

  const buildFormatted = (exercises: WorkoutExercise[]) => ({
    date: new Date(workout.date),
    exercises: exercises.map((ex) => ({
      exercise: {
        muscleGroup: ex.exercise.muscleGroup,
        name: ex.exercise.name,
        type: ex.exercise.type,
      },
      sets: ex.sets.map((s) => ({
        rir: s.rir,
        weight: s.weight,
        reps: s.reps,
      })),
    })),
  });

  const currentExercises = isEditing ? editExercises : workout.exercises;

  const validSetsResult = calculateValidSetsForWorkout(
    buildFormatted(currentExercises as WorkoutExercise[])
  );
  const totalValidSets = validSetsResult.totalValidSets;
  const totalSets = currentExercises.reduce(
    (sum, ex) => sum + ex.sets.length, 0
  );

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'rir',
    value: string
  ) => {
    setEditExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIndex].sets];
      sets[setIndex] = {
        ...sets[setIndex],
        [field]:
          value === ''
            ? field === 'rir' ? null : 0
            : parseFloat(value),
      };
      updated[exIndex] = { ...updated[exIndex], sets };
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          notes: editNotes || null,
          exercises: editExercises.map((ex) => ({
            workoutExerciseId: ex.id,
            sets: ex.sets.map((s) => ({
              id: s.id,
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
            })),
          })),
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success('Treino atualizado com sucesso!');
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error('Erro ao salvar treino. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Treino excluído com sucesso!');
      router.push('/workouts/list');
    } catch {
      toast.error('Erro ao excluir treino. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditDate(new Date(workout.date).toISOString().split('T')[0]);
    setEditNotes(workout.notes ?? '');
    setEditExercises(
      workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      }))
    );
    setIsEditing(false);
  };

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-4xl">

        {/* Título */}
        <div className="mb-16 text-center">
          <h1
            className="text-5xl font-bold mb-6 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            {isEditing ? 'Editar Treino' : 'Detalhes do Treino'}
          </h1>
        </div>

        {/* Navegação e botões de ação */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/workouts/list" className="btn-secondary">
            ← Voltar
          </Link>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn-secondary disabled:opacity-50"
                  style={{
                    color: 'var(--accent-warning)',
                    borderColor: 'var(--accent-warning)',
                  }}
                >
                  {isDeleting ? 'Excluindo...' : '🗑 Excluir'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : '💾 Salvar'}
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ height: '24px' }} />

        {/* Card principal com data, notas e resumo */}
        <div className="card-neon mb-10" style={{ padding: '40px' }}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h2
                className="text-2xl font-bold mb-3 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                {workout.template}
              </h2>

              {isEditing ? (
                <input
                  type="date"
                  value={editDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="input-neon"
                />
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>
                  {formatDate(workout.date)}
                </p>
              )}
            </div>
            <div className="text-right ml-8">
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                Séries Válidas
              </div>
              <div
                className="text-2xl font-bold text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                {totalValidSets.toFixed(1)}
              </div>
            </div>
          </div>
          {/* Notas */}
          {isEditing ? (
            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--accent-primary)' }}
              >
                Notas (opcional)
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Adicione notas sobre o treino..."
                className="input-neon w-full"
                rows={3}
              />
            </div>
          ) : (
            workout.notes && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  background: 'rgba(0, 217, 255, 0.05)',
                  border: '1px solid var(--accent-primary)',
                }}
              >
                <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-secondary)' }}>
                  Notas:
                </h3>
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {workout.notes}
                </p>
              </div>
            )
          )}

          {/* Resumo numérico */}
          <div
            className="grid grid-cols-3 gap-x-4 gap-y-6 text-center pt-6"
            style={{ borderTop: '2px solid var(--accent-primary)' }}
          >
            <div>
              <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
                {currentExercises.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Exercícios</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
                {totalSets}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
                {totalValidSets.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries Válidas</div>
            </div>
          </div>
        </div>

        <div style={{ height: '32px' }} />

        {/* Lista de exercícios */}
        <div className="space-y-6">
          {currentExercises.map((workoutExercise, exIndex) => {
            const exercise = workoutExercise.exercise;
            const sets = workoutExercise.sets;

            const exerciseValidSets = sets.reduce((sum, set) => {
              const rir = set.rir;
              if (rir === null || rir === undefined) return sum + 1.0;
              if (rir > 3) return sum + 0.0;
              if (rir >= 2 && rir <= 3) return sum + 0.5;
              return sum + 1.0;
            }, 0);

            return (
              <div
                key={workoutExercise.id}
                className="card-neon"
                style={{ padding: '32px' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2
                      className="text-xl font-semibold mb-2"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {exIndex + 1}. {exercise.name}
                    </h2>
                    <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                      {exercise.muscleGroup.replace('_', ' ')} • {exercise.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Séries Válidas
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>
                      {exerciseValidSets.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Tabela de séries */}
                <div className="overflow-x-auto">
                  {isEditing ? (
                    <table className="table-neon w-full">
                      <thead>
                        <tr>
                          <th>Série</th>
                          <th>Peso (kg)</th>
                          <th>Reps</th>
                          <th>RIR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sets.map((set, setIndex) => (
                          <tr key={set.id}>
                            <td style={{ color: 'var(--text-primary)' }}>
                              {set.setNumber}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={set.weight === 0 ? '' : set.weight}
                                onChange={(e) =>
                                  updateSet(exIndex, setIndex, 'weight', e.target.value)
                                }
                                className="input-neon w-full"
                                onFocus={(e) => e.target.select()}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={set.reps === 0 ? '' : set.reps}
                                onChange={(e) =>
                                  updateSet(exIndex, setIndex, 'reps', e.target.value)
                                }
                                className="input-neon w-full"
                                onFocus={(e) => e.target.select()}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="5"
                                value={set.rir === null ? '' : set.rir}
                                onChange={(e) =>
                                  updateSet(exIndex, setIndex, 'rir', e.target.value)
                                }
                                className="input-neon w-full"
                                onFocus={(e) => e.target.select()}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="table-neon w-full">
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
                            if (rir > 3) { validValue = 0.0; validLabel = '-'; }
                            else if (rir >= 2 && rir <= 3) { validValue = 0.5; validLabel = '0.5'; }
                          }
                          return (
                            <tr key={set.id}>
                              <td style={{ color: 'var(--text-primary)' }}>{set.setNumber}</td>
                              <td className="text-right" style={{ color: 'var(--text-primary)' }}>
                                {set.weight.toFixed(1)}
                              </td>
                              <td className="text-right" style={{ color: 'var(--text-primary)' }}>
                                {set.reps}
                              </td>
                              <td className="text-right" style={{ color: 'var(--text-primary)' }}>
                                {rir !== null && rir !== undefined ? rir.toFixed(1) : '-'}
                              </td>
                              <td
                                className="text-right font-medium"
                                style={{
                                  color: validValue > 0 ? 'var(--accent-success)' : 'var(--text-muted)',
                                }}
                              >
                                {validLabel}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
