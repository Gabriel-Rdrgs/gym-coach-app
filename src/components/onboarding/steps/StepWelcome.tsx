type StepWelcomeProps = {
  onNext: () => void;
};

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-8">
        {/* Título principal */}
        <div className="text-center md:text-left">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 text-glow"
            style={{
              color: "var(--accent-primary)",
              letterSpacing: "1.5px",
            }}
          >
            Bem-vindo ao seu GymCoach
          </h1>
          <p
            className="text-sm md:text-base font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Vamos entender quem você é como atleta para que o app monte metas de
            séries, programas de treino e análises pensadas para a sua rotina.
          </p>
        </div>

        {/* Dois cards explicativos, no estilo dashboard */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-neon" style={{ padding: "24px" }}>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: "var(--accent-primary)" }}
            >
              O que vamos perguntar
            </h2>
            <ul
              className="space-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <li>• Seu objetivo principal (hipertrofia, emagrecimento, força...)</li>
              <li>• Quantos dias por semana você pode treinar</li>
              <li>• Quanto tempo você costuma ter em cada sessão</li>
              <li>• Seu nível de experiência com musculação</li>
              <li>• Preferência de divisão de treino e limitações físicas</li>
            </ul>
          </div>

          <div className="card-neon" style={{ padding: "24px" }}>
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: "var(--accent-secondary)" }}
            >
              O que o GymCoach faz com isso
            </h2>
            <ul
              className="space-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <li>• Define metas de séries semanais por grupo muscular</li>
              <li>• Escolhe o melhor programa entre Full, ABC, PPL, Força, etc.</li>
              <li>• Ajusta o volume ao seu nível e disponibilidade de tempo</li>
              <li>• Usa essas informações para interpretar seu progresso depois</li>
            </ul>
          </div>
        </div>

        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Nada aqui é definitivo: você poderá ajustar cada preferência no futuro.
        </p>
      </div>

      {/* Botão de ação, seguindo seus botões globais */}
      <div
        className="mt-6 flex justify-end pt-4"
        style={{ borderTop: "1px solid rgba(0,217,255,0.2)" }}
      >
        <button
          type="button"
          onClick={onNext}
          className="btn-primary text-sm"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
