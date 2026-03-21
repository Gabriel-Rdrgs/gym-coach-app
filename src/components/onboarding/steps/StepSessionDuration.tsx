import type { SessionDuration } from "../types";

type StepSessionDurationProps = {
  value: SessionDuration | null;
  onChange: (duration: SessionDuration) => void;
  onNext: () => void;
  onBack: () => void;
};

const options: {
  value: SessionDuration;
  label: string;
  description: string;
}[] = [
  {
    value: "30min",
    label: "30 minutos",
    description: "Treinos bem enxutos. Ideal para agendas muito apertadas.",
  },
  {
    value: "45min",
    label: "45 minutos",
    description: "Um meio-termo: dá para treinar bem sem demandar muito tempo.",
  },
  {
    value: "1h",
    label: "1 hora",
    description: "Duração clássica de sessão, excelente para a maioria das pessoas.",
  },
  {
    value: "1h30",
    label: "1h30",
    description: "Sessões longas, com mais volume e calma entre exercícios.",
  },
  {
    value: "2h_plus",
    label: "2 horas ou mais",
    description: "Treinos bem longos. Requer atenção extra à recuperação.",
  },
];

export default function StepSessionDuration({
  value,
  onChange,
  onNext,
  onBack,
}: StepSessionDurationProps) {
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
          Quanto tempo dura sua sessão de treino?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Vamos usar essa informação para distribuir o volume de séries de forma
          que seus treinos caibam confortavelmente na sua rotina.
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
