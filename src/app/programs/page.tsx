'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

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
  }>;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Erro ao buscar programas:', error);
      toast.error('Erro ao carregar programas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este programa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Programa excluído com sucesso!');
        setPrograms(programs.filter((p) => p.id !== id));
      } else {
        toast.error('Erro ao excluir programa');
      }
    } catch (error) {
      console.error('Erro ao excluir programa:', error);
      toast.error('Erro ao excluir programa');
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
                Programas de Treino
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                Gerencie seus programas baseados em recomendações OMS
                <br />
                <span className="text-sm">
                  (10-20 séries válidas semanais por grupo muscular)
                </span>
              </p>
            </div>
            <Link href="/programs/new">
              <button className="btn-primary">
                + Novo Programa
              </button>
            </Link>
          </div>
        </div>

        {/* Lista de Programas */}
        {programs.length === 0 ? (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">📅</div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--accent-primary)' }}
            >
              Nenhum programa criado ainda
            </h2>
            <p style={{ color: 'var(--text-muted)' }} className="mb-8">
              Crie seu primeiro programa de treino personalizado!
            </p>
            <Link href="/programs/new">
              <div className="btn-primary inline-block px-8 py-4 text-base">
                Criar Primeiro Programa
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10">
            {programs.map((program) => {
              const activeWorkouts = program.scheduledWorkouts.filter(
                (sw) => !sw.isCompleted
              ).length;
              const totalWorkouts = program.scheduledWorkouts.length;

              return (
                <div
                  key={program.id}
                  className="card-neon relative group"
                  style={{ padding: '24px' }}
                >
                  {/* Badge de Status */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                      {program.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>

                  <Link href={`/programs/${program.id}`}>
                    <div className="cursor-pointer">
                      <h3
                        className="text-xl font-bold mb-2 pr-16"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {program.name}
                      </h3>
                      {program.description && (
                        <p
                          className="text-sm mb-4"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {program.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: 'var(--text-muted)' }}>
                            Início:
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {formatDate(program.startDate)}
                          </span>
                        </div>
                        {program.endDate && (
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--text-muted)' }}>
                              Término:
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {formatDate(program.endDate)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span style={{ color: 'var(--text-muted)' }}>
                            Treinos:
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {activeWorkouts}/{totalWorkouts} pendentes
                          </span>
                        </div>
                      </div>

                      {/* Resumo de Treinos por Dia */}
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                        <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          Distribuição Semanal:
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {DAYS_OF_WEEK.map((day, index) => {
                            const dayWorkouts = program.scheduledWorkouts.filter(
                              (sw) => sw.dayOfWeek === index
                            );
                            return (
                              <div
                                key={index}
                                className={`text-xs px-2 py-1 rounded ${
                                  dayWorkouts.length > 0
                                    ? 'text-green-400'
                                    : 'text-gray-600'
                                }`}
                                style={{
                                  background:
                                    dayWorkouts.length > 0
                                      ? 'rgba(16, 185, 129, 0.2)'
                                      : 'rgba(107, 114, 128, 0.1)',
                                }}
                              >
                                {day}: {dayWorkouts.length}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Botões de Ação */}
                  <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                    <Link href={`/programs/${program.id}`} className="flex-1">
                      <button className="btn-secondary w-full text-sm py-2">
                        Ver Detalhes
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: 'var(--accent-warning)',
                        border: '1px solid var(--accent-warning)',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

