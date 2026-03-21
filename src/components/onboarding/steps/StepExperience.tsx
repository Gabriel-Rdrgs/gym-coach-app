import type { ExperienceLevel } from "../types";

type StepExperienceProps = {
  value: ExperienceLevel | null;
  onChange: (level: ExperienceLevel) => void;
  onNext: () => void;
  onBack: () => void;
};

const options: {
  value: ExperienceLevel;
  label: string;
  subtitle: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Iniciante",
    subtitle: "Até ~1 ano de treino consistente",
    description:
      "Você ainda está aprendendo técnica, organizando rotina e não treinou pesado de forma sistemática por muito tempo.",
  },
  {
    value: "intermediate",
    label: "Intermediário",
    subtitle: "Entre ~1 e 3 anos de treino consistente",
    description:
      "Você já treina com regularidade, domina a maioria dos exercícios básicos e sente que os ganhos estão mais lentos.",
  },
  {
    value: "advanced",
    label: "Avançado",
    subtitle: "3+ anos de treino sério e consistente",
    description:
      "Você conhece bem seu corpo, já espremeu bastante progresso e precisa de ajustes finos de volume e intensidade.",
  },
];

export default function StepExperience({
  value,
  onChange,
  onNext,
  onBack,
}: StepExperienceProps) {
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
          Qual é o seu nível de experiência?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Isso ajuda o GymCoach a ajustar o volume de séries, a agressividade da
          progressão de cargas e o quanto de variação de exercício faz sentido
          para você.
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
                <div className="flex items-start justify-between gap-4">
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
                      className="text-xs mb-1"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {opt.subtitle}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {opt.description}
                    </p>
                  </div>
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
