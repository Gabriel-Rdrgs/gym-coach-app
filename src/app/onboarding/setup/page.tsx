"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { workoutPrograms, workoutTemplates } from "@/data/templates";

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface ScheduledWorkout {
  template: string;
  dayOfWeek: number;
  weekNumber: number;
  order: number;
}

export default function OnboardingSetupPage() {
  const router = useRouter();

  const [suggestedProgram, setSuggestedProgram] = useState<string | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();

        console.log("[setup] profile data:", data);

        if (!data.profile?.suggestedProgram) {
          router.push("/");
          return;
        }

        const programKey = data.profile.suggestedProgram as string;
        setSuggestedProgram(programKey);

        console.log("[setup] programKey:", programKey);
        console.log("[setup] workoutPrograms keys:", Object.keys(workoutPrograms));

        // Busca os templates do programa sugerido de forma segura
        const allProgramKeys = Object.keys(workoutPrograms) as Array<keyof typeof workoutPrograms>;
        const matchedKey = allProgramKeys.find(
          (k) => k.toLowerCase().trim() === programKey.toLowerCase().trim()
        );

        console.log("[setup] matchedKey:", matchedKey);

        if (matchedKey) {
          const templates = workoutPrograms[matchedKey].templates as unknown as string[];
          console.log("[setup] templates found:", templates);
          setAvailableTemplates(templates);
        } else {
          // Fallback: todos os templates disponíveis
          console.warn("[setup] program key not matched, using all templates");
          setAvailableTemplates(Object.keys(workoutTemplates));
        }
      } catch (err) {
        console.error("[setup] error loading profile:", err);
        setError("Erro ao carregar o programa sugerido.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleToggleTemplate = (template: string) => {
    if (selectedTemplates.includes(template)) {
      setSelectedTemplates(selectedTemplates.filter((t) => t !== template));
      setScheduledWorkouts(
        scheduledWorkouts.filter((sw) => sw.template !== template)
      );
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  const handleToggleDay = (template: string, dayOfWeek: number) => {
    const exists = scheduledWorkouts.find(
      (sw) => sw.template === template && sw.dayOfWeek === dayOfWeek
    );

    if (exists) {
      setScheduledWorkouts(
        scheduledWorkouts.filter(
          (sw) => !(sw.template === template && sw.dayOfWeek === dayOfWeek)
        )
      );
    } else {
      const order = scheduledWorkouts.filter(
        (sw) => sw.dayOfWeek === dayOfWeek
      ).length;

      setScheduledWorkouts([
        ...scheduledWorkouts,
        { template, dayOfWeek, weekNumber: 1, order },
      ]);
    }
  };

  const isScheduled = (template: string, dayOfWeek: number) =>
    scheduledWorkouts.some(
      (sw) => sw.template === template && sw.dayOfWeek === dayOfWeek
    );

  const handleSave = async () => {
    if (selectedTemplates.length === 0) {
      setError("Selecione pelo menos um treino antes de continuar.");
      return;
    }

    if (scheduledWorkouts.length === 0) {
      setError("Distribua pelo menos um treino em algum dia da semana.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Meu ${suggestedProgram}`,
          description: `Programa criado pelo GymCoach com base no seu perfil.`,
          startDate: new Date().toISOString().split("T")[0],
          scheduledWorkouts,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao criar programa.");
      }

      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ color: "var(--accent-primary)" }}
      >
        Carregando seu programa...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center py-12 px-4">
      <div className="w-full max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em] mb-1"
            style={{ color: "var(--accent-primary)" }}
          >
            Último passo
          </p>
          <h1
            className="text-4xl font-bold mb-2 text-glow"
            style={{
              color: "var(--accent-primary)",
              fontFamily: "var(--font-orbitron), sans-serif",
              letterSpacing: "2px",
            }}
          >
            Monte seu programa
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            Programa sugerido:{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--accent-secondary)" }}
            >
              {suggestedProgram}
            </span>
            . Selecione os treinos que vai usar e distribua nos dias da semana.
          </p>
        </div>

        {/* Seleção de templates */}
        <div className="card-neon" style={{ padding: "32px" }}>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--accent-secondary)" }}
          >
            Treinos disponíveis
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Selecione os treinos que farão parte do seu programa.
          </p>

          {availableTemplates.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--accent-warning)" }}>
              Nenhum treino encontrado para o programa "{suggestedProgram}".
              Tente recarregar a página.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableTemplates.map((template) => {
                const selected = selectedTemplates.includes(template);
                return (
                  <button
                    key={template}
                    type="button"
                    onClick={() => handleToggleTemplate(template)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: selected
                        ? "rgba(167,139,250,0.25)"
                        : "rgba(10,14,39,0.9)",
                      border: selected
                        ? "2px solid var(--accent-secondary)"
                        : "1px solid rgba(0,217,255,0.4)",
                      color: selected
                        ? "var(--accent-secondary)"
                        : "var(--text-muted)",
                      boxShadow: selected
                        ? "0 0 16px rgba(167,139,250,0.35)"
                        : "none",
                    }}
                  >
                    {template}
                  </button>
                );
              })}
            </div>
          )}

          {selectedTemplates.length > 0 && (
            <p
              className="mt-4 text-xs"
              style={{ color: "var(--accent-primary)" }}
            >
              {selectedTemplates.length} treino
              {selectedTemplates.length > 1 ? "s" : ""} selecionado
              {selectedTemplates.length > 1 ? "s" : ""}:{" "}
              {selectedTemplates.join(", ")}
            </p>
          )}
        </div>

        {/* Calendário semanal */}
        {selectedTemplates.length > 0 && (
          <div className="card-neon" style={{ padding: "32px" }}>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--accent-primary)" }}
            >
              Distribuição semanal
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Clique nas células para marcar em quais dias cada treino acontece.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th
                      className="text-left p-3 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Treino
                    </th>
                    {DAYS_SHORT.map((day) => (
                      <th
                        key={day}
                        className="text-center p-3 text-xs font-semibold"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplates.map((template) => (
                    <tr
                      key={template}
                      style={{ borderTop: "1px solid rgba(0,217,255,0.15)" }}
                    >
                      <td
                        className="p-3 text-sm font-semibold"
                        style={{ color: "var(--accent-secondary)" }}
                      >
                        {template}
                      </td>
                      {DAYS_SHORT.map((_, dayIndex) => {
                        const scheduled = isScheduled(template, dayIndex);
                        return (
                          <td key={dayIndex} className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDay(template, dayIndex)}
                              title={
                                scheduled
                                  ? `Remover ${template} de ${DAYS_OF_WEEK[dayIndex]}`
                                  : `Adicionar ${template} em ${DAYS_OF_WEEK[dayIndex]}`
                              }
                              className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                              style={{
                                background: scheduled
                                  ? "rgba(16,185,129,0.3)"
                                  : "rgba(255,255,255,0.05)",
                                border: scheduled
                                  ? "2px solid #10b981"
                                  : "1px solid rgba(0,217,255,0.2)",
                                boxShadow: scheduled
                                  ? "0 0 12px rgba(16,185,129,0.4)"
                                  : "none",
                              }}
                            >
                              {scheduled && (
                                <span className="text-xs text-green-400">✓</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo dos dias */}
            <div className="mt-6 flex flex-wrap gap-2">
              {DAYS_SHORT.map((day, dayIndex) => {
                const dayWorkouts = scheduledWorkouts.filter(
                  (sw) => sw.dayOfWeek === dayIndex
                );
                return (
                  <div
                    key={dayIndex}
                    className="rounded-xl px-3 py-2 text-xs"
                    style={{
                      background:
                        dayWorkouts.length > 0
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        dayWorkouts.length > 0
                          ? "1px solid rgba(16,185,129,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color:
                        dayWorkouts.length > 0
                          ? "#10b981"
                          : "var(--text-muted)",
                    }}
                  >
                    <span className="font-semibold">{day}</span>
                    {dayWorkouts.length > 0 ? (
                      <span className="ml-1">
                        — {dayWorkouts.map((sw) => sw.template).join(", ")}
                      </span>
                    ) : (
                      <span className="ml-1">descanso</span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              Total de sessões agendadas:{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--accent-primary)" }}
              >
                {scheduledWorkouts.length}
              </span>
            </p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 pb-12">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              selectedTemplates.length === 0 ||
              scheduledWorkouts.length === 0
            }
            className="btn-primary text-sm"
            style={{
              opacity:
                isSaving ||
                selectedTemplates.length === 0 ||
                scheduledWorkouts.length === 0
                  ? 0.6
                  : 1,
              cursor:
                isSaving ||
                selectedTemplates.length === 0 ||
                scheduledWorkouts.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isSaving ? "Criando programa..." : "Criar meu programa"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="btn-secondary text-sm"
          >
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  );
}
