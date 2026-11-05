import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandHeader } from "@/components/funnel/BrandHeader";
import { GhostButton, OptionCard, PrimaryButton } from "@/components/funnel/ui";
import { PROFILES, QUESTIONS, computeProfile, type Answers } from "@/lib/quiz";
import { trackEvent } from "@/lib/track";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Receitas que combinam com você | Mariana Nutri" },
      { name: "description", content: "Responda algumas perguntas rápidas e descubra receitas para sua rotina com a Mariana Nutri." },
      { property: "og:title", content: "Receitas que combinam com você | Mariana Nutri" },
      { property: "og:description", content: "Quiz rápido para descobrir receitas que combinam com sua rotina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

const TOTAL = QUESTIONS.length;

function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 intro, TOTAL = result
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");

  const start = () => { trackEvent("quiz_started"); setStep(0); };

  if (step === -1) {
    return (
      <Shell>
        <div className="step-in flex min-h-[80vh] flex-col items-center justify-center text-center">
          <BrandHeader />
          <h1 className="mt-10 text-4xl leading-tight font-semibold">Receitas que combinam com você</h1>
          <p className="mt-4 max-w-sm text-lg text-muted-foreground">Responda algumas perguntas rápidas e descubra opções para sua rotina.</p>
          <PrimaryButton className="mt-10 max-w-sm" onClick={start}>Começar</PrimaryButton>
          <p className="mt-4 text-sm text-muted-foreground">Leva cerca de 2 minutos</p>
        </div>
      </Shell>
    );
  }

  if (step === TOTAL) {
    const profile = PROFILES[computeProfile(answers)];
    const name = typeof answers["nome"] === "string" ? answers["nome"].trim() : "";
    return (
      <Shell>
        <div className="step-in flex min-h-[80vh] flex-col items-center justify-center text-center">
          <BrandHeader size="sm" />
          <div className="mt-8 w-full rounded-3xl border border-border bg-card p-7 shadow-sm">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">{name ? `${name}, seu resultado` : "Seu resultado"}</p>
            <h1 className="mt-3 text-3xl leading-tight font-semibold">Seu perfil na cozinha é: <span className="text-primary">{profile.name}</span></h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{profile.text}</p>
          </div>
          <PrimaryButton
            className="mt-8"
            onClick={() => { trackEvent("free_recipes_clicked", { profile: profile.name }); navigate({ to: "/receitas" }); }}
          >
            Resgatar minhas receitas grátis
          </PrimaryButton>
          <button className="mt-4 min-h-11 text-sm text-muted-foreground underline" onClick={() => setStep(TOTAL - 1)}>Revisar respostas</button>
        </div>
      </Shell>
    );
  }

  const q = QUESTIONS[step]!;
  const value = answers[q.id];
  const set = (v: string | string[]) => { setError(""); setAnswers((a) => ({ ...a, [q.id]: v })); };

  const next = () => {
    if (q.type !== "text") {
      const ok = Array.isArray(value) ? value.length > 0 : !!value;
      if (!ok) { setError("Escolha uma opção para continuar."); return; }
      trackEvent("quiz_question_answered", { question_id: q.id, step: step + 1 });
    }
    if (step === TOTAL - 1) {
      const p = PROFILES[computeProfile(answers)].name;
      trackEvent("quiz_completed");
      trackEvent("quiz_result_viewed", { profile: p });
    }
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <Shell>
      <div className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-5 pb-4 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">Mariana Nutri</span>
          <span>Etapa {step + 1} de {TOTAL}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={step + 1}>
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>
      </div>

      <div key={q.id} className="step-in pb-36">
        <h2 className="mt-6 text-2xl leading-snug font-semibold">{q.title}</h2>
        {q.type === "multi" && <p className="mt-2 text-sm text-muted-foreground">Você pode escolher mais de uma opção.</p>}

        <div className="mt-6 flex flex-col gap-3" role={q.type === "multi" ? "group" : "radiogroup"} aria-label={q.title}>
          {q.type === "text" ? (
            <label className="block">
              <span className="sr-only">{q.title}</span>
              <input
                value={typeof value === "string" ? value : ""}
                onChange={(e) => set(e.target.value)}
                placeholder={q.placeholder}
                maxLength={40}
                autoComplete="given-name"
                className="min-h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-base outline-none focus:border-primary"
              />
              <span className="mt-2 block text-sm text-muted-foreground">Opcional</span>
            </label>
          ) : (
            q.options.map((o) => {
              const multi = q.type === "multi";
              const arr = Array.isArray(value) ? value : [];
              const selected = multi ? arr.includes(o.label) : value === o.label;
              return (
                <OptionCard key={o.label} multi={multi} selected={selected}
                  onClick={() => set(multi ? (selected ? arr.filter((x) => x !== o.label) : [...arr, o.label]) : o.label)}>
                  {o.label}
                </OptionCard>
              );
            })
          )}
        </div>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-3 px-5 py-4">
          {step > 0 && <GhostButton onClick={() => { setError(""); setStep(step - 1); }}>Voltar</GhostButton>}
          <PrimaryButton onClick={next}>{step === TOTAL - 1 ? "Ver meu resultado" : "Continuar"}</PrimaryButton>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-lg px-5">{children}</main>;
}
