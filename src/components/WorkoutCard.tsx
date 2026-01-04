'use client';

import { useState, useEffect, memo } from 'react';

interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
}

interface ExerciseData {
  name: string;
  muscleGroup: string;
  type?: string;
  sets: SetData[];
}

interface WorkoutCardProps {
  exercise: ExerciseData;
  index: number;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof SetData, value: number | undefined) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  setSwapExerciseIndex: (index: number | null) => void;
  setSwapModalOpen: (open: boolean) => void;
}

const WorkoutCard = memo(({ 
  exercise, 
  index, 
  updateSet, 
  addSet, 
  removeSet,
  setSwapExerciseIndex,
  setSwapModalOpen
}: WorkoutCardProps) => {
  const [suggestion, setSuggestion] = useState<{
    suggestedWeight: number;
    suggestedReps: number;
    reason: string;
    lastWeight?: number;
    lastReps?: number;
    prWeight?: number;
    prReps?: number;
    loading: boolean;
  } | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Buscar histórico e calcular sugestão quando o componente é montado
  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        setSuggestion(prev => prev ? { ...prev, loading: true } : null);
        const response = await fetch(`/api/exercises/history?name=${encodeURIComponent(exercise.name)}`);
        if (response.ok) {
          const data = await response.json();
          
          // Importar função de cálculo de sugestão
          const { calculateWeightSuggestion } = await import('@/lib/weight-suggestion-utils');
          
          const suggestion = calculateWeightSuggestion(
            data.lastSet,
            data.pr,
            data.averageSet,
            data.trendData,
            data.daysSinceLastWorkout,
            exercise.type || 'isolation'
          );

          if (suggestion) {
            setSuggestion({
              ...suggestion,
              loading: false,
            });
          } else {
            setSuggestion(null);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar sugestão:', error);
        setSuggestion(null);
      }
    };
    fetchSuggestion();
  }, [exercise.name]);

  const handleApplySuggestion = () => {
    if (suggestion && suggestion.suggestedWeight && suggestion.suggestedReps) {
      exercise.sets.forEach((_, setIndex) => {
        updateSet(index, setIndex, 'weight', suggestion.suggestedWeight!);
        updateSet(index, setIndex, 'reps', suggestion.suggestedReps!);
      });
      setShowSuggestion(false);
    }
  };

  const handleWeightChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateSet(index, setIndex, 'weight', 0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        updateSet(index, setIndex, 'weight', numValue);
      }
    }
  };

  const handleRepsChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateSet(index, setIndex, 'reps', 0);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        updateSet(index, setIndex, 'reps', numValue);
      }
    }
  };

  const handleRirChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateSet(index, setIndex, 'rir', undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 5) {
        updateSet(index, setIndex, 'rir', numValue);
      }
    }
  };

  return (
    <div className="card-neon mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 text-glow" style={{ color: 'var(--accent-primary)' }}>
            {exercise.name}
          </h3>
          <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
            {exercise.muscleGroup.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {suggestion && suggestion.suggestedWeight && (
            <button
              onClick={() => setShowSuggestion(!showSuggestion)}
              className="px-3 py-1 text-xs font-medium transition-all hover:scale-105"
              style={{
                color: 'var(--accent-success)',
                border: '1px solid var(--accent-success)',
                borderRadius: 'var(--border-radius)',
              }}
              title="Ver sugestões de peso"
              type="button"
            >
              💡 Sugestão
            </button>
          )}
          <button
            onClick={() => {
              setSwapExerciseIndex(index);
              setSwapModalOpen(true);
            }}
            className="px-3 py-1 text-sm font-medium transition-all hover:scale-105"
            style={{
              color: 'var(--accent-secondary)',
              border: '1px solid var(--accent-secondary)',
              borderRadius: 'var(--border-radius)',
            }}
            title="Trocar exercício"
            type="button"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Painel de Sugestões */}
      {showSuggestion && suggestion && (
        <div className="mb-4 p-4 rounded-lg border" style={{ 
          background: 'rgba(0, 217, 255, 0.05)', 
          borderColor: 'var(--accent-primary)' 
        }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
              💡 Sugestões Baseadas no Seu Histórico
            </h4>
            <button
              onClick={() => setShowSuggestion(false)}
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
              type="button"
            >
              ✕
            </button>
          </div>
          
          {suggestion.suggestedWeight && suggestion.suggestedReps ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    {suggestion.reason}
                  </div>
                  <div className="text-lg font-bold mb-2" style={{ color: 'var(--accent-success)' }}>
                    {suggestion.suggestedWeight.toFixed(1)} kg × {suggestion.suggestedReps} reps
                  </div>
                  {suggestion.lastWeight && suggestion.lastReps && (
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      📅 Último treino: {suggestion.lastWeight.toFixed(1)} kg × {suggestion.lastReps} reps
                    </div>
                  )}
                </div>
                <button
                  onClick={handleApplySuggestion}
                  className="px-4 py-2 text-sm font-medium transition-all hover:scale-105 ml-4"
                  style={{
                    background: 'var(--accent-success)',
                    color: '#000',
                    borderRadius: 'var(--border-radius)',
                  }}
                  type="button"
                >
                  Aplicar
                </button>
              </div>
              
              {suggestion.prWeight && suggestion.prReps && (
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>🏆 Seu PR Atual</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--accent-warning)' }}>
                    {suggestion.prWeight.toFixed(1)} kg × {suggestion.prReps} reps
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Nenhum histórico encontrado para este exercício. Comece registrando seus treinos!
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
          <div>Série</div>
          <div>Peso (kg)</div>
          <div>Reps</div>
          <div>RIR</div>
          <div></div>
        </div>

        {exercise.sets.map((set, setIndex) => (
          <div key={`${index}-${setIndex}-${set.setNumber}`} className="grid grid-cols-5 gap-2">
            <div className="flex items-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {set.setNumber}
            </div>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="0"
              value={set.weight === 0 ? '' : set.weight}
              onChange={(e) => {
                const input = e.target;
                const cursorPosition = input.selectionStart || 0;
                handleWeightChange(setIndex, e);
                setTimeout(() => {
                  input.focus();
                  input.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  updateSet(index, setIndex, 'weight', 0);
                }
              }}
              className="input-neon"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onFocus={(e) => e.target.select()}
            />
            <input
              type="number"
              min="0"
              placeholder="0"
              value={set.reps === 0 ? '' : set.reps}
              onChange={(e) => {
                const input = e.target;
                const cursorPosition = input.selectionStart || 0;
                handleRepsChange(setIndex, e);
                setTimeout(() => {
                  input.focus();
                  input.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  updateSet(index, setIndex, 'reps', 0);
                }
              }}
              className="input-neon"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onFocus={(e) => e.target.select()}
            />
            <input
              type="number"
              step="0.5"
              min="0"
              max="5"
              placeholder="0"
              value={set.rir === undefined ? '' : set.rir}
              onChange={(e) => {
                const input = e.target;
                const cursorPosition = input.selectionStart || 0;
                handleRirChange(setIndex, e);
                setTimeout(() => {
                  input.focus();
                  input.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  updateSet(index, setIndex, 'rir', undefined);
                }
              }}
              className="input-neon"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={() => removeSet(index, setIndex)}
              disabled={exercise.sets.length <= 1}
              className="text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent-warning)' }}
              type="button"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() => addSet(index)}
          className="mt-2 text-sm font-medium transition-all hover:scale-105"
          style={{ color: 'var(--accent-secondary)' }}
          type="button"
        >
          + Adicionar série
        </button>
      </div>
    </div>
  );
});

WorkoutCard.displayName = 'WorkoutCard';

export default WorkoutCard;

