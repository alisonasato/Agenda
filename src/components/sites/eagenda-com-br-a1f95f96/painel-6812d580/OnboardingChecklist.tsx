"use client";

import { CheckReadIcon, CloseCircleIcon, PlayIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";
import { ROUTES } from "../shared/Sidebar";
import { CHECKLIST_STEPS, checklistState } from "./checklist";

/** Where each step sends you, in the same order as the rules. */
const HREFS = [ROUTES.telaAgendamento, ROUTES.dadosConta, ROUTES.novoAgendamento, ROUTES.planos];

export function OnboardingChecklist() {
  const data = useData();
  if (data.checklistDismissed) return null;

  const { done, count, next, percent } = checklistState(data);

  return (
    <div className="mb-6 md:mb-8">
      <section className="honbchecklist" id="onboarding-checklist">
        <div className="honbchecklist-head">
          <div className="honbchecklist-heading">
            <h3 className="honbchecklist-title">Termine de configurar sua conta</h3>
            <p className="honbchecklist-desc">Poucos passos e sua agenda fica completa.</p>
          </div>
          <div className="honbchecklist-progress">
            <div className="hmeter hmeter--accent" role="meter" aria-label={`${count} de ${CHECKLIST_STEPS.length} passos concluídos`} aria-valuenow={percent}>
              <div className="hmeter-head">
                <span className="hmeter-output">
                  {count} de {CHECKLIST_STEPS.length}
                </span>
              </div>
              <div className="hmeter-track">
                <div className="hmeter-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="honbchecklist-dismiss"
            title="Dispensar"
            aria-label="Dispensar"
            // The original posts this to the server, so it has to outlive a reload here too.
            onClick={() => update((d) => ({ ...d, checklistDismissed: true }))}
          >
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </div>
        <ol className="honbchecklist-steps">
          {CHECKLIST_STEPS.map((step, i) => (
            <li key={step.label}>
              <a href={HREFS[i]} className={`honbchecklist-step${done[i] ? " is-done" : i === next ? " is-emphasis" : ""}`}>
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
