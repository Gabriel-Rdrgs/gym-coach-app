// src/app/profile/settings/ProfileSettingsClient.tsx

"use client";

import { useState } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

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

// ─── Opções dos selects ───────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "fat_loss", label: "Perda de Gordura" },
  { value: "strength", label: "Força" },
  { value: "endurance", label: "Resistência" },
  { value: "general_fitness", label: "Condicionamento Geral" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

const DURATION_OPTIONS = [
  { value: "30min", label: "30 minutos" },
  { value: "45min", label: "45 minutos" },
  { value: "1h", label: "1 hora" },
  { value: "1h30", label: "1 hora e 30 minutos" },
  { value: "2h", label: "2 horas ou mais" },
];

const SPLIT_OPTIONS = [
  { value: "auto", label: "Automático (recomendado)" },
  { value: "full_body", label: "Full Body" },
  { value: "ab", label: "AB (Upper / Lower)" },
  { value: "abc", label: "ABC" },
  { value: "ppl", label: "PPL (Push / Pull / Legs)" },
  { value: "pplul", label: "PPL + Upper / Lower" },
];

const LIMITATION_OPTIONS = [
  "Joelho",
  "Ombro",
  "Coluna",
  "Cotovelo",
  "Quadril",
  "Tornozelo",
  "Punho",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseLimitations(raw: unknown): Limitations {
  if (Array.isArray(raw)) return raw as Limitations;
  return [];
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProfileSettingsClient({ profile }: ProfileSettingsClientProps) {
  const [goal, setGoal] = useState(profile.goal ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    profile.experienceLevel ?? ""
  );
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(
    profile.trainingDaysPerWeek ?? 3
  );
  const [sessionDuration, setSessionDuration] = useState(
    profile.sessionDuration ?? ""
  );
  const [preferredSplit, setPreferredSplit] = useState(
    profile.preferredSplit ?? "auto"
  );
  const [limitations, setLimitations] = useState<Limitations>(
    parseLimitations(profile.limitations)
  );
  const [weightKg, setWeightKg] = useState(
    profile.weightKg?.toString() ?? ""
  );
  const [heightCm, setHeightCm] = useState(
    profile.heightCm?.toString() ?? ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ─── Toggle de limitações ───────────────────────────────────────────────────

  function toggleLimitation(item: string) {
    const lower = item.toLowerCase();
    setLimitations((prev) =>
      prev.includes(lower)
        ? prev.filter((l) => l !== lower)
        : [...prev, lower]
    );
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validações simples no front antes de bater na API
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
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Seção 1: Objetivos de Treino ── */}
      <section className="card-neon rounded-xl p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-foreground">
          🎯 Objetivos de Treino
        </h2>

        {/* Objetivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Objetivo principal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nível */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Nível de experiência
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dias de treino */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Dias de treino por semana:{" "}
            <span className="text-primary font-bold">{trainingDaysPerWeek}</span>
          </label>
          <input
            type="range"
            min={1}
            max={7}
            value={trainingDaysPerWeek}
            onChange={(e) => setTrainingDaysPerWeek(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 dia</span>
            <span>7 dias</span>
          </div>
        </div>

        {/* Duração da sessão */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Duração da sessão
          </label>
          <select
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── Seção 2: Estrutura do Treino ── */}
      <section className="card-neon rounded-xl p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-foreground">
          🏋️ Estrutura do Treino
        </h2>

        {/* Divisão preferida */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Divisão de treino preferida
          </label>
          <select
            value={preferredSplit}
            onChange={(e) => setPreferredSplit(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SPLIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limitações */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Limitações físicas
          </label>
          <div className="flex flex-wrap gap-2">
            {LIMITATION_OPTIONS.map((item) => {
              const isActive = limitations.includes(item.toLowerCase());
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleLimitation(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione as regiões com limitação. Clique novamente para desmarcar.
          </p>
        </div>
      </section>

      {/* ── Seção 3: Dados Físicos ── */}
      <section className="card-neon rounded-xl p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-foreground">
          📏 Dados Físicos
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Peso */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Peso (kg)
            </label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Ex: 72"
              min={1}
              step={0.1}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Altura */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Altura (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="Ex: 175"
              min={1}
              step={1}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* ── Feedback ── */}
      {successMessage && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {/* ── Botão de salvar ── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-opacity disabled:opacity-50"
      >
        {isLoading ? "Salvando..." : "Salvar Configurações"}
      </button>

    </form>
  );
}
