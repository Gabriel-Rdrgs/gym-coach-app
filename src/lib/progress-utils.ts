/**
 * Utilitários para cálculos de progresso e séries válidas
 */

interface Set {
  rir: number | null;
  weight: number;
  reps: number;
}

interface WorkoutExercise {
  exercise: {
    muscleGroup: string;
    name: string;
    type?: string; // compound ou isolation
  };
  sets: Set[];
}

/**
 * Mapeamento de grupos musculares secundários (sinergistas) para exercícios compostos
 * Para exercícios compostos: grupo principal recebe 1.0, secundários recebem 0.5
 */
const COMPOUND_EXERCISE_SYNERGISTS: { [exerciseName: string]: string[] } = {
  // Remadas (dorsal + bíceps)
  'Remada curvada barra': ['biceps'],
  'Remada baixa máquina': ['biceps'],
  'Remada cavalinho T-bar': ['biceps'],
  'Remada unilateral halter': ['biceps'],
  'Remada com cabo': ['biceps'],
  'Barra fixa': ['biceps'],
  'Puxada frontal pegada aberta': ['biceps'],
  'Puxada frontal pegada fechada': ['biceps'],
  'Remada alta': ['biceps'],
  'Puxada no pulley': ['biceps'],
  'Pulldown pull-over': ['biceps'],
  
  // Supinos (peito + tríceps + ombros frontais)
  'Supino reto barra': ['triceps', 'shoulders'],
  'Supino reto halteres': ['triceps', 'shoulders'],
  'Supino inclinado halteres': ['triceps', 'shoulders'],
  'Supino inclinado máquina': ['triceps', 'shoulders'],
  'Supino declinado barra': ['triceps', 'shoulders'],
  'Supino declinado halteres': ['triceps', 'shoulders'],
  'Supino com pegada fechada': ['triceps', 'shoulders'],
  'Flexão de braço': ['triceps', 'shoulders'],
  
  // Desenvolvimento (ombros + tríceps)
  'Desenvolvimento halteres sentado': ['triceps'],
  'Desenvolvimento máquina': ['triceps'],
  'Desenvolvimento com barra': ['triceps'],
  'Desenvolvimento Arnold': ['triceps'],
  
  // Agachamentos (quadríceps + glúteos + panturrilhas)
  'Agachamento livre': ['glutes', 'calves'],
  'Agachamento frontal': ['glutes', 'calves'],
  'Agachamento sumô': ['glutes', 'calves'],
  'Agachamento búlgaro': ['glutes', 'calves'],
  'Leg press': ['glutes', 'calves'],
  'Leg press 45°': ['glutes', 'calves'],
  'Hack squat': ['glutes', 'calves'],
  'Afundo': ['glutes', 'calves'],
  
  // Terra/Stiff (posterior + glúteos + panturrilhas)
  'Terra tradicional': ['glutes', 'calves', 'lower_back'],
  'Levantamento terra romeno': ['glutes', 'calves', 'lower_back'],
  'Stiff': ['glutes', 'calves', 'lower_back'],
  
  // Glúteos (glúteos + posterior)
  'Hip thrust barra': ['hamstrings'],
  'Elevação pélvica': ['hamstrings'],
  
  // Paralelas (tríceps + peito + ombros)
  'Paralelas': ['chest', 'shoulders'],
};

interface Workout {
  date: Date;
  exercises: WorkoutExercise[];
}

/**
 * Calcula o valor de séries válidas baseado no RIR
 * RIR > 3: Série de aquecimento → 0 séries válidas
 * RIR 2-3: Série de ajuste → 0.5 séries válidas
 * RIR < 2: Série válida → 1 série válida
 * RIR null: Considerar como válida → 1 série válida
 */
export function calculateValidSetsFromRIR(rir: number | null): number {
  if (rir === null || rir === undefined) {
    return 1.0; // Séries sem RIR são consideradas válidas
  }
  
  if (rir > 3) {
    return 0.0; // Série de aquecimento
  }
  
  if (rir >= 2 && rir <= 3) {
    return 0.5; // Série de ajuste
  }
  
  return 1.0; // Série válida (RIR < 2)
}

/**
 * Calcula séries válidas para um treino completo
 * Para exercícios compostos: grupo principal recebe 1.0, secundários recebem 0.5 por série válida
 */
export function calculateValidSetsForWorkout(workout: Workout): {
  totalValidSets: number;
  byMuscleGroup: { [muscleGroup: string]: number };
  byExercise: { [exerciseName: string]: number };
} {
  const byMuscleGroup: { [muscleGroup: string]: number } = {};
  const byExercise: { [exerciseName: string]: number } = {};
  let totalValidSets = 0;

  workout.exercises.forEach((workoutExercise) => {
    const muscleGroup = workoutExercise.exercise.muscleGroup;
    const exerciseName = workoutExercise.exercise.name;
    const exerciseType = workoutExercise.exercise.type || 'isolation'; // Default para isolation se não especificado
    
    let exerciseValidSets = 0;

    // Calcular séries válidas baseadas em RIR
    workoutExercise.sets.forEach((set) => {
      const validSetsMultiplier = calculateValidSetsFromRIR(set.rir);
      exerciseValidSets += validSetsMultiplier;
      totalValidSets += validSetsMultiplier;
    });

    // Verificar se é exercício composto e tem sinergistas mapeados
    const synergists = COMPOUND_EXERCISE_SYNERGISTS[exerciseName] || [];
    const isCompound = exerciseType === 'compound' && synergists.length > 0;

    if (isCompound) {
      // Grupo principal: 1.0 por série válida
      if (!byMuscleGroup[muscleGroup]) {
        byMuscleGroup[muscleGroup] = 0;
      }
      byMuscleGroup[muscleGroup] += exerciseValidSets;

      // Grupos secundários: 0.5 por série válida
      synergists.forEach((synergistGroup) => {
        if (!byMuscleGroup[synergistGroup]) {
          byMuscleGroup[synergistGroup] = 0;
        }
        byMuscleGroup[synergistGroup] += exerciseValidSets * 0.5;
      });
    } else {
      // Exercícios de isolamento: apenas o grupo principal
      if (!byMuscleGroup[muscleGroup]) {
        byMuscleGroup[muscleGroup] = 0;
      }
      byMuscleGroup[muscleGroup] += exerciseValidSets;
    }

    // Agregar por exercício (total de séries válidas do exercício)
    if (!byExercise[exerciseName]) {
      byExercise[exerciseName] = 0;
    }
    byExercise[exerciseName] += exerciseValidSets;
  });

  return {
    totalValidSets,
    byMuscleGroup,
    byExercise,
  };
}

/**
 * Calcula séries válidas para múltiplos treinos
 */
export function calculateValidSetsForWorkouts(workouts: Workout[]): Array<{
  date: string;
  totalValidSets: number;
  byMuscleGroup: { [muscleGroup: string]: number };
  template?: string;
}> {
  return workouts.map((workout) => {
    const result = calculateValidSetsForWorkout(workout);
    return {
      date: workout.date.toISOString().split('T')[0],
      totalValidSets: result.totalValidSets,
      byMuscleGroup: result.byMuscleGroup,
    };
  });
}

/**
 * Agrupa séries válidas por grupo muscular ao longo do tempo
 */
export function groupValidSetsByMuscleGroup(
  workouts: Array<{
    date: string;
    byMuscleGroup: { [muscleGroup: string]: number };
  }>
): Array<{
  date: string;
  muscleGroup: string;
  validSets: number;
}> {
  const result: Array<{
    date: string;
    muscleGroup: string;
    validSets: number;
  }> = [];

  workouts.forEach((workout) => {
    Object.entries(workout.byMuscleGroup).forEach(([muscleGroup, validSets]) => {
      result.push({
        date: workout.date,
        muscleGroup: muscleGroup.replace('_', ' '),
        validSets,
      });
    });
  });

  return result.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.muscleGroup.localeCompare(b.muscleGroup);
  });
}

