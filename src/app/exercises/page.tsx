'use client';

import { useState, useEffect } from 'react';
import ExerciseModal from '@/components/ExerciseModal';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  type: string;
  notes?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !filterMuscleGroup || ex.muscleGroup === filterMuscleGroup;
    const matchesType = !filterType || ex.type === filterType;
    const matchesEquipment = !filterEquipment || ex.equipment === filterEquipment;
    const matchesDifficulty = !filterDifficulty || ex.difficulty === filterDifficulty;
    return matchesSearch && matchesMuscleGroup && matchesType && matchesEquipment && matchesDifficulty;
  });

  const uniqueMuscleGroups = Array.from(new Set(exercises.map((ex) => ex.muscleGroup))).sort();
  const uniqueTypes = Array.from(new Set(exercises.map((ex) => ex.type).filter(Boolean))).sort();
  const uniqueEquipment = Array.from(new Set(exercises.map((ex) => ex.equipment).filter(Boolean))).sort();
  const uniqueDifficulties = Array.from(new Set(exercises.map((ex) => ex.difficulty).filter(Boolean))).sort();

  return (
    <div className="flex justify-center min-h-screen py-12 px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl font-bold mb-6 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Exercícios
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            {exercises.length} exercícios disponíveis
          </p>
        </div>
        
        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>
        
        {/* Filtros e Busca */}
        <div className="card-neon mb-8" style={{ padding: '32px' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
            🔍 Busca e Filtros
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-neon w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filterMuscleGroup}
                onChange={(e) => setFilterMuscleGroup(e.target.value)}
                className="input-neon w-full"
              >
                <option value="">Todos os grupos</option>
                {uniqueMuscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-neon w-full"
              >
                <option value="">Todos os tipos</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'compound' ? 'Composto' : 'Isolado'}
                  </option>
                ))}
              </select>
              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className="input-neon w-full"
              >
                <option value="">Todos os equipamentos</option>
                {uniqueEquipment.map((equipment) => (
                  <option key={equipment} value={equipment || ''}>
                    {equipment}
                  </option>
                ))}
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="input-neon w-full"
              >
                <option value="">Todas as dificuldades</option>
                {uniqueDifficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty || ''}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
            {(filterMuscleGroup || filterType || filterEquipment || filterDifficulty || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterMuscleGroup('');
                  setFilterType('');
                  setFilterEquipment('');
                  setFilterDifficulty('');
                }}
                className="text-sm font-semibold hover:underline"
                style={{ color: 'var(--accent-secondary)' }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhum exercício encontrado
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => {
              const isGif = exercise.imageUrl?.toLowerCase().endsWith('.gif') || 
                           exercise.imageUrl?.includes('giphy') ||
                           exercise.imageUrl?.includes('.gif');
              
              return (
                <div
                  key={exercise.id}
                  className="card-neon cursor-pointer transition-all hover:scale-[1.02] group"
                  style={{ padding: '0', overflow: 'hidden' }}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  {exercise.imageUrl && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        style={{
                          borderBottom: '2px solid var(--accent-primary)',
                        }}
                      />
                      {isGif && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold" style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'var(--accent-primary)',
                        }}>
                          GIF
                        </div>
                      )}
                      {exercise.videoUrl && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold" style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'var(--accent-success)',
                        }}>
                          🎥 Vídeo
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <h2
                      className="text-lg font-bold mb-3 text-glow"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {exercise.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: 'rgba(0, 217, 255, 0.1)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        color: 'var(--accent-primary)',
                      }}>
                        {exercise.muscleGroup.replace('_', ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: 'rgba(167, 139, 250, 0.1)',
                        border: '1px solid rgba(167, 139, 250, 0.3)',
                        color: 'var(--accent-secondary)',
                      }}>
                        {exercise.type === 'compound' ? 'Composto' : 'Isolado'}
                      </span>
                      {exercise.difficulty && (
                        <span className="text-xs px-2 py-1 rounded" style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: 'var(--accent-success)',
                        }}>
                          {exercise.difficulty}
                        </span>
                      )}
                    </div>
                    {exercise.equipment && (
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        🏋️ {exercise.equipment}
                      </p>
                    )}
                    <button
                      className="mt-2 btn-secondary w-full text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExercise(exercise);
                      }}
                    >
                      Ver Detalhes →
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}

        <ExerciseModal
          exercise={selectedExercise}
          isOpen={selectedExercise !== null}
          onClose={() => setSelectedExercise(null)}
        />
      </div>
    </div>
  );
}
