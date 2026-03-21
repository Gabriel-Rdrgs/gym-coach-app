type StepDaysPerWeekProps = {
  value: number | null;
  onChange: (days: number) => void;
  onNext: () => void;
  onBack: () => void;
};

const options = [
  {
    value: 2,
    label: "2 dias por semana",
    description: "Agenda apertada. Foco em treinos Full Body bem eficientes.",
  },
  {
    value: 3,
    label: "3 dias por semana",
    description: "Equilíbrio entre rotina cheia e boas oportunidades de treino.",
  },
  {
    value: 4,
    label: "4 dias por semana",
    description:
      "Compromisso sólido com o treino, permite divisões mais sofisticadas.",
  },
  {
    value: 5,
    label: "5 dias por semana",
    description:
      "Alta frequência. Ideal para hipertrofia com volumes mais distribuídos.",
  },
  {
    value: 6,
    label: "6 dias por semana",
    description:
      "Treino quase diário. Requer atenção para recuperação e fadiga.",
  },
];

export default function StepDaysPerWeek({
  value,
  onChange,
  onNext,
  onBack,
}: StepDaysPerWeekProps) {
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
          Quantos dias por semana você pode treinar?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Seja realista com sua rotina. É melhor o GymCoach planejar para algo
          que você consegue cumprir do que para um cenário idealizado.
        </p>
      </div>

      <div className="flex-1 space-y-3">
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
                <div className="flex items-center justify-between gap-4">
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
