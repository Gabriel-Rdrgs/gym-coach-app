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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import WorkoutHeatmap from '@/components/WorkoutHeatmap';

// Componente customizado de Tooltip com tema dark
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="recharts-custom-tooltip"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.98) !important',
          border: '1px solid #00d9ff !important',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
          color: '#ffffff !important',
          margin: 0,
        }}
      >
        <p style={{ margin: '0 0 8px 0', color: '#00d9ff', fontWeight: 'bold', background: 'transparent' }}>
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', color: '#ffffff', background: 'transparent' }}>
            <span style={{ color: entry.color || '#10b981' }}>{entry.name}</span>: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ProgressData {
  metrics: Array<{
    date: string;
    weight: number | null;
    waist: number | null;
    armCircumference: number | null;
    thighCircumference: number | null;
    chestCircumference: number | null;
    bodyFatPercentage: number | null;
    sleep: number | null;
    energy: number | null;
    stress: number | null;
  }>;
  workoutVolumes: Array<{
    date: string;
    volume: number;
    template: string;
    exerciseCount: number;
    totalSets: number;
  }>;
  validSets: Array<{
    date: string;
    totalValidSets: number;
    byMuscleGroup: { [key: string]: number };
    template: string;
  }>;
  validSetsByMuscleGroup: Array<{
    date: string;
    muscleGroup: string;
    validSets: number;
  }>;
  workoutFrequency: Array<{
    week: string;
    count: number;
  }>;
  muscleGroupFrequency: Array<{
    muscleGroup: string;
    count: number;
  }>;
  prs: Array<{
    date: string;
    weight: number;
    exercise: string;
    reps: number;
  }>;
  heatmapData: Array<{
    date: string;
    template?: string;
    totalValidSets?: number;
  }>;
}

const COLORS = {
  primary: '#00d9ff',
  secondary: '#a78bfa',
  success: '#10b981',
  warning: '#ef4444',
};

const CHART_COLORS = [
  '#00d9ff',
  '#a78bfa',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
];

// Função auxiliar para formatar datas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

// Função para calcular semana do ano
const getWeekOfYear = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
};

// Função para calcular média móvel
const calculateMovingAverage = (data: number[], window: number = 3): number[] => {
  if (data.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(data.length, i + Math.ceil(window / 2));
    const slice = data.slice(start, end);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(avg);
  }
  return result;
};

type PeriodFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all' | 'custom';
type MuscleGroupFilter = string | 'all';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroupFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  // Função para calcular data de início baseado no filtro de período
  const getStartDate = (period: PeriodFilter): Date | null => {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3m':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6m':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case 'custom':
        return customStartDate ? new Date(customStartDate) : null;
      case 'all':
      default:
        return null;
    }
  };

  // Função para filtrar dados por data
  const filterByDate = <T extends { date: string }>(items: T[], startDate: Date | null): T[] => {
    if (!startDate) return items;
    return items.filter((item) => new Date(item.date) >= startDate);
  };

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const progressData = await response.json();
        setData(progressData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de progresso:', error);
    } finally {
      setLoading(false);
    }
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
          Erro ao carregar dados de progresso
        </div>
      </div>
    );
  }

  // Aplicar filtro de período
  const startDate = getStartDate(periodFilter);
  const endDate = periodFilter === 'custom' && customEndDate ? new Date(customEndDate) : null;

  // Filtrar métricas com peso válido
  let weightData = data.metrics
    .filter((m) => m.weight !== null)
    .map((m) => ({
      date: m.date,
      peso: m.weight,
    }));
  weightData = filterByDate(weightData, startDate);
  if (endDate) {
    weightData = weightData.filter((item) => new Date(item.date) <= endDate);
  }
  weightData = weightData.map((m) => ({
    date: formatDate(m.date),
    peso: m.peso,
  }));

  // Preparar dados de métricas combinadas
  let metricsData = data.metrics
    .filter((m) => m.weight !== null || m.waist !== null || m.sleep !== null || 
                   m.armCircumference !== null || m.thighCircumference !== null || 
                   m.chestCircumference !== null)
    .map((m) => ({
      date: m.date,
      peso: m.weight,
      cintura: m.waist,
      braco: m.armCircumference,
      coxa: m.thighCircumference,
      peito: m.chestCircumference,
      gordura: m.bodyFatPercentage,
      sono: m.sleep,
    }));
  metricsData = filterByDate(metricsData, startDate);
  if (endDate) {
    metricsData = metricsData.filter((item) => new Date(item.date) <= endDate);
  }
  metricsData = metricsData.map((m) => ({
    date: formatDate(m.date),
    peso: m.peso,
    cintura: m.cintura,
    braco: m.braco,
    coxa: m.coxa,
    peito: m.peito,
    gordura: m.gordura,
    sono: m.sono,
  }));

  // Preparar dados de séries válidas
  let validSetsDataRaw = data.validSets.map((v) => ({
    date: v.date,
    seriesValidas: Math.round(v.totalValidSets * 10) / 10,
    template: v.template,
    byMuscleGroup: v.byMuscleGroup,
  }));
  validSetsDataRaw = filterByDate(validSetsDataRaw, startDate);
  if (endDate) {
    validSetsDataRaw = validSetsDataRaw.filter((item) => new Date(item.date) <= endDate);
  }
  // Aplicar filtro de grupo muscular se necessário
  if (muscleGroupFilter !== 'all') {
    validSetsDataRaw = validSetsDataRaw.map((v) => ({
      ...v,
      seriesValidas: v.byMuscleGroup[muscleGroupFilter] || 0,
    }));
  }
  const validSetsData = validSetsDataRaw.map((v) => ({
    date: formatDate(v.date),
    seriesValidas: v.seriesValidas,
    template: v.template,
  }));

  // Preparar dados de séries válidas por grupo muscular
  let validSetsByMuscleGroup = data.validSetsByMuscleGroup.map((v) => ({
    date: v.date,
    muscleGroup: v.muscleGroup,
    validSets: v.validSets,
  }));
  validSetsByMuscleGroup = filterByDate(validSetsByMuscleGroup, startDate);
  if (endDate) {
    validSetsByMuscleGroup = validSetsByMuscleGroup.filter((item) => new Date(item.date) <= endDate);
  }
  if (muscleGroupFilter !== 'all') {
    validSetsByMuscleGroup = validSetsByMuscleGroup.filter(
      (v) => v.muscleGroup === muscleGroupFilter
    );
  }
  validSetsByMuscleGroup = validSetsByMuscleGroup.map((v) => ({
    date: formatDate(v.date),
    muscleGroup: v.muscleGroup,
    validSets: v.validSets,
  }));

  // Preparar dados de frequência de treinos
  const frequencyData = data.workoutFrequency.map((f) => ({
    semana: f.week.split('-W')[1],
    treinos: f.count,
  }));

  // Preparar dados de grupos musculares (para o filtro)
  const availableMuscleGroups = Array.from(
    new Set(data.validSetsByMuscleGroup.map((v) => v.muscleGroup))
  ).sort();

  // Preparar dados de grupos musculares (para gráfico)
  const muscleGroupData = data.muscleGroupFrequency.slice(0, 6).map((m) => ({
    name: m.muscleGroup,
    value: m.count,
  }));

  // Preparar dados de PRs - agrupar por exercício e pegar o melhor de cada um
  let prsRaw = data.prs.map((pr) => ({
    date: pr.date,
    peso: pr.weight,
    reps: pr.reps,
    exercicio: pr.exercise,
  }));
  prsRaw = filterByDate(prsRaw, startDate);
  if (endDate) {
    prsRaw = prsRaw.filter((item) => new Date(item.date) <= endDate);
  }

  // Agrupar PRs por exercício e pegar o melhor de cada (maior peso, ou se igual, mais reps)
  const prsByExercise: { [key: string]: typeof prsRaw[0] } = {};
  prsRaw.forEach((pr) => {
    const key = pr.exercicio;
    if (!prsByExercise[key] || 
        pr.peso > prsByExercise[key].peso || 
        (pr.peso === prsByExercise[key].peso && pr.reps > prsByExercise[key].reps)) {
      prsByExercise[key] = pr;
    }
  });

  // Converter para array e ordenar por data (mais recente primeiro)
  const latestPRs = Object.values(prsByExercise)
    .map((pr) => ({
      exercicio: pr.exercicio,
      peso: pr.peso,
      reps: pr.reps,
      date: formatDate(pr.date),
      fullDate: pr.date,
    }))
    .sort((a, b) => new Date(b.fullDate).getTime() - new Date(a.fullDate).getTime());

  // Para gráfico de evolução por exercício (se houver múltiplos PRs do mesmo exercício)
  const prsByExerciseForChart: { [key: string]: typeof prsRaw } = {};
  prsRaw.forEach((pr) => {
    const key = pr.exercicio;
    if (!prsByExerciseForChart[key]) {
      prsByExerciseForChart[key] = [];
    }
    prsByExerciseForChart[key].push(pr);
  });

  // Preparar dados para gráfico (apenas exercícios com múltiplos PRs)
  const exercisesWithMultiplePRs = Object.entries(prsByExerciseForChart)
    .filter(([_, prs]) => prs.length > 1)
    .slice(0, 5); // Limitar a 5 exercícios para não poluir o gráfico

  // Preparar dados do gráfico - criar evolução contínua mantendo o melhor PR até o próximo
  const prsChartData: any[] = [];
  
  exercisesWithMultiplePRs.forEach(([exerciseName, prs]) => {
    // Ordenar PRs por data
    const sortedPRs = [...prs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Para cada PR, criar um ponto no gráfico
    sortedPRs.forEach((pr, index) => {
      // Encontrar ou criar entrada para esta data
      let entry = prsChartData.find(e => e.date === formatDate(pr.date));
      if (!entry) {
        entry = { date: formatDate(pr.date) };
        prsChartData.push(entry);
      }
      
      // Para este exercício, usar o peso deste PR
      // Se já existe um PR anterior para este exercício nesta data, usar o maior
      if (!entry[exerciseName] || pr.peso > entry[exerciseName]) {
        entry[exerciseName] = pr.peso;
      }
    });
  });

  // Ordenar por data
  prsChartData.sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  // Preencher valores faltantes com o último PR conhecido (carry forward)
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

  // Calcular estatísticas gerais
  const totalWorkouts = data.validSets.length;
  const totalValidSets = data.validSets.reduce(
    (sum, v) => sum + v.totalValidSets,
    0
  );
  const avgValidSets = totalWorkouts > 0 ? totalValidSets / totalWorkouts : 0;
  const latestWeight =
    weightData.length > 0 ? weightData[weightData.length - 1].peso : null;
  const firstWeight = weightData.length > 0 ? weightData[0].peso : null;
  const weightChange =
    latestWeight && firstWeight ? latestWeight - firstWeight : 0;

  // Calcular tendências e comparações de período
  const calculateTrend = (current: number, previous: number) => {
    if (!current || !previous) return null;
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    return { change, percentChange };
  };

  // Comparar últimas 2 semanas vs 2 semanas anteriores (para séries válidas)
  // Usar validSetsDataRaw que tem as datas completas para comparação
  const allValidSetsData = data.validSets.map((v) => ({
    date: new Date(v.date),
    seriesValidas: v.totalValidSets,
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  
  const recentWorkouts = allValidSetsData.filter(w => w.date >= twoWeeksAgo);
  const previousWorkouts = allValidSetsData.filter(w => w.date >= fourWeeksAgo && w.date < twoWeeksAgo);
  
  const recentAvgValidSets = recentWorkouts.length > 0
    ? recentWorkouts.reduce((sum, w) => sum + w.seriesValidas, 0) / recentWorkouts.length
    : 0;
  const previousAvgValidSets = previousWorkouts.length > 0
    ? previousWorkouts.reduce((sum, w) => sum + w.seriesValidas, 0) / previousWorkouts.length
    : 0;
  const validSetsTrend = calculateTrend(recentAvgValidSets, previousAvgValidSets);

  // Calcular progresso por grupo muscular (comparar últimos 30 dias vs 30 dias anteriores)
  // Usar dados originais antes da formatação de data
  const allValidSetsByGroup = data.validSetsByMuscleGroup.map((v) => ({
    date: new Date(v.date),
    muscleGroup: v.muscleGroup,
    validSets: v.validSets,
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const recentValidSetsByGroup = allValidSetsByGroup.filter((v) => v.date >= thirtyDaysAgo);
  const previousValidSetsByGroup = allValidSetsByGroup.filter((v) => 
    v.date >= sixtyDaysAgo && v.date < thirtyDaysAgo
  );

  // Agrupar por grupo muscular e calcular progresso
  const muscleGroupProgress: { [key: string]: { recent: number; previous: number; change: number } } = {};
  
  recentValidSetsByGroup.forEach((v) => {
    if (!muscleGroupProgress[v.muscleGroup]) {
      muscleGroupProgress[v.muscleGroup] = { recent: 0, previous: 0, change: 0 };
    }
    muscleGroupProgress[v.muscleGroup].recent += v.validSets;
  });

  previousValidSetsByGroup.forEach((v) => {
    if (!muscleGroupProgress[v.muscleGroup]) {
      muscleGroupProgress[v.muscleGroup] = { recent: 0, previous: 0, change: 0 };
    }
    muscleGroupProgress[v.muscleGroup].previous += v.validSets;
  });

  // Calcular mudança percentual
  Object.keys(muscleGroupProgress).forEach((group) => {
    const data = muscleGroupProgress[group];
    if (data.previous > 0) {
      data.change = ((data.recent - data.previous) / data.previous) * 100;
    } else if (data.recent > 0) {
      data.change = 100; // Novo grupo
    }
  });

  // Ordenar por progresso (maior mudança positiva primeiro)
  const topProgressingGroups = Object.entries(muscleGroupProgress)
    .filter(([_, data]) => data.recent > 0 || data.previous > 0)
    .map(([group, data]) => ({ group, ...data }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  return (
    <div className="flex justify-center min-h-screen py-12 px-6 md:px-12 lg:px-16">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h1
            className="text-5xl font-bold mb-6 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Progresso
          </h1>
          <p
            className="text-lg mb-8"
            style={{ color: 'var(--text-muted)' }}
          >
            Acompanhe sua evolução e conquistas
          </p>
        </div>

        {/* Filtros */}
        <div className="card-neon mb-16" style={{ padding: '24px' }}>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filtro de Período */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Período
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="input-neon w-full text-sm"
                style={{ cursor: 'pointer' }}
              >
                <option value="all">Todo o período</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último ano</option>
                <option value="custom">Período customizado</option>
              </select>
            </div>

            {/* Filtro de Período Customizado */}
            {periodFilter === 'custom' && (
              <>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input-neon w-full text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input-neon w-full text-sm"
                  />
                </div>
              </>
            )}

            {/* Filtro de Grupo Muscular */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Grupo Muscular
              </label>
              <select
                value={muscleGroupFilter}
                onChange={(e) => setMuscleGroupFilter(e.target.value)}
                className="input-neon w-full text-sm"
                style={{ cursor: 'pointer' }}
              >
                <option value="all">Todos os grupos</option>
                {availableMuscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Reset */}
            {(periodFilter !== 'all' || muscleGroupFilter !== 'all') && (
              <button
                onClick={() => {
                  setPeriodFilter('all');
                  setMuscleGroupFilter('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="btn-secondary text-sm px-4 py-2"
                style={{ height: 'fit-content' }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">🏋️</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              {totalWorkouts}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Treinos Totais
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">✅</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-success)' }}
            >
              {avgValidSets.toFixed(1)}
            </div>
            {validSetsTrend && (
              <div 
                className="text-xs mb-1"
                style={{ 
                  color: validSetsTrend.change >= 0 ? 'var(--accent-success)' : 'var(--accent-warning)'
                }}
              >
                {validSetsTrend.change >= 0 ? '↑' : '↓'} {Math.abs(validSetsTrend.percentChange).toFixed(1)}% vs período anterior
              </div>
            )}
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Séries Válidas Média
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">⚖️</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{
                color:
                  weightChange >= 0
                    ? 'var(--accent-success)'
                    : 'var(--accent-warning)',
              }}
            >
              {latestWeight ? `${latestWeight.toFixed(1)} kg` : '--'}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Peso Atual
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '32px' }}>
            <div className="text-3xl mb-3">📈</div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{
                color:
                  weightChange >= 0
                    ? 'var(--accent-success)'
                    : 'var(--accent-warning)',
              }}
            >
              {weightChange !== 0
                ? `${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)} kg`
                : '--'}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Variação de Peso
            </div>
          </div>
        </div>

        {/* Seção: Métricas Corporais */}
        <div className="mb-20">
          <h2
            className="text-3xl font-bold mb-12 text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            📊 Métricas Corporais
          </h2>

          {/* Cards de Estatísticas de Métricas Corporais */}
          {metricsData.length > 0 && (() => {
            const latestMetrics = metricsData[metricsData.length - 1];
            const firstMetrics = metricsData[0];
            
            const calculateChange = (current: number | null, first: number | null) => {
              if (!current || !first) return null;
              return current - first;
            };

            const metricCards = [
              { 
                label: 'Cintura', 
                current: latestMetrics.cintura, 
                change: calculateChange(latestMetrics.cintura, firstMetrics.cintura),
                unit: 'cm',
                icon: '📏'
              },
              { 
                label: 'Braço', 
                current: latestMetrics.braco, 
                change: calculateChange(latestMetrics.braco, firstMetrics.braco),
                unit: 'cm',
                icon: '💪'
              },
              { 
                label: 'Coxa', 
                current: latestMetrics.coxa, 
                change: calculateChange(latestMetrics.coxa, firstMetrics.coxa),
                unit: 'cm',
                icon: '🦵'
              },
              { 
                label: 'Peito', 
                current: latestMetrics.peito, 
                change: calculateChange(latestMetrics.peito, firstMetrics.peito),
                unit: 'cm',
                icon: '💪'
              },
              { 
                label: '% Gordura', 
                current: latestMetrics.gordura, 
                change: calculateChange(latestMetrics.gordura, firstMetrics.gordura),
                unit: '%',
                icon: '📊'
              },
            ].filter(card => card.current !== null);

            if (metricCards.length > 0) {
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                  {metricCards.map((card, index) => (
                    <div key={index} className="card-neon text-center" style={{ padding: '20px' }}>
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <div className="text-lg font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
                        {card.current?.toFixed(1)} {card.unit}
                      </div>
                      {card.change !== null && (
                        <div 
                          className="text-xs"
                          style={{ 
                            color: card.change >= 0 ? 'var(--accent-success)' : 'var(--accent-warning)'
                          }}
                        >
                          {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)} {card.unit}
                        </div>
                      )}
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {/* Gráfico de Evolução de Circunferências */}
          {metricsData.length > 0 && (() => {
            const hasCircumferences = metricsData.some(m => 
              m.braco !== null || m.coxa !== null || m.peito !== null || m.cintura !== null
            );
            
            if (hasCircumferences) {
              return (
                <div className="card-neon mb-16" style={{ padding: '40px' }}>
                  <h2
                    className="text-2xl font-bold mb-8 text-glow"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    📏 Evolução de Circunferências
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    Acompanhe a evolução das suas medidas corporais ao longo do tempo
                  </p>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={metricsData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0, 217, 255, 0.2)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="var(--text-muted)"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'cm', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)' } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metricsData.some(m => m.cintura !== null) && (
                        <Line
                          type="monotone"
                          dataKey="cintura"
                          stroke={CHART_COLORS[0]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[0], r: 4 }}
                          name="Cintura (cm)"
                          connectNulls
                        />
                      )}
                      {metricsData.some(m => m.braco !== null) && (
                        <Line
                          type="monotone"
                          dataKey="braco"
                          stroke={CHART_COLORS[1]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[1], r: 4 }}
                          name="Braço (cm)"
                          connectNulls
                        />
                      )}
                      {metricsData.some(m => m.coxa !== null) && (
                        <Line
                          type="monotone"
                          dataKey="coxa"
                          stroke={CHART_COLORS[2]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[2], r: 4 }}
                          name="Coxa (cm)"
                          connectNulls
                        />
                      )}
                      {metricsData.some(m => m.peito !== null) && (
                        <Line
                          type="monotone"
                          dataKey="peito"
                          stroke={CHART_COLORS[3]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[3], r: 4 }}
                          name="Peito (cm)"
                          connectNulls
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            }
            return null;
          })()}

          {/* Gráfico de Evolução de % Gordura */}
          {metricsData.length > 0 && metricsData.some(m => m.gordura !== null) && (
            <div className="card-neon mb-16" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                📊 Evolução de Percentual de Gordura
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsData.map((m, i) => {
                  const gorduraValues = metricsData.map(d => d.gordura).filter(g => g !== null) as number[];
                  const movingAvg = calculateMovingAverage(gorduraValues, 3);
                  return {
                    ...m,
                    mediaMovel: movingAvg[i] || m.gordura,
                  };
                })}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="gordura"
                    stroke={CHART_COLORS[4]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[4], r: 4 }}
                    name="% Gordura"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="mediaMovel"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Média Móvel (3 pontos)"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Evolução de Peso */}
          {weightData.length > 0 && (
            <div className="card-neon mb-16" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                ⚖️ Evolução de Peso
              </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData.map((w, i) => {
                const weights = weightData.map(d => d.peso).filter(p => p !== null) as number[];
                const movingAvg = calculateMovingAverage(weights, 3);
                return {
                  ...w,
                  mediaMovel: movingAvg[i] || w.peso,
                };
              })}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 217, 255, 0.2)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  name="Peso (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="mediaMovel"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Média Móvel (3 pontos)"
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Seção: Análise de Treino */}
        <div className="mb-20">
          <h2
            className="text-3xl font-bold mb-12 text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            💪 Análise de Treino
          </h2>

          
          {/* Heatmap de Treinos */}
          <div className="mb-16">
            <WorkoutHeatmap workouts={data.heatmapData || []} />
          </div>
{/* Cards de Progresso por Grupo Muscular */}
          {topProgressingGroups.length > 0 && (
            <div className="card-neon mb-16" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                📈 Grupos Musculares em Maior Progresso
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Comparação: últimos 30 dias vs 30 dias anteriores
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topProgressingGroups.map((item, index) => (
                  <div
                    key={index}
                    className="card-neon"
                    style={{
                      padding: '20px',
                      border: item.change >= 0 ? '2px solid var(--accent-success)' : '2px solid var(--accent-warning)',
                      background: item.change >= 0 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <div className="text-sm mb-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      {item.group}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          Recente: {item.recent.toFixed(1)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Anterior: {item.previous.toFixed(1)}
                        </div>
                      </div>
                      <div 
                        className="text-xl font-bold"
                        style={{ 
                          color: item.change >= 0 ? 'var(--accent-success)' : 'var(--accent-warning)'
                        }}
                      >
                        {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas de Frequência */}
          {data.workoutFrequency.length > 0 && (() => {
            // Calcular frequência semanal
            const weeklyFrequency = data.workoutFrequency.map(f => f.count);
            const avgWeeklyFrequency = weeklyFrequency.length > 0
              ? weeklyFrequency.reduce((sum, count) => sum + count, 0) / weeklyFrequency.length
              : 0;

            return (
              <div className="card-neon mb-16" style={{ padding: '40px' }}>
                <h2
                  className="text-2xl font-bold mb-8 text-glow"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  📊 Estatísticas de Frequência
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
                      {avgWeeklyFrequency.toFixed(1)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Treinos por Semana (média)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-secondary)' }}>
                      {Math.max(...weeklyFrequency, 0)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Máximo em uma Semana
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-success)' }}>
                      {weeklyFrequency.length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Semanas com Treinos
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Gráfico de Séries Válidas */}
          {validSetsData.length > 0 && (
            <div className="card-neon mb-16" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Séries Válidas por Treino
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Baseado em RIR: RIR {'>'} 3 = 0, RIR 2-3 = 0.5, RIR {'<'} 2 = 1 série válida
              </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={validSetsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 217, 255, 0.2)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="seriesValidas"
                  fill={COLORS.success}
                  name="Séries Válidas"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Seção: Análise Detalhada */}
        <div className="mb-20">
          <h2
            className="text-3xl font-bold mb-12 text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            📈 Análise Detalhada
          </h2>

          {/* Gráficos em Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Gráfico de Métricas Combinadas */}
            {metricsData.length > 0 && (
              <div className="card-neon" style={{ padding: '40px' }}>
                <h2
                  className="text-2xl font-bold mb-8 text-glow"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Métricas Combinadas
                </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
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
                  {metricsData.some((m) => m.peso !== null) && (
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary, r: 4 }}
                      name="Peso (kg)"
                    />
                  )}
                  {metricsData.some((m) => m.cintura !== null) && (
                    <Line
                      type="monotone"
                      dataKey="cintura"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.secondary, r: 4 }}
                      name="Cintura (cm)"
                    />
                  )}
                  {metricsData.some((m) => m.braco !== null) && (
                    <Line
                      type="monotone"
                      dataKey="braco"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      name="Braço (cm)"
                    />
                  )}
                  {metricsData.some((m) => m.coxa !== null) && (
                    <Line
                      type="monotone"
                      dataKey="coxa"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      name="Coxa (cm)"
                    />
                  )}
                  {metricsData.some((m) => m.peito !== null) && (
                    <Line
                      type="monotone"
                      dataKey="peito"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                      name="Peito (cm)"
                    />
                  )}
                  {metricsData.some((m) => m.gordura !== null) && (
                    <Line
                      type="monotone"
                      dataKey="gordura"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 4 }}
                      name="% Gordura"
                    />
                  )}
                  {metricsData.some((m) => m.sono !== null) && (
                    <Line
                      type="monotone"
                      dataKey="sono"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      dot={{ fill: COLORS.success, r: 4 }}
                      name="Sono (h)"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

            {/* Gráfico de Frequência de Treinos */}
            {frequencyData.length > 0 && (
              <div className="card-neon" style={{ padding: '40px' }}>
                <h2
                  className="text-2xl font-bold mb-8 text-glow"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Frequência de Treinos
                </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequencyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="semana"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
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
                    dataKey="treinos"
                    fill={COLORS.success}
                    name="Treinos por Semana"
                    radius={[8, 8, 0, 0]}
                  />
              </BarChart>
            </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Seção: Distribuição e PRs */}
        <div className="mb-20">
          <h2
            className="text-3xl font-bold mb-16 text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            🏆 Distribuição e Personal Records
          </h2>

          {/* Gráfico de Grupos Musculares */}
          {muscleGroupData.length > 0 && (
            <div className="card-neon mb-24" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Grupos Musculares Mais Trabalhados
              </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={muscleGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {muscleGroupData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Espaçamento entre gráficos */}
        <div style={{ height: '40px' }}></div>

        {/* Gráfico de Séries Válidas por Grupo Muscular */}
        {validSetsByMuscleGroup && validSetsByMuscleGroup.length > 0 && (() => {
          // Agrupar dados por data e criar estrutura para múltiplas linhas
          const uniqueDates = Array.from(new Set(validSetsByMuscleGroup.map((d) => d.date))).sort();
          const uniqueGroups = Array.from(new Set(validSetsByMuscleGroup.map((d) => d.muscleGroup))).slice(0, 6);
          
          const chartData = uniqueDates.map((date) => {
            const entry: any = { date: formatDate(date) };
            uniqueGroups.forEach((group) => {
              const groupData = validSetsByMuscleGroup.find(
                (d) => d.date === date && d.muscleGroup === group
              );
              entry[group] = groupData ? groupData.validSets : null;
            });
            return entry;
          });

          return (
            <div className="card-neon mb-24" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Evolução de Séries Válidas por Grupo Muscular
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
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
                  {uniqueGroups.map((muscleGroup, index) => {
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                      <Line
                        key={muscleGroup}
                        type="monotone"
                        dataKey={muscleGroup}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 3 }}
                        name={muscleGroup}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Espaçamento entre gráficos */}
        <div style={{ height: '48px' }}></div>

          {/* PRs - Cards dos Melhores PRs */}
          {latestPRs.length > 0 && (
            <div className="card-neon mb-16" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                🏆 Seus Melhores Personal Records
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {latestPRs.map((pr, index) => (
                  <div
                    key={index}
                    className="card-neon"
                    style={{
                      padding: '20px',
                      border: '2px solid var(--accent-success)',
                      background: 'rgba(16, 185, 129, 0.1)',
                    }}
                  >
                    <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      {pr.exercicio}
                    </div>
                    <div className="text-2xl font-bold mb-1 text-glow" style={{ color: 'var(--accent-success)' }}>
                      {pr.peso.toFixed(1)} kg × {pr.reps} reps
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {pr.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico de Evolução de PRs por Exercício (apenas exercícios com múltiplos PRs) */}
          {exercisesWithMultiplePRs.length > 0 && (
            <div className="card-neon" style={{ padding: '40px' }}>
              <h2
                className="text-2xl font-bold mb-8 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                Evolução de PRs por Exercício
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Mostrando exercícios com múltiplos PRs registrados
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={prsChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 217, 255, 0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {exercisesWithMultiplePRs.map(([exerciseName], index) => {
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
          )}
        </div>
      </div>
    </div>
  );
}

