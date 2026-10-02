"use client";

import { useState, type CSSProperties } from "react";
import { DatePicker } from "../shared/DatePicker";
import { AlertDialog } from "../shared/AlertDialog";
import { nextId, update, useData } from "@/lib/seiri/store";
import type { Survey } from "@/lib/seiri/types";
import { AddAppointmentIcon, CheckboxMark, CheckReadIcon, InboxIcon, DangerCircleIcon, PenIcon, TrashIcon } from "../shared/icons";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { Modal, ModalSubmit } from "../shared/Modal";

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
function SurveyFormModal({ survey, onClose }: { survey?: Survey; onClose: () => void }) {
  const data = useData();
  const [today] = useState(() => new Date());
  const [name, setName] = useState(survey?.name ?? "");
  const [description, setDescription] = useState(survey?.description ?? "");
  const [stage, setStage] = useState(survey?.stage ?? "agendamento");
  const [template, setTemplate] = useState(survey?.template ?? "");
  const [agendas, setAgendas] = useState<string[]>(survey?.agendaIds ?? []);
  const [expires, setExpires] = useState<Date | null>(null);
  const [loginRequired, setLoginRequired] = useState(survey?.loginRequired ?? false);

  const pad = (n: number) => String(n).padStart(2, "0");
  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const row: Survey = {
        id: survey?.id ?? nextId("sv", d.surveys),
        name: name.trim(),
        description: description.trim(),
        stage,
        agendaIds: stage ? agendas : [],
        expiresAt: !stage && expires ? `${pad(expires.getDate())}/${pad(expires.getMonth() + 1)}/${expires.getFullYear()}` : (survey?.expiresAt ?? ""),
        loginRequired,
        template,
        // Importing the standard template brings its questions; from scratch starts empty.
        questions: survey?.questions ?? (template ? 5 : 0),
        responses: survey?.responses ?? 0,
      };
      return { ...d, surveys: survey ? d.surveys.map((x) => (x.id === survey.id ? row : x)) : [...d.surveys, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="survey-form-modal"
      title={survey ? "Editar Formulário" : "Novo Formulário"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="survey-form-modal" form="survey-form" icon={<CheckReadIcon />} label="Salvar" />
        </>
      }
    >
      <form
        id="survey-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="space-y-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_name">
              Nome do Formulário <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_name"
                className="hinput"
                type="text"
                name="name"
                placeholder="Ex: Pesquisa de Satisfação"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_description">
              Descrição
            </label>
            <textarea
              name="description"
              id="id_description"
              rows={3}
              className="htextarea mt-1.5"
              placeholder="Descreva o objetivo do formulário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
            {/* The original swaps these two: the agendas with a stage picked, the deadline without one. */}
            {stage ? (
              <ChipMultiSelect
                id="id_calendar"
                label="Vincular às Agendas"
                placeholder="Selecione as agendas"
                options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
                values={agendas}
                onChange={setAgendas}
              />
            ) : (
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_expire_date">
                  Data Limite para Responder
                </label>
                <div className="mt-1.5">
                  <DatePicker
                    id="id_expire_date"
                    name="expire_date"
                    ariaLabel="Data Limite para Responder"
                    value={expires}
                    onChange={setExpires}
                    today={today}
                  />
                </div>
              </div>
            )}
          </div>

          <label className="hcheckbox">
            <input
              type="checkbox"
              name="need_logged_user"
              className="hcheckbox-input"
              checked={loginRequired}
              onChange={(e) => setLoginRequired(e.target.checked)}
            />
            <span className="hcheckbox-box" aria-hidden="true">
              <CheckboxMark />
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
    </Modal>
  );
}

export function SurveysPage() {
  const data = useData();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [removing, setRemoving] = useState<Survey | null>(null);

  const rows = data.surveys.map((survey) => ({
    survey,
    stageLabel: (SURVEY_STAGES.find((x) => x.value === survey.stage)?.label ?? survey.stage).split(" - ")[0],
    agendaNames: survey.agendaIds.length ? survey.agendaIds.map((id) => data.agendas.find((a) => a.id === id)?.name ?? id).join(", ") : "—",
  }));

  const remove = (id: string) => update((d) => ({ ...d, surveys: d.surveys.filter((x) => x.id !== id) }));

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
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.75rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                  {rows.map((row) => (
                    <tr key={row.survey.id}>
                      <td className="htable-cell">
                        <p className="text-sm text-gray-900 font-semibold inter-semibold">{row.survey.name}</p>
                        {row.survey.description && <p className="text-xs text-gray-500 inter-regular">{row.survey.description}</p>}
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--soft hchip--sm">{row.stageLabel}</span>
                      </td>
                      <td className="htable-cell">{row.agendaNames}</td>
                      <td className="htable-cell htable-cell--num">{row.survey.questions}</td>
                      <td className="htable-cell htable-cell--num">{row.survey.responses}</td>
                      <td className="htable-cell whitespace-nowrap">{row.survey.expiresAt || "Sem prazo"}</td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(row.survey)}>
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(row.survey)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                  <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {creating && <SurveyFormModal onClose={() => setCreating(false)} />}
      {editing && <SurveyFormModal survey={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="survey-delete-dialog"
          heading="Excluir formulário"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        >
          As respostas já recebidas vão junto.
        </AlertDialog>
      )}
    </>
  );
}
