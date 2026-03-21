// src/components/OnboardingBanner.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

// Mapeamentos de exibição
const GOAL_LABELS: Record<string, string> = {
  hypertrophy: "Hipertrofia 💪",
  fat_loss: "Perda de Gordura 🔥",
  strength: "Força 🏋️",
  endurance: "Resistência ⚡",
  general_fitness: "Condicionamento Geral 🎯",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante 🌱",
  intermediate: "Intermediário ⚙️",
  advanced: "Avançado 🔬",
};

const SPLIT_LABELS: Record<string, string> = {
  auto: "Automático",
  full_body: "Full Body",
  ab: "AB (Upper/Lower)",
  abc: "ABC",
  ppl: "PPL",
  pplul: "PPL + Upper/Lower",
};

interface OnboardingBannerProps {
  goal: string | null;
  experienceLevel: string | null;
  suggestedProgram: string | null;
  preferredSplit: string | null;
  trainingDaysPerWeek: number | null;
  weeklySetGoal: number;
  activeProgramId: number | null;
}

export default function OnboardingBanner({
  goal,
  experienceLevel,
  suggestedProgram,
  preferredSplit,
  trainingDaysPerWeek,
  weeklySetGoal,
  activeProgramId,
}: OnboardingBannerProps) {
  const [visible, setVisible] = useState(true);
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingBannerDismissed: true }),
      });
    } catch {
      // Silencia o erro — o banner some de qualquer forma
    } finally {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      className="relative rounded-2xl p-6 mb-10"
      style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(0,217,255,0.08) 100%)",
        border: "2px solid var(--accent-secondary)",
        boxShadow: "0 0 30px rgba(167,139,250,0.2), 0 0 60px rgba(0,217,255,0.05)",
      }}
    >
      {/* Botão fechar */}
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{
          background: "rgba(167,139,250,0.15)",
          color: "var(--text-muted)",
          border: "1px solid rgba(167,139,250,0.3)",
        }}
        title="Dispensar"
      >
        ✕
      </button>

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-5 pr-10">
        <span className="text-3xl">🎉</span>
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--accent-secondary)" }}
          >
            Setup concluído! Seu GymCoach está configurado.
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aqui está um resumo do que foi definido para você.
          </p>
        </div>
      </div>

      {/* Grid de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">

        {/* Objetivo */}
        {goal && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(10,14,39,0.6)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Objetivo
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {GOAL_LABELS[goal] ?? goal}
            </p>
          </div>
        )}

        {/* Nível */}
        {experienceLevel && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(10,14,39,0.6)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Nível
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {LEVEL_LABELS[experienceLevel] ?? experienceLevel}
            </p>
          </div>
        )}

        {/* Dias de treino */}
        {trainingDaysPerWeek && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(10,14,39,0.6)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Dias / Semana
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {trainingDaysPerWeek} dias 📅
            </p>
          </div>
        )}

        {/* Meta de séries */}
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(10,14,39,0.6)",
            border: "1px solid rgba(167,139,250,0.25)",
          }}
        >
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            Meta Semanal
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {weeklySetGoal} séries ✅
          </p>
        </div>

      </div>

      {/* Programa sugerido + divisão */}
      {suggestedProgram && (
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-4"
          style={{
            background: "rgba(0,217,255,0.05)",
            border: "1px solid rgba(0,217,255,0.2)",
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
              Programa criado
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>
              {suggestedProgram}
              {preferredSplit && preferredSplit !== "auto" && (
                <span className="font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                  · {SPLIT_LABELS[preferredSplit] ?? preferredSplit}
                </span>
              )}
            </p>
          </div>
          {activeProgramId && (
            <Link
              href={`/programs/${activeProgramId}`}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "rgba(0,217,255,0.15)",
                border: "1px solid var(--accent-primary)",
                color: "var(--accent-primary)",
              }}
            >
              Ver programa →
            </Link>
          )}
        </div>
      )}

      {/* Rodapé */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Você pode ajustar essas configurações a qualquer momento em{" "}
        <Link
          href="/profile/settings"
          className="underline hover:opacity-80"
          style={{ color: "var(--accent-secondary)" }}
        >
          Configurações de Perfil
        </Link>
        .
      </p>
    </div>
  );
}
