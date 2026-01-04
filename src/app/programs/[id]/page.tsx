'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import {
  formatMuscleGroupName,
  getOMSStatusColor,
  getOMSStatusIcon,
  getWeekRange,
} from '@/lib/program-utils';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface WorkoutProgram {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  scheduledWorkouts: Array<{
    id: number;
    template: string;
    dayOfWeek: number;
    weekNumber: number;
    isCompleted: boolean;
    completedAt: string | null;
    workoutId: number | null;
  }>;
}

interface WeeklyStats {
  weekRange: {
    start: string;
    end: string;
  };
  validSetsByGroup: { [muscleGroup: string]: number };
  omsStatus: {
    [muscleGroup: string]: {
      status: 'optimal' | 'low' | 'high' | 'none';
      validSets: number;
      recommendation: string;
    };
  };
  workoutsCount: number;
}

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [programId, setProgramId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setProgramId(id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (programId) {
      Promise.all([
        fetchProgram(programId),
        fetchWeeklyStats(programId),
      ]);
    }
  }, [programId, selectedWeek]);

  const fetchProgram = async (programId: number) => {
    try {
      const response = await fetch(`/api/programs/${programId}`);
      if (response.ok) {
        const data = await response.json();
        setProgram(data.program);
      }
    } catch (error) {
      console.error('Erro ao buscar programa:', error);
      toast.error('Erro ao carregar programa');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async (programId: number) => {
    try {
      const response = await fetch(
        `/api/programs/${programId}/weekly-stats?weekStart=${selectedWeek}`
      );
      if (response.ok) {
        const data = await response.json();
        setWeeklyStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-warning)' }}>
          Programa não encontrado
        </div>
      </div>
    );
  }

  const weekWorkouts = program.scheduledWorkouts.filter(
    (sw) => sw.weekNumber === 1
  );

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/programs" className="text-sm mb-4 inline-block" style={{ color: 'var(--accent-secondary)' }}>
                ← Voltar para Programas
              </Link>
              <h1
                className="text-5xl font-bold mb-4 text-glow"
                style={{
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  letterSpacing: '2px',
                }}
              >
                {program.name}
              </h1>
              {program.description && (
                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                  {program.description}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  program.isActive
                    ? 'text-green-400'
                    : 'text-gray-400'
                }`}
                style={{
                  background: program.isActive
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(107, 114, 128, 0.2)',
                }}
              >
                {program.isActive ? '✓ Ativo' : 'Inativo'}
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Semana */}
        <div className="card-neon mb-8" style={{ padding: '24px' }}>
          <div className="flex items-center gap-4">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Semana:
            </label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="input-neon"
            />
            {weeklyStats && (
              <div className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(weeklyStats.weekRange.start)} - {formatDate(weeklyStats.weekRange.end)}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard de Séries Válidas e Status OMS */}
        {weeklyStats && (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-10 lg:gap-y-12 mb-8">
            {/* Séries Válidas por Grupo Muscular */}
            <div className="card-neon" style={{ padding: '32px' }}>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--accent-primary)' }}
              >
                Séries Válidas por Grupo Muscular
              </h2>
              <div className="space-y-4">
                {Object.entries(weeklyStats.validSetsByGroup)
                  .sort(([, a], [, b]) => b - a)
                  .map(([muscleGroup, validSets]) => {
                    const status = weeklyStats.omsStatus[muscleGroup];
                    return (
                      <div
                        key={muscleGroup}
                        className="p-4 rounded-lg border"
                        style={{
                          background: 'rgba(0, 217, 255, 0.05)',
                          borderColor: getOMSStatusColor(status?.status || 'none'),
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getOMSStatusIcon(status?.status || 'none')}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatMuscleGroupName(muscleGroup)}
                            </span>
                          </div>
                          <div
                            className="text-xl font-bold"
                            style={{
                              color: getOMSStatusColor(status?.status || 'none'),
                            }}
                          >
                            {validSets.toFixed(1)}
                          </div>
                        </div>
                        {status && (
                          <p
                            className="text-xs mt-2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {status.recommendation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                {Object.keys(weeklyStats.validSetsByGroup).length === 0 && (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    Nenhum treino registrado nesta semana
                  </p>
                )}
              </div>
            </div>

            {/* Alertas OMS */}
            <div className="card-neon" style={{ padding: '32px' }}>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Status OMS (10-20 séries válidas/semana)
              </h2>
              <div className="space-y-4">
                {Object.entries(weeklyStats.omsStatus)
                  .filter(([, status]) => status.status !== 'optimal')
                  .map(([muscleGroup, status]) => (
                    <div
                      key={muscleGroup}
                      className={`p-4 rounded-lg border ${
                        status.status === 'low'
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : status.status === 'high'
                          ? 'bg-red-900/20 border-red-500/50'
                          : 'bg-gray-900/20 border-gray-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {getOMSStatusIcon(status.status)}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatMuscleGroupName(muscleGroup)}
                        </span>
                        <span
                          className="ml-auto font-bold"
                          style={{
                            color: getOMSStatusColor(status.status),
                          }}
                        >
                          {status.validSets.toFixed(1)} séries
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {status.recommendation}
                      </p>
                    </div>
                  ))}
                {Object.values(weeklyStats.omsStatus).every(
                  (s) => s.status === 'optimal'
                ) && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">✅</div>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--accent-success)' }}
                    >
                      Todos os grupos musculares estão dentro da faixa recomendada pela OMS!
                    </p>
                  </div>
                )}
                {Object.keys(weeklyStats.omsStatus).length === 0 && (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    Nenhum dado disponível
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendário Semanal */}
        <div className="card-neon mb-8" style={{ padding: '32px' }}>
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--accent-primary)' }}
          >
            Calendário Semanal
          </h2>
          <div className="grid grid-cols-7 gap-x-4 gap-y-6">
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const dayWorkouts = weekWorkouts.filter(
                (sw) => sw.dayOfWeek === dayIndex
              );
              return (
                <div
                  key={dayIndex}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderColor: 'rgba(0, 217, 255, 0.2)',
                  }}
                >
                  <div
                    className="font-semibold mb-3 text-center"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {day}
                  </div>
                  <div className="space-y-2">
                    {dayWorkouts.length > 0 ? (
                      dayWorkouts.map((sw) => (
                        <div
                          key={sw.id}
                          className={`p-2 rounded text-sm text-center ${
                            sw.isCompleted
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {sw.template}
                          {sw.isCompleted && ' ✓'}
                        </div>
                      ))
                    ) : (
                      <div
                        className="text-xs text-center py-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Sem treino
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatísticas da Semana */}
        {weeklyStats && (
          <div className="card-neon" style={{ padding: '32px' }}>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Estatísticas da Semana
            </h2>
            <div className="grid md:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10">
              <div className="text-center p-6 rounded-lg" style={{ background: 'rgba(0, 217, 255, 0.1)' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
                  {weeklyStats.workoutsCount}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Treinos Realizados
                </div>
              </div>
              <div className="text-center p-6 rounded-lg" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-secondary)' }}>
                  {Object.keys(weeklyStats.validSetsByGroup).length}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Grupos Musculares Treinados
                </div>
              </div>
              <div className="text-center p-6 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-success)' }}>
                  {Object.values(weeklyStats.omsStatus).filter(
                    (s) => s.status === 'optimal'
                  ).length}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Grupos no Ideal OMS
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

