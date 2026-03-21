import type { OnboardingGoal } from "../types";

type StepGoalProps = {
  value: OnboardingGoal | null;
  onChange: (goal: OnboardingGoal) => void;
  onNext: () => void;
  onBack: () => void;
};

const options: {
  value: OnboardingGoal;
  label: string;
  description: string;
}[] = [
  {
    value: "hypertrophy",
    label: "Hipertrofia",
    description: "Ganho de massa muscular, foco em estética e volume.",
  },
  {
    value: "fat_loss",
    label: "Emagrecimento",
    description: "Redução de gordura preservando o máximo de massa magra.",
  },
  {
    value: "strength",
    label: "Força",
    description: "Aumentar cargas nos principais levantamentos.",
  },
  {
    value: "endurance",
    label: "Resistência",
    description: "Aguentar mais trabalho de treino sem quebrar.",
  },
  {
    value: "health",
    label: "Saúde geral",
    description: "Bem-estar, longevidade e condicionamento geral.",
  },
];

export default function StepGoal({
  value,
  onChange,
  onNext,
  onBack,
}: StepGoalProps) {
  const handleNext = () => {
    if (!value) return;
    onNext();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--accent-primary)" }}
        >
          Qual é o seu objetivo principal?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Vamos usar esse objetivo como base para definir volume de treino,
          intensidade e a divisão mais adequada para você.
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {options.map((opt) => {
          const selected = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="w-full text-left"
            >
              <div
                className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all"
                style={{
                  border: selected
                    ? "2px solid var(--accent-secondary)"
                    : "1px solid rgba(0,217,255,0.4)",
                  background: selected
                    ? "rgba(167,139,250,0.12)"
                    : "rgba(10,14,39,0.9)",
                  boxShadow: selected
                    ? "0 0 25px rgba(167,139,250,0.4)"
                    : "0 0 12px rgba(0,217,255,0.15)",
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {opt.label}
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
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="mt-6 flex justify-between pt-4"
        style={{ borderTop: "1px solid rgba(0,217,255,0.2)" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary text-xs"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!value}
          className={`btn-primary text-sm ${
            !value ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
