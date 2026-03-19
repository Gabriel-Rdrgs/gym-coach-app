'use client';

import { useState, useEffect, useRef } from 'react';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  type: string;
  imageUrl?: string | null;
  equipment?: string | null;
}

interface ExerciseSwapModalProps {
  currentExercise: {
    name: string;
    muscleGroup: string;
    type?: string;
    sets?: any[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: any) => void;
  mode?: "add" | "swap"; // <<< NOVO
}

export default function ExerciseSwapModal({
  currentExercise,
  isOpen,
  onClose,
  onSelect,
  mode = "swap", // <<< NOVO (valor padrão)
}: ExerciseSwapModalProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // No modo "add", não precisa de name para carregar
      // No modo "swap", só carrega se tiver nome do exercício atual
      if (mode === "add" || currentExercise.name) {
        loadAlternatives();
      }
    }
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
    };
  }, [isOpen, currentExercise?.name, mode]);



  const loadAlternatives = async () => {
    try {
      setLoading(true);

      let url: string;

      if (mode === "swap") {
        // MODO TROCAR: continua usando a lógica antiga
        url = `/api/exercises/alternatives?name=${encodeURIComponent(
          currentExercise.name
        )}`;
      } else {
        // MODO ADICIONAR: usa a lista geral de exercícios
        url = `/api/exercises`; // <<< usa a rota que você já tem [file:31]
      }

      const response = await fetch(url);
      if (!response.ok) {
        setAlternatives([]);
        return;
      }

      const data = await response.json();

      // Ajustar conforme formato real da resposta
      // /api/exercises devolve { exercises: [...] } [file:31]
      const list =
        mode === "swap" ? data.alternatives ?? [] : data.exercises ?? [];

      setAlternatives(list);
    } catch (error) {
      console.error("Erro ao carregar alternativas:", error);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };


  const handleRoll = () => {
    const filtered = alternatives.filter((ex) =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      return;
    }

    setIsRolling(true);
    setHighlightedIndex(null);

    // Animação de rolagem - destaca exercícios em sequência
    let currentIndex = 0;
    const rollDuration = 2000; // 2 segundos de animação
    const intervalTime = 100; // Muda de exercício a cada 100ms

    rollIntervalRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % filtered.length;
      setHighlightedIndex(currentIndex);
    }, intervalTime);

    // Após a animação, seleciona um exercício aleatório
    setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }

      const randomIndex = Math.floor(Math.random() * filtered.length);
      const selectedExercise = filtered[randomIndex];
      
      // Destacar o exercício selecionado por um momento
      setHighlightedIndex(randomIndex);
      
      // Aguardar um pouco antes de selecionar
      setTimeout(() => {
        setIsRolling(false);
        setHighlightedIndex(null);
        onSelect(selectedExercise);
        onClose();
      }, 500);
    }, rollDuration);
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
        className="card-neon w-full max-w-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          padding: '0',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
          <h2
            className="text-2xl font-bold text-glow"
            style={{ color: 'var(--accent-primary)' }}
          >
            🔄 {mode === "add" ? "Adicionar Exercício" : "Trocar Exercício"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all hover:scale-110"
            style={{ color: 'var(--accent-warning)' }}
          >
            ✕
          </button>
        </div>

        {/* Área de busca fixa */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            {mode === "swap" && (
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Exercício atual: <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{currentExercise.name}</span>
          </p>
          )}
            {!loading && filteredAlternatives.length > 0 && (
              <p className="text-sm" style={{ color: 'var(--accent-secondary)' }}>
                {filteredAlternatives.length} {filteredAlternatives.length === 1 ? 'alternativa' : 'alternativas'}
              </p>
            )}
          </div>
          <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar exercício alternativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="input-neon flex-1"
              disabled={isRolling}
            />
            <button
              onClick={handleRoll}
              disabled={isRolling || filteredAlternatives.length === 0}
              className="btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minWidth: '120px',
                background: isRolling 
                  ? 'linear-gradient(135deg, var(--accent-secondary), #8b5cf6)'
                  : 'linear-gradient(135deg, var(--accent-primary), #0099cc)',
                animation: isRolling ? 'pulse 0.5s infinite' : 'none',
              }}
            >
              <span className="text-xl">{isRolling ? '🎲' : '🎯'}</span>
              <span>{isRolling ? 'Rolando...' : 'Roll'}</span>
            </button>
          </div>
        </div>

        {/* Área scrollável de exercícios */}
        <div 
          className="flex-1 overflow-y-auto relative"
          style={{
            maxHeight: 'calc(85vh - 200px)',
            scrollbarWidth: 'thin',
          }}
        >
          {/* Indicador de scroll no topo */}
          {!loading && filteredAlternatives.length > 4 && (
            <div 
              className="sticky top-0 left-0 right-0 h-4 pointer-events-none z-10 mb-2"
              style={{
                background: 'linear-gradient(to bottom, var(--bg-card), transparent)',
              }}
            />
          )}
          
          <div className="p-6">
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
            {filteredAlternatives.map((exercise, index) => {
              const isHighlighted = highlightedIndex === index;
              const isCurrent = !isRolling && highlightedIndex === index;
              
              return (
              <button
                key={exercise.id}
                onClick={() => {
                    if (!isRolling) {
                  onSelect(exercise);
                  onClose();
                    }
                }}
                  disabled={isRolling}
                  className="card-neon text-left p-4 transition-all relative"
                style={{
                    border: isHighlighted 
                      ? '3px solid var(--accent-secondary)' 
                      : '1px solid var(--accent-primary)',
                    cursor: isRolling ? 'not-allowed' : 'pointer',
                    transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    background: isHighlighted 
                      ? 'rgba(167, 139, 250, 0.2)' 
                      : 'var(--bg-card)',
                    boxShadow: isHighlighted
                      ? '0 0 30px rgba(167, 139, 250, 0.6), 0 0 60px rgba(167, 139, 250, 0.3)'
                      : '0 0 20px rgba(0, 217, 255, 0.15)',
                    opacity: isRolling && !isHighlighted ? 0.5 : 1,
                    pointerEvents: isRolling ? 'none' : 'auto',
                    animation: isCurrent ? 'selected-pulse 0.5s ease-out' : 'none',
                }}
              >
                  {isHighlighted && (
                    <div 
                      className="absolute top-2 right-2 text-2xl animate-bounce z-10"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      ✨
                    </div>
                  )}
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
              );
            })}
            </div>
          )}
          </div>
          
          {/* Indicador de scroll no rodapé */}
          {!loading && filteredAlternatives.length > 4 && (
            <div 
              className="sticky bottom-0 left-0 right-0 h-4 pointer-events-none z-10 mt-2"
              style={{
                background: 'linear-gradient(to top, var(--bg-card), transparent)',
              }}
            />
        )}
        </div>
      </div>
    </div>
  );
}

