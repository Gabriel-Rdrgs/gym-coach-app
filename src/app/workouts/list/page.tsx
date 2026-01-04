'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { calculateValidSetsForWorkout } from '@/lib/progress-utils';

interface Workout {
  id: number;
  date: string;
  template: string;
  notes: string | null;
  exercises: Array<{
    id: number;
    exercise: {
      name: string;
      muscleGroup: string;
      type?: string;
    };
    sets: Array<{
      weight: number;
      reps: number;
      rir?: number | null;
    }>;
  }>;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
};

const calculateValidSets = (workout: Workout) => {
  const workoutFormatted = {
    date: new Date(workout.date),
    exercises: workout.exercises.map((ex) => ({
      exercise: {
        muscleGroup: ex.exercise.muscleGroup,
        name: ex.exercise.name,
        type: ex.exercise.type || 'isolation',
      },
      sets: ex.sets.map((set) => ({
        rir: set.rir ?? null,
        weight: set.weight,
        reps: set.reps,
      })),
    })),
  };
  const result = calculateValidSetsForWorkout(workoutFormatted);
  return result.totalValidSets;
};

const groupWorkoutsByDate = (workouts: Workout[]) => {
  const groups: { [key: string]: Workout[] } = {};
  
  workouts.forEach((workout) => {
    const date = new Date(workout.date);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(workout);
  });

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, workouts]) => ({
      date,
      workouts: workouts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
};

export default function WorkoutsListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      toast.error('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Treino excluído com sucesso!');
        setWorkouts(workouts.filter((w) => w.id !== id));
        setDeleteConfirmId(null);
      } else {
        console.error('Erro na API:', data);
        toast.error(data.error || 'Erro ao excluir treino');
      }
    } catch (error: any) {
      console.error('Erro ao excluir treino:', error);
      toast.error(error.message || 'Erro ao excluir treino');
    }
  };

  // Filtrar treinos
  const filteredWorkouts = workouts.filter((workout) => {
    // Filtro de busca
    const matchesSearch = 
      workout.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.exercises.some((ex) => 
        ex.exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtro de template
    const matchesTemplate = !filterTemplate || workout.template === filterTemplate;

    // Filtro de período
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const workoutDate = new Date(workout.date);
      const now = new Date();
      const diffTime = now.getTime() - workoutDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (filterPeriod === 'today') {
        matchesPeriod = diffDays < 1;
      } else if (filterPeriod === 'week') {
        matchesPeriod = diffDays < 7;
      } else if (filterPeriod === 'month') {
        matchesPeriod = diffDays < 30;
      }
    }

    return matchesSearch && matchesTemplate && matchesPeriod;
  });

  const groupedWorkouts = groupWorkoutsByDate(filteredWorkouts);
  const uniqueTemplates = Array.from(new Set(workouts.map((w) => w.template))).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-5xl font-bold mb-4 text-glow"
                style={{
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  letterSpacing: '2px',
                }}
              >
                Meus Treinos
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                {workouts.length} {workouts.length === 1 ? 'treino' : 'treinos'} registrados
              </p>
            </div>
            <Link href="/workouts">
              <button className="btn-primary">
                + Novo Treino
              </button>
            </Link>
          </div>

          {/* Filtros */}
          <div className="card-neon p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-x-4 gap-y-6 md:gap-y-8">
              {/* Busca */}
              <input
                type="text"
                placeholder="Buscar treino, exercício ou nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-neon w-full"
              />

              {/* Filtro de Template */}
              <select
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
                className="input-neon w-full"
              >
                <option value="">Todos os templates</option>
                {uniqueTemplates.map((template) => (
                  <option key={template} value={template}>
                    {template}
                  </option>
                ))}
              </select>

              {/* Filtro de Período */}
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="input-neon w-full"
              >
                <option value="all">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Treinos Agrupados */}
        {groupedWorkouts.length === 0 ? (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">🔍</div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--accent-primary)' }}
            >
              Nenhum treino encontrado
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {workouts.length === 0
                ? 'Comece criando seu primeiro treino!'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedWorkouts.map(({ date, workouts: dayWorkouts }) => (
              <div key={date}>
                {/* Cabeçalho da Data */}
                <div className="mb-4">
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--accent-secondary)' }}
                  >
                    {formatDateShort(date)}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {dayWorkouts.length} {dayWorkouts.length === 1 ? 'treino' : 'treinos'}
                  </p>
                </div>

                {/* Cards de Treinos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 md:gap-y-8">
                  {dayWorkouts.map((workout) => {
                    const totalValidSets = calculateValidSets(workout);
                    const totalSets = workout.exercises.reduce(
                      (sum, ex) => sum + ex.sets.length,
                      0
                    );

                    return (
                      <div
                        key={workout.id}
                        className="card-neon relative group"
                        style={{ padding: '24px' }}
                      >
                        {/* Botão de Excluir */}
                        <button
                          onClick={() => setDeleteConfirmId(workout.id)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all text-xl hover:scale-110"
                          style={{ color: 'var(--accent-warning)' }}
                          title="Excluir treino"
                        >
                          🗑️
                        </button>

                        <Link href={`/workouts/${workout.id}`}>
                          <div className="cursor-pointer">
                            <h3
                              className="text-xl font-bold mb-2 pr-8"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              {workout.template}
                            </h3>
                            <p
                              className="text-sm mb-4"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatDate(workout.date)}
                            </p>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Séries Válidas:</span>
                                <span
                                  className="font-bold"
                                  style={{ color: 'var(--accent-success)' }}
                                >
                                  {totalValidSets.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Exercícios:</span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {workout.exercises.length}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Séries Totais:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{totalSets}</span>
                              </div>
                            </div>

                            {workout.notes && (
                              <p
                                className="text-xs italic truncate"
                                style={{ color: 'var(--text-muted)' }}
                                title={workout.notes}
                              >
                                💬 {workout.notes}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="card-neon w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '32px' }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--accent-warning)' }}
            >
              Confirmar Exclusão
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
              Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-primary flex-1"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-warning), #dc2626)',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

