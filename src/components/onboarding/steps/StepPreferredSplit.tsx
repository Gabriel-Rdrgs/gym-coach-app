import type { OnboardingGoal, PreferredSplit } from "../types";

type StepPreferredSplitProps = {
  value: PreferredSplit | null;
  goal: OnboardingGoal | null;
  trainingDays: number | null;
  onChange: (split: PreferredSplit) => void;
  onNext: () => void;
  onBack: () => void;
};

type SplitOption = {
  value: PreferredSplit;
  label: string;
  description: string;
  hint?: string;
};

function buildHint(
  value: PreferredSplit,
  goal: OnboardingGoal | null,
  days: number | null
): string | undefined {
  if (value === "auto") {
    return "GymCoach escolhe automaticamente com base no seu objetivo e dias disponíveis.";
  }

  if (value === "full_body") {
    return "Brilha especialmente com 2–3 treinos por semana.";
  }

  if (value === "abc") {
    return "Funciona muito bem com 3 treinos por semana.";
  }

  if (value === "ppl") {
    if (goal === "hypertrophy") {
      return "Excelente para hipertrofia com 5–6 dias por semana.";
    }
    if (goal === "strength") {
      return "Boa base para força com frequência alta.";
    }
    return "Funciona melhor com pelo menos 4–5 dias livres.";
  }

  if (value === "upper_lower") {
    return "Equilíbrio entre frequência e recuperação, ótimo com 4 dias.";
  }

  if (value === "abcd") {
    return "Boa opção para quem consegue 4 dias fixos e quer diversidade.";
  }

  if (value === "abcde") {
    return "Mais avançada, exige rotina bem consistente (5 dias).";
  }

  if (value === "strength") {
    return "Focada nos grandes levantamentos, especialmente para força.";
  }

  return undefined;
}

const baseOptions: SplitOption[] = [
  {
    value: "auto",
    label: "Deixe o GymCoach decidir (recomendado)",
    description:
      "O app escolhe automaticamente Full, ABC, PPL, Força, etc., com base nas suas respostas anteriores.",
  },
  {
    value: "full_body",
    label: "Full Body",
    description:
      "Treinos de corpo inteiro em cada sessão. Excelente para poucas idas à academia.",
  },
  {
    value: "abc",
    label: "ABC",
    description:
      "Divisão clássica (Peito/Tríceps, Costas/Bíceps, Pernas/Ombros ou similar).",
  },
  {
    value: "ppl",
    label: "PPL (Push/Pull/Legs)",
    description:
      "Empurra/Puxa/Perna, muito usada para hipertrofia com alta frequência.",
  },
  {
    value: "upper_lower",
    label: "Upper / Lower",
    description:
      "Dias de membros superiores alternados com dias de membros inferiores.",
  },
  {
    value: "abcd",
    label: "ABCD",
    description:
      "Quatro dias com divisão mais segmentada (ex: Peito, Costas, Pernas, Ombros/Braços).",
  },
  {
    value: "abcde",
    label: "ABCDE",
    description:
      "Cinco dias, foco em um grupo principal por dia. Requer rotina bem estável.",
  },
  {
    value: "strength",
    label: "Força / Powerlifting",
    description:
      "Foco em Supino, Agachamento e Terra, com acessórios pensados para performance.",
  },
];

export default function StepPreferredSplit({
  value,
  goal,
  trainingDays,
  onChange,
  onNext,
  onBack,
}: StepPreferredSplitProps) {
  const handleNext = () => {
    if (!value) return;
    onNext();
  };

  const optionsWithHints: SplitOption[] = baseOptions.map((opt) => ({
    ...opt,
    hint: buildHint(opt.value, goal, trainingDays),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--accent-primary)" }}
        >
          Qual divisão de treino você prefere?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Se você não tiver preferência, deixe o GymCoach escolher. Se já está
          acostumado com algum formato (ABC, PPL, etc.), pode indicar aqui.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {optionsWithHints.map((opt) => {
          const selected = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="w-full text-left"
            >
              <div
                className="rounded-2xl px-4 py-3 transition-all"
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
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
                  {opt.hint && (
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {opt.hint}
                    </p>
                  )}
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
