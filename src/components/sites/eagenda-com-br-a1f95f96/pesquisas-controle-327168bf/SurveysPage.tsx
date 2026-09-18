"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AddAppointmentIcon, CheckReadIcon, CloseCircleIcon, InboxIcon } from "../shared/icons";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";

const SURVEY_STAGES = [
  { value: "agendamento", label: "Agendamento - Deve ser preenchido no momento do agendamento" },
  { value: "pre-atendimento", label: "Pré-Atendimento - Deve ser preenchido após o agendamento, antes do horário agendado" },
  { value: "atendimento", label: "Atendimento - Formulário Interno para Registro do Atendimento" },
  { value: "pos-atendimento", label: "Pesquisa de Satisfação - Disponível para ser preenchida após a finalização do atendimento" },
];

const TEMPLATES = [{ value: "avaliacao", label: "Pesquisa de Opinião de Atendimento" }];

const COLUMNS = ["Formulário", "Tipo", "Agendas", "Perguntas", "Respostas", "Validade"];
const SLOTS = 10;

/** "Novo Formulário" modal. The original loads this body over htmx; the fields are the same. */
function SurveyFormModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState("agendamento");
  const [template, setTemplate] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="hmodal">
      <div className="hmodal-wrapper hmodal-wrapper--auto hmodal-wrapper--scroll-inside" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="hmodal-backdrop hmodal-backdrop--opaque" aria-hidden="true" />
        <div
          className="hmodal-panel hmodal-panel--lg hmodal-panel--radius-lg hmodal-panel--shadow-lg hmodal-panel--scroll-inside"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="survey-form-modal-title"
        >
          <button type="button" className="hmodal-close" aria-label="Fechar" onClick={onClose}>
            <CloseCircleIcon className="w-5 h-5" />
          </button>
          <div className="hmodal-header">
            <h2 className="hmodal-title" id="survey-form-modal-title">
              Novo Formulário
            </h2>
          </div>
          <div className="hmodal-body-wrap">
            <div className="hmodal-body" id="survey-form-modal-body">
              <form id="survey-form" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div className="hinput-field hinput-field--block">
                    <label className="hinput-label" htmlFor="id_name">
                      Nome do Formulário <span className="hinput-req">*</span>
                    </label>
                    <div className="hinput-wrap">
                      <input id="id_name" className="hinput" type="text" name="name" placeholder="Ex: Pesquisa de Satisfação" required />
                    </div>
                  </div>

                  <div className="hinput-field hinput-field--block">
                    <label className="hinput-label" htmlFor="id_description">
                      Descrição
                    </label>
                    <textarea name="description" id="id_description" rows={3} className="htextarea mt-1.5" placeholder="Descreva o objetivo do formulário..." />
                  </div>

                  <div>
                    <Combobox
                      id="survey_stage"
                      label="Tipo de Formulário"
                      options={SURVEY_STAGES}
                      value={stage}
                      onChange={setStage}
                      placeholder="Selecione o tipo"
                      searchInPopover
                    />
                  </div>

                  <div>
                    {/* The live account's picker offers no agendas here, so it opens on its empty state. */}
                    <ChipMultiSelect id="id_calendar" label="Vincular às Agendas" placeholder="Selecione as agendas" options={[]} values={agendas} onChange={setAgendas} />
                  </div>

                  <label className="hcheckbox">
                    <input type="checkbox" name="need_logged_user" className="hcheckbox-input" />
                    <span className="hcheckbox-box" aria-hidden="true">
                      <CheckReadIcon className="hcheckbox-check w-3 h-3" />
                      <span className="hcheckbox-dash" aria-hidden="true" />
                    </span>
                    <span className="hcheckbox-label">Apenas usuários logados podem responder</span>
                  </label>

                  <div>
                    <Combobox
                      id="modelo_questoes"
                      label="Importar Modelo Padronizado"
                      options={TEMPLATES}
                      value={template}
                      onChange={setTemplate}
                      placeholder="Não importar - criar do zero"
                      searchInPopover
                    />
                    <p className="hinput-desc">Importa perguntas pré-definidas que você pode editar depois</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="hmodal-footer">
            <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" form="survey-form" id="survey-form-modal-submit" className="hbtn hbtn--primary">
              <CheckReadIcon />
              Salvar
              <span className="hmodal-submit-spinner">
                <span className="hmodal-submit-dot" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SurveysPage() {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="hbtn hbtn--primary" onClick={() => setCreating(true)}>
          <AddAppointmentIcon />
          Novo Formulário
        </button>
      </div>

      <div className="mt-6">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Seus Formulários</h2>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div id="surveys-table-container" className="mt-4">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.75rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className="htable-col">
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {creating && <SurveyFormModal onClose={() => setCreating(false)} />}
    </>
  );
}
