"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { nextId, update, useData } from "@/lib/seiri/store";
import { CHOICE_TYPES, DEFAULT_QUESTION_TYPE, QUESTION_TYPES, RANGE_TYPES } from "@/lib/seiri/types";
import type { Survey, SurveyQuestion } from "@/lib/seiri/types";
import { AlertDialog } from "../shared/AlertDialog";
import { Combobox } from "../shared/Combobox";
import { Modal, ModalSubmit } from "../shared/Modal";
import { SurveyFormModal } from "../pesquisas-controle-327168bf/SurveysPage";
import {
  CheckboxMark,
  DangerCircleIcon,
  EyeIcon,
  InboxIcon,
  PenIcon,
  PlusCircleIcon,
  ReportIcon,
  SaveIcon,
  TrashIcon,
  WarningTriangleIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";

const SURVEY_STAGES: Record<string, string> = {
  agendamento: "Agendamento",
  "pre-atendimento": "Pré-Atendimento",
  atendimento: "Atendimento",
  "pos-atendimento": "Pesquisa de Satisfação",
};

const COLUMNS = ["Ordem", "Pergunta", "Tipo", "Opções/Limites", "Obrigatória", "Ações"];
const SLOTS = 8;

const typeLabel = (value: string) => QUESTION_TYPES.find((t) => t.value === value)?.label ?? value;

/** "Opções/Limites": the alternatives, or the range, or nothing. */
function limitsOf(q: SurveyQuestion) {
  if (CHOICE_TYPES.includes(q.type)) return q.choices || "—";
  if (RANGE_TYPES.includes(q.type) && (q.minValue || q.maxValue)) return `${q.minValue || "—"} a ${q.maxValue || "—"}`;
  return "—";
}

function QuestionModal({ surveyId, question, onClose }: { surveyId: string; question?: SurveyQuestion; onClose: () => void }) {
  const data = useData();
  const [text, setText] = useState(question?.text ?? "");
  const [type, setType] = useState(question?.type ?? DEFAULT_QUESTION_TYPE);
  const [order, setOrder] = useState(String(question?.order ?? data.surveyQuestions.filter((q) => q.surveyId === surveyId).length + 1));
  const [required, setRequired] = useState(question?.required ?? false);
  const [choices, setChoices] = useState(question?.choices ?? "");
  const [minValue, setMinValue] = useState(question?.minValue ?? "");
  const [maxValue, setMaxValue] = useState(question?.maxValue ?? "");
  const [helpText, setHelpText] = useState(question?.helpText ?? "");

  const asksChoices = CHOICE_TYPES.includes(type);
  const asksRange = RANGE_TYPES.includes(type);
  // The preview splits on the comma and drops the blanks, like the original's `choiceList`.
  const choiceList = choices
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const save = () => {
    if (!text.trim() || (asksChoices && !choiceList.length)) return;
    update((d) => {
      const row: SurveyQuestion = {
        id: question?.id ?? nextId("sq", d.surveyQuestions),
        surveyId,
        text: text.trim(),
        type,
        order: Number(order) || 1,
        required,
        choices: asksChoices ? choices.trim() : "",
        minValue: asksRange ? minValue : "",
        maxValue: asksRange ? maxValue : "",
        helpText: helpText.trim(),
      };
      return {
        ...d,
        surveyQuestions: question ? d.surveyQuestions.map((x) => (x.id === question.id ? row : x)) : [...d.surveyQuestions, row],
      };
    });
    onClose();
  };

  return (
    <Modal
      id="question-modal"
      title={question ? "Editar Pergunta" : "Nova Pergunta"}
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="question-modal" form="question-form" icon={<SaveIcon />} label="Salvar" />
        </>
      }
    >
      <form
        id="question-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="space-y-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_text">
              Texto da Pergunta <span className="hinput-req">*</span>
            </label>
            <textarea
              id="id_text"
              name="text"
              className="htextarea mt-1.5"
              rows={3}
              required
              placeholder="Digite a pergunta aqui..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_order">
                Ordem <span className="hinput-req">*</span>
              </label>
              <div className="hinput-wrap hinput-wrap--number">
                <input id="id_order" name="order" type="number" min={1} className="hinput" required value={order} onChange={(e) => setOrder(e.target.value)} />
              </div>
            </div>
            <div>
              <Combobox
                id="id_type"
                label="Tipo de Resposta"
                options={QUESTION_TYPES}
                value={type}
                onChange={setType}
                placeholder="Selecione o tipo"
                required
                searchInPopover
              />
            </div>
          </div>

          <label className="hcheckbox">
            <input type="checkbox" name="required" className="hcheckbox-input" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            <span className="hcheckbox-box" aria-hidden="true">
              <CheckboxMark />
            </span>
            <span className="hcheckbox-label">Resposta obrigatória</span>
          </label>

          {type === "texto-nota" && (
            <p className="hinput-desc">
              O tipo &apos;Nota&apos; permite ao respondente informar uma nota de 0 a 10. Notas abaixo de 6 em pesquisas de satisfação geram alertas
              automáticos.
            </p>
          )}

          {asksChoices && (
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_choices">
                Alternativas <span className="hinput-req">*</span>
              </label>
              <textarea
                id="id_choices"
                name="choices"
                className="htextarea mt-1.5"
                rows={3}
                placeholder="Opção 1, Opção 2, Opção 3"
                value={choices}
                onChange={(e) => setChoices(e.target.value)}
              />
              <p className="hinput-desc">Separe as alternativas por vírgula. Ex: Sim, Não, Talvez</p>
            </div>
          )}

          {asksRange && (
            <div className="grid grid-cols-2 gap-4">
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_min">
                  Valor Mínimo
                </label>
                <div className="hinput-wrap hinput-wrap--number">
                  <input id="id_min" name="min_value" type="number" className="hinput" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_max">
                  Valor Máximo
                </label>
                <div className="hinput-wrap hinput-wrap--number">
                  <input id="id_max" name="max_value" type="number" className="hinput" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_help">
              Texto de Ajuda (opcional)
            </label>
            <textarea
              id="id_help"
              name="help_text"
              className="htextarea mt-1.5"
              rows={2}
              placeholder="Instruções adicionais para o respondente..."
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
            />
            <p className="hinput-desc">Exibido abaixo da pergunta como dica</p>
          </div>

          {/* The original previews the question as the respondent will see it, updating as you type. */}
          {text.trim() && (
            <div className="rounded-xl border border-[color:var(--color-border)] bg-gray-50 p-4">
              <p className="text-xs text-gray-500 inter-regular mb-2">Prévia</p>
              <p className="text-sm text-gray-900 inter-semibold">
                {text.trim()}
                {required && <span className="hinput-req"> *</span>}
              </p>
              {helpText.trim() && <p className="text-xs text-gray-500 inter-regular mt-1">{helpText.trim()}</p>}
              {asksChoices && choiceList.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {choiceList.map((c, i) => (
                    <li key={i} className="text-sm text-gray-600 inter-regular">
                      • {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

/** The chips and the buttons the original puts above the cards. */
export function SurveyDetailsHeader() {
  const data = useData();
  const id = useSearchParams().get("id");
  const survey = data.surveys.find((s) => s.id === id);

  return (
    <div className="min-w-0">
      <h1 className="truncate text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-slate-900 nunito-bold">{survey?.name ?? "Formulário"}</h1>
    </div>
  );
}

export function SurveyDetails() {
  const data = useData();
  const id = useSearchParams().get("id");
  const survey: Survey | undefined = data.surveys.find((s) => s.id === id);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SurveyQuestion | null>(null);
  const [removing, setRemoving] = useState<SurveyQuestion | null>(null);
  const [editingSurvey, setEditingSurvey] = useState(false);
  const [removingSurvey, setRemovingSurvey] = useState(false);

  if (!survey) {
    return (
      <div className="hempty hempty--inline hui-reveal">
        <InboxIcon className="hempty-icon" />
        <h3 className="hempty-title nunito-bold">Formulário não encontrado</h3>
        <p className="hempty-desc inter-regular">
          Volte para <a href={ROUTES.formularios}>Formulários</a> e escolha um da lista.
        </p>
      </div>
    );
  }

  const questions = data.surveyQuestions.filter((q) => q.surveyId === survey.id).sort((a, b) => a.order - b.order);
  const removeQuestion = (qid: string) => update((d) => ({ ...d, surveyQuestions: d.surveyQuestions.filter((q) => q.id !== qid) }));
  // With the form gone this page has nothing left to show, so it goes back to the list.
  const removeSurvey = () => {
    update((d) => ({
      ...d,
      surveys: d.surveys.filter((x) => x.id !== survey.id),
      surveyQuestions: d.surveyQuestions.filter((q) => q.surveyId !== survey.id),
    }));
    window.location.href = ROUTES.formularios;
  };

  const cards = [
    { label: "Perguntas", value: String(questions.length) },
    { label: "Respostas", value: String(survey.responses) },
    { label: "Agendas", value: String(survey.agendaIds.length) },
    { label: "Validade", value: survey.expiresAt || "Sem limite" },
  ];

  // The warning only applies to the types that are answered against an agenda.
  const needsAgenda = survey.stage !== "" && !survey.agendaIds.length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className="hchip hchip--accent hchip--primary">{SURVEY_STAGES[survey.stage] ?? survey.stage}</span>
        <span className="hchip hchip--success hchip--primary">Publicado</span>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* The clone has neither the public answer page nor the consolidated report, so these two
              say why instead of pointing nowhere. */}
          <button type="button" className="hbtn hbtn--secondary" disabled title="O protótipo não tem a página pública de resposta">
            <EyeIcon className="w-4 h-4" />
            Visualizar
          </button>
          <button type="button" className="hbtn hbtn--secondary" disabled title="Sem respostas, o consolidado não existe no protótipo">
            <ReportIcon className="w-4 h-4" />
            Relatório
          </button>
          <button type="button" className="hbtn hbtn--danger" onClick={() => setRemovingSurvey(true)}>
            <TrashIcon className="w-4 h-4" />
            Excluir
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={() => setEditingSurvey(true)}>
            <PenIcon className="w-4 h-4" />
            Editar Formulário
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="hui-card hui-card--flush hkpi">
            <div className="hkpi-body">
              <p className="hkpi-label">{c.label}</p>
              <div className="hkpi-value-row">
                <span className="hkpi-value">{c.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {needsAgenda && (
        <div className="mt-6 survey-warning border rounded-xl p-4" role="alert">
          <div className="flex items-start gap-3">
            <WarningTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold mb-0.5 nunito-bold">Atenção: Nenhuma agenda vinculada</p>
              <p className="inter-regular">
                Este formulário é do tipo {SURVEY_STAGES[survey.stage] ?? survey.stage} mas não está vinculado a nenhuma agenda. Edite o formulário para
                vincular às agendas desejadas.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Perguntas</h2>
          </div>
          <div className="hwidget-actions">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <PlusCircleIcon className="w-4 h-4" />
              Nova Pergunta
            </button>
          </div>
        </div>

        <div className="htable-scroll">
          <table className="htable-table w-full htable-fixed">
            <thead>
              <tr>
                {COLUMNS.map((c, i) => (
                  <th key={c} className={`htable-head${i === COLUMNS.length - 1 ? " htable-cell--end" : ""}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="htable-row">
                  <td className="htable-cell htable-cell--num">{q.order}</td>
                  <td className="htable-cell">{q.text}</td>
                  <td className="htable-cell whitespace-nowrap">
                    <span className="hchip hchip--default hchip--soft hchip--sm">{typeLabel(q.type)}</span>
                  </td>
                  <td className="htable-cell">{limitsOf(q)}</td>
                  <td className="htable-cell whitespace-nowrap">{q.required ? "Sim" : "Não"}</td>
                  <td className="htable-cell htable-cell--end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(q)}>
                        <PenIcon className="w-4 h-4" />
                      </button>
                      <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(q)}>
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, SLOTS - questions.length) }, (_, i) => (
                <tr key={i} className="htable-row--empty" aria-hidden="true">
                  {Array.from({ length: COLUMNS.length }, (_, j) => (
                    <td key={j} className="htable-cell" />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!questions.length && (
          <div className="htable-empty" role="status" aria-live="polite">
            <div className="hempty hempty--inline hui-reveal">
              <InboxIcon className="hempty-icon" />
              <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
              <p className="hempty-desc inter-regular">Use &quot;Nova Pergunta&quot; para montar o formulário.</p>
            </div>
          </div>
        )}
      </div>

      {editingSurvey && <SurveyFormModal survey={survey} onClose={() => setEditingSurvey(false)} />}
      {removingSurvey && (
        <AlertDialog
          id="survey-delete-dialog"
          heading="Excluir formulário"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemovingSurvey(false)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemovingSurvey(false)}>
                Cancelar
              </button>
              <button type="button" className="hbtn hbtn--danger" onClick={removeSurvey}>
                Excluir
              </button>
            </>
          }
        >
          As perguntas e as respostas já recebidas vão junto.
        </AlertDialog>
      )}
      {creating && <QuestionModal surveyId={survey.id} onClose={() => setCreating(false)} />}
      {editing && <QuestionModal surveyId={survey.id} question={editing} onClose={() => setEditing(null)} />}
      {removing && (
        <AlertDialog
          id="question-delete-dialog"
          heading="Excluir pergunta"
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
                  removeQuestion(removing.id);
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        >
          A pergunta &quot;{removing.text}&quot; sai do formulário.
        </AlertDialog>
      )}
    </>
  );
}
