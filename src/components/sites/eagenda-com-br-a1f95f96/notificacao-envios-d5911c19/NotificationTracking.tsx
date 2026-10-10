"use client";

import { useRef, useState, type CSSProperties } from "react";
import { BellIcon, CalendarIcon, CaretDownIcon, FunnelIcon, InboxIcon, PlaneIcon, SearchEmptyIcon } from "../shared/icons";
import { DateRangePopover } from "../shared/DateRangePopover";
import { inPeriod, periodLabel, type Period } from "@/lib/seiri/range";
import { InlineFilter } from "../shared/InlineFilter";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { useDismiss } from "../shared/useDismiss";
import { useData } from "@/lib/seiri/store";
import { SITUATION_TONES, sendsOf, showStamp } from "@/lib/seiri/sends";
import { STATUS_LABELS, STATUS_TONES } from "@/lib/seiri/types";

const TYPES = ["SMS", "WhatsApp", "Email", "Notificação Push", "WhatsApp - via WideChat", "WhatsApp - via Twilio"];
const APPOINTMENT_STATUSES = [
  "ATENDIDO",
  "CANCELADO",
  "CANCELADO PELO CLIENTE",
  "CANCELADO VIA GOOGLE AGENDA",
  "CONFIRMADO",
  "EM ATENDIMENTO",
  "NÃO COMPARECEU",
  "PENDENTE CONFIRMAÇÃO",
  "AGUARDANDO PREENCHIMENTO DE ACOMPANHANTES",
  "AGUARDANDO PREENCHIMENTO DE FORMULÁRIO",
  "AGUARDANDO CONFIRMAÇÃO DE PAGAMENTO",
];
const SEND_STATUSES = ["Todas", "Aguardando", "Enviada", "Cancelada", "Falhou", "Sem Crédito", "Bloqueada"];
const COLUMNS = ["Destinatário", "Agenda", "Regra", "Tipo", "Status Agend.", "Data Agend.", "Envio em", "Situação"];
const SLOTS = 10;

/** Period filter (.hdaterange): shows its label until a period is picked, then the period. */
function DateFilter({ label, period, onPeriod, today }: { label: string; period?: Period; onPeriod: (p?: Period) => void; today: Date }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false), panelRef);
  const pick = (p?: Period) => {
    onPeriod(p);
    setOpen(false);
  };
  return (
    <div ref={ref} className="hdaterange">
      <button
        type="button"
        className={`hinline-trigger hdaterange-trigger hinline-trigger--bare${period && period !== "Todos os períodos" ? " is-active" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">{period ? periodLabel(period) : label}</span>
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && <DateRangePopover period={period} today={today} onPeriod={pick} onClear={() => pick(undefined)} anchor={ref} panelRef={panelRef} />}
    </div>
  );
}

type MoreFilters = { statuses: string[]; date?: Period };

/** "Filtros" menu: the appointment status and date filters, counted on the trigger. */
function MoreFiltersMenu({ value, onChange, today }: { value: MoreFilters; onChange: (v: MoreFilters) => void; today: Date }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Like the original: clicks inside the nested field popovers (on <body>) keep the menu open.
  useDismiss(ref, open, () => setOpen(false), undefined, ".hselect-popover");
  const count = (value.statuses.length > 0 ? 1 : 0) + (value.date ? 1 : 0);
  return (
    <div ref={ref} className="hinline">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${open ? " is-open" : ""}${count > 0 ? " is-active" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label hactionbar-label">Filtros</span>
        {count > 0 && <span className="hinline-count">{count}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div id="notif-more-panel" className="hselect-popover hmenu-popover hmenu-filters" role="dialog">
          <div className="hmenu-filter-row">
            <InlineFilter
              label="Status do agendamento"
              icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
              options={APPOINTMENT_STATUSES}
              values={value.statuses}
              onChange={(statuses) => onChange({ ...value, statuses })}
            />
          </div>
          <div className="hmenu-filter-row">
            <DateFilter label="Data do agendamento" period={value.date} onPeriod={(date) => onChange({ ...value, date })} today={today} />
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationTracking() {
  const data = useData();
  const [today] = useState(() => new Date());
  const [sendDate, setSendDate] = useState<Period>();
  const [agendas, setAgendas] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [more, setMore] = useState<MoreFilters>({ statuses: [] });
  const [status, setStatus] = useState("Todas");
  // Remounting the filters on "Limpar filtros" also closes any open popover, as the original's reset does.
  const [resetKey, setResetKey] = useState(0);

  const periodSet = (p?: Period) => !!p && p !== "Todos os períodos";
  // Any applied filter swaps the empty state for the "filtered" variant, as on the live page.
  const filtered = status !== "Todas" || periodSet(sendDate) || periodSet(more.date) || agendas.length + types.length + more.statuses.length > 0;

  const sends = sendsOf(data);
  const agendaNames = [...new Set(data.agendas.map((a) => a.name))];
  const rows = sends
    .filter((row) => (status === "Todas" ? true : row.situation === status))
    .filter((row) => (agendas.length ? agendas.includes(row.agendaName) : true))
    .filter((row) => (types.length ? types.includes(row.channelLabel) : true))
    .filter((row) => (more.statuses.length ? more.statuses.includes(STATUS_LABELS[row.status].toUpperCase()) : true))
    .filter((row) => (sendDate ? inPeriod(row.at, sendDate, today) : true))
    .filter((row) => (more.date ? inPeriod(row.start, more.date, today) : true));

  const reset = () => {
    setSendDate(undefined);
    setAgendas([]);
    setTypes([]);
    setMore({ statuses: [] });
    setStatus("Todas");
    setResetKey((k) => k + 1);
  };

  return (
    <>
      <form id="formFilter" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <ScrollRail key={resetKey} className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <DateFilter label="Envio" period={sendDate} onPeriod={setSendDate} today={today} />
              <InlineFilter
                label="Agenda"
                icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
                options={agendaNames}
                values={agendas}
                onChange={setAgendas}
              />
              <InlineFilter label="Tipo" icon={<PlaneIcon className="hinline-icon w-4 h-4" />} options={TYPES} values={types} onChange={setTypes} />
              <MoreFiltersMenu value={more} onChange={setMore} today={today} />
              <span className="hactionbar-sep" aria-hidden="true" />
              <a href={ROUTES.notificacoesRegras} className="hbtn hbtn--ghost hbtn--sm">
                <BellIcon />
                <span className="hactionbar-label">Regras de Notificação</span>
              </a>
            </ScrollRail>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 hui-reveal" style={{ animationDelay: ".04s" }}>
          <ScrollRail className="hrail min-w-0" trackClassName="hrail-track">
            <div className="htaggroup htaggroup--nowrap">
              {SEND_STATUSES.map((s) => (
                <button key={s} type="button" className={`htag${s === status ? " htag--active" : ""}`} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </ScrollRail>
          <div className="sm:ml-auto flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              Limpar filtros
            </button>
          </div>
        </div>
      </form>

      <div id="notifications-table-container" className="mt-4 hui-reveal" style={{ animationDelay: ".06s" }}>
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
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
                  <tr key={row.id}>
                    <td className="htable-cell">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm text-gray-900 inter-semibold truncate">{row.clientName}</span>
                        <span className="text-xs text-gray-500 inter-regular truncate">{row.contact}</span>
                      </div>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className="hchip hchip--default hchip--soft hchip--sm">{row.agendaName}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-700 inter-regular">{row.ruleTitle}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className="hchip hchip--accent hchip--primary hchip--sm">{row.channelLabel}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className={`hchip ${STATUS_TONES[row.status]} hchip--primary hchip--sm`}>{STATUS_LABELS[row.status]}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-700 inter-regular whitespace-nowrap">{showStamp(row.start)}</span>
                    </td>
                    <td className="htable-cell">
                      <span className="text-sm text-gray-700 inter-regular whitespace-nowrap">{showStamp(row.at)}</span>
                    </td>
                    <td className="htable-cell whitespace-nowrap">
                      <span className={`hchip ${SITUATION_TONES[row.situation]} hchip--primary hchip--sm`}>{row.situation}</span>
                    </td>
                    <td className="htable-cell htable-cell--end">
                      <span className="text-xs text-gray-400 inter-regular">-</span>
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
              {filtered ? (
                <div className="hempty hempty--inline hui-reveal">
                  <SearchEmptyIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum resultado encontrado</h3>
                  <p className="hempty-desc inter-regular">
                    Nenhum registro corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhuma notificação programada</h3>
                  <p className="hempty-desc inter-regular">Quando uma regra de notificação agendar um envio, ele aparece aqui.</p>
                </div>
              )}
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>
    </>
  );
}
