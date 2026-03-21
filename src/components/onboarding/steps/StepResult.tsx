import { useRouter } from "next/navigation";
import type { OnboardingFormState } from "../types";

type StepResultProps = {
  formState: OnboardingFormState;
  suggestion: {
    suggestedProgram: string;
    suggestedWeeklySets: Record<string, number>;
  };
  onFinish: () => void;
};

const goalLabels: Record<string, string> = {
  hypertrophy: "Hipertrofia",
  fat_loss: "Emagrecimento",
  strength: "Força",
  endurance: "Resistência",
  health: "Saúde geral",
};

const levelLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const splitLabels: Record<string, string> = {
  auto: "Escolhido pelo GymCoach",
  full_body: "Full Body",
  abc: "ABC",
  ppl: "PPL",
  upper_lower: "Upper / Lower",
  abcd: "ABCD",
  abcde: "ABCDE",
  strength: "Força / Powerlifting",
};

const muscleLabels: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  quads: "Quadríceps",
  hamstrings: "Posterior de coxa",
  glutes: "Glúteos",
  side_delts: "Deltoides lateral",
  rear_delts: "Deltoides posterior",
  biceps: "Bíceps",
  triceps: "Tríceps",
  calves: "Panturrilha",
  core: "Core / Abdômen",
  posterior: "Cadeia posterior",
};

export default function StepResult({
  formState,
  suggestion,
  onFinish,
}: StepResultProps) {
  const weeklySetsEntries = Object.entries(suggestion.suggestedWeeklySets);

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho de conclusão */}
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(0,217,255,0.1)",
            border: "2px solid var(--accent-primary)",
            boxShadow: "0 0 30px rgba(0,217,255,0.4)",
          }}
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--accent-primary)" }}
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--accent-primary)" }}
        >
          Perfil configurado com sucesso
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Com base nas suas respostas, o GymCoach montou as sugestões abaixo.
          No próximo passo, você vai distribuir os treinos nos dias da semana.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Resumo das respostas */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(10,14,39,0.9)",
            border: "1px solid rgba(0,217,255,0.3)",
          }}
        >
          <h3
            className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Seu perfil
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span style={{ color: "var(--text-muted)" }}>Objetivo</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.goal ? goalLabels[formState.goal] : "—"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Nível</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.experienceLevel
                  ? levelLabels[formState.experienceLevel]
                  : "—"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Dias por semana</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.trainingDaysPerWeek ?? "—"} dias
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Duração da sessão</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.sessionDuration ?? "—"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Divisão</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.preferredSplit
                  ? splitLabels[formState.preferredSplit]
                  : "—"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Limitações</span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formState.limitations.length === 0
                  ? "Nenhuma"
                  : formState.limitations.join(", ")}
              </p>
            </div>
            {formState.weightKg && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Peso</span>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {formState.weightKg} kg
                </p>
              </div>
            )}
            {formState.heightCm && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Altura</span>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {formState.heightCm} cm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Programa sugerido */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(167,139,250,0.08)",
            border: "2px solid var(--accent-secondary)",
            boxShadow: "0 0 30px rgba(167,139,250,0.2)",
          }}
        >
          <h3
            className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-secondary)" }}
          >
            Programa sugerido
          </h3>
          <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {suggestion.suggestedProgram}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            No próximo passo você escolhe quais treinos desse programa usar e
            distribui nos dias da semana que preferir.
          </p>
        </div>

        {/* Meta de séries semanais */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(10,14,39,0.9)",
            border: "1px solid rgba(0,217,255,0.3)",
          }}
        >
          <h3
            className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Meta de séries semanais por grupo muscular
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {weeklySetsEntries.map(([muscle, sets]) => (
              <div key={muscle} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {muscleLabels[muscle] ?? muscle}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {sets} séries
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão */}
      <div
        className="mt-6 flex justify-center pt-4"
        style={{ borderTop: "1px solid rgba(0,217,255,0.2)" }}
      >
        <button
          type="button"
          onClick={onFinish}
          className="btn-primary text-sm px-10"
        >
          Montar meu programa →
        </button>
      </div>
    </div>
  );
}
