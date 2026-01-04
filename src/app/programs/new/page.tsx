'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { workoutTemplates, workoutPrograms } from '@/data/templates';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

interface ScheduledWorkout {
  template: string;
  dayOfWeek: number;
  weekNumber: number;
  order: number;
}

export default function NewProgramPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Obter todos os templates disponíveis
  const allTemplates = Object.keys(workoutTemplates);

  const handleAddTemplate = (template: string) => {
    if (!selectedTemplates.includes(template)) {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  const handleRemoveTemplate = (template: string) => {
    setSelectedTemplates(selectedTemplates.filter((t) => t !== template));
    setScheduledWorkouts(
      scheduledWorkouts.filter((sw) => sw.template !== template)
    );
  };

  const handleScheduleWorkout = (
    template: string,
    dayOfWeek: number,
    weekNumber: number = 1
  ) => {
    const existing = scheduledWorkouts.find(
      (sw) =>
        sw.template === template &&
        sw.dayOfWeek === dayOfWeek &&
        sw.weekNumber === weekNumber
    );

    if (existing) {
      // Remover se já existe
      setScheduledWorkouts(
        scheduledWorkouts.filter(
          (sw) =>
            !(
              sw.template === template &&
              sw.dayOfWeek === dayOfWeek &&
              sw.weekNumber === weekNumber
            )
        )
      );
    } else {
      // Adicionar novo
      const order = scheduledWorkouts.filter(
        (sw) => sw.dayOfWeek === dayOfWeek && sw.weekNumber === weekNumber
      ).length;
      setScheduledWorkouts([
        ...scheduledWorkouts,
        { template, dayOfWeek, weekNumber, order },
      ]);
    }
  };

  const isWorkoutScheduled = (
    template: string,
    dayOfWeek: number,
    weekNumber: number = 1
  ) => {
    return scheduledWorkouts.some(
      (sw) =>
        sw.template === template &&
        sw.dayOfWeek === dayOfWeek &&
        sw.weekNumber === weekNumber
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Nome do programa é obrigatório');
      return;
    }

    if (scheduledWorkouts.length === 0) {
      toast.error('Adicione pelo menos um treino ao programa');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || null,
          startDate,
          scheduledWorkouts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Programa criado com sucesso!');
        router.push(`/programs/${data.program.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar programa');
      }
    } catch (error) {
      console.error('Erro ao criar programa:', error);
      toast.error('Erro ao criar programa. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-5xl font-bold mb-4 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Novo Programa de Treino
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Crie um programa personalizado baseado em recomendações OMS
            <br />
            <span className="text-sm">
              (10-20 séries válidas semanais por grupo muscular)
            </span>
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-8">
          {/* Informações Básicas */}
          <div className="card-neon" style={{ padding: '32px' }}>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--accent-primary)' }}
            >
              Informações Básicas
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Nome do Programa *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Hipertrofia 4x/semana"
                  className="input-neon w-full"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo do programa..."
                  className="input-neon w-full"
                  rows={3}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-neon"
                />
              </div>
            </div>
          </div>

          {/* Seleção de Templates */}
          <div className="card-neon" style={{ padding: '32px' }}>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Templates de Treino
            </h2>
            <div className="mb-6">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Selecione os templates que farão parte do programa:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4 md:gap-y-6">
                {allTemplates.map((template) => (
                  <button
                    key={template}
                    onClick={() => handleAddTemplate(template)}
                    disabled={selectedTemplates.includes(template)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedTemplates.includes(template)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      background: selectedTemplates.includes(template)
                        ? 'rgba(107, 114, 128, 0.2)'
                        : 'rgba(167, 139, 250, 0.2)',
                      border: '1px solid var(--accent-secondary)',
                      color: 'var(--accent-secondary)',
                    }}
                  >
                    {selectedTemplates.includes(template) ? '✓ ' : '+ '}
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Selecionados */}
            {selectedTemplates.length > 0 && (
              <div className="mt-6">
                <p className="text-sm mb-4 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  Templates Selecionados ({selectedTemplates.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplates.map((template) => (
                    <div
                      key={template}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: 'rgba(0, 217, 255, 0.2)',
                        border: '1px solid var(--accent-primary)',
                      }}
                    >
                      <span style={{ color: 'var(--accent-primary)' }}>{template}</span>
                      <button
                        onClick={() => handleRemoveTemplate(template)}
                        className="text-lg hover:scale-110 transition-all"
                        style={{ color: 'var(--accent-warning)' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendário Semanal */}
          {selectedTemplates.length > 0 && (
            <div className="card-neon" style={{ padding: '32px' }}>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--accent-primary)' }}
              >
                Distribuição Semanal
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Clique nos dias da semana para agendar os treinos:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3" style={{ color: 'var(--text-muted)' }}>
                        Dia
                      </th>
                      {selectedTemplates.map((template) => (
                        <th
                          key={template}
                          className="text-center p-3 text-sm"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          {template}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_OF_WEEK.map((day, dayIndex) => (
                      <tr
                        key={dayIndex}
                        className="border-t"
                        style={{ borderColor: 'rgba(0, 217, 255, 0.2)' }}
                      >
                        <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {day}
                        </td>
                        {selectedTemplates.map((template) => {
                          const isScheduled = isWorkoutScheduled(template, dayIndex);
                          return (
                            <td key={template} className="p-3 text-center">
                              <button
                                onClick={() => handleScheduleWorkout(template, dayIndex)}
                                className={`w-8 h-8 rounded transition-all ${
                                  isScheduled
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                title={isScheduled ? 'Remover treino' : 'Adicionar treino'}
                              >
                                {isScheduled ? '✓' : ''}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                <p>
                  Total de treinos agendados: <strong>{scheduledWorkouts.length}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || scheduledWorkouts.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : '💾 Criar Programa'}
            </button>
            <button
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

