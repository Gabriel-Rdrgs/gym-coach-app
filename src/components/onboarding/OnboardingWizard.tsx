"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingFormState } from "./types";
import StepWelcome from "./steps/StepWelcome";
import StepGoal from "./steps/StepGoal";
import StepExperience from "./steps/StepExperience";
import StepDaysPerWeek from "./steps/StepDaysPerWeek";
import StepSessionDuration from "./steps/StepSessionDuration";
import StepPreferredSplit from "./steps/StepPreferredSplit";
import StepLimitations from "./steps/StepLimitations";
import StepBodyMetrics from "./steps/StepBodyMetrics";
import StepResult from "./steps/StepResult";

// Step 0: welcome
// Step 1: goal
// Step 2: experience
// Step 3: days per week
// Step 4: session duration
// Step 5: preferred split
// Step 6: limitations
// Step 7: body metrics
// Step 8: result / summary
const TOTAL_STEPS = 9;

export default function OnboardingWizard() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    suggestedProgram: string;
    suggestedWeeklySets: Record<string, number>;
  } | null>(null);

  const [formState, setFormState] = useState<OnboardingFormState>({
    goal: null,
    experienceLevel: null,
    trainingDaysPerWeek: null,
    sessionDuration: null,
    preferredSplit: "auto",
    limitations: [],
    weightKg: null,
    heightCm: null,
  });

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const updateForm = (partial: Partial<OnboardingFormState>) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  };

  // Chamado ao sair do Step 7 (métricas): envia os dados para a API
  // e move para o Step 8 (resultado)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: formState.goal,
          experienceLevel: formState.experienceLevel,
          trainingDaysPerWeek: formState.trainingDaysPerWeek,
          sessionDuration: formState.sessionDuration,
          preferredSplit: formState.preferredSplit,
          limitations: formState.limitations,
          weightKg: formState.weightKg ?? undefined,
          heightCm: formState.heightCm ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar onboarding.");
      }

      const data = await res.json();

      setSuggestion({
        suggestedProgram: data.profile.suggestedProgram,
        suggestedWeeklySets: data.profile.suggestedWeeklySets,
      });

      // Vai para a tela de resultado
      setCurrentStep(8);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chamado na tela de resultado ao clicar "Entrar no app"
    const handleFinish = () => {
        router.push("/onboarding/setup");
    };


  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden"
        style={{
          background: "var(--bg-card)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.9)",
          borderRadius: "20px",
          border: "1px solid rgba(0, 217, 255, 0.5)",
        }}
      >
        {/* Header com progresso — não mostra no step de resultado */}
        {currentStep < 8 && (
          <div
            className="px-8 py-5"
            style={{ borderBottom: "1px solid rgba(0,217,255,0.2)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--accent-primary)" }}
                >
                  Onboarding inicial
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ajustando o GymCoach ao seu perfil.
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Etapa {currentStep + 1} de {TOTAL_STEPS - 1}
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full"
              style={{ background: "rgba(15,23,42,0.9)" }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                  boxShadow:
                    "0 0 20px rgba(0,217,255,0.6), 0 0 40px rgba(167,139,250,0.5)",
                }}
              />
            </div>
          </div>
        )}

        {/* Conteúdo do step */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentStep === 0 && <StepWelcome onNext={goNext} />}

          {currentStep === 1 && (
            <StepGoal
              value={formState.goal}
              onChange={(goal) => updateForm({ goal })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 2 && (
            <StepExperience
              value={formState.experienceLevel}
              onChange={(experienceLevel) => updateForm({ experienceLevel })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <StepDaysPerWeek
              value={formState.trainingDaysPerWeek}
              onChange={(trainingDaysPerWeek) =>
                updateForm({ trainingDaysPerWeek })
              }
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 4 && (
            <StepSessionDuration
              value={formState.sessionDuration}
              onChange={(sessionDuration) => updateForm({ sessionDuration })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 5 && (
            <StepPreferredSplit
              value={formState.preferredSplit}
              goal={formState.goal}
              trainingDays={formState.trainingDaysPerWeek}
              onChange={(preferredSplit) => updateForm({ preferredSplit })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 6 && (
            <StepLimitations
              value={formState.limitations}
              onChange={(limitations) => updateForm({ limitations })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 7 && (
            <StepBodyMetrics
              weightKg={formState.weightKg}
              heightCm={formState.heightCm}
              onChangeWeight={(weightKg) => updateForm({ weightKg })}
              onChangeHeight={(heightCm) => updateForm({ heightCm })}
              onNext={handleSubmit}
              onBack={goBack}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {currentStep === 8 && suggestion && (
            <StepResult
              formState={formState}
              suggestion={suggestion}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
