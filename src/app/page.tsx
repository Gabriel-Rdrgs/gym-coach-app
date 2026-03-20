import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";
import { calculateValidSetsForWorkout } from '@/lib/progress-utils';
import { getTodayWorkoutData } from '@/lib/queries/today-workout';
import TodayWorkout from '@/components/TodayWorkout';

// Forçar renderização dinâmica (não pré-renderizar durante build)
export const dynamic = 'force-dynamic';

async function getStats(userId: string | null) {
  try {
    if (!userId) {
      let totalExercises = 0
      try {
        totalExercises = await prisma.exercise.count()
      } catch {
        totalExercises = 0
      }
      return {
        recentWorkouts: [],
        latestMetric: null,
        totalExercises,
        totalWorkouts: 0,
        totalMetrics: 0,
        thisWeekWorkouts: 0,
        lastWeekWorkouts: 0,
        thisWeekValidSets: 0,
        lastWeekValidSets: 0,
        avgWeeklyWorkouts: 0,
        weightTrend: null,
        thisMonthAvgWeight: null,
        streak: 0,
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const fourWeeksAgo = new Date(startOfWeek);
    fourWeeksAgo.setDate(startOfWeek.getDate() - 28);

    const userWhere = { userId };

    // Queries em sequência, todas filtradas por usuário
    const recentWorkouts = await prisma.workout.findMany({
      where: userWhere,
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    });
    const recentMetrics = await prisma.metric.findMany({
      where: userWhere,
      take: 1,
      orderBy: { date: 'desc' },
    });
    const latestMetric = recentMetrics[0] || null;

    const totalExercises = await prisma.exercise.count();
    const totalWorkouts = await prisma.workout.count({ where: userWhere });
    const totalMetrics = await prisma.metric.count({ where: userWhere });

    // Só treinos das últimas 2 semanas (não todos) para séries válidas
    const workoutsLastTwoWeeks = await prisma.workout.findMany({
      where: { ...userWhere, date: { gte: startOfLastWeek } },
      orderBy: { date: 'asc' },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    });
    const thisWeekWorkouts = workoutsLastTwoWeeks.filter((w) => new Date(w.date) >= startOfWeek);
    const lastWeekWorkouts = workoutsLastTwoWeeks.filter((w) => {
      const d = new Date(w.date);
      return d >= startOfLastWeek && d < startOfWeek;
    });

    const calculateWeekValidSets = (workouts: typeof workoutsLastTwoWeeks) =>
      workouts.reduce((sum, workout) => {
        const formatted = {
          date: workout.date,
          exercises: workout.exercises.map((ex) => ({
            exercise: {
              muscleGroup: ex.exercise?.muscleGroup ?? '',
              name: ex.exercise?.name ?? '',
              type: ex.exercise?.type ?? 'isolation',
            },
            sets: ex.sets.map((s) => ({ rir: s.rir, weight: s.weight, reps: s.reps })),
          })),
        };
        return sum + calculateValidSetsForWorkout(formatted).totalValidSets;
      }, 0);
    const thisWeekValidSets = calculateWeekValidSets(thisWeekWorkouts);
    const lastWeekValidSets = calculateWeekValidSets(lastWeekWorkouts);

    // Média semanal: só treinos das últimas 4 semanas (só campo date)
    const workoutsFourWeeks = await prisma.workout.findMany({
      where: { ...userWhere, date: { gte: fourWeeksAgo } },
      select: { date: true },
    });
    const weeklyCounts: Record<string, number> = {};
    workoutsFourWeeks.forEach((w) => {
      const d = new Date(w.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().split('T')[0];
      weeklyCounts[key] = (weeklyCounts[key] ?? 0) + 1;
    });
    const avgWeeklyWorkouts =
      Object.keys(weeklyCounts).length > 0
        ? Object.values(weeklyCounts).reduce((a, b) => a + b, 0) / Object.keys(weeklyCounts).length
        : 0;

    // Tendência de peso: só métricas desde o mês passado
    const metricsForTrend = await prisma.metric.findMany({
      where: { ...userWhere, date: { gte: startOfLastMonth } },
      select: { date: true, weight: true },
      orderBy: { date: 'desc' },
    });
    const thisMonthMetrics = metricsForTrend.filter((m) => new Date(m.date) >= startOfMonth);
    const lastMonthMetrics = metricsForTrend.filter((m) => {
      const d = new Date(m.date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });
    const withWeight = (arr: typeof thisMonthMetrics) =>
      arr.filter((m) => m.weight != null) as Array<{ date: Date; weight: number }>;
    const thisMonthAvgWeight =
      withWeight(thisMonthMetrics).length > 0
        ? withWeight(thisMonthMetrics).reduce((s, m) => s + m.weight, 0) / withWeight(thisMonthMetrics).length
        : null;
    const lastMonthAvgWeight =
      withWeight(lastMonthMetrics).length > 0
        ? withWeight(lastMonthMetrics).reduce((s, m) => s + m.weight, 0) / withWeight(lastMonthMetrics).length
        : null;
    const weightTrend =
      thisMonthAvgWeight != null && lastMonthAvgWeight != null
        ? thisMonthAvgWeight - lastMonthAvgWeight
        : null;
          // Calcular streak de dias consecutivos treinando
    const allWorkoutDates = await prisma.workout.findMany({
      where: userWhere,
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    // Conjunto de dias únicos com treino (formato YYYY-MM-DD)
    const trainingDays = new Set(
      allWorkoutDates.map((w) =>
        new Date(w.date).toISOString().split('T')[0]
      )
    );

    // Contar dias consecutivos até hoje
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 365; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().split('T')[0];
      if (trainingDays.has(key)) {
        streak++;
      } else {
        break; // Quebrou a sequência
      }
    }


    return {
      recentWorkouts,
      latestMetric,
      totalExercises,
      totalWorkouts,
      totalMetrics,
      thisWeekWorkouts: thisWeekWorkouts.length,
      lastWeekWorkouts: lastWeekWorkouts.length,
      thisWeekValidSets,
      lastWeekValidSets,
      avgWeeklyWorkouts,
      weightTrend,
      thisMonthAvgWeight,
      streak, // <<< NOVO
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      recentWorkouts: [],
      latestMetric: null,
      totalExercises: 0,
      totalWorkouts: 0,
      totalMetrics: 0,
      thisWeekWorkouts: 0,
      lastWeekWorkouts: 0,
      thisWeekValidSets: 0,
      lastWeekValidSets: 0,
      avgWeeklyWorkouts: 0,
      weightTrend: null,
      thisMonthAvgWeight: null,
      streak: 0,
    };
  }
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

const calculateValidSets = (workout: {
  date: Date;
  exercises: Array<{
    exercise: { muscleGroup: string | null; name: string; type?: string | null };
    sets: Array<{ rir: number | null; weight: number; reps: number }>;
  }>;
}) => {
  const formatted = {
    date: workout.date,
    exercises: workout.exercises.map((ex) => ({
      exercise: {
        muscleGroup: ex.exercise?.muscleGroup ?? '',
        name: ex.exercise?.name ?? '',
        type: ex.exercise?.type ?? 'isolation',
      },
      sets: ex.sets.map((s) => ({ rir: s.rir, weight: s.weight, reps: s.reps })),
    })),
  };
  return calculateValidSetsForWorkout(formatted).totalValidSets;
};

export default async function Home() {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  // SE NÃO HOUVER SESSÃO, REDIRECIONA PARA /login
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  let stats;
  try {
    stats = await getStats(userId);
  } catch (error) {
    console.error('Erro ao carregar página inicial:', error);
    stats = {
      recentWorkouts: [],
      latestMetric: null,
      totalExercises: 0,
      totalWorkouts: 0,
      totalMetrics: 0,
      thisWeekWorkouts: 0,
      lastWeekWorkouts: 0,
      thisWeekValidSets: 0,
      lastWeekValidSets: 0,
      avgWeeklyWorkouts: 0,
      weightTrend: null,
      thisMonthAvgWeight: null,
      streak: 0,
    };
  }

  let todayWorkoutData;
  try {
    todayWorkoutData = await getTodayWorkoutData(userId);
  } catch {
    todayWorkoutData = { hasWorkout: false, message: 'Erro ao carregar treino do dia' };
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto py-12">
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
            className="text-xl font-light mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Seu Personal Trainer Digital
          </p>
          <p
            className="text-lg font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {(() => {
              const hour = new Date().getHours();
              const greeting =
                hour < 12 ? 'Bom dia' :
                hour < 18 ? 'Boa tarde' :
                'Boa noite';
              const name = session.user.name?.split(' ')[0] ?? 'Atleta';
              return `${greeting}, ${name}! 👋`;
            })()}
          </p>
        </div>

        {/* Treino do Dia */}
        <TodayWorkout initialData={todayWorkoutData} />

        {/* Stats Cards - Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10 mb-12 md:mb-16 lg:mb-20">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-y-8 lg:gap-y-10 section-spacing mb-12 md:mb-16 lg:mb-20">
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

          {/* Streak */}
          <div
            className="card-neon"
            style={{
              padding: '32px',
              ...(stats.streak >= 3 && {
                border: '2px solid #f59e0b',
                background: 'rgba(245, 158, 11, 0.05)',
              }),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">
                {stats.streak === 0 ? '😴' : stats.streak >= 30 ? '🏆' : stats.streak >= 14 ? '⚡' : stats.streak >= 7 ? '🔥' : '✨'}
              </div>
              {stats.streak >= 7 && (
                <div
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                  }}
                >
                  {stats.streak >= 30 ? 'Lendário!' : stats.streak >= 14 ? 'Incrível!' : 'Em chamas!'}
                </div>
              )}
            </div>
            <div
              className="text-3xl font-bold mb-2 text-glow"
              style={{
                color: stats.streak === 0
                  ? 'var(--text-muted)'
                  : stats.streak >= 7
                  ? '#f59e0b'
                  : 'var(--accent-success)',
              }}
            >
              {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}
            </div>
            <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Sequência
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stats.streak === 0
                ? 'Treine hoje para começar!'
                : stats.streak === 1
                ? 'Começou hoje, continue!'
                : `${stats.streak} dias seguidos 💪`}
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
                {/* Indicador de Progresso Semanal */}
        {(() => {
          const meta = 100// séries válidas semanais
          const atual = stats.thisWeekValidSets;
          const percentual = Math.min((atual / meta) * 100, 100);
          const faltam = Math.max(meta - atual, 0);

          const cor =
            percentual >= 100 ? 'var(--accent-success)' :
            percentual >= 60  ? 'var(--accent-primary)' :
            percentual >= 30  ? 'var(--accent-secondary)' :
            'var(--accent-warning)';

          const mensagem =
            percentual >= 100 ? '🏆 Meta semanal atingida! Excelente trabalho!' :
            percentual >= 60  ? `💪 Quase lá! Faltam ${faltam.toFixed(1)} séries válidas.` :
            percentual >= 30  ? `📈 Bom começo! Faltam ${faltam.toFixed(1)} séries válidas.` :
            `🎯 Faltam ${faltam.toFixed(1)} séries válidas para atingir a meta.`;

          return (
            <div className="card-neon mb-12 md:mb-16 lg:mb-20" style={{ padding: '32px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  🎯 Progresso Semanal
                </h3>
                <span
                  className="text-sm font-semibold"
                  style={{ color: cor }}
                >
                  {atual.toFixed(1)} / {meta} séries válidas
                </span>
              </div>

              {/* Barra de progresso */}
              <div
                className="w-full rounded-full mb-4 overflow-hidden"
                style={{
                  height: '12px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentual}%`,
                    background: percentual >= 100
                      ? 'linear-gradient(90deg, var(--accent-success), #34d399)'
                      : `linear-gradient(90deg, ${cor}, rgba(0, 217, 255, 0.6))`,
                    boxShadow: `0 0 10px ${cor}`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {mensagem}
                </p>
                <span
                  className="text-sm font-bold ml-4 flex-shrink-0"
                  style={{ color: cor }}
                >
                  {percentual.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })()}


        {/* Espaçamento vertical entre seções */}
        <div style={{ height: '64px' }}></div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-y-10 lg:gap-y-12 mb-20">
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

                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
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
                const totalSets = workout.exercises.reduce(
                  (sum, ex) => sum + ex.sets.length,
                  0
                );

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
