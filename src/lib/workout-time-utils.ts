/**
 * Calcula o tempo estimado de um treino baseado em:
 * - Número de exercícios
 * - Número de séries por exercício
 * - Tipo de exercício (composto vs isolador)
 * - Tempo de descanso entre séries (variável por tipo)
 * - Tempo de transição entre exercícios
 */

interface ExerciseTimeEstimate {
  exerciseName: string;
  estimatedMinutes: number;
  setsCount: number;
}

/**
 * Estima o tempo total de um treino
 * @param exercises Array de exercícios com suas séries e tipo
 * @returns Tempo estimado em minutos
 */
export function estimateWorkoutTime(exercises: Array<{ name: string; type?: string; sets: Array<any> }>): {
  totalMinutes: number;
  breakdown: ExerciseTimeEstimate[];
} {
  const breakdown: ExerciseTimeEstimate[] = [];

  // Constantes de tempo (em minutos)
  const TIME_PER_SET = 0.5; // 30 segundos de execução por série
  
  // Descanso entre séries baseado no tipo de exercício
  const REST_COMPOUND_MIN = 2.0; // 2 minutos mínimo para compostos
  const REST_COMPOUND_MAX = 3.0; // 3 minutos máximo para compostos
  const REST_COMPOUND_AVG = 2.5; // Média de 2.5 minutos para compostos
  const REST_ISOLATION_MIN = 1.5; // 1.5 minutos mínimo para isoladores
  const REST_ISOLATION_MAX = 2.0; // 2 minutos máximo para isoladores
  const REST_ISOLATION_AVG = 1.75; // Média de 1.75 minutos para isoladores
  
  // Tempo de transição entre exercícios (2-3 minutos, similar aos compostos)
  const TRANSITION_MIN = 2.0;
  const TRANSITION_MAX = 3.0;
  const TRANSITION_AVG = 2.5; // Média de 2.5 minutos

  let totalMinutes = 0;

  exercises.forEach((exercise, index) => {
    const setsCount = exercise.sets.length;
    const exerciseType = exercise.type || 'isolation'; // Default para isolation se não especificado
    const isCompound = exerciseType === 'compound';
    
    // Determinar tempo de descanso baseado no tipo
    const restBetweenSets = isCompound ? REST_COMPOUND_AVG : REST_ISOLATION_AVG;
    
    if (setsCount === 0) {
      // Se não tem séries ainda, usa estimativa padrão (3 séries)
      const defaultSets = 3;
      const exerciseTime = (defaultSets * TIME_PER_SET) + ((defaultSets - 1) * restBetweenSets);
      breakdown.push({
        exerciseName: exercise.name,
        estimatedMinutes: exerciseTime,
        setsCount: defaultSets,
      });
      totalMinutes += exerciseTime;
    } else {
      // Tempo = (séries × tempo execução) + (descansos entre séries)
      const exerciseTime = (setsCount * TIME_PER_SET) + ((setsCount - 1) * restBetweenSets);
      breakdown.push({
        exerciseName: exercise.name,
        estimatedMinutes: exerciseTime,
        setsCount: setsCount,
      });
      totalMinutes += exerciseTime;
    }

    // Adicionar tempo de transição (exceto no último exercício)
    if (index < exercises.length - 1) {
      totalMinutes += TRANSITION_AVG;
    }
  });

  return {
    totalMinutes: Math.round(totalMinutes),
    breakdown,
  };
}

/**
 * Formata minutos em formato legível (ex: "45 min" ou "1h 15min")
 */
export function formatWorkoutTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
}

