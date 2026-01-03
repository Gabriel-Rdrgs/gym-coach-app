'use client';

import { useState, useEffect } from 'react';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  type: string;
  imageUrl?: string | null;
  equipment?: string | null;
}

interface ExerciseSwapModalProps {
  currentExercise: { name: string; muscleGroup: string };
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSwapModal({
  currentExercise,
  isOpen,
  onClose,
  onSelect,
}: ExerciseSwapModalProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && currentExercise.name) {
      loadAlternatives();
    }
  }, [isOpen, currentExercise.name]);

  const loadAlternatives = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/exercises/alternatives?exerciseName=${encodeURIComponent(currentExercise.name)}&limit=10`
      );
      const data = await response.json();
      setAlternatives(data.alternatives || []);
    } catch (error) {
      console.error('Erro ao carregar alternativas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAlternatives = alternatives.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="card-neon w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '32px' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            🔄 Trocar Exercício
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all hover:scale-110"
            style={{ color: 'var(--accent-warning)' }}
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-base mb-4" style={{ color: 'var(--text-muted)' }}>
            Exercício atual: <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{currentExercise.name}</span>
          </p>
          <input
            type="text"
            placeholder="Buscar exercício alternativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neon w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p style={{ color: 'var(--text-muted)' }}>Carregando alternativas...</p>
          </div>
        ) : filteredAlternatives.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhum exercício alternativo encontrado
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredAlternatives.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => {
                  onSelect(exercise);
                  onClose();
                }}
                className="card-neon text-left p-4 transition-all hover:scale-105"
                style={{
                  border: '1px solid var(--accent-primary)',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-start gap-4">
                  {exercise.imageUrl && (
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-lg mb-1"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {exercise.name}
                    </h3>
                    <p className="text-sm capitalize mb-2" style={{ color: 'var(--text-muted)' }}>
                      {exercise.muscleGroup.replace('_', ' ')} • {exercise.type}
                    </p>
                    {exercise.equipment && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        🏋️ {exercise.equipment}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

