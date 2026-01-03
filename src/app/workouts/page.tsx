'use client';

import { useState } from 'react';
import { workoutTemplates, workoutPrograms } from '@/data/templates';
import ExerciseSwapModal from '@/components/ExerciseSwapModal';

interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
}

interface ExerciseData {
  name: string;
  muscleGroup: string;
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

  const handleProgramSelect = (program: keyof typeof workoutPrograms) => {
    setSelectedProgram(program);
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    const exercises = workoutTemplates[template as keyof typeof workoutTemplates];
    // Inicializar cada exercício com 3 séries vazias
    const workoutWithSets: ExerciseData[] = exercises.map((ex) => ({
      ...ex,
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

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetData, value: number | undefined) => {
    const updatedWorkout = [...currentWorkout];
    updatedWorkout[exerciseIndex].sets[setIndex] = {
      ...updatedWorkout[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setCurrentWorkout(updatedWorkout);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedWorkout = [...currentWorkout];
    const newSetNumber = updatedWorkout[exerciseIndex].sets.length + 1;
    updatedWorkout[exerciseIndex].sets.push({
      setNumber: newSetNumber,
      weight: 0,
      reps: 0,
      rir: undefined,
    });
    setCurrentWorkout(updatedWorkout);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedWorkout = [...currentWorkout];
    if (updatedWorkout[exerciseIndex].sets.length > 1) {
      updatedWorkout[exerciseIndex].sets.splice(setIndex, 1);
      // Renumerar os sets
      updatedWorkout[exerciseIndex].sets.forEach((set, idx) => {
        set.setNumber = idx + 1;
      });
      setCurrentWorkout(updatedWorkout);
    }
  };

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

      alert('Treino salvo com sucesso!');
      // Reset form
      setSelectedTemplate('');
      setCurrentWorkout([]);
      setShowForm(false);
      setNotes('');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar treino. Tente novamente.');
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
      };
      setCurrentWorkout(updatedWorkout);
    }
    setSwapModalOpen(false);
    setSwapExerciseIndex(null);
  };

  const WorkoutCard = ({ exercise, index }: { exercise: ExerciseData; index: number }) => (
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
        <button
          onClick={() => {
            setSwapExerciseIndex(index);
            setSwapModalOpen(true);
          }}
          className="ml-4 px-3 py-1 text-sm font-medium transition-all hover:scale-105"
          style={{
            color: 'var(--accent-secondary)',
            border: '1px solid var(--accent-secondary)',
            borderRadius: 'var(--border-radius)',
          }}
          title="Trocar exercício"
        >
          🔄
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
          <div>Série</div>
          <div>Peso (kg)</div>
          <div>Reps</div>
          <div>RIR</div>
          <div></div>
        </div>

        {exercise.sets.map((set, setIndex) => (
          <div key={setIndex} className="grid grid-cols-5 gap-2">
            <div className="flex items-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {set.setNumber}
            </div>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="0"
              value={set.weight || ''}
              onChange={(e) => updateSet(index, setIndex, 'weight', parseFloat(e.target.value) || 0)}
              className="input-neon"
            />
            <input
              type="number"
              min="0"
              placeholder="0"
              value={set.reps || ''}
              onChange={(e) => updateSet(index, setIndex, 'reps', parseInt(e.target.value) || 0)}
              className="input-neon"
            />
            <input
              type="number"
              step="0.5"
              min="0"
              max="5"
              placeholder="0"
              value={set.rir || ''}
              onChange={(e) => updateSet(index, setIndex, 'rir', parseFloat(e.target.value) || undefined)}
              className="input-neon"
            />
            <button
              onClick={() => removeSet(index, setIndex)}
              className="text-sm transition-all hover:scale-110"
              style={{ 
                color: 'var(--accent-warning)',
                cursor: exercise.sets.length === 1 ? 'not-allowed' : 'pointer',
                opacity: exercise.sets.length === 1 ? 0.5 : 1
              }}
              disabled={exercise.sets.length === 1}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() => addSet(index)}
          className="mt-2 text-sm font-medium transition-all hover:scale-105"
          style={{ color: 'var(--accent-secondary)' }}
        >
          + Adicionar série
        </button>
      </div>
    </div>
  );

  if (showForm) {
    return (
      <div className="flex justify-center min-h-screen py-12 px-8">
        <div className="w-full max-w-4xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-glow mb-3" style={{ color: 'var(--accent-primary)' }}>
              {selectedTemplate}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Preencha os dados do seu treino
            </p>
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
            <WorkoutCard key={index} exercise={exercise} index={index} />
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
