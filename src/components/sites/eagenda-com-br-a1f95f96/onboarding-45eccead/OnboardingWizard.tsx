"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/basePath";
import { ArrowRightIcon, ChevronLeftIcon, CloseCircleIcon, UserCircleIcon, UsersIcon } from "../shared/icons";

const STEP_LABELS = ["Início", "Perfil", "Agenda", "Horários", "Atendimento", "Avisos", "Google Agenda"];
const HELLO = withBase("/sites/eagenda-com-br-a1f95f96/onboarding-45eccead/hello.json");

/** Step 1 shows the welcome question ("ask") and then the usage-mode cards ("config"). */
type Phase = "ask" | "config";

/** The welcome animation, played by lottie-web exactly like the original. */
function HelloAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let animation: { destroy: () => void } | undefined;
    let cancelled = false;
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !container) return;
      animation = lottie.loadAnimation({ container, renderer: "svg", loop: true, autoplay: true, path: HELLO });
    });
    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);
  return <div ref={ref} className="onb-orb-in mx-auto mb-10" style={{ width: 240, height: 240, "--d": "0ms" } as React.CSSProperties} aria-hidden="true" />;
}

/** The dots above the stage: filled up to the current step, hidden while a step only asks a question. */
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-3 pt-6 sm:pt-8 pb-3 px-6">
      <ol className="flex items-center" aria-label="Etapas">
        {STEP_LABELS.map((name, i) => (
          <li key={name} className="flex items-center">
            <button
              type="button"
              className={`relative rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
                i + 1 === step ? "w-7 h-7 bg-surface border-2 border-accent onb-dot-active" : i + 1 < step ? "w-6 h-6 bg-accent" : "w-6 h-6 bg-border"
              } cursor-default`}
              disabled
              aria-label={name}
              aria-current={i + 1 === step ? "step" : undefined}
            />
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-1.5 w-6 sm:w-10 mx-1.5 rounded-full transition-colors duration-300 ${i + 1 < step ? "bg-accent" : "bg-border"}`} />
            )}
          </li>
        ))}
      </ol>
      <span className="text-[14px] font-[600] text-muted">{STEP_LABELS[step - 1] ?? ""}</span>
    </div>
  );
}

/** One of the two usage-mode cards; choosing either submits step 1 in the original. */
function UsageCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <button
      type="submit"
      className="onb-rise group bg-surface border border-border rounded-3xl p-6 sm:p-7 cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">{icon}</div>
      <div className="text-[22px] font-[700] text-foreground mb-1.5">{title}</div>
      <p className="text-[16px] leading-relaxed text-muted">{desc}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent mt-4 transition-transform group-hover:gap-2.5">
        Escolher
        <ArrowRightIcon className="w-4 h-4" />
      </span>
    </button>
  );
}

/** "Quer continuar depois?" — the confirmation behind both "Sair" buttons. */
function SkipDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="halertdialog">
      <div className="halertdialog-backdrop halertdialog-backdrop--opaque">
        <div className="halertdialog-container">
          <div
            className="halertdialog-dialog halertdialog-dialog--md"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="onboarding-skip-dialog-heading"
            tabIndex={-1}
          >
            <button type="button" className="halertdialog-close" aria-label="Fechar" onClick={onClose}>
              <CloseCircleIcon className="w-5 h-5" />
            </button>
            <div className="halertdialog-header">
              <span className="halertdialog-icon halertdialog-icon--accent" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.428 2c-1.114 0-2.129.6-4.157 1.802l-.686.406C5.555 5.41 4.542 6.011 3.985 7c-.557.99-.557 2.19-.557 4.594v.812c0 2.403 0 3.605.557 4.594s1.57 1.59 3.6 2.791l.686.407C10.299 21.399 11.314 22 12.428 22s2.128-.6 4.157-1.802l.686-.407c2.028-1.2 3.043-1.802 3.6-2.791c.557-.99.557-2.19.557-4.594v-.812c0-2.403 0-3.605-.557-4.594s-1.572-1.59-3.6-2.792l-.686-.406C14.555 2.601 13.542 2 12.428 2m-3.75 10a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 0 1-7.5 0"
                  />
                </svg>
              </span>
              <h2 className="halertdialog-heading" id="onboarding-skip-dialog-heading">
                Quer continuar depois?
              </h2>
            </div>
            <div className="halertdialog-body" id="onboarding-skip-dialog-body">
              <p>Você configura serviços, horários e avisos quando quiser nas Configurações — o que já preencheu fica salvo.</p>
            </div>
            <div className="halertdialog-footer">
              <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
                Continuar configurando
              </button>
              <a href={withBase("/")} className="hbtn hbtn--primary">
                Sair e configurar depois
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Clone of /onboarding/ (Ajuda › Passo a Passo): the 7-step wizard, with step 1 built out. */
export function OnboardingWizard() {
  const [phase, setPhase] = useState<Phase>("ask");
  const [skipping, setSkipping] = useState(false);
  return (
    <main className="relative h-full flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-1">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/brand/logo.png")} alt="Seiri" className="h-8 w-auto flex-shrink-0" />
          <span className="h-6 w-px bg-border hidden sm:block flex-shrink-0" />
          <div className="hidden sm:flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-[13px] font-[700] flex-shrink-0">M</div>
            <div className="leading-tight min-w-0">
              <div className="text-[12px] font-semibold text-foreground truncate">Minha Empresa</div>
              <div className="text-[10px] text-muted">Configuração inicial</div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button type="button" className="text-muted hbtn hbtn--ghost hbtn--sm" onClick={() => setSkipping(true)}>
            <CloseCircleIcon />
            Sair
          </button>
        </div>
      </header>

      {phase === "config" && <Stepper step={1} />}

      <div className="relative flex-1 overflow-hidden">
        <div id="step-wrapper" className="relative h-full">
          <div id="step-content" className="h-full overflow-y-auto onb-scroll">
            <div className="h-full">
              {phase === "ask" ? (
                <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
                  <HelloAnimation />
                  <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={{ "--d": "900ms" } as React.CSSProperties}>
                    VAMOS PREPARAR SUA AGENDA
                  </p>
                  <h1
                    className="onb-in text-[38px] sm:text-[46px] leading-[1.08] text-balance font-[700] text-foreground"
                    style={{ "--d": "1050ms" } as React.CSSProperties}
                  >
                    Olá, Maria!
                  </h1>
                  <p
                    className="onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto mt-4"
                    style={{ "--d": "1200ms" } as React.CSSProperties}
                  >
                    Vou te fazer algumas perguntas rápidas e deixar sua agenda pronta para atender. São 7 passos e você pode sair quando quiser.
                  </p>
                  <div className="onb-in flex flex-col items-center gap-4 mt-10" style={{ "--d": "1350ms" } as React.CSSProperties}>
                    <button type="button" className="group hbtn hbtn--primary hbtn--lg" onClick={() => setPhase("config")}>
                      Começar a configuração
                      <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button type="button" className="text-muted hbtn hbtn--ghost hbtn--lg" onClick={() => setSkipping(true)}>
                      Pular e configurar depois
                    </button>
                  </div>
                </section>
              ) : (
                <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
                  <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={{ "--d": "0ms" } as React.CSSProperties}>
                    ETAPA 1 DE 7
                  </p>
                  <h1
                    className="onb-in text-[38px] sm:text-[46px] leading-[1.06] text-balance font-[700] text-foreground"
                    style={{ "--d": "90ms" } as React.CSSProperties}
                  >
                    Como você vai usar o Seiri?
                  </h1>
                  <p
                    className="onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto mt-5"
                    style={{ "--d": "180ms" } as React.CSSProperties}
                  >
                    Escolhendo “Para equipes” eu já te ajudo a convidar as pessoas no fim.
                  </p>
                  <form
                    className="onb-in grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-2xl w-full mt-8"
                    style={{ "--d": "270ms" } as React.CSSProperties}
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <UsageCard
                      icon={<UserCircleIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
                      title="Para mim"
                      desc="Uso individual — eu gerencio meus próprios agendamentos."
                      delay={60}
                    />
                    <UsageCard
                      icon={<UsersIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
                      title="Para equipes"
                      desc="Vários profissionais — gerencio uma equipe com agendas separadas."
                      delay={160}
                    />
                  </form>
                  <div className="onb-in mt-6" style={{ "--d": "360ms" } as React.CSSProperties}>
                    <button type="button" className="group hbtn hbtn--secondary hbtn--lg" onClick={() => setPhase("ask")}>
                      <ChevronLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
                      Voltar
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {skipping && <SkipDialog onClose={() => setSkipping(false)} />}
    </main>
  );
}
