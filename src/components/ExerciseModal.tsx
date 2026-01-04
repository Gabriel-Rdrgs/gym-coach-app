'use client';

import { useState } from 'react';
import { convertYouTubeUrlToEmbed, isYouTubeUrl } from '@/lib/youtube-utils';

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

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseModal({
  exercise,
  isOpen,
  onClose,
}: ExerciseModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'video'>('info');

  if (!isOpen || !exercise) return null;

  const isGif = exercise.imageUrl?.toLowerCase().endsWith('.gif') || 
                exercise.imageUrl?.includes('giphy') ||
                exercise.imageUrl?.includes('.gif');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card-neon neon-glow w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          padding: '40px',
          border: '2px solid var(--accent-primary)',
          boxShadow: '0 0 40px rgba(0, 217, 255, 0.4), 0 0 80px rgba(0, 217, 255, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--accent-primary)' }}>
          <div className="flex-1">
            <h2
              className="text-3xl font-bold mb-2 text-glow"
              style={{ color: 'var(--accent-primary)' }}
            >
              💪 {exercise.name}
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm px-3 py-1 rounded-full" style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}>
                {exercise.muscleGroup.replace('_', ' ')}
              </span>
              <span className="text-sm px-3 py-1 rounded-full" style={{
                background: 'rgba(167, 139, 250, 0.1)',
                border: '1px solid var(--accent-secondary)',
                color: 'var(--accent-secondary)',
              }}>
                {exercise.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-3xl transition-all hover:scale-110 p-2 rounded-lg"
            style={{ 
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)';
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        {(exercise.imageUrl || exercise.videoUrl) && (
          <div className="flex gap-2 mb-6">
            {exercise.imageUrl && (
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'info' ? 'text-glow' : ''
                }`}
                style={{
                  background: activeTab === 'info' 
                    ? 'rgba(0, 217, 255, 0.2)' 
                    : 'rgba(0, 217, 255, 0.05)',
                  border: `1px solid ${activeTab === 'info' ? 'var(--accent-primary)' : 'rgba(0, 217, 255, 0.3)'}`,
                  color: activeTab === 'info' 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-muted)',
                }}
              >
                📸 Visualização
              </button>
            )}
            {exercise.videoUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'video' ? 'text-glow' : ''
                }`}
                style={{
                  background: activeTab === 'video' 
                    ? 'rgba(0, 217, 255, 0.2)' 
                    : 'rgba(0, 217, 255, 0.05)',
                  border: `1px solid ${activeTab === 'video' ? 'var(--accent-primary)' : 'rgba(0, 217, 255, 0.3)'}`,
                  color: activeTab === 'video' 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-muted)',
                }}
              >
                🎥 Vídeo Tutorial
              </button>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visualização (GIF/Imagem) */}
          {activeTab === 'info' && exercise.imageUrl && (
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden" style={{
                border: '2px solid var(--accent-primary)',
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
              }}>
                {isGif ? (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                ) : (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                )}
                {isGif && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold" style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'var(--accent-primary)',
                  }}>
                    GIF
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vídeo Tutorial */}
          {activeTab === 'video' && exercise.videoUrl && (() => {
            const embedUrl = isYouTubeUrl(exercise.videoUrl) 
              ? convertYouTubeUrlToEmbed(exercise.videoUrl) 
              : exercise.videoUrl;
            
            return embedUrl ? (
              <div className="mb-6">
                <div className="relative rounded-lg overflow-hidden" style={{
                  border: '2px solid var(--accent-primary)',
                  boxShadow: '0 0 30px rgba(0, 217, 255, 0.4)',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                }}>
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null;
          })()}

          {/* Informações do Exercício */}
          <div className="space-y-6">
            <div className="p-5 rounded-lg" style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
            }}>
              <h3
                className="text-xl font-bold mb-4 text-glow"
                style={{ color: 'var(--accent-primary)' }}
              >
                📋 Informações
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[120px]" style={{ color: 'var(--accent-secondary)' }}>
                    Grupo Muscular:
                  </span>
                  <span className="capitalize" style={{ color: 'var(--text-primary)' }}>
                    {exercise.muscleGroup.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[120px]" style={{ color: 'var(--accent-secondary)' }}>
                    Tipo:
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {exercise.type === 'compound' ? 'Composto' : 'Isolado'}
                  </span>
                </div>
                {exercise.equipment && (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold min-w-[120px]" style={{ color: 'var(--accent-secondary)' }}>
                      Equipamento:
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {exercise.equipment}
                    </span>
                  </div>
                )}
                {exercise.difficulty && (
                  <div className="flex items-start gap-3">
                    <span className="font-semibold min-w-[120px]" style={{ color: 'var(--accent-secondary)' }}>
                      Dificuldade:
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {exercise.difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {exercise.notes && (
              <div className="p-5 rounded-lg" style={{
                background: 'rgba(167, 139, 250, 0.05)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
              }}>
                <h3
                  className="text-xl font-bold mb-3 text-glow"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  💡 Dicas e Instruções
                </h3>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {exercise.notes}
                </p>
              </div>
            )}

            {exercise.videoUrl && activeTab === 'info' && (
              <div className="p-5 rounded-lg text-center" style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: 'var(--accent-success)' }}
                >
                  🎥 Vídeo Tutorial Disponível
                </h3>
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  Assistir Vídeo
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

