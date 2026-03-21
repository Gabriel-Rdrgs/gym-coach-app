// src/app/profile/settings/ProfileSettingsClient.tsx

"use client";

import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Limitations = string[];

interface ProfileData {
  goal: string | null;
  experienceLevel: string | null;
  trainingDaysPerWeek: number | null;
  sessionDuration: string | null;
  preferredSplit: string | null;
  limitations: unknown;
  weightKg: number | null;
  heightCm: number | null;
}

interface ProfileSettingsClientProps {
  profile: ProfileData;
}

// ─── Opções ───────────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  {
    value: "hypertrophy",
    label: "Hipertrofia",
    subtitle: "Ganho de massa muscular",
    description: "Foco em volume de séries, progressão de cargas e técnica para maximizar o crescimento muscular.",
    icon: "💪",
  },
  {
    value: "fat_loss",
    label: "Perda de Gordura",
    subtitle: "Redução de gordura corporal",
    description: "Combinação de treino resistido e déficit calórico para perder gordura preservando músculo.",
    icon: "🔥",
  },
  {
    value: "strength",
    label: "Força",
    subtitle: "Aumento de força máxima",
    description: "Foco em cargas pesadas, menor volume e maior intensidade nos movimentos compostos.",
    icon: "🏋️",
  },
  {
    value: "endurance",
    label: "Resistência",
    subtitle: "Condicionamento e resistência muscular",
    description: "Séries mais longas, menor descanso e exercícios que desenvolvem a capacidade aeróbica.",
    icon: "⚡",
  },
  {
    value: "general_fitness",
    label: "Condicionamento Geral",
    subtitle: "Saúde e qualidade de vida",
    description: "Equilíbrio entre força, resistência e mobilidade para uma vida mais ativa e saudável.",
    icon: "🎯",
  },
];

const LEVEL_OPTIONS = [
  {
    value: "beginner",
    label: "Iniciante",
    subtitle: "Até ~1 ano de treino consistente",
    description: "Você ainda está aprendendo técnica, organizando rotina e não treinou pesado de forma sistemática por muito tempo.",
    icon: "🌱",
  },
  {
    value: "intermediate",
    label: "Intermediário",
    subtitle: "Entre ~1 e 3 anos de treino consistente",
    description: "Você já treina com regularidade, domina a maioria dos exercícios básicos e sente que os ganhos estão mais lentos.",
    icon: "⚙️",
  },
  {
    value: "advanced",
    label: "Avançado",
    subtitle: "3+ anos de treino sério e consistente",
    description: "Você conhece bem seu corpo, já espremeu bastante progresso e precisa de ajustes finos de volume e intensidade.",
    icon: "🔬",
  },
];

const DURATION_OPTIONS = [
  { value: "30min", label: "30 minutos", subtitle: "Sessões curtas e diretas" },
  { value: "45min", label: "45 minutos", subtitle: "Treino compacto e eficiente" },
  { value: "1h", label: "1 hora", subtitle: "Tempo ideal para a maioria" },
  { value: "1h30", label: "1h30", subtitle: "Sessões longas com volume alto" },
  { value: "2h", label: "2h ou mais", subtitle: "Treinos extensos e detalhados" },
];

const SPLIT_OPTIONS = [
  { value: "auto", label: "Automático", subtitle: "GymCoach escolhe o melhor para você", icon: "🤖" },
  { value: "full_body", label: "Full Body", subtitle: "Corpo inteiro em cada sessão", icon: "🔄" },
  { value: "ab", label: "AB", subtitle: "Superior / Inferior alternados", icon: "↕️" },
  { value: "abc", label: "ABC", subtitle: "Três grupos musculares distintos", icon: "🔀" },
  { value: "ppl", label: "PPL", subtitle: "Push / Pull / Legs", icon: "3️⃣" },
  { value: "pplul", label: "PPL + UL", subtitle: "PPL com dias extras Upper/Lower", icon: "5️⃣" },
];

const LIMITATION_OPTIONS = [
  { value: "joelho", label: "Joelho", icon: "🦵" },
  { value: "ombro", label: "Ombro", icon: "💪" },
  { value: "coluna", label: "Coluna", icon: "🦴" },
  { value: "cotovelo", label: "Cotovelo", icon: "🦾" },
  { value: "quadril", label: "Quadril", icon: "🏃" },
  { value: "tornozelo", label: "Tornozelo", icon: "🦶" },
  { value: "punho", label: "Punho", icon: "✋" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLimitations(raw: unknown): Limitations {
  if (Array.isArray(raw)) return raw as Limitations;
  return [];
}

// ─── Sub-componente: Card de opção selecionável ────────────────────────────────

function OptionCard({
  value,
  label,
  subtitle,
  description,
  icon,
  selected,
  onClick,
}: {
  value: string;
  label: string;
  subtitle: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
    >
      <div
        className="rounded-2xl px-4 py-3 transition-all"
        style={{
          border: selected
            ? "2px solid var(--accent-secondary)"
            : "1px solid rgba(0,217,255,0.3)",
          background: selected
            ? "rgba(167,139,250,0.12)"
            : "rgba(10,14,39,0.9)",
          boxShadow: selected
            ? "0 0 25px rgba(167,139,250,0.35)"
            : "0 0 10px rgba(0,217,255,0.1)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && <span className="text-xl mt-0.5">{icon}</span>}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {label}
                </span>
                {selected && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(167,139,250,0.25)",
                      color: "var(--accent-secondary)",
                    }}
                  >
                    Selecionado
                  </span>
                )}
              </div>
              <p
                className="text-xs mb-1"
                style={{ color: "var(--accent-primary)" }}
              >
                {subtitle}
              </p>
              {description && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProfileSettingsClient({ profile }: ProfileSettingsClientProps) {
  const [goal, setGoal] = useState(profile.goal ?? "hypertrophy");
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel ?? "beginner");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(profile.trainingDaysPerWeek ?? 3);
  const [sessionDuration, setSessionDuration] = useState(profile.sessionDuration ?? "1h");
  const [preferredSplit, setPreferredSplit] = useState(profile.preferredSplit ?? "auto");
  const [limitations, setLimitations] = useState<Limitations>(parseLimitations(profile.limitations));
  const [weightKg, setWeightKg] = useState(profile.weightKg?.toString() ?? "");
  const [heightCm, setHeightCm] = useState(profile.heightCm?.toString() ?? "");

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleLimitation(value: string) {
    setLimitations((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const days = Number(trainingDaysPerWeek);
    if (isNaN(days) || days < 1 || days > 7) {
      setErrorMessage("Dias de treino deve ser entre 1 e 7.");
      setIsLoading(false);
      return;
    }

    const weight = weightKg ? Number(weightKg) : undefined;
    const height = heightCm ? Number(heightCm) : undefined;

    if (weight !== undefined && (isNaN(weight) || weight <= 0)) {
      setErrorMessage("Peso inválido.");
      setIsLoading(false);
      return;
    }
    if (height !== undefined && (isNaN(height) || height <= 0)) {
      setErrorMessage("Altura inválida.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          experienceLevel,
          trainingDaysPerWeek: days,
          sessionDuration,
          preferredSplit,
          limitations,
          ...(weight !== undefined && { weightKg: weight }),
          ...(height !== undefined && { heightCm: height }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar.");
      }

      setSuccessMessage("Configurações salvas com sucesso!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Seção 1: Objetivo Principal ── */}
      <section
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-primary)",
          boxShadow: "0 0 20px rgba(0,217,255,0.1)",
        }}
      >
        <div>
          <h2
            className="text-base font-bold mb-0.5"
            style={{ color: "var(--accent-primary)" }}
          >
            🎯 Objetivo Principal
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            O que você quer prioritariamente com o seu treino.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              {...opt}
              selected={goal === opt.value}
              onClick={() => setGoal(opt.value)}
            />
          ))}
        </div>
      </section>

      {/* ── Seção 2: Nível de Experiência ── */}
      <section
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-primary)",
          boxShadow: "0 0 20px rgba(0,217,255,0.1)",
        }}
      >
        <div>
          <h2
            className="text-base font-bold mb-0.5"
            style={{ color: "var(--accent-primary)" }}
          >
            🏅 Nível de Experiência
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Usado para calibrar volume, intensidade e progressão.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {LEVEL_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              {...opt}
              selected={experienceLevel === opt.value}
              onClick={() => setExperienceLevel(opt.value)}
            />
          ))}
        </div>
      </section>

      {/* ── Seção 3: Estrutura de Treino ── */}
      <section
        className="rounded-2xl p-6 flex flex-col gap-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-primary)",
          boxShadow: "0 0 20px rgba(0,217,255,0.1)",
        }}
      >
        <div>
          <h2
            className="text-base font-bold mb-0.5"
            style={{ color: "var(--accent-primary)" }}
          >
            🏋️ Estrutura de Treino
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Dias por semana, duração das sessões e divisão de grupos musculares.
          </p>
        </div>

        {/* Dias de treino — slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Dias de treino por semana
            </label>
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--accent-secondary)" }}
            >
              {trainingDaysPerWeek}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={trainingDaysPerWeek}
            onChange={(e) => setTrainingDaysPerWeek(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "var(--accent-primary)" }}
          />
          <div
            className="flex justify-between text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span>1 dia</span>
            <span>7 dias</span>
          </div>
        </div>

        {/* Duração da sessão */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Duração da sessão
          </label>
          <div className="flex flex-col gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                value={opt.value}
                label={opt.label}
                subtitle={opt.subtitle}
                selected={sessionDuration === opt.value}
                onClick={() => setSessionDuration(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Divisão preferida */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Divisão de treino preferida
          </label>
          <div className="flex flex-col gap-2">
            {SPLIT_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                value={opt.value}
                label={opt.label}
                subtitle={opt.subtitle}
                icon={opt.icon}
                selected={preferredSplit === opt.value}
                onClick={() => setPreferredSplit(opt.value)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 4: Limitações Físicas ── */}
      <section
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-primary)",
          boxShadow: "0 0 20px rgba(0,217,255,0.1)",
        }}
      >
        <div>
          <h2
            className="text-base font-bold mb-0.5"
            style={{ color: "var(--accent-primary)" }}
          >
            ⚠️ Limitações Físicas
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Selecione as regiões com dor ou restrição. Clique novamente para desmarcar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {LIMITATION_OPTIONS.map((item) => {
            const isActive = limitations.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleLimitation(item.value)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  border: isActive
                    ? "2px solid var(--accent-secondary)"
                    : "1px solid rgba(0,217,255,0.3)",
                  background: isActive
                    ? "rgba(167,139,250,0.18)"
                    : "rgba(10,14,39,0.9)",
                  color: isActive
                    ? "var(--accent-secondary)"
                    : "var(--text-muted)",
                  boxShadow: isActive
                    ? "0 0 15px rgba(167,139,250,0.3)"
                    : "none",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="ml-1 text-xs font-bold"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {limitations.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Nenhuma limitação selecionada.
          </p>
        )}
      </section>

      {/* ── Seção 5: Dados Físicos ── */}
      <section
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-primary)",
          boxShadow: "0 0 20px rgba(0,217,255,0.1)",
        }}
      >
        <div>
          <h2
            className="text-base font-bold mb-0.5"
            style={{ color: "var(--accent-primary)" }}
          >
            📏 Dados Físicos
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Usados para calcular métricas e personalizar recomendações.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Peso */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Peso
            </label>
            <div className="relative">
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="72"
                min={1}
                step={0.1}
                className="w-full pr-10 rounded-xl px-4 py-3 text-sm transition-all"
                style={{
                  background: "rgba(10,14,39,0.9)",
                  border: "1px solid rgba(0,217,255,0.3)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid var(--accent-primary)";
                  e.target.style.boxShadow = "0 0 15px rgba(0,217,255,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(0,217,255,0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                kg
              </span>
            </div>
          </div>

          {/* Altura */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Altura
            </label>
            <div className="relative">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="175"
                min={1}
                step={1}
                className="w-full pr-10 rounded-xl px-4 py-3 text-sm transition-all"
                style={{
                  background: "rgba(10,14,39,0.9)",
                  border: "1px solid rgba(0,217,255,0.3)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid var(--accent-primary)";
                  e.target.style.boxShadow = "0 0 15px rgba(0,217,255,0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(0,217,255,0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                cm
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feedback ── */}
      {successMessage && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.4)",
            color: "var(--accent-success)",
            boxShadow: "0 0 15px rgba(16,185,129,0.15)",
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "var(--accent-warning)",
            boxShadow: "0 0 15px rgba(239,68,68,0.15)",
          }}
        >
          ❌ {errorMessage}
        </div>
      )}

      {/* ── Botão salvar ── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all btn-primary"
        style={{
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Salvando..." : "💾 Salvar Configurações"}
      </button>

    </form>
  );
}
