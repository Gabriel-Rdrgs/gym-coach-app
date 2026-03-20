'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

interface Metric {
  id: number;
  date: string;
  weight: number | null;
  waist: number | null;
  armCircumference: number | null;
  thighCircumference: number | null;
  chestCircumference: number | null;
  bodyFatPercentage: number | null;
  sleep: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
}

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  weight: '',
  waist: '',
  armCircumference: '',
  thighCircumference: '',
  chestCircumference: '',
  bodyFatPercentage: '',
  sleep: '',
  energy: '',
  stress: '',
  notes: '',
};

export default function MetricsClient() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const isEditing = editingMetric !== null;
      const response = await fetch('/api/metrics', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: editingMetric.id, ...formData } : formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar métrica');

      await fetchMetrics();
      setShowForm(false);
      setEditingMetric(null);
      setFormData(emptyForm);
      toast.success(isEditing ? 'Métrica atualizada com sucesso!' : 'Métrica salva com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar métrica. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setFormData({
      date: new Date(metric.date).toISOString().split('T')[0],
      weight: metric.weight?.toString() ?? '',
      waist: metric.waist?.toString() ?? '',
      armCircumference: metric.armCircumference?.toString() ?? '',
      thighCircumference: metric.thighCircumference?.toString() ?? '',
      chestCircumference: metric.chestCircumference?.toString() ?? '',
      bodyFatPercentage: metric.bodyFatPercentage?.toString() ?? '',
      sleep: metric.sleep?.toString() ?? '',
      energy: metric.energy?.toString() ?? '',
      stress: metric.stress?.toString() ?? '',
      notes: metric.notes ?? '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/metrics?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar métrica');

      setMetrics((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
      toast.success('Métrica excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir métrica. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMetric(null);
    setFormData(emptyForm);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: 'var(--accent-primary)' }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <h1
            className="text-5xl font-bold mb-8 text-glow"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Métricas
          </h1>
          <button
            onClick={() => {
              if (showForm && !editingMetric) {
                handleCancelForm();
              } else {
                setEditingMetric(null);
                setFormData(emptyForm);
                setShowForm(true);
              }
            }}
            className="btn-primary"
          >
            {showForm && !editingMetric ? 'Cancelar' : '+ Nova Métrica'}
          </button>
        </div>

        {showForm && <div style={{ height: '32px' }}></div>}

        {/* Formulário (criar ou editar) */}
        {showForm && (
          <div className="card-neon mb-12">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent-secondary)' }}>
              {editingMetric ? 'Editar Métrica' : 'Adicionar Nova Métrica'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-neon w-full"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-x-4 gap-y-8">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 75.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Cintura (cm)
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 82.0"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Braço (cm)
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 35.0"
                    value={formData.armCircumference}
                    onChange={(e) => setFormData({ ...formData, armCircumference: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Coxa (cm)
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 58.0"
                    value={formData.thighCircumference}
                    onChange={(e) => setFormData({ ...formData, thighCircumference: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Peito (cm)
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 100.0"
                    value={formData.chestCircumference}
                    onChange={(e) => setFormData({ ...formData, chestCircumference: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    % Gordura Corporal
                  </label>
                  <input
                    type="number" step="0.1" placeholder="Ex: 15.5"
                    value={formData.bodyFatPercentage}
                    onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Sono (horas)
                  </label>
                  <input
                    type="number" step="0.5" placeholder="Ex: 7.5"
                    value={formData.sleep}
                    onChange={(e) => setFormData({ ...formData, sleep: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Energia (1-5)
                  </label>
                  <input
                    type="number" min="1" max="5" placeholder="Ex: 4"
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Estresse (1-5)
                  </label>
                  <input
                    type="number" min="1" max="5" placeholder="Ex: 2"
                    value={formData.stress}
                    onChange={(e) => setFormData({ ...formData, stress: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Adicione observações..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-neon w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingMetric
                    ? '💾 Atualizar Métrica'
                    : '💾 Salvar Métrica'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de métricas */}
        {metrics.length === 0 ? (
          <div className="card-neon text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhuma métrica registrada ainda. Adicione sua primeira métrica!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.id} className="card-neon" style={{ padding: '32px' }}>

                {/* Cabeçalho do card com botões */}
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {formatDate(metric.date)}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(metric)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                      style={{
                        background: 'rgba(167, 139, 250, 0.1)',
                        border: '1px solid var(--accent-secondary)',
                        color: 'var(--accent-secondary)',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(metric.id)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--accent-warning)',
                        color: 'var(--accent-warning)',
                      }}
                    >
                      🗑 Excluir
                    </button>
                  </div>
                </div>

                {/* Dados da métrica */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 mb-8">
                  {metric.weight !== null && metric.weight !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Peso</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.weight.toFixed(1)} kg
                      </div>
                    </div>
                  )}
                  {metric.waist !== null && metric.waist !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Cintura</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.waist.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {metric.armCircumference !== null && metric.armCircumference !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Braço</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.armCircumference.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {metric.thighCircumference !== null && metric.thighCircumference !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Coxa</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.thighCircumference.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {metric.chestCircumference !== null && metric.chestCircumference !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Peito</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.chestCircumference.toFixed(1)} cm
                      </div>
                    </div>
                  )}
                  {metric.bodyFatPercentage !== null && metric.bodyFatPercentage !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>% Gordura</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.bodyFatPercentage.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {metric.sleep !== null && metric.sleep !== undefined && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Sono</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
                        {metric.sleep.toFixed(1)}h
                      </div>
                    </div>
                  )}
                  {metric.energy !== null && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Energia</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                        {metric.energy}/5
                      </div>
                    </div>
                  )}
                  {metric.stress !== null && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Estresse</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                        {metric.stress}/5
                      </div>
                    </div>
                  )}
                </div>

                {metric.notes && (
                  <div className="mt-6 p-4 rounded" style={{
                    background: 'rgba(167, 139, 250, 0.1)',
                    border: '1px solid var(--accent-secondary)',
                  }}>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{metric.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="card-neon w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '32px' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--accent-warning)' }}>
              Confirmar Exclusão
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
              Tem certeza que deseja excluir esta métrica? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="btn-primary flex-1 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-warning), #dc2626)',
                }}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
