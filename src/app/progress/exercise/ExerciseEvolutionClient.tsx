'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

interface HistoryEntry {
  date: string;
  maxWeight: number;
  avgWeight: number;
  totalVolume: number;
  avgReps: number;
  sets: number;
}

interface EvolutionData {
  exercise: {
    id: number;
    name: string;
    muscleGroup: string;
    type: string;
  };
  history: HistoryEntry[];
  pr: { weight: number; reps: number; date: string } | null;
  stats: {
    totalSessions: number;
    avgWeight: number;
    trend: number | null;
    daysSinceLast: number | null;
  };
}

const CHART_COLORS = {
  maxWeight: '#00d9ff',
  avgWeight: '#a78bfa',
  volume: '#10b981',
};

export default function ExerciseEvolutionClient() {
  const [search, setSearch] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [data, setData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(dateString));
  };

  const fetchSuggestions = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.exercises
          .map((ex: any) => ex.name)
          .filter((name: string) =>
            name.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 8);
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const fetchEvolution = async (name: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await fetch(
        `/api/exercises/evolution?name=${encodeURIComponent(name)}`
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Erro ao buscar dados');
        return;
      }
      if (result.history.length === 0) {
        setError('Nenhum treino registrado para este exercício ainda.');
        return;
      }
      setData(result);
    } catch {
      setError('Erro ao buscar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setSearch(name);
    setExerciseName(name);
    setShowSuggestions(false);
    fetchEvolution(name);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setExerciseName(search.trim());
    setShowSuggestions(false);
    fetchEvolution(search.trim());
  };

  // Preparar dados para o gráfico de volume
  const chartData = data?.history.map((h) => ({
    date: formatDate(h.date),
    'Peso Máximo': h.maxWeight,
    'Peso Médio': h.avgWeight,
    'Volume Total': h.totalVolume,
  })) ?? [];

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-5xl">

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
            Evolução por Exercício
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Acompanhe a evolução de carga e volume em qualquer exercício
          </p>
        </div>

        {/* Campo de busca */}
        <div className="card-neon mb-10" style={{ padding: '32px' }}>
          <form onSubmit={handleSearch}>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--accent-primary)' }}
            >
              Buscar exercício
            </label>
            <div className="relative">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onFocus={() => search.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ex: Supino reto barra, Agachamento livre..."
                  className="input-neon flex-1"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading || !search.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Buscar'}
                </button>
              </div>

              {/* Sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent-primary)',
                    boxShadow: '0 4px 20px rgba(0, 217, 255, 0.2)',
                  }}
                >
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectSuggestion(name)}
                      className="w-full text-left px-4 py-3 transition-all hover:bg-cyan-500/10"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Erro */}
        {error && (
          <div
            className="p-4 rounded-lg text-center mb-8"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
          </div>
        )}

        {/* Dados */}
        {data && (
          <>
            {/* Título do exercício */}
            <div className="mb-10">
              <h2
                className="text-3xl font-bold text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                {data.exercise.name}
              </h2>
              <p className="text-sm mt-1 capitalize" style={{ color: 'var(--text-muted)' }}>
                {data.exercise.muscleGroup.replace('_', ' ')} ·{' '}
                {data.exercise.type === 'compound' ? 'Composto' : 'Isolado'}
              </p>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 mb-10">
              <div className="card-neon text-center" style={{ padding: '24px' }}>
                <div className="text-2xl mb-2">🏆</div>
                <div
                  className="text-2xl font-bold mb-1 text-glow"
                  style={{ color: 'var(--accent-success)' }}
                >
                  {data.pr ? `${data.pr.weight} kg` : '--'}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  PR Atual
                </div>
                {data.pr && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {data.pr.reps} reps
                  </div>
                )}
              </div>

              <div className="card-neon text-center" style={{ padding: '24px' }}>
                <div className="text-2xl mb-2">📊</div>
                <div
                  className="text-2xl font-bold mb-1 text-glow"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {data.stats.totalSessions}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Sessões
                </div>
              </div>

              <div className="card-neon text-center" style={{ padding: '24px' }}>
                <div className="text-2xl mb-2">📈</div>
                <div
                  className="text-2xl font-bold mb-1 text-glow"
                  style={{
                    color: data.stats.trend !== null
                      ? data.stats.trend >= 0
                        ? 'var(--accent-success)'
                        : 'var(--accent-warning)'
                      : 'var(--text-muted)',
                  }}
                >
                  {data.stats.trend !== null
                    ? `${data.stats.trend >= 0 ? '+' : ''}${data.stats.trend} kg`
                    : '--'}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Evolução Total
                </div>
              </div>

              <div className="card-neon text-center" style={{ padding: '24px' }}>
                <div className="text-2xl mb-2">🗓️</div>
                <div
                  className="text-2xl font-bold mb-1 text-glow"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  {data.stats.daysSinceLast !== null ? data.stats.daysSinceLast : '--'}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Dias sem treinar
                </div>
              </div>
            </div>

            {/* Gráfico de evolução de peso */}
            <div className="card-neon mb-8" style={{ padding: '40px' }}>
              <h3
                className="text-xl font-bold mb-2 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Evolução de Carga
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Peso máximo e peso médio por sessão de treino
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.2)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Peso (kg)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'var(--text-muted)' },
                    }}
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
                  <Line
                    type="monotone"
                    dataKey="Peso Máximo"
                    stroke={CHART_COLORS.maxWeight}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.maxWeight, r: 4 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Peso Médio"
                    stroke={CHART_COLORS.avgWeight}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: CHART_COLORS.avgWeight, r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de volume */}
            <div className="card-neon mb-8" style={{ padding: '40px' }}>
              <h3
                className="text-xl font-bold mb-2 text-glow"
                style={{ color: 'var(--accent-success)' }}
              >
                Volume por Sessão
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Volume total = peso × repetições por sessão
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.2)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Volume (kg)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'var(--text-muted)' },
                    }}
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
                  <Bar
                    dataKey="Volume Total"
                    fill={CHART_COLORS.volume}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de histórico */}
            <div className="card-neon" style={{ padding: '40px' }}>
              <h3
                className="text-xl font-bold mb-6 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Histórico Completo
              </h3>
              <div className="overflow-x-auto">
                <table className="table-neon w-full">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Peso Máximo</th>
                      <th>Peso Médio</th>
                      <th>Reps (média)</th>
                      <th>Séries</th>
                      <th>Volume Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.history].reverse().map((entry, index) => (
                      <tr key={index}>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {formatDate(entry.date)}
                        </td>
                        <td className="font-bold" style={{ color: 'var(--accent-primary)' }}>
                          {entry.maxWeight} kg
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {entry.avgWeight} kg
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {entry.avgReps}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {entry.sets}
                        </td>
                        <td style={{ color: 'var(--accent-success)' }}>
                          {entry.totalVolume} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Estado inicial */}
        {!data && !loading && !error && (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
              Busque um exercício
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Digite o nome de um exercício para ver sua evolução completa de carga e volume.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
