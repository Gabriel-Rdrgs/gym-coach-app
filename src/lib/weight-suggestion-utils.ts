/**
 * Utilitários para sugestão automática de pesos baseado no histórico
 */

interface LastSet {
  weight: number;
  reps: number;
  rir?: number | null;
}

interface PR {
  weight: number;
  reps: number;
}

interface AverageSet {
  weight: number;
  reps: number;
  rir?: number | null;
}

interface TrendData {
  weightChange: number;
  repsChange: number;
  daysBetween: number;
  workoutsCount: number;
  isImproving: boolean;
}

interface WeightSuggestion {
  suggestedWeight: number;
  suggestedReps: number;
  reason: string;
  lastWeight?: number;
  lastReps?: number;
  prWeight?: number;
  prReps?: number;
}

/**
 * Arredonda peso para incrementos práticos
 */
function roundToPracticalIncrement(weight: number): number {
  if (weight < 5) {
    // Para pesos muito baixos, incrementos de 0.5kg
    return Math.round(weight * 2) / 2;
  } else if (weight < 20) {
    // Para pesos médios, incrementos de 1kg
    return Math.round(weight);
  } else if (weight < 50) {
    // Para pesos maiores, incrementos de 2.5kg
    return Math.round(weight / 2.5) * 2.5;
  } else {
    // Para pesos muito grandes, incrementos de 5kg
    return Math.round(weight / 5) * 5;
  }
}

/**
 * Calcula sugestão de peso baseado no histórico
 */
export function calculateWeightSuggestion(
  lastSet: LastSet | null,
  pr: PR | null,
  averageSet: AverageSet | null,
  trendData: TrendData | null = null,
  daysSinceLastWorkout: number | null = null,
  exerciseType: string = 'isolation'
): WeightSuggestion | null {
  // Se não há histórico, não podemos sugerir
  if (!lastSet && !averageSet && !pr) {
    return null;
  }

  // Priorizar média do último treino (mais representativa), depois última série, depois PR
  const baseWeight = averageSet?.weight || lastSet?.weight || pr?.weight || 0;
  const baseReps = averageSet?.reps || lastSet?.reps || pr?.reps || 0;
  const baseRir = averageSet?.rir ?? lastSet?.rir ?? null;

  if (baseWeight === 0 || baseReps === 0) {
    return null;
  }

  // Ajuste por tempo desde último treino
  let timeAdjustment = 1.0;
  if (daysSinceLastWorkout !== null) {
    if (daysSinceLastWorkout > 14) {
      // Mais de 2 semanas - reduzir sugestão em 10%
      timeAdjustment = 0.9;
    } else if (daysSinceLastWorkout > 7) {
      // Mais de 1 semana - reduzir sugestão em 5%
      timeAdjustment = 0.95;
    } else if (daysSinceLastWorkout <= 2) {
      // Treinou recentemente - pode progredir normalmente
      timeAdjustment = 1.0;
    }
  }

  // Ajuste por tipo de exercício
  const isCompound = exerciseType === 'compound';
  const compoundMultiplier = isCompound ? 1.0 : 1.0; // Compostos podem progredir mais agressivamente

  // Estratégia de progressão baseada no RIR médio
  let suggestedWeight = baseWeight;
  let suggestedReps = baseReps;
  let reason = '';

  // Usar RIR médio do último treino (mais confiável que RIR de uma única série)
  const effectiveRir = baseRir;

  if (effectiveRir !== null && effectiveRir !== undefined) {
    // Se RIR está disponível, usar para progressão mais inteligente
    if (effectiveRir <= 1) {
      // Muito próximo da falha - aumentar peso conservadoramente
      suggestedWeight = baseWeight * 1.025 * timeAdjustment; // 2.5% de aumento
      suggestedReps = baseReps;
      reason = `Média de RIR ${effectiveRir.toFixed(1)} (próximo da falha). Sugestão: aumentar peso em ~2.5%`;
    } else if (effectiveRir <= 2) {
      // Próximo da falha - aumentar peso levemente
      suggestedWeight = baseWeight * 1.02 * timeAdjustment; // 2% de aumento
      suggestedReps = baseReps;
      reason = `Média de RIR ${effectiveRir.toFixed(1)} (próximo da falha). Sugestão: aumentar peso em ~2%`;
    } else if (effectiveRir <= 2.5) {
      // Moderado - aumentar peso normalmente
      suggestedWeight = baseWeight * 1.025 * timeAdjustment; // 2.5% de aumento
      suggestedReps = baseReps;
      reason = `Média de RIR ${effectiveRir.toFixed(1)}. Sugestão: aumentar peso em ~2.5%`;
    } else if (effectiveRir >= 3) {
      // Muito longe da falha - aumentar peso mais agressivamente ou aumentar reps
      const weightIncrease = isCompound ? 1.05 : 1.04; // Compostos podem progredir mais
      suggestedWeight = baseWeight * weightIncrease * timeAdjustment;
      
      // Se está muito longe da falha e o peso já é alto, considerar aumentar reps também
      if (baseWeight > 20 && effectiveRir >= 4) {
        suggestedReps = baseReps + 1;
        reason = `Média de RIR ${effectiveRir.toFixed(1)} (muito longe da falha). Sugestão: aumentar peso em ~${((weightIncrease - 1) * 100).toFixed(0)}% ou aumentar para ${suggestedReps} reps`;
      } else {
        suggestedReps = baseReps;
        reason = `Média de RIR ${effectiveRir.toFixed(1)} (longe da falha). Sugestão: aumentar peso em ~${((weightIncrease - 1) * 100).toFixed(0)}%`;
      }
    }
  } else {
    // Sem RIR - progressão conservadora baseada em porcentagem
    suggestedWeight = baseWeight * 1.025 * timeAdjustment; // 2.5% de aumento padrão
    suggestedReps = baseReps;
    reason = 'Progressão padrão: aumentar peso em ~2.5%';
  }

  // Ajuste baseado na tendência
  if (trendData) {
    if (trendData.isImproving && trendData.workoutsCount >= 3) {
      // Se está melhorando consistentemente, pode progredir um pouco mais
      suggestedWeight = suggestedWeight * 1.01; // +1% adicional
      reason += ' (tendência positiva)';
    } else if (!trendData.isImproving && trendData.workoutsCount >= 3) {
      // Se não está melhorando, ser mais conservador
      suggestedWeight = suggestedWeight * 0.98; // -2% mais conservador
      reason += ' (tendência estável - progressão conservadora)';
    }
  }

  // Ajuste por tempo desde último treino na mensagem
  if (daysSinceLastWorkout !== null && daysSinceLastWorkout > 7) {
    reason += ` (último treino há ${daysSinceLastWorkout} dias - progressão ajustada)`;
  }

  // Arredondar para incrementos práticos
  suggestedWeight = roundToPracticalIncrement(suggestedWeight);

  // Garantir que não sugerimos menos que o peso base
  if (suggestedWeight < baseWeight) {
    suggestedWeight = baseWeight;
  }

  // Se a sugestão de peso é igual ao peso base, considerar aumentar reps
  if (suggestedWeight === baseWeight && suggestedReps === baseReps && baseReps < 15) {
    suggestedReps = baseReps + 1;
    reason = reason.replace('aumentar peso', 'aumentar reps') || 'Sugestão: aumentar reps em 1';
  }

  return {
    suggestedWeight,
    suggestedReps,
    reason,
    lastWeight: lastSet?.weight,
    lastReps: lastSet?.reps,
    prWeight: pr?.weight,
    prReps: pr?.reps,
  };
}

/**
 * Formata sugestão para exibição
 */
export function formatSuggestion(suggestion: WeightSuggestion | null): string {
  if (!suggestion) {
    return 'Sem histórico disponível';
  }

  return `${suggestion.suggestedWeight.toFixed(1)}kg × ${suggestion.suggestedReps} reps`;
}

