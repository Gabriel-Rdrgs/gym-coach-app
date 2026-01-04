'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/components/Toast';

interface PersonalRecord {
  id: number;
  exerciseId: number;
  weight: number;
  reps: number;
  date: string;
  workoutId: number | null;
  exercise: {
    id: number;
    name: string;
    muscleGroup: string;
  };
}

interface PRData {
  prs: PersonalRecord[];
  recentPRs: PersonalRecord[];
  bestPRs: PersonalRecord[];
  stats: {
    totalPRs: number;
    uniqueExercises: number;
  };
}

const COLORS = {
  primary: '#00d9ff',
  secondary: '#a78bfa',
  success: '#10b981',
  warning: '#ef4444',
};

export default function PRsPage() {
  const [data, setData] = useState<PRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchPRs();
  }, [selectedExercise]);

  const fetchPRs = async () => {
    try {
      const url = selectedExercise
        ? `/api/prs?exerciseId=${selectedExercise}`
        : '/api/prs';
      const response = await fetch(url);
      if (response.ok) {
        const prData = await response.json();
        setData(prData);
      } else {
        toast.error('Erro ao carregar PRs');
      }
    } catch (error) {
      console.error('Erro ao buscar PRs:', error);
      toast.error('Erro ao carregar PRs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--text-muted)' }}>
          Erro ao carregar dados de PRs
        </div>
      </div>
    );
  }

  // Preparar dados para gráfico de evolução de PRs por exercício
  const prsByExerciseForChart: { [key: string]: PersonalRecord[] } = {};
  data.prs.forEach((pr) => {
    const key = pr.exercise.name;
    if (!prsByExerciseForChart[key]) {
      prsByExerciseForChart[key] = [];
    }
    prsByExerciseForChart[key].push(pr);
  });

  // Filtrar apenas exercícios com múltiplos PRs para o gráfico
  const exercisesWithMultiplePRs = Object.entries(prsByExerciseForChart)
    .filter(([_, prs]) => prs.length > 1)
    .slice(0, 5); // Limitar a 5 exercícios

  // Preparar dados do gráfico com evolução contínua
  const prsChartData: any[] = [];
  
  exercisesWithMultiplePRs.forEach(([exerciseName, prs]) => {
    const sortedPRs = [...prs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedPRs.forEach((pr) => {
      let entry = prsChartData.find(e => e.date === formatDate(pr.date));
      if (!entry) {
        entry = { date: formatDate(pr.date) };
        prsChartData.push(entry);
      }
      
      if (!entry[exerciseName] || pr.weight > entry[exerciseName]) {
        entry[exerciseName] = pr.weight;
      }
    });
  });

  // Ordenar por data
  prsChartData.sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  // Preencher valores faltantes com carry forward
  exercisesWithMultiplePRs.forEach(([exerciseName, prs]) => {
    const sortedPRs = [...prs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let lastKnownValue: number | null = null;
    
    prsChartData.forEach((entry) => {
      if (entry[exerciseName] !== undefined && entry[exerciseName] !== null) {
        lastKnownValue = entry[exerciseName];
      } else if (lastKnownValue !== null) {
        entry[exerciseName] = lastKnownValue;
      }
    });
  });

  // Agrupar PRs por exercício para gráfico de barras
  const prsByExercise: { [key: string]: number } = {};
  data.bestPRs.forEach((pr) => {
    prsByExercise[pr.exercise.name] = pr.weight;
  });

  const prsByExerciseData = Object.entries(prsByExercise)
    .map(([name, weight]) => ({ name, peso: weight }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 10);

  // Obter lista única de exercícios para filtro
  const uniqueExercises = Array.from(
    new Set(data.prs.map((pr) => ({ id: pr.exerciseId, name: pr.exercise.name })))
  ).map((ex) => ex);

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1
            className="text-5xl font-bold mb-6 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            🏆 Personal Records
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Acompanhe seus recordes pessoais e evolução
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10 mb-16">
          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">🏆</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              {data.stats.totalPRs}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              PRs Totais
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">💪</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {data.stats.uniqueExercises}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Exercícios com PR
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">📈</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-success)' }}
            >
              {data.recentPRs.length > 0 ? data.recentPRs[0].weight : 0} kg
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Último PR
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">🔥</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-warning)' }}
            >
              {data.bestPRs.length > 0
                ? Math.max(...data.bestPRs.map((pr) => pr.weight))
                : 0}{' '}
              kg
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Maior PR
            </div>
          </div>
        </div>

        {/* Filtro por Exercício */}
        {uniqueExercises.length > 0 && (
          <div className="mb-8">
            <label
              className="block mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              Filtrar por Exercício
            </label>
            <select
              value={selectedExercise || ''}
              onChange={(e) =>
                setSelectedExercise(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="input-neon w-full md:w-auto"
            >
              <option value="">Todos os exercícios</option>
              {uniqueExercises.map((ex: any) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-x-8 gap-y-12 mb-16">
          {/* Gráfico de Evolução de PRs por Exercício */}
          {exercisesWithMultiplePRs.length > 0 && prsChartData.length > 0 ? (
            <div className="card-neon" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-4 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                📈 Evolução de PRs por Exercício
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Mostrando exercícios com múltiplos PRs registrados
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={prsChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 20, 0.98)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
                    }}
                  />
                  <Legend />
                  {exercisesWithMultiplePRs.map(([exerciseName], index) => {
                    const CHART_COLORS = [
                      '#00d9ff',
                      '#a78bfa',
                      '#10b981',
                      '#ef4444',
                      '#f59e0b',
                    ];
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                      <Line
                        key={exerciseName}
                        type="monotone"
                        dataKey={exerciseName}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 4 }}
                        name={exerciseName}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card-neon" style={{ padding: '40px', opacity: 0.6 }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--accent-primary)' }}
              >
                📈 Evolução de PRs
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Registre múltiplos PRs do mesmo exercício para ver a evolução
              </p>
            </div>
          )}

          {/* Gráfico de PRs por Exercício */}
          {prsByExerciseData.length > 0 && (
            <div className="card-neon" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Top 10 PRs por Exercício
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prsByExerciseData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="peso"
                    fill={COLORS.secondary}
                    name="Peso (kg)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Histórico Completo de PRs por Exercício */}
        {Object.keys(prsByExerciseForChart).length > 0 && (
          <div className="card-neon mb-12" style={{ padding: '40px' }}>
            <h2
              className="text-2xl font-bold mb-8 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              📋 Histórico Completo por Exercício
            </h2>
            <div className="space-y-8">
              {Object.entries(prsByExerciseForChart)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([exerciseName, prs]) => {
                  const sortedPRs = [...prs].sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                  const bestPR = sortedPRs.reduce((best, pr) => 
                    pr.weight > best.weight ? pr : best
                  );
                  
                  return (
                    <div
                      key={exerciseName}
                      className="p-6 rounded-lg border"
                      style={{
                        background: 'rgba(0, 217, 255, 0.05)',
                        borderColor: 'rgba(0, 217, 255, 0.3)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className="text-xl font-bold"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          {exerciseName}
                        </h3>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                            Melhor PR
                          </div>
                          <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-success)' }}>
                            {bestPR.weight} kg × {bestPR.reps} reps
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {sortedPRs.map((pr, index) => (
                          <div
                            key={pr.id}
                            className="flex items-center justify-between p-3 rounded"
                            style={{
                              background: pr.id === bestPR.id 
                                ? 'rgba(16, 185, 129, 0.1)' 
                                : 'rgba(0, 217, 255, 0.03)',
                              border: pr.id === bestPR.id 
                                ? '1px solid rgba(16, 185, 129, 0.3)' 
                                : '1px solid transparent',
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-medium" style={{ color: 'var(--text-muted)', minWidth: '60px' }}>
                                #{sortedPRs.length - index}
                              </div>
                              <div>
                                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {pr.weight} kg × {pr.reps} reps
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {formatDate(pr.date)}
                                </div>
                              </div>
                            </div>
                            {pr.id === bestPR.id && (
                              <div className="text-xs font-semibold px-2 py-1 rounded" style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: 'var(--accent-success)',
                              }}>
                                🏆 Melhor
                              </div>
                            )}
                            {index > 0 && (
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {pr.weight > sortedPRs[index - 1].weight 
                                  ? `+${(pr.weight - sortedPRs[index - 1].weight).toFixed(1)}kg` 
                                  : '='}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Lista de PRs Recentes */}
        {data.recentPRs.length > 0 && (
          <div className="card-neon mb-12" style={{ padding: '40px' }}>
            <h2
              className="text-2xl font-bold mb-8 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              🕐 PRs Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="table-neon w-full">
                <thead>
                  <tr>
                    <th>Exercício</th>
                    <th>Peso (kg)</th>
                    <th>Repetições</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPRs.map((pr) => (
                    <tr key={pr.id}>
                      <td style={{ color: 'var(--text-primary)' }}>
                        {pr.exercise.name}
                      </td>
                      <td
                        className="font-bold"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {pr.weight} kg
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>
                        {pr.reps} reps
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {formatDate(pr.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Melhores PRs por Exercício */}
        {data.bestPRs.length > 0 && (
          <div className="card-neon" style={{ padding: '40px' }}>
            <h2
              className="text-2xl font-bold mb-8 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              Melhores PRs por Exercício
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10">
              {data.bestPRs
                .sort((a, b) => b.weight - a.weight)
                .map((pr) => (
                  <div
                    key={pr.id}
                    className="card-neon"
                    style={{
                      padding: '24px',
                      border: '2px solid var(--accent-primary)',
                    }}
                  >
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {pr.exercise.name}
                    </h3>
                    <div className="space-y-2">
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          Peso:
                        </span>{' '}
                        <span className="text-xl font-bold">{pr.weight} kg</span>
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          Repetições:
                        </span>{' '}
                        {pr.reps}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatDate(pr.date)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {data.prs.length === 0 && (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">🏋️</div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--accent-primary)' }}
            >
              Nenhum PR registrado ainda
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Complete treinos para começar a registrar seus Personal Records!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

