'use client';

import { useState, useEffect, useRef, memo } from 'react';

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
  onRemoveExercise?: () => void;
}

// Tempos pré-definidos em segundos
const TIMER_PRESETS = [
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2min', seconds: 120 },
  { label: '3min', seconds: 180 },
];

// Bipe de alerta usando Web Audio API
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch {
    // Silencioso se Web Audio API não estiver disponível
  }
}

// Componente de Timer separado para não re-renderizar o card inteiro
const RestTimer = memo(() => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(90);
  const [showTimer, setShowTimer] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = (seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelectedPreset(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
    setShowTimer(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    if (timeLeft !== null && timeLeft > 0) setIsRunning(true);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(selectedPreset);
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(null);
    setShowTimer(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Porcentagem para o anel de progresso
  const progress = timeLeft !== null ? (timeLeft / selectedPreset) * 100 : 100;
  const isFinished = timeLeft === 0;
  const circumference = 2 * Math.PI * 28; // raio 28
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0, 217, 255, 0.15)' }}>

      {/* Botão para mostrar/esconder timer */}
      {!showTimer && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            ⏱ Descanso:
          </span>
          {TIMER_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              type="button"
              onClick={() => handleStart(preset.seconds)}
              className="text-xs px-3 py-1 rounded-lg transition-all hover:scale-105 font-semibold"
              style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: 'var(--accent-primary)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Timer ativo */}
      {showTimer && timeLeft !== null && (
        <div
          className="p-4 rounded-lg"
          style={{
            background: isFinished
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(0, 217, 255, 0.05)',
            border: isFinished
              ? '1px solid var(--accent-success)'
              : '1px solid rgba(0, 217, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-6">

            {/* Anel de progresso SVG */}
            <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                {/* Fundo */}
                <circle
                  cx="36" cy="36" r="28"
                  fill="none"
                  stroke="rgba(0, 217, 255, 0.15)"
                  strokeWidth="5"
                />
                {/* Progresso */}
                <circle
                  cx="36" cy="36" r="28"
                  fill="none"
                  stroke={isFinished ? 'var(--accent-success)' : 'var(--accent-primary)'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              {/* Tempo no centro */}
              <div
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{
                  color: isFinished ? 'var(--accent-success)' : 'var(--accent-primary)',
                }}
              >
                {isFinished ? '✓' : formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex-1">
              {/* Mensagem */}
              <p
                className="text-sm font-semibold mb-3"
                style={{
                  color: isFinished ? 'var(--accent-success)' : 'var(--text-primary)',
                }}
              >
                {isFinished
                  ? 'Descansou! Hora da próxima série.'
                  : isRunning
                  ? 'Descansando...'
                  : 'Pausado'}
              </p>

              {/* Controles */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isFinished && (
                  <>
                    {isRunning ? (
                      <button
                        type="button"
                        onClick={handlePause}
                        className="text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'rgba(167, 139, 250, 0.2)',
                          border: '1px solid var(--accent-secondary)',
                          color: 'var(--accent-secondary)',
                        }}
                      >
                        ⏸ Pausar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResume}
                        className="text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'rgba(0, 217, 255, 0.2)',
                          border: '1px solid var(--accent-primary)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        ▶ Continuar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:scale-105"
                      style={{
                        background: 'rgba(0, 217, 255, 0.1)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ↺ Resetar
                    </button>
                  </>
                )}

                {/* Presets rápidos para trocar */}
                {TIMER_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    type="button"
                    onClick={() => handleStart(preset.seconds)}
                    className="text-xs px-2 py-1 rounded transition-all hover:scale-105"
                    style={{
                      background: selectedPreset === preset.seconds
                        ? 'rgba(0, 217, 255, 0.2)'
                        : 'transparent',
                      border: selectedPreset === preset.seconds
                        ? '1px solid var(--accent-primary)'
                        : '1px solid rgba(0, 217, 255, 0.2)',
                      color: selectedPreset === preset.seconds
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs ml-auto"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

RestTimer.displayName = 'RestTimer';

const WorkoutCard = memo(({
  exercise,
  index,
  updateSet,
  addSet,
  removeSet,
  setSwapExerciseIndex,
  setSwapModalOpen,
  onRemoveExercise,
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

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        setSuggestion(prev => prev ? { ...prev, loading: true } : null);
        const response = await fetch(`/api/exercises/history?name=${encodeURIComponent(exercise.name)}`);
        if (response.ok) {
          const data = await response.json();
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
            setSuggestion({ ...suggestion, loading: false });
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
      if (!isNaN(numValue) && numValue >= 0) updateSet(index, setIndex, 'weight', numValue);
    }
  };

  const handleRepsChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateSet(index, setIndex, 'reps', 0);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) updateSet(index, setIndex, 'reps', numValue);
    }
  };

  const handleRirChange = (setIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateSet(index, setIndex, 'rir', undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 5) updateSet(index, setIndex, 'rir', numValue);
    }
  };

  return (
    <div className="card-neon mb-4">
      {/* Cabeçalho */}
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
          {onRemoveExercise && (
            <button
              onClick={onRemoveExercise}
              className="px-3 py-1 text-sm font-medium transition-all hover:scale-105"
              style={{
                color: 'var(--accent-warning)',
                border: '1px solid var(--accent-warning)',
                borderRadius: 'var(--border-radius)',
              }}
              title="Remover exercício"
              type="button"
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {/* Painel de Sugestões */}
      {showSuggestion && suggestion && (
        <div className="mb-4 p-4 rounded-lg border" style={{
          background: 'rgba(0, 217, 255, 0.05)',
          borderColor: 'var(--accent-primary)',
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

      {/* Tabela de séries */}
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
              onChange={(e) => handleWeightChange(setIndex, e)}
              onBlur={(e) => {
                if (e.target.value === '') updateSet(index, setIndex, 'weight', 0);
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
              onChange={(e) => handleRepsChange(setIndex, e)}
              onBlur={(e) => {
                if (e.target.value === '') updateSet(index, setIndex, 'reps', 0);
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
              onChange={(e) => handleRirChange(setIndex, e)}
              onBlur={(e) => {
                if (e.target.value === '') updateSet(index, setIndex, 'rir', undefined);
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

      {/* Timer de descanso */}
      <RestTimer />
    </div>
  );
});

WorkoutCard.displayName = 'WorkoutCard';

export default WorkoutCard;

