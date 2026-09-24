"use client";

import { useRef, useState } from "react";
import { CaretDownIcon, CloseCircleIcon, PenIcon, ReceiptIcon, SearchSolidIcon, SlidersIcon, TrashIcon } from "../shared/icons";
import { useData, update } from "@/lib/seiri/store";
import { expand, fold, formatWhen, inPreset } from "@/lib/seiri/select";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/seiri/types";
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
  const [columns, setColumns] = useState<string[]>([]);
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
  const remove = (id: string) => update((d) => ({ ...d, appointments: d.appointments.filter((a) => a.id !== id) }));
  const reset = () => {
    setQuery("");
    setStatus("");
    setPreset("Próximos 7 dias");
  };

  return (
    <>
      <AppointmentsFilters query={query} onQuery={setQuery} preset={preset} onPreset={setPreset} today={today} />

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
            <ColumnsMenu visible={columns} onToggle={(id) => setColumns((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} />
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
                      const { clientName, agendaName, serviceName, tags } = expand(data, a);
                      return (
                        <tr key={a.id} className="htable-row">
                          <td className="htable-cell htable-cell--center">{a.code}</td>
                          <td className="htable-cell">
                            <span className={`hchip hchip--soft hchip--sm ${STATUS_TONES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                          </td>
                          <td className="htable-cell">{clientName}</td>
                          <td className="htable-cell">
                            <span className="block">{agendaName}</span>
                            <span className="block text-xs text-gray-500">{serviceName}</span>
                          </td>
                          <td className="htable-cell">{formatWhen(a.start, a.duration)}</td>
                          {shows("check_tags") && (
                            <td className="htable-cell col_tags">
                              {tags.map((t) => (
                                <span key={t} className="hchip hchip--soft hchip--sm hchip--default">
                                  {t}
                                </span>
                              ))}
                            </td>
                          )}
                          {shows("check_owner") && <td className="htable-cell col_owner">{a.owner}</td>}
                          {shows("check_comments") && <td className="htable-cell col_comment">{a.comment}</td>}
                          <td className="htable-cell htable-cell--center">
                            <span className="inline-flex items-center gap-1">
                              <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Editar agendamento">
                                <PenIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
                                aria-label="Excluir agendamento"
                                onClick={() => remove(a.id)}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </span>
                          </td>
                          <td className="htable-cell htable-cell--center">
                            <button type="button" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" aria-label="Recibo">
                              <ReceiptIcon className="w-4 h-4" />
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
    </>
  );
}
