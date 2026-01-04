import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { calculateValidSetsForWorkout } from '@/lib/progress-utils';

// Forçar renderização dinâmica (não pré-renderizar durante build)
export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo da semana atual
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [recentWorkouts, recentMetrics, totalExercises, totalWorkouts, allWorkouts, allMetrics] = await Promise.all([
    prisma.workout.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    }),
    prisma.metric.findMany({
      take: 1,
      orderBy: { date: 'desc' },
    }),
    prisma.exercise.count(),
    prisma.workout.count(),
    prisma.workout.findMany({
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.metric.findMany({
      orderBy: { date: 'desc' },
    }),
  ]);

  const latestMetric = recentMetrics[0] || null;
  const totalMetrics = await prisma.metric.count();

  // Calcular estatísticas da semana atual
  const thisWeekWorkouts = allWorkouts.filter(w => new Date(w.date) >= startOfWeek);
  const lastWeekWorkouts = allWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= startOfLastWeek && workoutDate < startOfWeek;
  });

  // Calcular séries válidas
  const calculateWeekValidSets = (workouts: any[]) => {
    return workouts.reduce((sum, workout) => {
      const workoutFormatted = {
        date: workout.date,
        exercises: workout.exercises.map((ex: any) => ({
          exercise: {
            muscleGroup: ex.exercise?.muscleGroup || '',
            name: ex.exercise?.name || '',
            type: ex.exercise?.type || 'isolation',
          },
          sets: ex.sets.map((set: any) => ({
            rir: set.rir,
            weight: set.weight,
            reps: set.reps,
          })),
        })),
      };
      const result = calculateValidSetsForWorkout(workoutFormatted);
      return sum + result.totalValidSets;
    }, 0);
  };

  const thisWeekValidSets = calculateWeekValidSets(thisWeekWorkouts);
  const lastWeekValidSets = calculateWeekValidSets(lastWeekWorkouts);

  // Calcular média semanal de treinos (últimas 4 semanas)
  const fourWeeksAgo = new Date(startOfWeek);
  fourWeeksAgo.setDate(startOfWeek.getDate() - 28);
  const recentWorkoutsForAvg = allWorkouts.filter(w => new Date(w.date) >= fourWeeksAgo);
  const weeklyCounts: { [key: string]: number } = {};
  recentWorkoutsForAvg.forEach(workout => {
    const workoutDate = new Date(workout.date);
    const weekStart = new Date(workoutDate);
    weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
  });
  const avgWeeklyWorkouts = Object.keys(weeklyCounts).length > 0
    ? Object.values(weeklyCounts).reduce((a, b) => a + b, 0) / Object.keys(weeklyCounts).length
    : 0;

  // Calcular tendência de peso
  const thisMonthMetrics = allMetrics.filter(m => new Date(m.date) >= startOfMonth);
  const lastMonthMetrics = allMetrics.filter(m => {
    const metricDate = new Date(m.date);
    return metricDate >= startOfLastMonth && metricDate <= endOfLastMonth;
  });
  
  const thisMonthAvgWeight = thisMonthMetrics.length > 0 && thisMonthMetrics[0].weight
    ? thisMonthMetrics.reduce((sum, m) => sum + (m.weight || 0), 0) / thisMonthMetrics.filter(m => m.weight).length
    : null;
  const lastMonthAvgWeight = lastMonthMetrics.length > 0 && lastMonthMetrics[0].weight
    ? lastMonthMetrics.reduce((sum, m) => sum + (m.weight || 0), 0) / lastMonthMetrics.filter(m => m.weight).length
    : null;

  const weightTrend = thisMonthAvgWeight && lastMonthAvgWeight
    ? thisMonthAvgWeight - lastMonthAvgWeight
    : null;

  return {
    recentWorkouts,
    latestMetric,
    totalExercises,
    totalWorkouts,
    totalMetrics,
    // Estatísticas avançadas
    thisWeekWorkouts: thisWeekWorkouts.length,
    lastWeekWorkouts: lastWeekWorkouts.length,
    thisWeekValidSets,
    lastWeekValidSets,
    avgWeeklyWorkouts,
    weightTrend,
    thisMonthAvgWeight,
  };
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

const calculateValidSets = (workout: any) => {
  // Converter o workout para o formato esperado pela função
  const workoutFormatted = {
    date: workout.date,
    exercises: workout.exercises.map((ex: any) => ({
      exercise: {
        muscleGroup: ex.exercise?.muscleGroup || '',
        name: ex.exercise?.name || '',
        type: ex.exercise?.type || 'isolation',
      },
      sets: ex.sets.map((set: any) => ({
        rir: set.rir,
        weight: set.weight,
        reps: set.reps,
      })),
    })),
  };
  
  const result = calculateValidSetsForWorkout(workoutFormatted);
  return result.totalValidSets;
};

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto px-8 py-12 lg:ml-0">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-4 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Dashboard
          </h1>
          <p 
            className="text-xl font-light"
            style={{ color: 'var(--text-muted)' }}
          >
            Seu Personal Trainer Digital
          </p>
        </div>

        {/* Stats Cards - Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="card-neon text-center" style={{ padding: '40px 32px' }}>
            <div className="text-5xl mb-6">🏋️</div>
            <div className="text-4xl font-bold mb-3 text-glow" style={{ color: 'var(--accent-primary)' }}>
              {stats.totalWorkouts}
            </div>
            <div className="text-base font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Treinos
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '40px 32px' }}>
            <div className="text-5xl mb-6">💪</div>
            <div className="text-4xl font-bold mb-3 text-glow" style={{ color: 'var(--accent-secondary)' }}>
              {stats.totalExercises}
            </div>
            <div className="text-base font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Exercícios
            </div>
          </div>

          <div className="card-neon text-center" style={{ padding: '40px 32px' }}>
            <div className="text-5xl mb-6">📊</div>
            <div className="text-4xl font-bold mb-3 text-glow" style={{ color: 'var(--accent-success)' }}>
              {stats.totalMetrics}
            </div>
            <div className="text-base font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Métricas
            </div>
          </div>

          {stats.latestMetric && stats.latestMetric.weight ? (
            <div className="card-neon text-center" style={{ padding: '40px 32px' }}>
              <div className="text-5xl mb-6">⚖️</div>
              <div className="text-4xl font-bold mb-3 text-glow" style={{ color: 'var(--accent-primary)' }}>
                {stats.latestMetric.weight.toFixed(1)} kg
              </div>
              <div className="text-base font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Peso Atual
              </div>
            </div>
          ) : (
            <div className="card-neon text-center" style={{ padding: '40px 32px', opacity: 0.6 }}>
              <div className="text-5xl mb-6">⚖️</div>
              <div className="text-4xl font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                --
              </div>
              <div className="text-base font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Peso Atual
              </div>
            </div>
          )}
        </div>

        {/* Estatísticas Avançadas - Segunda Linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Treinos Esta Semana */}
          <div className="card-neon" style={{ padding: '32px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📅</div>
              {stats.lastWeekWorkouts > 0 && (
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  stats.thisWeekWorkouts >= stats.lastWeekWorkouts ? 'text-green-400' : 'text-red-400'
                }`} style={{
                  background: stats.thisWeekWorkouts >= stats.lastWeekWorkouts 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                }}>
                  {stats.thisWeekWorkouts >= stats.lastWeekWorkouts ? '↑' : '↓'} {Math.abs(stats.thisWeekWorkouts - stats.lastWeekWorkouts)}
                </div>
              )}
            </div>
            <div className="text-3xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-primary)' }}>
              {stats.thisWeekWorkouts}
            </div>
            <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Treinos Esta Semana
            </div>
            {stats.lastWeekWorkouts > 0 && (
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Semana passada: {stats.lastWeekWorkouts}
              </div>
            )}
          </div>

          {/* Séries Válidas Esta Semana */}
          <div className="card-neon" style={{ padding: '32px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">✅</div>
              {stats.lastWeekValidSets > 0 && (
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  stats.thisWeekValidSets >= stats.lastWeekValidSets ? 'text-green-400' : 'text-red-400'
                }`} style={{
                  background: stats.thisWeekValidSets >= stats.lastWeekValidSets 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                }}>
                  {stats.thisWeekValidSets >= stats.lastWeekValidSets ? '↑' : '↓'} {Math.abs(stats.thisWeekValidSets - stats.lastWeekValidSets).toFixed(1)}
                </div>
              )}
            </div>
            <div className="text-3xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-success)' }}>
              {stats.thisWeekValidSets.toFixed(1)}
            </div>
            <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Séries Válidas
            </div>
            {stats.lastWeekValidSets > 0 && (
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Semana passada: {stats.lastWeekValidSets.toFixed(1)}
              </div>
            )}
          </div>

          {/* Média Semanal */}
          <div className="card-neon" style={{ padding: '32px' }}>
            <div className="text-3xl mb-4">📈</div>
            <div className="text-3xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-secondary)' }}>
              {stats.avgWeeklyWorkouts.toFixed(1)}
            </div>
            <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Média Semanal
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Últimas 4 semanas
            </div>
          </div>

          {/* Tendência de Peso */}
          {stats.weightTrend !== null ? (
            <div className="card-neon" style={{ padding: '32px' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⚖️</div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  stats.weightTrend >= 0 ? 'text-green-400' : 'text-red-400'
                }`} style={{
                  background: stats.weightTrend >= 0 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                }}>
                  {stats.weightTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.weightTrend).toFixed(1)} kg
                </div>
              </div>
              <div className="text-3xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-primary)' }}>
                {stats.thisMonthAvgWeight?.toFixed(1)} kg
              </div>
              <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Média do Mês
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                vs. mês anterior
              </div>
            </div>
          ) : (
            <div className="card-neon" style={{ padding: '32px', opacity: 0.6 }}>
              <div className="text-3xl mb-4">⚖️</div>
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                --
              </div>
              <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Tendência de Peso
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Dados insuficientes
              </div>
            </div>
          )}
        </div>

        {/* Espaçamento vertical entre seções */}
        <div style={{ height: '64px' }}></div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-14 mb-20">
          {/* Quick Actions - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="card-neon" style={{ padding: '48px' }}>
              <h2 
                className="text-3xl font-bold mb-12"
                style={{ color: 'var(--accent-primary)' }}
              >
                Ações Rápidas
              </h2>
              <div className="space-y-8">
                <Link href="/workouts">
                  <div className="action-card-blue group">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">🏋️</div>
                      <div className="flex-1">
                        <div className="font-bold text-xl mb-2 transition-all" style={{ color: 'var(--accent-primary)' }}>
                          Novo Treino
                        </div>
                        <div className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          Crie e registre um novo treino com séries, pesos e progresso
                        </div>
                      </div>
                      <div className="text-2xl transition-transform group-hover:translate-x-2" style={{ color: 'var(--accent-primary)' }}>→</div>
                    </div>
                  </div>
                </Link>

                <Link href="/metrics">
                  <div className="action-card-purple group">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">📊</div>
                      <div className="flex-1">
                        <div className="font-bold text-xl mb-2 transition-all" style={{ color: 'var(--accent-secondary)' }}>
                          Registrar Métrica
                        </div>
                        <div className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          Adicione peso, cintura, sono, energia e estresse
                        </div>
                      </div>
                      <div className="text-2xl transition-transform group-hover:translate-x-2" style={{ color: 'var(--accent-secondary)' }}>→</div>
                    </div>
                  </div>
                </Link>

                <Link href="/exercises">
                  <div className="action-card-blue group">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">💪</div>
                      <div className="flex-1">
                        <div className="font-bold text-xl mb-2 transition-all" style={{ color: 'var(--accent-primary)' }}>
                          Ver Exercícios
                        </div>
                        <div className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          Explore nossa biblioteca completa de exercícios
                        </div>
                      </div>
                      <div className="text-2xl transition-transform group-hover:translate-x-2" style={{ color: 'var(--accent-primary)' }}>→</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Metric - Takes 1 column */}
          {stats.latestMetric && (
            <div className="card-neon" style={{ padding: '48px' }}>
              <h2 
                className="text-3xl font-bold mb-12"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Última Métrica
              </h2>
              <div className="space-y-8">
                <div className="pb-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                  <div className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Data
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(stats.latestMetric.date)}
                  </div>
                </div>

                {stats.latestMetric.weight && (
                  <div className="pb-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                    <div className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Peso
                    </div>
                    <div className="text-2xl font-bold text-glow" style={{ color: 'var(--accent-primary)' }}>
                      {stats.latestMetric.weight.toFixed(1)} kg
                    </div>
                  </div>
                )}

                {stats.latestMetric.waist && (
                  <div className="pb-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                    <div className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Cintura
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {stats.latestMetric.waist.toFixed(1)} cm
                    </div>
                  </div>
                )}

                {stats.latestMetric.sleep && (
                  <div className="pb-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                    <div className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Sono
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
                      {stats.latestMetric.sleep.toFixed(1)}h
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {stats.latestMetric.energy !== null && (
                    <div>
                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Energia
                      </div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                        {stats.latestMetric.energy}/5
                      </div>
                    </div>
                  )}

                  {stats.latestMetric.stress !== null && (
                    <div>
                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Estresse
                      </div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                        {stats.latestMetric.stress}/5
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/metrics" className="block mt-8">
                  <div className="btn-secondary w-full text-center py-4 text-base font-semibold">
                    Ver Todas as Métricas
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Espaçamento vertical entre seções */}
        <div style={{ height: '64px' }}></div>

        {/* Recent Workouts Section */}
        <div className="card-neon" style={{ padding: '48px' }}>
          <div className="flex items-center justify-between mb-14">
            <h2 
              className="text-3xl font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Treinos Recentes
            </h2>
            <Link href="/workouts/list">
              <span 
                className="text-base font-semibold hover:underline transition-all inline-flex items-center gap-2"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Ver todos
                <span>→</span>
              </span>
            </Link>
          </div>

          {stats.recentWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 opacity-50">🏋️</div>
              <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-xl">
                Nenhum treino registrado ainda.
              </p>
              <Link href="/workouts">
                <div className="btn-primary inline-block px-8 py-4 text-base">
                  Criar Primeiro Treino
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {stats.recentWorkouts.map((workout) => {
                const validSets = calculateValidSets(workout);
                const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);

                return (
                  <Link key={workout.id} href={`/workouts/${workout.id}`}>
                    <div className="workout-card group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3 transition-all" style={{ color: 'var(--accent-primary)' }}>
                            {workout.template}
                          </h3>
                          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(workout.date)}
                          </p>
                        </div>
                        <div className="text-right ml-12">
                          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                            Séries Válidas
                          </div>
                          <div className="text-3xl font-bold text-glow mb-3" style={{ color: 'var(--accent-primary)' }}>
                            {validSets.toFixed(1)}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {workout.exercises.length} exercícios • {totalSets} séries
                          </div>
                        </div>
                        <div className="ml-8 text-2xl opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" style={{ color: 'var(--accent-primary)' }}>
                          →
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
