'use client';

import { useState, useCallback, useMemo } from 'react';
import { workoutTemplates, workoutPrograms } from '@/data/templates';
import ExerciseSwapModal from '@/components/ExerciseSwapModal';
import WorkoutCard from '@/components/WorkoutCard';
import { useToast } from '@/components/Toast';
import { estimateWorkoutTime, formatWorkoutTime } from '@/lib/workout-time-utils';
import { getExerciseType } from '@/lib/exercise-types-map';

interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
}

interface ExerciseData {
  name: string;
  muscleGroup: string;
  type?: string; // compound ou isolation
  sets: SetData[];
}

export default function WorkoutsPage() {
  const [selectedProgram, setSelectedProgram] = useState<keyof typeof workoutPrograms | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentWorkout, setCurrentWorkout] = useState<ExerciseData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapExerciseIndex, setSwapExerciseIndex] = useState<number | null>(null);
  const toast = useToast();

  const handleProgramSelect = (program: keyof typeof workoutPrograms) => {
    setSelectedProgram(program);
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    const exercises = workoutTemplates[template as keyof typeof workoutTemplates];
    // Inicializar cada exercício com 3 séries vazias
    const workoutWithSets: ExerciseData[] = exercises.map((ex) => ({
      ...ex,
      type: getExerciseType(ex.name),
      sets: [
        { setNumber: 1, weight: 0, reps: 0, rir: undefined },
        { setNumber: 2, weight: 0, reps: 0, rir: undefined },
        { setNumber: 3, weight: 0, reps: 0, rir: undefined },
      ],
    }));
    setCurrentWorkout(workoutWithSets);
    setShowForm(true);
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
  };

  const handleBackToTemplates = () => {
    setShowForm(false);
    setSelectedTemplate('');
    setCurrentWorkout([]);
    setNotes('');
  };

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, field: keyof SetData, value: number | undefined) => {
    setCurrentWorkout((prev) => {
      const updatedWorkout = [...prev];
      updatedWorkout[exerciseIndex] = {
        ...updatedWorkout[exerciseIndex],
        sets: updatedWorkout[exerciseIndex].sets.map((set, idx) => 
          idx === setIndex 
            ? { ...set, [field]: value }
            : set
        ),
    };
      return updatedWorkout;
    });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    setCurrentWorkout((prev) => {
      const updatedWorkout = [...prev];
    const newSetNumber = updatedWorkout[exerciseIndex].sets.length + 1;
      updatedWorkout[exerciseIndex] = {
        ...updatedWorkout[exerciseIndex],
        sets: [
          ...updatedWorkout[exerciseIndex].sets,
          {
      setNumber: newSetNumber,
      weight: 0,
      reps: 0,
      rir: undefined,
          },
        ],
      };
      return updatedWorkout;
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setCurrentWorkout((prev) => {
      const updatedWorkout = [...prev];
    if (updatedWorkout[exerciseIndex].sets.length > 1) {
        updatedWorkout[exerciseIndex] = {
          ...updatedWorkout[exerciseIndex],
          sets: updatedWorkout[exerciseIndex].sets
            .filter((_, idx) => idx !== setIndex)
            .map((set, idx) => ({
              ...set,
              setNumber: idx + 1,
            })),
        };
      }
      return updatedWorkout;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          notes: notes || null,
          exercises: currentWorkout.map((ex, idx) => ({
            exerciseName: ex.name,
            order: idx + 1,
            sets: ex.sets.filter((s) => s.weight > 0 && s.reps > 0),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar treino');
      }

      const data = await response.json();
      
      // Mostrar notificações de PRs
      if (data.prsDetected && data.prsDetected.length > 0) {
        data.prsDetected.forEach((pr: any) => {
          toast.success(
            `🏆 NOVO PR! ${pr.exercise}: ${pr.weight}kg x ${pr.reps} reps!`
          );
        });
      }

      toast.success('Treino salvo com sucesso!');
      
      // Reset form
      setSelectedTemplate('');
      setCurrentWorkout([]);
      setShowForm(false);
      setNotes('');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar treino. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExerciseSwap = (newExercise: any) => {
    if (swapExerciseIndex !== null) {
      const updatedWorkout = [...currentWorkout];
      updatedWorkout[swapExerciseIndex] = {
        ...updatedWorkout[swapExerciseIndex],
        name: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
        type: newExercise.type || getExerciseType(newExercise.name),
      };
      setCurrentWorkout(updatedWorkout);
    }
    setSwapModalOpen(false);
    setSwapExerciseIndex(null);
  };

  // WorkoutCard removido - agora é um componente separado em @/components/WorkoutCard.tsx

  if (showForm) {
    return (
      <div 
        className="flex justify-center min-h-screen py-12 px-8"
        onScroll={(e) => {
          // Prevenir scroll acidental
          e.stopPropagation();
        }}
      >
        <div className="w-full max-w-4xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-glow mb-3" style={{ color: 'var(--accent-primary)' }}>
              {selectedTemplate}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Preencha os dados do seu treino
              </p>
              {currentWorkout.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg border" style={{ 
                  background: 'rgba(0, 217, 255, 0.05)', 
                  borderColor: 'var(--accent-primary)' 
                }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>⏱️</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {formatWorkoutTime(estimateWorkoutTime(currentWorkout).totalMinutes)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleBackToTemplates}
            className="btn-secondary"
          >
            ← Voltar
          </button>
        </div>

        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>

        <div className="mb-10">
          <label className="block text-sm font-medium mb-4" style={{ color: 'var(--accent-primary)' }}>
            Notas do treino (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione notas sobre o treino..."
            className="input-neon w-full"
            rows={3}
          />
        </div>

        {/* Espaçamento vertical */}
        <div style={{ height: '24px' }}></div>

        <div className="space-y-8 mb-10">
          {currentWorkout.map((exercise, index) => (
            <WorkoutCard
              key={`exercise-${index}-${exercise.name}`}
              exercise={exercise}
              index={index}
              updateSet={updateSet}
              addSet={addSet}
              removeSet={removeSet}
              setSwapExerciseIndex={setSwapExerciseIndex}
              setSwapModalOpen={setSwapModalOpen}
            />
          ))}
        </div>

        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : '💾 Salvar Treino'}
          </button>
          <button
            onClick={handleBackToTemplates}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
        </div>

        {/* Modal de Troca de Exercício */}
        {swapExerciseIndex !== null && (
          <ExerciseSwapModal
            currentExercise={currentWorkout[swapExerciseIndex]}
            isOpen={swapModalOpen}
            onClose={() => {
              setSwapModalOpen(false);
              setSwapExerciseIndex(null);
            }}
            onSelect={handleExerciseSwap}
          />
        )}
      </div>
    );
  }

  // Se um programa foi selecionado, mostrar os templates desse programa
  if (selectedProgram) {
    const program = workoutPrograms[selectedProgram];
    return (
      <div className="flex justify-center min-h-screen py-12 px-8">
        <div className="w-full max-w-4xl">
          <div className="mb-10 flex items-center gap-4">
            <button
              onClick={handleBackToPrograms}
              className="text-2xl transition-all hover:scale-110"
              style={{ color: 'var(--accent-primary)' }}
            >
              ←
            </button>
          </div>
          <p className="text-base mb-14 text-center" style={{ color: 'var(--text-muted)' }}>
            {program.description}
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-10 text-center" style={{ color: 'var(--accent-secondary)' }}>
              Selecione um treino:
            </h2>
            
            {/* Espaçamento vertical */}
            <div style={{ height: '24px' }}></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {program.templates.map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateSelect(template)}
                  className="card-neon text-left transition-all hover:scale-105"
                  style={{ padding: '24px' }}
                >
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>
                    {template}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {workoutTemplates[template as keyof typeof workoutTemplates].length} exercícios
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela inicial com os 3 programas principais
  return (
    <div className="flex justify-center min-h-screen py-12 px-8">
      <div className="w-full max-w-6xl">
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl font-bold mb-6 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Treinos
          </h1>
          <h2 className="text-xl font-semibold mb-10" style={{ color: 'var(--accent-secondary)' }}>
            Escolha um programa de treino:
          </h2>
        </div>
        
        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>
        
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(workoutPrograms).map(([key, program]) => (
              <button
                key={key}
                onClick={() => handleProgramSelect(key as keyof typeof workoutPrograms)}
                className="card-neon text-left p-8 transition-all hover:scale-105"
                style={{
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-glow" style={{ color: 'var(--accent-primary)' }}>
                    {program.name}
                  </h3>
                  <p className="text-base mb-6" style={{ color: 'var(--text-muted)' }}>
                    {program.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium" style={{ color: 'var(--accent-secondary)' }}>
                    {program.templates.length} treinos
                  </span>
                  <span className="text-2xl transition-transform group-hover:translate-x-2" style={{ color: 'var(--accent-primary)' }}>
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
      </div>
    </div>
  );
}
