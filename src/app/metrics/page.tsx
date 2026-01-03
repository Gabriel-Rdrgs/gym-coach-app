'use client';

import { useState, useEffect } from 'react';

interface Metric {
  id: number;
  date: string;
  weight: number | null;
  waist: number | null;
  sleep: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    sleep: '',
    energy: '',
    stress: '',
    notes: '',
  });

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
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar métrica');
      }

      await fetchMetrics();
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        waist: '',
        sleep: '',
        energy: '',
        stress: '',
        notes: '',
      });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar métrica. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
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
    <div className="flex justify-center min-h-screen py-12 px-8">
      <div className="w-full max-w-4xl">
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
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nova Métrica'}
          </button>
        </div>

        {/* Espaçamento vertical */}
        {showForm && <div style={{ height: '32px' }}></div>}

        {showForm && (
          <div className="card-neon mb-12">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent-secondary)' }}>
              Adicionar Nova Métrica
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75.5"
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
                    type="number"
                    step="0.1"
                    placeholder="Ex: 82.0"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    className="input-neon w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                    Sono (horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 7.5"
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
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Ex: 4"
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
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Ex: 2"
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

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : '💾 Salvar Métrica'}
              </button>
            </form>
          </div>
        )}

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
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>
                      {formatDate(metric.date)}
                    </h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                  {metric.weight !== null && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Peso</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.weight.toFixed(1)} kg
                      </div>
                    </div>
                  )}

                  {metric.waist !== null && (
                    <div>
                      <div className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Cintura</div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {metric.waist.toFixed(1)} cm
                      </div>
                    </div>
                  )}

                  {metric.sleep !== null && (
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
                  <div className="mt-6 p-4 rounded" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid var(--accent-secondary)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{metric.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
