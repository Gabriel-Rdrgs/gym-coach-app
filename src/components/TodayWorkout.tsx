'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  type: string;
  isSubstituted?: boolean;
  originalName?: string;
  substitutionReason?: string;
  isFavorite?: boolean;
}

interface Workout {
  id: number;
  template: string;
  order: number;
  isCompleted: boolean;
  exercises: Exercise[];
}

interface TodayWorkoutData {
  hasWorkout: boolean;
  program?: {
    id: number;
    name: string;
  };
  workouts?: Workout[];
  message?: string;
  error?: string;
}

export default function TodayWorkout() {
  const [workoutData, setWorkoutData] = useState<TodayWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      const response = await fetch('/api/programs/today');
      const data = await response.json();
      setWorkoutData(data);
    } catch (error) {
      console.error('Erro ao buscar treino do dia:', error);
      setWorkoutData({ hasWorkout: false, error: 'Erro ao carregar treino' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-neon mb-8" style={{ padding: '24px' }}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏋️</div>
          <div>
            <div className="text-lg font-semibold">Carregando treino do dia...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workoutData?.hasWorkout || !workoutData.workouts || workoutData.workouts.length === 0) {
    return (
      <div className="card-neon mb-8" style={{ padding: '24px', opacity: 0.7 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <div className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>
                Nenhum treino agendado para hoje
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {workoutData?.message || 'Configure um programa de treino para ver seus treinos diários'}
              </div>
            </div>
          </div>
          <Link
            href="/programs/new"
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            Criar Programa
          </Link>
        </div>
      </div>
    );
  }

  const mainWorkout = workoutData.workouts[0];

  return (
    <div className="card-neon mb-8" style={{ padding: '24px' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏋️</div>
          <div>
            <div className="text-xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
              Treino de Hoje
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {workoutData.program?.name || 'Programa de Treino'}
            </div>
          </div>
        </div>
        <Link
          href={`/programs/${workoutData.program?.id}`}
          className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
          style={{
            background: 'var(--accent-secondary)',
            color: 'var(--bg-primary)',
          }}
        >
          Ver Programa
        </Link>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
          {mainWorkout.template}
        </div>
        {mainWorkout.isCompleted && (
          <div className="text-sm mb-2" style={{ color: 'var(--accent-success)' }}>
            ✅ Treino completado
          </div>
        )}
      </div>

      {mainWorkout.exercises && mainWorkout.exercises.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Exercícios ({mainWorkout.exercises.length})
          </div>
          <div className="space-y-2">
            {mainWorkout.exercises.slice(0, 5).map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center gap-2 p-2 rounded"
                style={{
                  background: exercise.isSubstituted
                    ? 'rgba(255, 193, 7, 0.1)'
                    : exercise.isFavorite
                    ? 'rgba(0, 217, 255, 0.1)'
                    : 'transparent',
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {index + 1}. {exercise.name}
                </div>
                {exercise.isSubstituted && (
                  <div className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255, 193, 7, 0.2)', color: 'var(--accent-warning)' }}>
                    Substituído
                  </div>
                )}
                {exercise.isFavorite && (
                  <div className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0, 217, 255, 0.2)', color: 'var(--accent-primary)' }}>
                    ⭐ Favorito
                  </div>
                )}
              </div>
            ))}
            {mainWorkout.exercises.length > 5 && (
              <div className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                +{mainWorkout.exercises.length - 5} exercícios
              </div>
            )}
          </div>
        </div>
      )}

      <Link
        href="/workouts"
        className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105"
        style={{
          background: 'var(--accent-primary)',
          color: 'var(--bg-primary)',
        }}
      >
        {mainWorkout.isCompleted ? 'Ver Detalhes' : 'Iniciar Treino'}
      </Link>
    </div>
  );
}


