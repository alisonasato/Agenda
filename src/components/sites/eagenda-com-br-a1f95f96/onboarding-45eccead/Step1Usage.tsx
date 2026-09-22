"use client";

import { ArrowRightIcon, UserCircleIcon, UsersIcon } from "../shared/icons";
import { ChoiceCard, Lottie, delay } from "./parts";
import type { StepProps } from "./types";

/** Step 1 — "Início": the welcome screen and the usage-mode question. */
export function Step1Usage({ phase, setPhase, onNext, onSkip }: StepProps & { onSkip: () => void }) {
  if (phase === "ask") {
    return (
      <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
        <Lottie name="hello" size={240} className="mx-auto mb-10" style={delay(0)} />
        <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={delay(900)}>
          VAMOS PREPARAR SUA AGENDA
        </p>
        <h1 className="onb-in text-[38px] sm:text-[46px] leading-[1.08] text-balance font-[700] text-foreground" style={delay(1050)}>
          Olá, Maria!
        </h1>
        <p className="onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto mt-4" style={delay(1200)}>
          Vou te fazer algumas perguntas rápidas e deixar sua agenda pronta para atender. São 7 passos e você pode sair quando quiser.
        </p>
        <div className="onb-in flex flex-col items-center gap-4 mt-10" style={delay(1350)}>
          <button type="button" className="group hbtn hbtn--primary hbtn--lg" onClick={() => setPhase("config")}>
            Começar a configuração
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button type="button" className="text-muted hbtn hbtn--ghost hbtn--lg" onClick={onSkip}>
            Pular e configurar depois
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
      <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={delay(0)}>
        ETAPA 1 DE 7
      </p>
      <h1 className="onb-in text-[38px] sm:text-[46px] leading-[1.06] text-balance font-[700] text-foreground" style={delay(90)}>
        Como você vai usar o Seiri?
      </h1>
      <p className="onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto mt-5" style={delay(180)}>
        Escolhendo “Para equipes” eu já te ajudo a convidar as pessoas no fim.
      </p>
      <div className="onb-in grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-2xl w-full mt-8" style={delay(270)}>
        <ChoiceCard
          icon={<UserCircleIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
          title="Para mim"
          desc="Uso individual — eu gerencio meus próprios agendamentos."
          delay={60}
          onClick={onNext}
        />
        <ChoiceCard
          icon={<UsersIcon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />}
          title="Para equipes"
          desc="Vários profissionais — gerencio uma equipe com agendas separadas."
          delay={160}
          onClick={onNext}
        />
      </div>
      <div className="onb-in mt-6" style={delay(360)}>
        <button type="button" className="group hbtn hbtn--secondary hbtn--lg" onClick={() => setPhase("ask")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74" />
          </svg>
          Voltar
        </button>
      </div>
    </section>
  );
}
