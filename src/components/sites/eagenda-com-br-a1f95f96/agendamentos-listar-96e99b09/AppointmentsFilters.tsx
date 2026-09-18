"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  ActivityIcon,
  AddAppointmentIcon,
  CalendarIcon,
  CaretDownIcon,
  CheckReadIcon,
  ChevronRightIcon,
  CloseCircleIcon,
  SearchSolidIcon,
  SettingsIcon,
  WidgetIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useDismiss } from "../shared/useDismiss";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";

/** Trigger + popover pair used by every filter in the action bar. */
function InlineFilter({
  label,
  icon,
  count,
  children,
}: {
  label: string;
  icon: ReactNode;
  count?: number;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="hinline">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)}>
        {icon}
        <span className="hinline-label">{label}</span>
        {count ? <span className="hinline-count">{count}</span> : null}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && children(() => setOpen(false))}
    </div>
  );
}

/** Searchable multi-select popover (Agenda / Serviço). */
function OptionsPopover({
  options,
  values,
  onChange,
  onDone,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const hits = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));
  // Same rule as the original: no search box for static lists of 7 options or fewer.
  const searchable = options.length > 7;
  return (
    <div className="hselect-popover hinline-popover" style={{ width: 240 }}>
      {searchable && (
        <div className="hinline-search-wrap">
          <SearchSolidIcon className="hinline-search-icon w-4 h-4" />
          <input type="text" placeholder="Buscar..." className="hinline-search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}
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
                  onClick={() => onChange(selected ? values.filter((v) => v !== o) : [...values, o])}
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
          <button type="button" className="hinline-footer-clear" onClick={() => onChange([])}>
            Limpar
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <button type="button" className="hinline-footer-done" onClick={onDone}>
          Concluir
        </button>
      </div>
    </div>
  );
}

const AGENDAS = ["Agenda Principal"];
const SERVICES: string[] = [];

type FiltersProps = {
  query: string;
  onQuery: (v: string) => void;
  preset: Preset;
  onPreset: (p: Preset) => void;
  today: Date;
};

export function AppointmentsFilters({ query, onQuery, preset, onPreset, today }: FiltersProps) {
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const dateRef = useRef<HTMLDivElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  useDismiss(dateRef, dateOpen, () => setDateOpen(false));

  return (
    <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
        <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="appt-search">
          <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="hui-search-input"
            placeholder="Buscar por cliente ou identificador"
            aria-label="Buscar por cliente ou identificador"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => onQuery("")}>
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </label>

        <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
          <a href={ROUTES.novoAgendamento} className="hbtn hbtn--primary hbtn--sm">
            <AddAppointmentIcon className="w-4 h-4" />
            Novo Agendamento
          </a>
          <div className="hactionbar" role="group">
            <div className="hrail-track hactionbar-track">
              <div ref={dateRef} className="hdaterange">
                <button
                  type="button"
                  className="hinline-trigger hdaterange-trigger hinline-trigger--bare"
                  aria-expanded={dateOpen}
                  onClick={() => setDateOpen((o) => !o)}
                >
                  <CalendarIcon className="hinline-icon w-4 h-4" />
                  <span className="hinline-label">{preset}</span>
                  <span className="hinline-chevron" aria-hidden="true">
                    <CaretDownIcon className="w-3.5 h-3.5" />
                  </span>
                </button>
                {dateOpen && (
                  <DateRangePopover
                    preset={preset}
                    today={today}
                    onPreset={(p) => {
                      onPreset(p);
                      setDateOpen(false);
                    }}
                  />
                )}
              </div>

              <InlineFilter label="Agenda" count={agendas.length} icon={<CalendarIcon className="hinline-icon w-4 h-4" />}>
                {(close) => <OptionsPopover options={AGENDAS} values={agendas} onChange={setAgendas} onDone={close} />}
              </InlineFilter>

              <InlineFilter label="Serviço" count={services.length} icon={<WidgetIcon className="hinline-icon w-4 h-4" />}>
                {(close) => <OptionsPopover options={SERVICES} values={services} onChange={setServices} onDone={close} />}
              </InlineFilter>

              <InlineFilter label="Filtros" icon={<ActivityIcon className="hinline-icon w-4 h-4" />}>
                {() => (
                  <div className="hselect-popover hmenu-popover hmenu-filters">
                    <button type="button" className="hmenu-item">
                      <span className="hmenu-item-label">Tag</span>
                    </button>
                    <button type="button" className="hmenu-item">
                      <span className="hmenu-item-label">Colaborador</span>
                    </button>
                  </div>
                )}
              </InlineFilter>

              <span className="hactionbar-sep" aria-hidden="true" />

              <InlineFilter label="Visualizar" icon={<WidgetIcon className="hinline-icon w-4 h-4" />}>
                {() => (
                  <div className="hselect-popover hmenu-popover">
                    <a href={ROUTES.calendario} className="hmenu-item" role="menuitem">
                      <span className="hmenu-item-label">Ver Agenda</span>
                    </a>
                    <button type="button" className="hmenu-item" role="menuitem">
                      <span className="hmenu-item-label">Lista de Espera</span>
                    </button>
                  </div>
                )}
              </InlineFilter>

              <span className="hactionbar-sep" aria-hidden="true" />

              <button type="button" aria-label="Exportar" className="hbtn hbtn--ghost hbtn--sm">
                <SettingsIcon className="w-4 h-4" />
                <span className="hactionbar-label">Exportar</span>
              </button>
            </div>
            <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
