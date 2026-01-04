import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateValidSetsForWorkouts,
  groupValidSetsByMuscleGroup,
} from '@/lib/progress-utils';

export async function GET() {
  try {
    // Buscar todas as métricas ordenadas por data
    const metrics = await prisma.metric.findMany({
      orderBy: { date: 'asc' },
    }).catch(() => []);

    // Buscar todos os treinos com exercícios e séries
    const workouts = await prisma.workout.findMany({
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    }).catch(() => []);

    // Calcular séries válidas baseadas em RIR
    const validSetsData = calculateValidSetsForWorkouts(workouts);
    
    // Adicionar template aos dados de séries válidas
    const validSetsWithTemplate = validSetsData.map((validSet, index) => ({
      ...validSet,
      template: workouts[index].template,
    }));

    // Agrupar séries válidas por grupo muscular ao longo do tempo
    const validSetsByMuscleGroup = groupValidSetsByMuscleGroup(validSetsData);

    // Preparar dados de métricas para gráficos
    const metricsData = metrics.map((metric: any) => ({
      date: metric.date.toISOString().split('T')[0],
      weight: metric.weight,
      waist: metric.waist,
      armCircumference: metric.armCircumference ?? null,
      thighCircumference: metric.thighCircumference ?? null,
      chestCircumference: metric.chestCircumference ?? null,
      bodyFatPercentage: metric.bodyFatPercentage ?? null,
      sleep: metric.sleep,
      energy: metric.energy,
      stress: metric.stress,
    }));

    // Calcular estatísticas de frequência
    const workoutFrequency = calculateWorkoutFrequency(workouts);
    const muscleGroupFrequency = calculateMuscleGroupFrequency(workouts);

    // Buscar PRs para gráfico
    const prs = await prisma.personalRecord.findMany({
      include: {
        exercise: true,
      },
      orderBy: { date: 'asc' },
    }).catch(() => []);

    const prsData = prs.map((pr) => ({
      date: pr.date.toISOString().split('T')[0],
      weight: pr.weight,
      exercise: pr.exercise.name,
      reps: pr.reps,
    }));

    // Preparar dados para heatmap (últimos 12 meses)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const heatmapData = workouts
      .filter((workout) => new Date(workout.date) >= twelveMonthsAgo)
      .map((workout) => {
        const validSetsForWorkout = calculateValidSetsForWorkouts([workout])[0];
        return {
          date: workout.date.toISOString(),
          template: workout.template,
          totalValidSets: validSetsForWorkout?.totalValidSets || 0,
        };
      });

    return NextResponse.json({
      metrics: metricsData,
      validSets: validSetsWithTemplate,
      validSetsByMuscleGroup,
      workoutFrequency,
      muscleGroupFrequency,
      prs: prsData,
      heatmapData: heatmapData,
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados de progresso:', error);
    // Retornar dados vazios ao invés de erro 500
    return NextResponse.json({
      metrics: [],
      validSets: [],
      validSetsByMuscleGroup: [],
      workoutFrequency: [],
      muscleGroupFrequency: [],
      prs: [],
      heatmapData: [],
      error: error?.message || 'Erro ao buscar dados de progresso',
    }, { status: 200 }); // Retornar 200 com dados vazios para não quebrar a UI
  }
}

function calculateWorkoutFrequency(workouts: any[]) {
  const frequency: { [key: string]: number } = {};
  
  workouts.forEach((workout) => {
    const date = workout.date instanceof Date ? workout.date : new Date(workout.date);
    const week = getWeekOfYear(date);
    const key = `${week}`;
    frequency[key] = (frequency[key] || 0) + 1;
  });

  return Object.entries(frequency)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => {
      // Ordenar por ano e semana
      const aParts = a.week.split('-W');
      const bParts = b.week.split('-W');
      if (aParts[0] !== bParts[0]) {
        return parseInt(aParts[0]) - parseInt(bParts[0]);
      }
      return parseInt(aParts[1]) - parseInt(bParts[1]);
    });
}

function calculateMuscleGroupFrequency(workouts: any[]) {
  const frequency: { [key: string]: number } = {};
  
  workouts.forEach((workout) => {
    workout.exercises.forEach((ex: any) => {
      const muscleGroup = ex.exercise.muscleGroup;
      frequency[muscleGroup] = (frequency[muscleGroup] || 0) + 1;
    });
  });

  return Object.entries(frequency)
    .map(([muscleGroup, count]) => ({
      muscleGroup: muscleGroup.replace('_', ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function getWeekOfYear(date: Date): string {
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
}

