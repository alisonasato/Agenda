"use client";

import { ChevronLeftIcon } from "../shared/icons";
import { AskScreen, ForwardButton, delay } from "./parts";
import type { StepProps } from "./types";

/** Step 7 — "Google Agenda": the last question, which offers the Google Calendar sync. */
export function Step7Google({ onNext, onBack }: StepProps) {
  return (
    <AskScreen
      lottie="google"
      size={360}
      lottieStyle={{ maxWidth: "88vw" }}
      step={7}
      title="Quer ver tudo no Google Agenda?"
      lead="Cada agendamento novo aparece automaticamente no seu Google Calendar — sem digitar nada duas vezes."
      titleClass="leading-[1.08]"
      leadClass="mt-4"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="onb-in flex flex-col sm:flex-row items-center gap-3 mt-10" style={delay(1080)}>
          <ForwardButton label="Sim, sincronizar com o Google" submit />
          <button type="submit" className="hbtn hbtn--secondary hbtn--lg">
            Agora não
          </button>
        </div>
      </form>
      <p className="onb-in text-[14px] text-muted max-w-xs mt-4" style={delay(1160)}>
        Você será redirecionado para autorizar o acesso e volta para cá em seguida.
      </p>
      <div className="onb-in mt-5" style={delay(1220)}>
        <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
          <ChevronLeftIcon />
          Voltar
        </button>
      </div>
    </AskScreen>
  );
}
