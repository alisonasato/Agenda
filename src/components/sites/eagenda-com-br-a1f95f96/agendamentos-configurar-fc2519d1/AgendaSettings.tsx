"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  ActivityIcon,
  CalendarAddIcon,
  CalendarIcon,
  CaretDownIcon,
  ChevronRightIcon,
  CloseCircleIcon,
  SearchSolidIcon,
  SettingsIcon,
  SortIcon,
} from "../shared/icons";
import { useDismiss } from "../shared/useDismiss";
import { ROUTES } from "../shared/Sidebar";
import { AgendaOrderModal } from "./AgendaOrderModal";
import { AgendaNoteCard } from "./AgendaNoteCard";
import { AGENDAS, type Agenda } from "./agendas";
import { update, useData } from "@/lib/seiri/store";
import { fold, formatDate, formatDuration } from "@/lib/seiri/select";
import { DEFAULT_RULES, type Data } from "@/lib/seiri/types";

/**
 * The card needs more than the store keeps about an agenda (notice, asks, notifications), so the
 * mock supplies those while the store supplies the agenda itself, its services and its numbers.
 */
function agendaRows(data: Data): Agenda[] {
  const template = AGENDAS[0];
  const todayIso = new Date().toISOString().slice(0, 10);
  return data.agendas.map((a) => {
    const booked = data.appointments.filter((x) => x.agendaId === a.id && x.status !== "CANCELED");
    const upcoming = booked.filter((x) => x.start.slice(0, 10) >= todayIso);
    const last = booked
      .map((x) => x.start)
      .sort()
      .at(-1);
    const services = data.services.filter((svc) => svc.agendaIds.includes(a.id));
    const rules = data.agendaRules[a.id] ?? DEFAULT_RULES;
    return {
      ...template,
      id: a.id,
      name: a.name,
      color: a.color,
      active: a.active,
      upcoming: upcoming.length,
      freeSlots: Math.max(0, 40 - booked.length),
      lastDate: last ? formatDate(last) : "—",
      duration: formatDuration(rules.duration),
      step: formatDuration(rules.granularity || rules.duration + rules.gap),
      notice: `${rules.minNotice}h – ${rules.maxAhead} dia(s)`,
      maxPerSlot: rules.maxPeople,
      services: services.map((svc) => svc.name),
      week: data.hours[a.id],
    };
  });
}

/** The original's "Configurações" menu: the registers that belong to an agenda. */
const SETTINGS_LINKS = [
  { label: "Serviços", href: ROUTES.servicos },
  { label: "Tags", href: ROUTES.tags },
  { label: "Endereços", href: ROUTES.adminUnidades },
  { label: "Acessos", href: ROUTES.acessoClientes },
  { label: "Feriados", href: ROUTES.feriados },
  { label: "Limites", href: ROUTES.limitesAgendamentos },
];

function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="hinline">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <SettingsIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Configurações</span>
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hmenu-popover" role="menu">
          {SETTINGS_LINKS.map((item) => (
            <a key={item.label} href={item.href} className="hselect-option" role="menuitem">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

type View = "cards" | "table";
const STATUS = [
  { value: "", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "inactive", label: "Inativas" },
];

function AgendasTable({ rows }: { rows: Agenda[] }) {
  return (
    <div className="htable" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
      <div className="htable-scroll">
        <table className="htable-table w-full htable-fixed">
          <thead>
            <tr>
              <th className="htable-col">Agenda</th>
              <th className="htable-col">Status</th>
              <th className="htable-col htable-col--center htable-col--num">Horários</th>
              <th className="htable-col">Serviços</th>
              <th className="htable-col htable-col--center htable-col--num">Max/Hora</th>
              <th className="htable-col htable-col--center htable-col--num">Min Ant.</th>
              <th className="htable-col htable-col--center htable-col--num">Max Ant.</th>
              <th className="htable-col htable-col--center htable-col--num">Intervalo</th>
              <th className="htable-col htable-col--center htable-col--num">Período</th>
              <th className="htable-col htable-col--center htable-col--num">Confirmar</th>
              <th className="htable-col">Dados Solicitados</th>
              <th className="htable-col">Formulários</th>
              <th className="htable-col htable-col--end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="group">
                <td className="htable-cell whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center flex-shrink-0" style={{ color: a.color }}>
                      <CalendarIcon className="w-4 h-4" />
                    </span>
                    <a href="#" className="text-sm text-gray-900 hover:text-primary transition-colors truncate inter-semibold">
                      {a.name}
                    </a>
                  </div>
                </td>
                <td className="htable-cell whitespace-nowrap">
                  <span className={`hchip ${a.active ? "hchip--success" : "hchip--default"} hchip--primary hchip--sm`}>{a.active ? "Ativa" : "Inativa"}</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-sm text-gray-900 inter-semibold">0</span>
                </td>
                <td className="htable-cell">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-400 text-xs">—</span>
                  </div>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-sm text-gray-900 inter-semibold">{a.maxPerSlot}</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-sm text-gray-600 inter-regular">1h</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-sm text-gray-600 inter-regular">7d</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-sm text-gray-600 inter-regular">{a.step}</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-gray-400 text-xs">Sempre</span>
                </td>
                <td className="htable-cell htable-cell--center htable-cell--num whitespace-nowrap">
                  <span className="text-gray-300 text-sm">—</span>
                </td>
                <td className="htable-cell">
                  <div className="flex flex-wrap gap-1">
                    {a.requested.map((x) => (
                      <span key={x} className="hchip hchip--default hchip--primary hchip--sm">
                        {x}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="htable-cell">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-300 text-xs">—</span>
                  </div>
                </td>
                <td className="htable-cell htable-cell--end whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <a title="Configurar" href="#" className="btn-icon btn-icon-sm btn-icon-solid">
                      <SettingsIcon className="w-4 h-4" />
                    </a>
                    <button type="button" title="Atualizar" className="btn-icon btn-icon-sm btn-icon-flat">
                      <ActivityIcon className="w-4 h-4" />
                    </button>
                    <button type="button" title="Desativar Agenda" className="btn-icon btn-icon-sm btn-icon-warning">
                      <CloseCircleIcon className="w-4 h-4" />
                    </button>
                    <button type="button" title="Excluir" className="btn-icon btn-icon-sm btn-icon-danger">
                      <CloseCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="htable-footer" />
    </div>
  );
}

export function AgendaSettings() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<View>("cards");
  const [ordering, setOrdering] = useState(false);
  const toggleAgenda = (id: string) => update((d) => ({ ...d, agendas: d.agendas.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) }));
  const removeAgenda = (id: string) => update((d) => ({ ...d, agendas: d.agendas.filter((x) => x.id !== id) }));

  const data = useData();
  const term = fold(query.trim());
  const agendas = agendaRows(data).filter((a) => fold(a.name).includes(term) && (status === "" || (status === "active") === a.active));

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="agenda-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar pelo identificador da agenda"
              aria-label="Buscar pelo identificador da agenda"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <a href={ROUTES.novaAgenda} className="hbtn hbtn--primary hbtn--sm">
              <CalendarAddIcon className="w-4 h-4" />
              Nova Agenda
            </a>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <button type="button" className="hbtn hbtn--ghost hbtn--sm" onClick={() => setOrdering(true)}>
                  <SortIcon className="w-4 h-4" />
                  <span className="hactionbar-label">Organizar</span>
                </button>
                <span className="hactionbar-sep" aria-hidden="true" />
                <SettingsMenu />
              </div>
              <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 min-w-0">
          <div id="agenda-status-filter" className="min-w-0">
            <div className="htaggroup">
              {STATUS.map((s) => (
                <button key={s.label} type="button" className={`htag${s.value === status ? " htag--active" : ""}`} onClick={() => setStatus(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <div className="htabs" role="tablist" aria-label="Visualização" style={{ "--htabs-count": 2 } as CSSProperties}>
              <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${view === "cards" ? 0 : 100}%))` }} />
              <button
                type="button"
                role="tab"
                aria-selected={view === "cards"}
                className={`htabs-tab${view === "cards" ? " is-active" : ""}`}
                onClick={() => setView("cards")}
              >
                Cards
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "table"}
                className={`htabs-tab${view === "table" ? " is-active" : ""}`}
                onClick={() => setView("table")}
              >
                Tabela
              </button>
            </div>
            <button
              type="button"
              className="hbtn hbtn--secondary hbtn--sm"
              onClick={() => {
                setQuery("");
                setStatus("");
              }}
            >
              <CloseCircleIcon className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        </div>
      </form>

      <div id="agendas-container" className="mt-5 min-w-0 hui-reveal">
        {view === "cards" ? (
          <div id="card_lists" className="grid grid-cols-1 lg:grid-cols-2 gap-9 pl-7 lg:pl-0">
            {agendas.map((a) => (
              <div key={a.id} className="w-full min-w-0 h-full">
                <AgendaNoteCard agenda={a} onToggle={() => toggleAgenda(a.id)} onRemove={() => removeAgenda(a.id)} />
              </div>
            ))}
          </div>
        ) : (
          <AgendasTable rows={agendas} />
        )}
      </div>
      {ordering && <AgendaOrderModal onClose={() => setOrdering(false)} />}
    </>
  );
}
