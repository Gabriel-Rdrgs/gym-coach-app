type StepBodyMetricsProps = {
  weightKg: number | null;
  heightCm: number | null;
  onChangeWeight: (value: number | null) => void;
  onChangeHeight: (value: number | null) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
};

export default function StepBodyMetrics({
  weightKg,
  heightCm,
  onChangeWeight,
  onChangeHeight,
  onNext,
  onBack,
  isSubmitting,
  submitError,
}: StepBodyMetricsProps) {
  const handleWeight = (raw: string) => {
    const parsed = parseFloat(raw);
    onChangeWeight(isNaN(parsed) ? null : parsed);
  };

  const handleHeight = (raw: string) => {
    const parsed = parseFloat(raw);
    onChangeHeight(isNaN(parsed) ? null : parsed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--accent-primary)" }}
        >
          Peso e altura atuais
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Usamos esses dados para calcular seu IMC inicial e registrar o ponto
          de partida das suas métricas físicas. Ambos os campos são opcionais —
          você pode preencher depois na seção de métricas.
        </p>
      </div>

      <div className="flex-1 space-y-6">
        {/* Peso */}
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Peso (kg)
          </label>
          <input
            type="number"
            placeholder="ex: 75.5"
            value={weightKg ?? ""}
            onChange={(e) => handleWeight(e.target.value)}
            min={20}
            max={300}
            step={0.1}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: "rgba(10,14,39,0.9)",
              border: "1px solid rgba(0,217,255,0.4)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border =
                "1px solid var(--accent-primary)";
              e.currentTarget.style.boxShadow =
                "0 0 16px rgba(0,217,255,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border =
                "1px solid rgba(0,217,255,0.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Altura */}
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Altura (cm)
          </label>
          <input
            type="number"
            placeholder="ex: 178"
            value={heightCm ?? ""}
            onChange={(e) => handleHeight(e.target.value)}
            min={100}
            max={250}
            step={1}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: "rgba(10,14,39,0.9)",
              border: "1px solid rgba(0,217,255,0.4)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border =
                "1px solid var(--accent-primary)";
              e.currentTarget.style.boxShadow =
                "0 0 16px rgba(0,217,255,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border =
                "1px solid rgba(0,217,255,0.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Erro de envio */}
        {submitError && (
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
            }}
          >
            {submitError}
          </div>
        )}

        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Esses dados ficam salvos apenas no seu perfil e não são
          compartilhados.
        </p>
      </div>

      <div
        className="mt-6 flex justify-between pt-4"
        style={{ borderTop: "1px solid rgba(0,217,255,0.2)" }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="btn-secondary text-xs"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={`btn-primary text-sm ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Salvando..." : "Concluir"}
        </button>
      </div>
    </div>
  );
}
