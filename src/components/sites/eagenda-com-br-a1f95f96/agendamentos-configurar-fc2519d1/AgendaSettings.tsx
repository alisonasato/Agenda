"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ActivityIcon,
  CalendarAddIcon,
  CalendarIcon,
  CaretDownIcon,
  CheckReadIcon,
  ChevronRightIcon,
  CloseCircleIcon,
  MapPointIcon,
  SearchSolidIcon,
  SettingsIcon,
  UsersIcon,
  WidgetIcon,
} from "../shared/icons";
import { useDismiss } from "../shared/useDismiss";
import { AgendaNoteCard } from "./AgendaNoteCard";
import { AGENDAS } from "./agendas";

type View = "cards" | "table";
const STATUS = [
  { value: "", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "inactive", label: "Inativas" },
];

/** Trigger + searchable popover shared by the Unidade / Serviço / Usuário filters. */
function InlineFilter({ label, icon, options }: { label: string; icon: ReactNode; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const hits = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} className="hinline">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {icon}
        <span className="hinline-label">{label}</span>
        {values.length > 0 && <span className="hinline-count">{values.length}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hinline-popover" style={{ width: 240 }}>
          <div className="hinline-search-wrap">
            <SearchSolidIcon className="hinline-search-icon w-4 h-4" />
            <input type="text" placeholder="Buscar..." className="hinline-search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <ul className="hautocomplete-options" role="listbox">
            {hits.length === 0 ? (
              <li className="hautocomplete-state">
                <div className="hautocomplete-state-inner">
                  <SearchSolidIcon className="w-4 h-4" />
                  <span>Nenhum resultado encontrado</span>
                </div>
              </li>
            ) : (
              hits.map((o) => {
                const selected = values.includes(o);
                return (
                  <li key={o}>
                    <button
                      type="button"
                      className="hselect-option hautocomplete-option"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setValues(selected ? values.filter((v) => v !== o) : [...values, o])}
                    >
                      <span className="hautocomplete-option-check">{selected && <CheckReadIcon className="w-3 h-3" />}</span>
                      <span className="hautocomplete-option-content">
                        <span className="hselect-option-label">{o}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="hinline-footer">
            {values.length > 0 ? (
              <button type="button" className="hinline-footer-clear" onClick={() => setValues([])}>
                Limpar
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <button type="button" className="hinline-footer-done" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendasTable() {
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
            {AGENDAS.map((a) => (
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

  const agendas = AGENDAS.filter(
    (a) =>
      a.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === "" || (status === "active") === a.active),
  );

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
            <a href="#" className="hbtn hbtn--primary hbtn--sm">
              <CalendarAddIcon className="w-4 h-4" />
              Nova Agenda
            </a>
            <div className="hactionbar" role="group">
              <div className="hrail-track hactionbar-track">
                <InlineFilter label="Unidade" icon={<MapPointIcon className="hinline-icon w-4 h-4" />} options={[]} />
                <InlineFilter label="Serviço" icon={<WidgetIcon className="hinline-icon w-4 h-4" />} options={[]} />
                <InlineFilter label="Usuário" icon={<UsersIcon className="hinline-icon w-4 h-4" />} options={["Maria Souza"]} />
                <InlineFilter label="Filtros" icon={<ActivityIcon className="hinline-icon w-4 h-4" />} options={[]} />
                <span className="hactionbar-sep" aria-hidden="true" />
                <button type="button" className="hbtn hbtn--ghost hbtn--sm">
                  <WidgetIcon className="w-4 h-4" />
                  <span className="hactionbar-label">Organizar</span>
                </button>
                <span className="hactionbar-sep" aria-hidden="true" />
                <InlineFilter label="Configurações" icon={<SettingsIcon className="hinline-icon w-4 h-4" />} options={[]} />
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
              <button type="button" role="tab" aria-selected={view === "cards"} className={`htabs-tab${view === "cards" ? " is-active" : ""}`} onClick={() => setView("cards")}>
                Cards
              </button>
              <button type="button" role="tab" aria-selected={view === "table"} className={`htabs-tab${view === "table" ? " is-active" : ""}`} onClick={() => setView("table")}>
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
                <AgendaNoteCard agenda={a} />
              </div>
            ))}
          </div>
        ) : (
          <AgendasTable />
        )}
      </div>
    </>
  );
}
