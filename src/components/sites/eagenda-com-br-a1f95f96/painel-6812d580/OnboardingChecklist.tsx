"use client";

import { useState } from "react";
import { CloseCircleIcon, PlayIcon } from "../shared/icons";

const STEPS = [
  "Terminar a configuração da agenda",
  "Adicionar logo e mensagem de boas-vindas",
  "Fazer um agendamento teste",
  "Escolher seu plano",
];

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const done = 0;
  return (
    <div className="mb-6 md:mb-8">
      <section className="honbchecklist" id="onboarding-checklist">
        <div className="honbchecklist-head">
          <div className="min-w-0">
            <h3 className="honbchecklist-title">Termine de configurar sua conta</h3>
            <p className="honbchecklist-desc">Poucos passos e sua agenda fica completa.</p>
          </div>
          <button type="button" className="honbchecklist-dismiss" title="Dispensar" aria-label="Dispensar" onClick={() => setDismissed(true)}>
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="honbchecklist-progress" role="group" aria-label={`${done} de ${STEPS.length} concluídos`}>
          <div className="honbchecklist-track">
            <div className="honbchecklist-bar" style={{ width: `${(done / STEPS.length) * 100}%` }} />
          </div>
          <span className="honbchecklist-count">
            {done}/{STEPS.length}
          </span>
        </div>
        <ul className="honbchecklist-list">
          {STEPS.map((label, i) => (
            <li key={label}>
              <a href="#" className={`honbchecklist-item${i === 0 ? " is-emphasis" : ""}`}>
                <span className="honbchecklist-mark" aria-hidden="true" />
                <span className="honbchecklist-label">{label}</span>
                <PlayIcon className="honbchecklist-arrow w-4 h-4" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
