"use client";

import { useRef, useState } from "react";
import { CalendarIcon, CaretDownIcon, CheckReadIcon, CloseCircleIcon, FunnelIcon, ReportIcon, SlidersIcon, SortIcon } from "../shared/icons";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";
import { InlineFilter } from "../shared/InlineFilter";
import { InlineSelect, type SelectOption } from "../shared/InlineSelect";
import { ROUTES } from "../shared/Sidebar";
import { ScrollRail } from "../shared/ScrollRail";
import { useDismiss } from "../shared/useDismiss";

import { useData } from "@/lib/seiri/store";
import { dayKey, expand, formatWhen } from "@/lib/seiri/select";
import { STATUS_LABELS } from "@/lib/seiri/types";
import type { Data, Appointment } from "@/lib/seiri/types";

/** What each selectable column shows for a row; the fields the store does not keep read "—". */
function cellOf(data: Data, a: Appointment, column: string) {
  const { client, clientName, agendaName, serviceName, tags } = expand(data, a);
  switch (column) {
    case "Identificador do Agendamento":
      return a.code;
    case "Nome":
      return clientName;
    case "E-mail":
      return client?.email ?? "—";
    case "Telefone":
      return client?.phone ?? "—";
    case "CPF":
      return client?.cpf ?? "—";
    case "Gênero":
      return client?.gender ?? "—";
    case "Agendado em":
      return formatWhen(a.start, a.duration);
    case "Atualizado em":
      return `${agendaName} · ${serviceName}`;
    case "Comentários":
      return a.comment || "—";
    case "Tags":
      return tags.join(", ") || "—";
    case "Responsável":
      return a.owner;
    default:
      return "—";
  }
}

const STATUSES: SelectOption[] = [
  { value: "todos", label: "Todos" },
  { value: "exc_cancel", label: "Todos, menos os Cancelados" },
  { value: "cancelled", label: "Somente Cancelados" },
];

const ORDERINGS: SelectOption[] = [
  { value: "nome", label: "Nome" },
  { value: "email", label: "E-mail" },
  { value: "created", label: "Hora do Agendamento" },
];

const COLUMNS = [
  "Identificador do Agendamento",
  "Nome",
  "E-mail",
  "Telefone",
  "CPF",
  "Endereço",
  "Data de Nascimento",
  "Agendado em",
  "Atualizado em",
  "Comentários",
  "Tags",
  "Gênero",
  "Profissão",
  "Nacionalidade",
  "Local de Nascimento",
  "Documento de Identificação",
  "Responsável",
  "IP de cliente",
  "Respostas de Formulários",
];

/** The 11 columns the original pre-selects. */
const DEFAULT_COLUMNS = [
  "Nome",
  "E-mail",
  "Telefone",
  "CPF",
  "Endereço",
  "Data de Nascimento",
  "Agendado em",
  "Atualizado em",
  "Comentários",
  "Tags",
  "Respostas de Formulários",
];

const pad = (n: number) => String(n).padStart(2, "0");
const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

/** Default window: the last 30 days, ending today. */
function defaultRange(today: Date) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  return { from, to: today };
}

export function AppointmentsReport() {
  const data = useData();
  const [today] = useState(() => new Date());
  const [preview, setPreview] = useState<Appointment[] | null>(null);
  const [range] = useState(() => defaultRange(new Date()));
  const [agendas, setAgendas] = useState<string[]>([]);
  const [status, setStatus] = useState("exc_cancel");
  const [ordering, setOrdering] = useState("nome");
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);

  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useDismiss(dateRef, dateOpen, () => setDateOpen(false));

  return (
    <form id="appointments-report-filter-form" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
        <div className="w-full md:w-auto flex items-center gap-2 min-w-0">
          <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
            <div ref={dateRef} className="hdaterange">
              <button
                type="button"
                className="hinline-trigger hdaterange-trigger hinline-trigger--bare is-active"
                aria-expanded={dateOpen}
                onClick={() => setDateOpen((o) => !o)}
              >
                <CalendarIcon className="hinline-icon w-4 h-4" />
                <span className="hinline-label">
                  {short(range.from)} – {short(range.to)}
                </span>
                <span className="hinline-chevron" aria-hidden="true">
                  <CaretDownIcon className="w-3.5 h-3.5" />
                </span>
              </button>
              {dateOpen && (
                <DateRangePopover
                  preset={"Todos os períodos" as Preset}
                  today={today}
                  initialMonth={range.from}
                  onPreset={() => setDateOpen(false)}
                  onClear={() => setDateOpen(false)}
                />
              )}
            </div>

            <InlineFilter label="Agenda" icon={<CalendarIcon className="hinline-icon w-4 h-4" />} options={data.agendas.map((a) => a.name)} values={agendas} onChange={setAgendas} />
            <InlineSelect label="Status" icon={<CheckReadIcon className="hinline-icon w-4 h-4" />} options={STATUSES} value={status} onChange={setStatus} clearTo="exc_cancel" />
            <InlineSelect label="Ordenar por" icon={<SortIcon className="hinline-icon w-4 h-4" />} options={ORDERINGS} value={ordering} onChange={setOrdering} clearTo="nome" />
            <InlineFilter label="Colunas" icon={<SlidersIcon className="hinline-icon w-4 h-4" />} options={COLUMNS} values={columns} onChange={setColumns} />

            <span className="hactionbar-sep" aria-hidden="true" />

            <a href={`${ROUTES.relatorioAgendamentos}?reset=1`} className="hbtn hbtn--ghost hbtn--sm">
              <CloseCircleIcon className="w-4 h-4" />
              <span className="hactionbar-label">Limpar filtros</span>
            </a>
          </ScrollRail>
        </div>

        <div className="md:ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            id="report-apply-btn"
            className="hbtn hbtn--primary hbtn--sm"
            onClick={() =>
              setPreview(
                data.appointments
                  .filter((a) => dayKey(a.start) >= dayKey(range.from.toISOString()) && dayKey(a.start) <= dayKey(range.to.toISOString()))
                  .filter((a) => (status === "exc_cancel" ? a.status !== "CANCELED" : status === "all" ? true : a.status === status))
                  .filter((a) => (agendas.length ? agendas.includes(data.agendas.find((g) => g.id === a.agendaId)?.name ?? "") : true))
                  .sort((x, y) =>
                    ordering === "nome"
                      ? (expand(data, x).clientName ?? "").localeCompare(expand(data, y).clientName ?? "")
                      : x.start.localeCompare(y.start),
                  ),
              )
            }
          >
            <FunnelIcon className="w-4 h-4" />
            Aplicar filtros
          </button>
        </div>
      </div>

      <div id="report-preview" className="mt-6 md:mt-8">
        <div className="mt-6 md:mt-8 hui-reveal" style={{ animationDelay: ".04s" }}>
          <div className="hwidget-head">
            <div className="hwidget-titles">
              <h2 className="hwidget-title">Prévia do relatório</h2>
            </div>
            <div className="hwidget-actions" />
          </div>
          <div className="mt-4">
            {preview === null ? (
              <div className="hui-card hui-card--flush hempty hui-reveal">
                <ReportIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nenhum relatório foi gerado até o momento</h3>
                <p className="hempty-desc inter-regular">Ajuste o período, a agenda, a situação e as colunas na barra acima e clique em Aplicar filtros.</p>
              </div>
            ) : preview.length === 0 ? (
              <div className="hui-card hui-card--flush hempty hui-reveal">
                <ReportIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nenhum agendamento no período</h3>
                <p className="hempty-desc inter-regular">Ajuste o período, a agenda ou a situação e gere o relatório de novo.</p>
              </div>
            ) : (
              <div className="htable" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as React.CSSProperties}>
                <div className="htable-scroll">
                  <table className="htable-table w-full">
                    <thead>
                      <tr>
                        <th className="htable-col">Situação</th>
                        {columns.map((c) => (
                          <th key={c} className="htable-col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((a) => (
                        <tr key={a.id} className="htable-row">
                          <td className="htable-cell">{STATUS_LABELS[a.status]}</td>
                          {columns.map((c) => (
                            <td key={c} className="htable-cell">
                              {cellOf(data, a, c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="htable-footer" />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
