'use client';

import { useState, useEffect } from 'react';
import { convertYouTubeUrlToEmbed, isYouTubeUrl, extractYouTubeVideoId } from '@/lib/youtube-utils';

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

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForms, setEditForms] = useState<{ [key: number]: Partial<Exercise> }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('');
  const [saving, setSaving] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSave = async (exercise: Exercise, formData: Partial<Exercise>) => {
    setSaving(exercise.id);
    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(exercises.map(ex => ex.id === exercise.id ? data.exercise : ex));
        setEditingId(null);
        setSuccessMessage(`✅ ${exercise.name} atualizado com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert('Erro ao atualizar exercício');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar exercício');
    } finally {
      setSaving(null);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !filterMuscleGroup || ex.muscleGroup === filterMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  const uniqueMuscleGroups = Array.from(new Set(exercises.map((ex) => ex.muscleGroup))).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-6xl">
        <div className="mb-12 text-center">
          <h1 
            className="text-5xl font-bold mb-4 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            ⚙️ Administração de Exercícios
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Adicione GIFs, vídeos e informações aos exercícios
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg text-center" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--accent-success)',
            color: 'var(--accent-success)',
          }}>
            {successMessage}
          </div>
        )}

        {/* Filtros */}
        <div className="card-neon mb-8" style={{ padding: '24px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-neon w-full"
            />
            <select
              value={filterMuscleGroup}
              onChange={(e) => setFilterMuscleGroup(e.target.value)}
              className="input-neon w-full"
            >
              <option value="">Todos os grupos musculares</option>
              {uniqueMuscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="space-y-4">
          {filteredExercises.map((exercise) => {
            const isEditing = editingId === exercise.id;
            const formData = editForms[exercise.id] || {
              imageUrl: exercise.imageUrl || '',
              videoUrl: exercise.videoUrl || '',
              equipment: exercise.equipment || '',
              difficulty: exercise.difficulty || '',
              notes: exercise.notes || '',
            };

            const updateFormData = (updates: Partial<Exercise>) => {
              setEditForms(prev => ({
                ...prev,
                [exercise.id]: { ...formData, ...updates }
              }));
            };

            return (
              <div
                key={exercise.id}
                className="card-neon"
                style={{ padding: '24px' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold mb-2 text-glow"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {exercise.name}
                    </h3>
                    <div className="flex gap-2 mb-2">
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
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingId(exercise.id);
                        setEditForms(prev => ({
                          ...prev,
                          [exercise.id]: {
                            imageUrl: exercise.imageUrl || '',
                            videoUrl: exercise.videoUrl || '',
                            equipment: exercise.equipment || '',
                            difficulty: exercise.difficulty || '',
                            notes: exercise.notes || '',
                          }
                        }));
                      }}
                      className="btn-primary"
                    >
                      ✏️ Editar
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                        URL da Imagem/GIF
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl || ''}
                        onChange={(e) => updateFormData({ imageUrl: e.target.value })}
                        placeholder="https://exemplo.com/exercicio.gif"
                        className="input-neon w-full"
                      />
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-full max-w-xs h-32 object-cover rounded"
                            style={{ border: '1px solid var(--accent-primary)' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                        URL do Vídeo Tutorial (YouTube, Vimeo, etc)
                      </label>
                      <input
                        type="url"
                        value={formData.videoUrl || ''}
                        onChange={(e) => updateFormData({ videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                        className="input-neon w-full"
                      />
                      {formData.videoUrl && isYouTubeUrl(formData.videoUrl) && (
                        <div className="mt-3 p-3 rounded text-xs" style={{
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '1px solid rgba(0, 217, 255, 0.3)',
                          color: 'var(--accent-primary)',
                        }}>
                          ✅ URL do YouTube detectada - será convertida para embed automaticamente
                        </div>
                      )}
                      {formData.videoUrl && isYouTubeUrl(formData.videoUrl) && convertYouTubeUrlToEmbed(formData.videoUrl) && (
                        <div className="mt-3">
                          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                            Preview do embed:
                          </p>
                          <div className="relative rounded-lg overflow-hidden" style={{
                            border: '1px solid var(--accent-primary)',
                            paddingBottom: '56.25%', // 16:9 aspect ratio
                            height: 0,
                          }}>
                            <iframe
                              src={convertYouTubeUrlToEmbed(formData.videoUrl) || ''}
                              className="absolute top-0 left-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
                      <div>
                        <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Equipamento
                        </label>
                        <input
                          type="text"
                          value={formData.equipment || ''}
                          onChange={(e) => updateFormData({ equipment: e.target.value })}
                          placeholder="Barra, Halteres, Máquina..."
                          className="input-neon w-full"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Dificuldade
                        </label>
                        <select
                          value={formData.difficulty || ''}
                          onChange={(e) => updateFormData({ difficulty: e.target.value || null })}
                          className="input-neon w-full"
                        >
                          <option value="">Selecione...</option>
                          <option value="Iniciante">Iniciante</option>
                          <option value="Intermediário">Intermediário</option>
                          <option value="Avançado">Avançado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                        Notas/Dicas
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => updateFormData({ notes: e.target.value })}
                        placeholder="Dicas de execução, pontos de atenção..."
                        className="input-neon w-full"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(exercise, formData)}
                        disabled={saving === exercise.id}
                        className="btn-primary"
                      >
                        {saving === exercise.id ? 'Salvando...' : '💾 Salvar'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForms(prev => {
                            const newForms = { ...prev };
                            delete newForms[exercise.id];
                            return newForms;
                          });
                        }}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {exercise.imageUrl && (
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Imagem/GIF:
                        </span>{' '}
                        <a
                          href={exercise.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          Ver
                        </a>
                      </p>
                    )}
                    {exercise.videoUrl && (
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Vídeo:
                        </span>{' '}
                        <a
                          href={exercise.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          Ver
                        </a>
                      </p>
                    )}
                    {exercise.equipment && (
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Equipamento:
                        </span>{' '}
                        {exercise.equipment}
                      </p>
                    )}
                    {exercise.difficulty && (
                      <p style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                          Dificuldade:
                        </span>{' '}
                        {exercise.difficulty}
                      </p>
                    )}
                    {exercise.notes && (
                      <p style={{ color: 'var(--text-muted)' }}>
                        {exercise.notes}
                      </p>
                    )}
                    {!exercise.imageUrl && !exercise.videoUrl && !exercise.equipment && !exercise.difficulty && !exercise.notes && (
                      <p style={{ color: 'var(--text-muted)' }}>
                        Nenhuma informação adicional cadastrada
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div className="card-neon text-center" style={{ padding: '60px' }}>
            <div className="text-6xl mb-6">🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhum exercício encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

