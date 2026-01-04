/**
 * Utilitários para Programas de Treino baseados em recomendações OMS
 * OMS recomenda: 10-20 séries válidas semanais por grupo muscular para hipertrofia
 */

import { calculateValidSetsForWorkout } from './progress-utils';

interface Workout {
  date: Date;
  exercises: Array<{
    exercise: {
      muscleGroup: string;
      name: string;
      type?: string;
    };
    sets: Array<{
      rir: number | null;
      weight: number;
      reps: number;
    }>;
  }>;
}

/**
 * Calcula séries válidas semanais por grupo muscular
 * @param workouts Array de treinos da semana
 * @returns Objeto com séries válidas por grupo muscular
 */
export function calculateWeeklyValidSetsByMuscleGroup(
  workouts: Workout[]
): { [muscleGroup: string]: number } {
  const weeklyValidSets: { [muscleGroup: string]: number } = {};

  workouts.forEach((workout) => {
    const result = calculateValidSetsForWorkout(workout);
    
    // Agregar séries válidas por grupo muscular
    Object.entries(result.byMuscleGroup).forEach(([muscleGroup, validSets]) => {
      if (!weeklyValidSets[muscleGroup]) {
        weeklyValidSets[muscleGroup] = 0;
      }
      weeklyValidSets[muscleGroup] += validSets;
    });
  });

  return weeklyValidSets;
}

/**
 * Valida se as séries válidas estão dentro das recomendações OMS
 * OMS: 10-20 séries válidas semanais por grupo muscular
 * @param validSetsByGroup Séries válidas por grupo muscular
 * @returns Status OMS por grupo muscular
 */
export function validateOMSRecommendations(
  validSetsByGroup: { [muscleGroup: string]: number }
): {
  [muscleGroup: string]: {
    status: 'optimal' | 'low' | 'high' | 'none';
    validSets: number;
    recommendation: string;
  };
} {
  const OMS_MIN = 10;
  const OMS_MAX = 20;
  
  const status: {
    [muscleGroup: string]: {
      status: 'optimal' | 'low' | 'high' | 'none';
      validSets: number;
      recommendation: string;
    };
  } = {};

  Object.entries(validSetsByGroup).forEach(([muscleGroup, validSets]) => {
    if (validSets === 0) {
      status[muscleGroup] = {
        status: 'none',
        validSets,
        recommendation: 'Nenhuma série válida registrada. Adicione treinos para este grupo muscular.',
      };
    } else if (validSets < OMS_MIN) {
      status[muscleGroup] = {
        status: 'low',
        validSets,
        recommendation: `Abaixo do mínimo OMS (${OMS_MIN} séries). Considere adicionar mais exercícios ou séries.`,
      };
    } else if (validSets > OMS_MAX) {
      status[muscleGroup] = {
        status: 'high',
        validSets,
        recommendation: `Acima do máximo OMS (${OMS_MAX} séries). Pode ser excessivo para recuperação.`,
      };
    } else {
      status[muscleGroup] = {
        status: 'optimal',
        validSets,
        recommendation: `Dentro da faixa recomendada pela OMS (${OMS_MIN}-${OMS_MAX} séries válidas).`,
      };
    }
  });

  return status;
}

/**
 * Calcula a semana atual baseada em uma data
 * @param date Data de referência
 * @returns Objeto com início e fim da semana (segunda a domingo)
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
  
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Obtém o número da semana do ano
 * @param date Data de referência
 * @returns Número da semana (1-53)
 */
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Formata o nome do grupo muscular para exibição
 * @param muscleGroup Nome do grupo muscular (ex: "lower_back")
 * @returns Nome formatado (ex: "Lower Back")
 */
export function formatMuscleGroupName(muscleGroup: string): string {
  return muscleGroup
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Obtém a cor baseada no status OMS
 * @param status Status OMS
 * @returns Cor em formato hex
 */
export function getOMSStatusColor(status: 'optimal' | 'low' | 'high' | 'none'): string {
  switch (status) {
    case 'optimal':
      return '#10b981'; // Verde (sucesso)
    case 'low':
      return '#f59e0b'; // Amarelo (atenção)
    case 'high':
      return '#ef4444'; // Vermelho (excesso)
    case 'none':
      return '#6b7280'; // Cinza (sem dados)
    default:
      return '#6b7280';
  }
}

/**
 * Obtém o ícone baseado no status OMS
 * @param status Status OMS
 * @returns Emoji ou ícone
 */
export function getOMSStatusIcon(status: 'optimal' | 'low' | 'high' | 'none'): string {
  switch (status) {
    case 'optimal':
      return '✅';
    case 'low':
      return '⚠️';
    case 'high':
      return '🔴';
    case 'none':
      return '⚪';
    default:
      return '⚪';
  }
}

