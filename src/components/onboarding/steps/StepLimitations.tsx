type StepLimitationsProps = {
  value: string[];
  onChange: (limitations: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

const options = [
  { value: "joelho", label: "Joelho" },
  { value: "ombro", label: "Ombro" },
  { value: "coluna_lombar", label: "Coluna lombar (lombar)" },
  { value: "coluna_cervical", label: "Coluna cervical (pescoço)" },
  { value: "quadril", label: "Quadril" },
  { value: "tornozelo", label: "Tornozelo / Pé" },
  { value: "cotovelo", label: "Cotovelo" },
  { value: "punho", label: "Punho / Mão" },
  { value: "peito", label: "Peitoral (ex: pós-cirurgia)" },
];

export default function StepLimitations({
  value,
  onChange,
  onNext,
  onBack,
}: StepLimitationsProps) {
  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--accent-primary)" }}
        >
          Alguma limitação física?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Se você tem dor, lesão ou restrição em alguma região, marque abaixo.
          O GymCoach vai considerar isso ao sugerir exercícios. Se não tiver
          nenhuma limitação, pode avançar diretamente.
        </p>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const selected = value.includes(opt.value);

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="w-full text-left"
              >
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
                  style={{
                    border: selected
                      ? "2px solid var(--accent-secondary)"
                      : "1px solid rgba(0,217,255,0.4)",
                    background: selected
                      ? "rgba(167,139,250,0.12)"
                      : "rgba(10,14,39,0.9)",
                    boxShadow: selected
                      ? "0 0 20px rgba(167,139,250,0.35)"
                      : "0 0 10px rgba(0,217,255,0.12)",
                  }}
                >
                  {/* Checkbox visual */}
                  <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                    style={{
                      border: selected
                        ? "2px solid var(--accent-secondary)"
                        : "2px solid rgba(0,217,255,0.5)",
                      background: selected
                        ? "var(--accent-secondary)"
                        : "transparent",
                    }}
                  >
                    {selected && (
                      <svg
                        className="h-2.5 w-2.5"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5l2.5 2.5 4.5-4.5"
                          stroke="#0a0e27"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {value.length === 0 && (
          <p
            className="mt-4 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Nenhuma limitação marcada — ótimo! Você pode avançar.
          </p>
        )}

        {value.length > 0 && (
          <p
            className="mt-4 text-xs"
            style={{ color: "var(--accent-secondary)" }}
          >
            {value.length} limitação{value.length > 1 ? "ões" : ""} marcada
            {value.length > 1 ? "s" : ""}.
          </p>
        )}
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
          onClick={onNext}
          className="btn-primary text-sm"
        >
          {value.length === 0 ? "Avançar sem limitações" : "Avançar"}
        </button>
      </div>
    </div>
  );
}
