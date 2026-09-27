"use client";

import { useState } from "react";
import { CheckReadIcon, CloseCircleIcon, PlayIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useData } from "@/lib/seiri/store";

/** The four steps the original lists, in its order. */
const STEPS = [
  { label: "Adicionar logo e mensagem de boas-vindas", href: ROUTES.dadosConta },
  { label: "Informar o e-mail de contato do negócio", href: ROUTES.telaAgendamento },
  { label: "Fazer um agendamento teste", href: ROUTES.novoAgendamento },
  { label: "Escolher seu plano", href: ROUTES.pacotesEnvio },
];

export function OnboardingChecklist() {
  const data = useData();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Only the third step can be told from the data this clone keeps.
  const done = STEPS.map((_, i) => i === 2 && data.appointments.length > 0);
  const count = done.filter(Boolean).length;
  const next = done.indexOf(false);

  return (
    <div className="mb-6 md:mb-8">
      <section className="honbchecklist" id="onboarding-checklist">
        <div className="honbchecklist-head">
          <div className="honbchecklist-heading">
            <h3 className="honbchecklist-title">Termine de configurar sua conta</h3>
            <p className="honbchecklist-desc">Poucos passos e sua agenda fica completa.</p>
          </div>
          <div className="honbchecklist-progress">
            <div
              className="hmeter hmeter--accent"
              role="meter"
              aria-label={`${count} de ${STEPS.length} passos concluídos`}
              aria-valuenow={(count / STEPS.length) * 100}
            >
              <div className="hmeter-head">
                <span className="hmeter-output">
                  {count} de {STEPS.length}
                </span>
              </div>
              <div className="hmeter-track">
                <div className="hmeter-fill" style={{ width: `${(count / STEPS.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <button type="button" className="honbchecklist-dismiss" title="Dispensar" aria-label="Dispensar" onClick={() => setDismissed(true)}>
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </div>
        <ol className="honbchecklist-steps">
          {STEPS.map((step, i) => (
            <li key={step.label}>
              <a href={step.href} className={`honbchecklist-step${done[i] ? " is-done" : i === next ? " is-emphasis" : ""}`}>
                <span className="honbchecklist-mark" aria-hidden="true">
                  {done[i] ? <CheckReadIcon className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className="honbchecklist-label">{step.label}</span>
                {done[i] ? <span className="sr-only">concluído</span> : i === next ? <span className="sr-only">próximo passo</span> : null}
                {!done[i] && <PlayIcon className="honbchecklist-arrow w-4 h-4" />}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
