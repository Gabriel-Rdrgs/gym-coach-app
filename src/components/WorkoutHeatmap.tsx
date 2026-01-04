'use client';

import { useMemo, useState } from 'react';
import React from 'react';

interface WorkoutDate {
  date: string; // YYYY-MM-DD format
  count: number;
  totalValidSets?: number;
  templates?: string[];
  workouts?: Array<{ date: string; template?: string; totalValidSets?: number }>;
}

interface WorkoutHeatmapProps {
  workouts: Array<{ date: string; template?: string; totalValidSets?: number }>;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Componente de Heatmap (calendário visual) para mostrar frequência de treinos
 * Inspirado no GitHub Contributions Graph
 */
export default function WorkoutHeatmap({ workouts, startDate, endDate }: WorkoutHeatmapProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('12m');
  const [selectedDay, setSelectedDay] = useState<WorkoutDate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Calcular datas baseado no período selecionado
  const periodMonths = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
  const defaultEndDate = endDate || new Date();
  // Começar do primeiro dia do mês
  const defaultStartDate = startDate || new Date(defaultEndDate.getFullYear(), defaultEndDate.getMonth() - (periodMonths - 1), 1);

  // Filtrar treinos pelo período selecionado ANTES de agrupar
  const filteredWorkouts = useMemo(() => {
    const periodStart = new Date(defaultStartDate);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(defaultEndDate);
    periodEnd.setHours(23, 59, 59, 999);
    
    return workouts.filter((workout) => {
      // Extrair data corretamente - pode vir como ISO string ou já ser uma data
      let workoutDate: Date;
      if (typeof workout.date === 'string') {
        // Se for string ISO, usar apenas a parte da data (YYYY-MM-DD)
        const dateStr = workout.date.split('T')[0];
        workoutDate = new Date(dateStr + 'T00:00:00');
      } else {
        workoutDate = new Date(workout.date);
      }
      workoutDate.setHours(0, 0, 0, 0);
      
      return workoutDate >= periodStart && workoutDate <= periodEnd;
    });
  }, [workouts, defaultStartDate, defaultEndDate]);

  // Agrupar treinos por data (apenas os filtrados)
  const filteredWorkoutsByDate = useMemo(() => {
    const grouped: { [key: string]: WorkoutDate } = {};
    
    filteredWorkouts.forEach((workout) => {
      // Extrair data no formato YYYY-MM-DD
      let dateStr: string;
      if (typeof workout.date === 'string') {
        dateStr = workout.date.split('T')[0];
      } else {
        const d = new Date(workout.date);
        dateStr = d.toISOString().split('T')[0];
      }
      
      if (grouped[dateStr]) {
        grouped[dateStr].count++;
        if (workout.totalValidSets) {
          grouped[dateStr].totalValidSets = (grouped[dateStr].totalValidSets || 0) + workout.totalValidSets;
        }
        if (workout.template) {
          if (!grouped[dateStr].templates) {
            grouped[dateStr].templates = [];
          }
          grouped[dateStr].templates!.push(workout.template);
        }
        if (!grouped[dateStr].workouts) {
          grouped[dateStr].workouts = [];
        }
        grouped[dateStr].workouts!.push(workout);
      } else {
        grouped[dateStr] = {
          date: dateStr,
          count: 1,
          totalValidSets: workout.totalValidSets,
          templates: workout.template ? [workout.template] : [],
          workouts: [workout],
        };
      }
    });

    return grouped;
  }, [filteredWorkouts]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalDays = Object.keys(filteredWorkoutsByDate).length;
    const weeks = Math.ceil((defaultEndDate.getTime() - defaultStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const avgPerWeek = weeks > 0 ? totalWorkouts / weeks : 0;

    // Calcular streak (sequência mais longa de dias consecutivos com treino)
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = Object.keys(filteredWorkoutsByDate).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i] + 'T00:00:00');
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00');
        const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      totalWorkouts,
      totalDays,
      avgPerWeek: avgPerWeek.toFixed(1),
      maxStreak,
    };
  }, [filteredWorkouts, filteredWorkoutsByDate, defaultStartDate, defaultEndDate]);

  // Gerar array de dias para o heatmap
  const days = useMemo(() => {
    const daysArray: Array<{ date: Date; dateStr: string; data?: WorkoutDate; isInPeriod: boolean }> = [];
    
    // Normalizar datas de período
    const periodStart = new Date(defaultStartDate);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(defaultEndDate);
    periodEnd.setHours(23, 59, 59, 999);
    
    // Calcular o primeiro dia da semana que contém o startDate (segunda-feira)
    const startOfWeek = new Date(periodStart);
    const startDay = startOfWeek.getDay();
    const daysToSubtract = startDay === 0 ? 6 : startDay - 1; // Segunda = 0
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calcular o último dia da semana que contém o endDate (domingo)
    const endOfWeek = new Date(periodEnd);
    const endDay = endOfWeek.getDay();
    const daysToAdd = endDay === 0 ? 0 : 7 - endDay; // Domingo = 0
    endOfWeek.setDate(endOfWeek.getDate() + daysToAdd);
    endOfWeek.setHours(23, 59, 59, 999);

    const current = new Date(startOfWeek);
    while (current <= endOfWeek) {
      // Usar métodos locais para evitar problemas de timezone
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const currentDate = new Date(current);
      const isInPeriod = currentDate >= periodStart && currentDate <= periodEnd;
      
      daysArray.push({
        date: new Date(currentDate),
        dateStr,
        data: filteredWorkoutsByDate[dateStr],
        isInPeriod,
      });
      current.setDate(current.getDate() + 1);
    }

    return daysArray;
  }, [defaultStartDate, defaultEndDate, filteredWorkoutsByDate]);

  // Agrupar por semanas (7 dias)
  const weeks = useMemo(() => {
    const weeksArray: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }
    return weeksArray;
  }, [days]);

  // Calcular níveis de intensidade baseado no máximo de treinos em um dia
  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(filteredWorkoutsByDate).map((d) => d.count));
  }, [filteredWorkoutsByDate]);

  const getIntensityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (maxCount === 1) return 1;
    const ratio = count / maxCount;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  };

  const getColorStyle = (level: number, isStreak: boolean = false): React.CSSProperties => {
    const baseColor = isStreak ? 'rgba(16, 185, 129, ' : 'rgba(0, 217, 255, ';
    switch (level) {
      case 0:
        return { backgroundColor: 'rgba(30, 30, 40, 0.5)' }; // Sem treino
      case 1:
        return { backgroundColor: baseColor + '0.2)' }; // Baixo
      case 2:
        return { backgroundColor: baseColor + '0.4)' }; // Médio-baixo
      case 3:
        return { backgroundColor: baseColor + '0.6)' }; // Médio
      case 4:
        return { backgroundColor: baseColor + '0.8)' }; // Alto
      default:
        return { backgroundColor: 'rgba(30, 30, 40, 0.5)' };
    }
  };

  // Detectar streaks (sequências consecutivas)
  const streakDays = useMemo(() => {
    const streakSet = new Set<string>();
    const sortedDates = Object.keys(filteredWorkoutsByDate).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) continue;
      const currentDate = new Date(sortedDates[i] + 'T00:00:00');
      const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00');
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff === 1) {
        streakSet.add(sortedDates[i - 1]);
        streakSet.add(sortedDates[i]);
      }
    }
    
    return streakSet;
  }, [filteredWorkoutsByDate]);

  const formatTooltip = (day: typeof days[0]): string => {
    if (!day.data) {
      return `${day.date.toLocaleDateString('pt-BR')}\nNenhum treino`;
    }
    const validSetsText = day.data.totalValidSets 
      ? `\n${day.data.totalValidSets.toFixed(1)} séries válidas` 
      : '';
    return `${day.date.toLocaleDateString('pt-BR')}\n${day.data.count} treino${day.data.count > 1 ? 's' : ''}${validSetsText}`;
  };

  const handleDayClick = (day: typeof days[0]) => {
    if (day.data) {
      setSelectedDay(day.data);
      setModalOpen(true);
    }
  };

  // Meses para labels - alinhar corretamente com as semanas
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Criar um mapa de meses para cada semana
    const monthByWeek = new Map<number, number>();
    
    weeks.forEach((week, weekIndex) => {
      // Encontrar o primeiro dia da semana que está dentro do período
      const firstDayInPeriod = week.find(day => day.isInPeriod);
      if (firstDayInPeriod) {
        const month = firstDayInPeriod.date.getMonth();
        monthByWeek.set(weekIndex, month);
      } else {
        // Se não houver dia no período, usar o primeiro dia da semana
        if (week.length > 0) {
          const month = week[0].date.getMonth();
          monthByWeek.set(weekIndex, month);
        }
      }
    });
    
    // Criar labels apenas quando o mês muda
    let lastMonth = -1;
    monthByWeek.forEach((month, weekIndex) => {
      if (month !== lastMonth) {
        labels.push({ month: monthNames[month], weekIndex });
        lastMonth = month;
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <>
      <div className="card-neon" style={{ padding: '32px' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--accent-primary)' }}>
            📅 Calendário de Treinos
          </h3>
          
          {/* Filtro de Período */}
          <div className="flex gap-2">
            {(['3m', '6m', '12m'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className="px-3 py-1 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: selectedPeriod === period 
                    ? 'rgba(0, 217, 255, 0.2)' 
                    : 'rgba(0, 217, 255, 0.05)',
                  border: `1px solid ${selectedPeriod === period ? 'var(--accent-primary)' : 'rgba(0, 217, 255, 0.3)'}`,
                  color: selectedPeriod === period 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-muted)',
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
              {stats.totalWorkouts}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total de Treinos
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
              {stats.totalDays}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Dias com Treino
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
              {stats.avgPerWeek}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Treinos/Semana
            </div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-success)' }}>
              🔥 {stats.maxStreak}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sequência Máxima
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex items-start gap-1" style={{ width: 'fit-content' }}>
            {/* Labels dos dias da semana */}
            <div className="flex flex-col gap-1 mr-2" style={{ minWidth: '20px', flexShrink: 0 }}>
              <div style={{ height: '12px' }}></div>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                <div
                  key={day}
                  className="text-xs flex items-center justify-end"
                  style={{ 
                    height: '11px', 
                    color: 'var(--text-muted)',
                    paddingRight: '4px'
                  }}
                >
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Grid do heatmap */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {/* Labels dos meses */}
              <div className="mb-1" style={{ height: '12px', position: 'relative' }}>
                {monthLabels.map(({ month, weekIndex }) => {
                  // Cada semana tem largura de 11px (bolinha) + 4px (gap) = 15px
                  const weekWidth = 15;
                  const leftPosition = weekIndex * weekWidth;
                  
                  return (
                    <div
                      key={`${weekIndex}-${month}`}
                      className="text-xs"
                      style={{
                        color: 'var(--text-muted)',
                        position: 'absolute',
                        left: `${leftPosition}px`,
                        whiteSpace: 'nowrap',
                        transform: weekIndex === 0 ? 'translateX(0)' : 'translateX(-50%)',
                      }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>

              {/* Semanas */}
              <div className="flex gap-1" style={{ width: `${weeks.length * 15}px` }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const level = day.data ? getIntensityLevel(day.data.count) : 0;
                      const isStreak = streakDays.has(day.dateStr);
                      // Opacidade reduzida para dias fora do período
                      const opacity = day.isInPeriod ? 1 : 0.3;
                      
                      return (
                        <div
                          key={`${day.dateStr}-${dayIndex}`}
                          className="rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10"
                          style={{
                            width: '11px',
                            height: '11px',
                            border: level > 0 
                              ? (isStreak 
                                  ? '1px solid rgba(16, 185, 129, 0.5)' 
                                  : '1px solid rgba(0, 217, 255, 0.3)')
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            ...getColorStyle(level, isStreak),
                            opacity,
                            boxShadow: level > 0 && day.isInPeriod
                              ? (isStreak 
                                  ? '0 0 6px rgba(16, 185, 129, 0.5)' 
                                  : '0 0 4px rgba(0, 217, 255, 0.3)')
                              : 'none',
                          }}
                          title={formatTooltip(day)}
                          onClick={() => day.isInPeriod && handleDayClick(day)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--accent-primary)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🔥 = Sequência</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Menos</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="rounded-sm"
                  style={{
                    width: '11px',
                    height: '11px',
                    border: level > 0 ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    ...getColorStyle(level),
                    boxShadow: level > 0 ? '0 0 4px rgba(0, 217, 255, 0.3)' : 'none',
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mais</span>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalOpen && selectedDay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="card-neon neon-glow max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            style={{ 
              padding: '40px',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 0 40px rgba(0, 217, 255, 0.4), 0 0 80px rgba(0, 217, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--accent-primary)' }}>
              <div>
                <h3 className="text-3xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-primary)' }}>
                  📅 {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total:</span>
                    <span className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      {selectedDay.count} treino{selectedDay.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {selectedDay.totalValidSets !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Séries válidas:</span>
                      <span className="text-lg font-semibold" style={{ color: 'var(--accent-success)' }}>
                        {selectedDay.totalValidSets.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-3xl hover:scale-110 transition-all p-2 rounded-lg"
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

            {/* Lista de Treinos */}
            {selectedDay.workouts && selectedDay.workouts.length > 0 ? (
              <div className="space-y-4">
                {selectedDay.workouts.map((workout, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-lg transition-all hover:scale-[1.02]"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(167, 139, 250, 0.05) 100%)',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 217, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2 text-glow" style={{ color: 'var(--accent-primary)' }}>
                          {workout.template || 'Treino'}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🕐</span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {new Date(workout.date).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {workout.totalValidSets !== undefined && (
                        <div 
                          className="px-4 py-2 rounded-lg text-center"
                          style={{ 
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            minWidth: '120px',
                          }}
                        >
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                            Séries Válidas
                          </div>
                          <div className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                            {workout.totalValidSets.toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🏋️</div>
                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                  Nenhum treino registrado neste dia.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
