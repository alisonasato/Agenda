"use client";

import { useState } from "react";
import { withBase } from "@/lib/basePath";
import { CloseCircleIcon } from "../shared/icons";
import { Step1Usage } from "./Step1Usage";
import { Step2Profile } from "./Step2Profile";
import { Step3Agenda } from "./Step3Agenda";
import { Step4Schedule } from "./Step4Schedule";
import { Step5Location } from "./Step5Location";
import { Step6Notifications } from "./Step6Notifications";
import { Step7Google } from "./Step7Google";
import { FinishScreen } from "./FinishScreen";
import type { Phase } from "./types";

const STEP_LABELS = ["Início", "Perfil", "Agenda", "Horários", "Atendimento", "Avisos", "Google Agenda"];

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

/** "Quer continuar depois?" — the confirmation behind both exit buttons. */
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

/** Clone of /onboarding/ (Ajuda › Passo a Passo): the 7-step wizard that prepares the agenda. */
export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>("ask");
  const [skipping, setSkipping] = useState(false);
  const go = (next: number) => {
    setStep(next);
    setPhase("ask");
  };
  const props = { phase, setPhase, onNext: () => go(step + 1), onBack: () => go(step - 1) };

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

      {phase === "config" && step <= STEP_LABELS.length && <Stepper step={step} />}

      <div className="relative flex-1 overflow-hidden">
        <div id="step-wrapper" className="relative h-full">
          <div id="step-content" className="h-full overflow-y-auto onb-scroll">
            <div className="h-full">
              {step === 1 && <Step1Usage {...props} onSkip={() => setSkipping(true)} />}
              {step === 2 && <Step2Profile {...props} />}
              {step === 3 && <Step3Agenda {...props} />}
              {step === 4 && <Step4Schedule {...props} />}
              {step === 5 && <Step5Location {...props} />}
              {step === 6 && <Step6Notifications {...props} />}
              {step === 7 && <Step7Google {...props} />}
              {step === 8 && <FinishScreen days={6} notices={2} />}
            </div>
          </div>
        </div>
      </div>

      {skipping && <SkipDialog onClose={() => setSkipping(false)} />}
    </main>
  );
}
