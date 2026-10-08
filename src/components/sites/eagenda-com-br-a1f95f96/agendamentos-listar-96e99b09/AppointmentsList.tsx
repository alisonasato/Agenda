"use client";

import { useRef, useState } from "react";
import { useViewPref } from "../shared/viewPrefs";
import {
  CaretDownIcon,
  CheckReadIcon,
  CloseCircleIcon,
  DangerCircleIcon,
  IdCardIcon,
  LetterIcon,
  PenIcon,
  SearchSolidIcon,
  SlidersIcon,
  TagIcon,
  TrashIcon,
  WhatsappIcon,
} from "../shared/icons";
import { useData, update } from "@/lib/seiri/store";
import { download, stamp, toCsv } from "@/lib/seiri/csv";
import { Modal } from "../shared/Modal";
import { SaveIcon } from "../shared/icons";
import type { Appointment, Status } from "@/lib/seiri/types";
import { expand, fold, formatWhen, inPreset } from "@/lib/seiri/select";
import { ROUTES } from "../shared/Sidebar";
import { ActionDialog, statusOf, type CalendarAction } from "../agendamentos-calendar-18078-85bcf86b/ActionDialog";
import { CommentModal, ReceiptModal, TagsModal } from "../agendamentos-calendar-18078-85bcf86b/SlotModals";
import { OwnerModal } from "./OwnerModal";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/seiri/types";

const EDITABLE: Appointment["status"][] = ["PENDING", "CONFIRMED", "ATTENDED", "NO_SHOW", "CANCELED"];

/** The clone's edit dialog: day, time, status and the comment of an appointment. */
function EditModal({ row, onClose }: { row: Appointment; onClose: () => void }) {
  const [day, setDay] = useState(row.start.slice(0, 10));
  const [time, setTime] = useState(row.start.slice(11, 16));
  const [status, setStatus] = useState<Appointment["status"]>(row.status);
  const [comment, setComment] = useState(row.comment);

  const save = () => {
    update((d) => ({
      ...d,
      appointments: d.appointments.map((a) => (a.id === row.id ? { ...a, start: `${day}T${time}`, status, comment } : a)),
    }));
    onClose();
  };

  return (
    <Modal
      id="appointment-edit-modal"
      title={`Agendamento ${row.code}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            <SaveIcon />
            Salvar
          </button>
        </>
      }
    >
      <form id="appointment-edit-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_edit_day">
              Dia
            </label>
            <div className="hinput-wrap">
              <input id="id_edit_day" className="hinput" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
          </div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_edit_time">
              Horário
            </label>
            <div className="hinput-wrap">
              <input id="id_edit_time" className="hinput" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_edit_status">
            Status
          </label>
          <div className="hinput-wrap">
            <select id="id_edit_status" className="hinput hselect-native" value={status} onChange={(e) => setStatus(e.target.value as Appointment["status"])}>
              {EDITABLE.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="hinput-label" htmlFor="id_edit_comment">
            Comentários
          </label>
          <textarea id="id_edit_comment" rows={3} className="htextarea mt-1.5" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
import { useDismiss } from "../shared/useDismiss";
import { AppointmentsFilters } from "./AppointmentsFilters";
import type { Preset } from "../shared/DateRangePopover";

const STATUS_TAGS = [
  { value: "", label: "Todos" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "PENDING", label: "Pendentes" },
  { value: "ATTENDED", label: "Atendidos" },
  { value: "NO_SHOW", label: "Não compareceu" },
  { value: "CANCELED", label: "Cancelados" },
];

const BADGE_CLASS = "appt-status-badge hchip hchip--sm ";
const detailHref = (id: string) => `${ROUTES.agendamentoDetalhes}/?id=${id}`;

/** What a row offers next, by the status it is in — the original hides them all once cancelled. */
const ROW_ACTIONS: Record<string, { label: string; action: CalendarAction; tone: string; icon: React.ReactNode }[]> = {
  PENDING: [
    { label: "Confirmar", action: "accept", tone: "success", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Recusar", action: "reject", tone: "danger", icon: <CloseCircleIcon className="w-4 h-4" /> },
  ],
  CONFIRMED: [
    { label: "Registrar Chegada", action: "attend", tone: "success", icon: <CheckReadIcon className="w-4 h-4" /> },
    { label: "Não Compareceu", action: "no_show", tone: "danger", icon: <DangerCircleIcon className="w-4 h-4" /> },
    { label: "Cancelar Agendamento", action: "cancel", tone: "flat", icon: <TrashIcon className="w-4 h-4" /> },
  ],
  ATTENDED: [],
  NO_SHOW: [],
  CANCELED: [],
};

const OPTIONAL_COLUMNS = [
  { id: "check_tags", label: "Tags", column: "col_tags" },
  { id: "check_owner", label: "Responsável", column: "col_owner" },
  { id: "check_cpf", label: "CPF", column: "col_cpf" },
  { id: "check_email", label: "Email", column: "col_email" },
  { id: "check_phone", label: "Telefone", column: "col_phone" },
  { id: "check_comments", label: "Comentários", column: "col_comment" },
  { id: "check_answers", label: "Respostas Formulários", column: "col_answers" },
];

const SLOTS = 10;

/** The original starts with Responsável on and the rest off. */
const DEFAULT_COLUMNS = ["check_owner"];

function ColumnsMenu({ visible, onToggle }: { visible: string[]; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setOpen((o) => !o)}>
        <SlidersIcon className="w-4 h-4" />
        <span>Colunas</span>
        <span className="inline-flex transition-transform">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-30 py-2 px-1">
          <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 nunito-semibold">Colunas visíveis</p>
          {OPTIONAL_COLUMNS.map((c, i) => (
            <div key={c.id}>
              {i === OPTIONAL_COLUMNS.length - 1 && <div className="border-t border-gray-100 mt-1 pt-1 mx-2" />}
              <label htmlFor={c.id} className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors group">
                <div className="relative flex-shrink-0">
                  <input type="checkbox" id={c.id} className="peer sr-only" checked={visible.includes(c.id)} onChange={() => onToggle(c.id)} />
                  <div className="w-7 h-4 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors duration-200" />
                  <div className="absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full shadow-sm peer-checked:translate-x-3 transition-transform duration-200" />
                </div>
                <span className="text-xs text-gray-600 inter-regular select-none">{c.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AppointmentsListProps = {
  /** The "Confirmar Agendamentos" entry deep-links here with a status and period preselected. */
  initialStatus?: string;
  initialPreset?: Preset;
};

// Rows come from the browser's own data (src/lib/seiri): the live account is empty, so the original
// never showed a filled table — these rows are this clone's own, built from the design system.
export function AppointmentsList({ initialStatus = "", initialPreset = "Próximos 7 dias" }: AppointmentsListProps = {}) {
  const [today] = useState(() => new Date());
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<Preset>(initialPreset);
  const [status, setStatus] = useState(initialStatus);
  // Measured on the original: with its storage cleared it comes back with Responsável alone.
  const [columns, toggleColumn] = useViewPref("appointments.columns", DEFAULT_COLUMNS);
  const data = useData();

  const shows = (id: string) => columns.includes(id);
  const filtered = Boolean(query.trim()) || preset !== "Todos os períodos";
  const term = fold(query.trim());
  const rows = data.appointments
    .filter((a) => (status ? a.status === status : true))
    .filter((a) => inPreset(a.start, preset, today))
    .filter((a) => {
      if (!term) return true;
      const { clientName, serviceName, agendaName } = expand(data, a);
      return [a.code, clientName, serviceName, agendaName].some((v) => fold(v).includes(term));
    })
    .sort((a, b) => a.start.localeCompare(b.start));
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [tags, setTags] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ action: CalendarAction; id: string; name: string } | null>(null);
  // The confirmations write the status, and "Aceitar" also records its payment box.
  const apply = (id: string, status: Status, paid: boolean) =>
    update((d) => ({ ...d, appointments: d.appointments.map((x) => (x.id === id ? { ...x, status, paidExternally: paid || x.paidExternally } : x)) }));
  const exportCsv = () =>
    download(
      `agendamentos-${stamp()}.csv`,
      toCsv(
        ["Identificador", "Status", "Cliente", "Agenda", "Serviço", "Quando", "Responsável", "Comentários"],
        rows.map((a) => {
          const { clientName, agendaName, serviceName } = expand(data, a);
          return [a.code, STATUS_LABELS[a.status], clientName, agendaName, serviceName, formatWhen(a.start, a.duration), a.owner, a.comment];
        }),
      ),
    );
  const reset = () => {
    setQuery("");
    setStatus("");
    setPreset("Próximos 7 dias");
  };

  return (
    <>
      <AppointmentsFilters query={query} onQuery={setQuery} preset={preset} onPreset={setPreset} today={today} onExport={exportCsv} />

      <div className="mt-6 md:mt-8 hui-reveal">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div id="status-quick-filters" className="hrail min-w-0">
            <div className="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {STATUS_TAGS.map((t) => (
                  <button key={t.label} type="button" className={`htag${t.value === status ? " htag--active" : ""}`} onClick={() => setStatus(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <CloseCircleIcon className="w-4 h-4" />
              Limpar filtros
            </button>
            <ColumnsMenu visible={columns} onToggle={toggleColumn} />
          </div>
        </div>

        <div id="tableView" className="relative">
          <div id="appointment-table">
            <div
              className={`htable${rows.length ? "" : " htable-is-empty"}`}
              style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as React.CSSProperties}
            >
              <div className="htable-scroll">
                <table className="htable-table w-full htable-fixed">
                  <thead>
                    <tr id="table-head">
                      <th className="htable-col htable-col--center">Identificador</th>
                      <th className="htable-col">Status</th>
                      <th className="htable-col">Cliente</th>
                      <th className="htable-col">Agenda / Serviço</th>
                      <th className="htable-col">Quando</th>
                      {shows("check_tags") && <th className="htable-col col_tags">Tags</th>}
                      {shows("check_owner") && <th className="htable-col col_owner">Responsável</th>}
                      {shows("check_comments") && <th className="htable-col col_comment">Comentários</th>}
                      <th className="htable-col htable-col--center">Ações</th>
                      <th className="htable-col htable-col--center">Recibo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => {
                      const { client, clientName, agendaName, serviceName, tags } = expand(data, a);
                      return (
                        <tr key={a.id} className="htable-row">
                          <td className="htable-cell htable-cell--center whitespace-nowrap">
                            <a
                              href={detailHref(a.id)}
                              className="text-gray-900 hover:text-primary text-sm inter-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              {a.code}
                            </a>
                          </td>
                          <td className="htable-cell whitespace-nowrap">
                            <a href={detailHref(a.id)} title={STATUS_LABELS[a.status]} className={BADGE_CLASS + STATUS_TONES[a.status]}>
                              <span className="appt-status-label">{STATUS_LABELS[a.status]}</span>
                            </a>
                          </td>
                          <td className="htable-cell">
                            <div className="flex flex-col gap-1 min-w-0">
                              <a
                                href={ROUTES.clienteDetalhes + "/?id=" + a.clientId}
                                className="text-sm text-gray-900 hover:text-primary font-semibold inter-semibold truncate appt-client-name transition-colors"
                              >
                                {clientName}
                              </a>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                {shows("check_phone") && client?.phone && (
                                  <a
                                    href={"https://wa.me/" + client.phone.replace(/\D/g, "") + "/"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="col_phone inline-flex items-center gap-1 hover:text-primary transition-colors"
                                    title={client.phone}
                                  >
                                    <WhatsappIcon className="w-3 h-3" />
                                    <span>{client.phone}</span>
                                  </a>
                                )}
                                {shows("check_email") && client?.email && (
                                  <a
                                    href={"mailto:" + client.email}
                                    className="col_email inline-flex items-center gap-1 hover:text-primary transition-colors min-w-0"
                                    title={client.email}
                                  >
                                    <LetterIcon className="w-3 h-3" />
                                    <span className="truncate appt-client-email">{client.email}</span>
                                  </a>
                                )}
                                {shows("check_cpf") && client?.cpf && (
                                  <span className="col_cpf inline-flex items-center gap-1 font-mono" title={client.cpf}>
                                    <IdCardIcon className="w-3 h-3" />
                                    {client.cpf}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="htable-cell">
                            <div className="flex flex-col gap-1.5 min-w-0">
                              <span className="text-sm text-gray-900 font-semibold inter-semibold">{agendaName}</span>
                              <span className="text-xs text-gray-500 inter-regular">{serviceName}</span>
                            </div>
                          </td>
                          <td className="htable-cell whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <a href={detailHref(a.id)} className="text-sm text-gray-700 hover:text-primary font-semibold inter-semibold transition-colors">
                                {formatWhen(a.start, a.duration)}
                              </a>
                              {a.createdAt && <span className="text-xs text-gray-400 inter-regular">criado {a.createdAt}</span>}
                            </div>
                          </td>
                          {shows("check_tags") && (
                            <td className="htable-cell col_tags">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {tags.map((t) => (
                                    <span key={t} className="hchip hchip--soft hchip--sm hchip--default">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  className="btn-icon btn-icon-sm btn-icon-flat flex-shrink-0"
                                  title="Editar tags"
                                  onClick={() => setTags(a.id)}
                                >
                                  <TagIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                          {shows("check_owner") && (
                            <td className="htable-cell col_owner">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 inter-semibold">{a.owner}</span>
                                <button
                                  type="button"
                                  className="btn-icon btn-icon-sm btn-icon-flat flex-shrink-0"
                                  title="Editar responsável"
                                  onClick={() => setOwner(a.id)}
                                >
                                  <PenIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                          {shows("check_comments") && (
                            <td className="htable-cell col_comment">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 inter-regular truncate max-w-xs" title={a.comment}>
                                  {a.comment}
                                </span>
                                <button
                                  type="button"
                                  className="btn-icon btn-icon-sm btn-icon-flat flex-shrink-0"
                                  title="Editar comentário"
                                  onClick={() => setComment(a.id)}
                                >
                                  <PenIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="htable-cell htable-cell--center whitespace-nowrap">
                            {a.status === "CANCELED" ? (
                              <span className="text-xs text-gray-400 inter-regular">Cancelado</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar Agendamento" onClick={() => setEditing(a)}>
                                  <PenIcon className="w-4 h-4" />
                                </button>
                                {ROW_ACTIONS[a.status].map((action) => (
                                  <button
                                    key={action.label}
                                    type="button"
                                    className={"btn-icon btn-icon-sm btn-icon-" + action.tone}
                                    title={action.label}
                                    onClick={() => setConfirming({ action: action.action, id: a.id, name: clientName })}
                                  >
                                    {action.icon}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="htable-cell htable-cell--center">
                            <button type="button" className="hbtn hbtn--secondary hbtn--sm" title="Recibo de Agendamento" onClick={() => setReceipt(a.id)}>
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                      <tr key={`empty-${i}`} className="htable-row--empty" aria-hidden="true">
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                        {shows("check_tags") && <td className="htable-cell col_tags" />}
                        {shows("check_owner") && <td className="htable-cell col_owner" />}
                        {shows("check_comments") && <td className="htable-cell col_comment" />}
                        <td className="htable-cell" />
                        <td className="htable-cell" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length && (
                <div className="htable-empty" role="status" aria-live="polite">
                  <div className="hempty hempty--inline hui-reveal">
                    <SearchSolidIcon className="hempty-icon" />
                    <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum agendamento encontrado" : "Nenhum agendamento por aqui"}</h3>
                    <p className="hempty-desc inter-regular">
                      {filtered
                        ? "Nenhum agendamento corresponde aos filtros aplicados. Ajuste o período ou limpe os filtros."
                        : "Os agendamentos das suas agendas aparecerão nesta lista."}
                    </p>
                  </div>
                </div>
              )}
              <div className="htable-footer" />
            </div>
          </div>
        </div>
      </div>
      {editing && <EditModal row={editing} onClose={() => setEditing(null)} />}
      {tags && <TagsModal appointmentId={tags} onClose={() => setTags(null)} />}
      {owner && <OwnerModal appointmentId={owner} onClose={() => setOwner(null)} />}
      {comment && <CommentModal appointmentId={comment} onClose={() => setComment(null)} />}
      {receipt && <ReceiptModal appointmentId={receipt} onClose={() => setReceipt(null)} />}
      {confirming && (
        <ActionDialog
          action={confirming.action}
          name={confirming.name}
          onClose={() => setConfirming(null)}
          onConfirm={(paid) => {
            const status = statusOf(confirming.action);
            if (status) apply(confirming.id, status, paid);
            setConfirming(null);
          }}
        />
      )}
    </>
  );
}
