"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AddAppointmentIcon,
  CalendarIcon,
  CaretDownIcon,
  ChevronRightIcon,
  ClockSolidIcon,
  CloseCircleIcon,
  DownloadIcon,
  EyeIcon,
  SearchSolidIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useDismiss } from "../shared/useDismiss";
import { DateRangePopover, type Preset } from "../shared/DateRangePopover";
import { useAnchoredPopover } from "../shared/useAnchoredPopover";

/** The action bar’s "Visualizar" menu (.hmenu), teleported like the original. */
function ViewMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const style = useAnchoredPopover(open, ref, panelRef);
  useDismiss(ref, open, () => setOpen(false), panelRef);

  return (
    <div ref={ref} className="hinline hmenu">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <EyeIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Visualizar</span>
        <span className={`hinline-chevron${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open &&
        createPortal(
          <div ref={panelRef} className="hselect-popover hmenu-popover" role="menu" style={style}>
            <a href={ROUTES.calendario} className="hmenu-item" role="menuitem" onClick={() => setOpen(false)}>
              <CalendarIcon className="hmenu-item-icon w-4 h-4" />
              <span className="hmenu-item-label">Ver Agenda</span>
            </a>
            {/* The waiting list page is not cloned yet. */}
            <a href="#" className="hmenu-item" role="menuitem" onClick={() => setOpen(false)}>
              <ClockSolidIcon className="hmenu-item-icon w-4 h-4" />
              <span className="hmenu-item-label">Lista de Espera</span>
            </a>
          </div>,
          document.body,
        )}
    </div>
  );
}

type FiltersProps = {
  query: string;
  onQuery: (v: string) => void;
  preset: Preset;
  onPreset: (p: Preset) => void;
  today: Date;
};

export function AppointmentsFilters({ query, onQuery, preset, onPreset, today }: FiltersProps) {
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
          <a href={ROUTES.novoAgendamento} target="_blank" rel="noopener noreferrer" className="hbtn hbtn--primary hbtn--sm">
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

              <span className="hactionbar-sep" aria-hidden="true" />

              <ViewMenu />

              <span className="hactionbar-sep" aria-hidden="true" />

              <button type="button" aria-label="Exportar" className="hbtn hbtn--ghost hbtn--sm">
                <DownloadIcon className="w-4 h-4" />
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
