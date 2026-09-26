"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ActivityIcon, AddAppointmentIcon, CaretDownIcon, CheckReadIcon, ChevronLeftIcon, ChevronRightIcon, LockIcon, SettingsIcon } from "../shared/icons";
import { useDismiss } from "../shared/useDismiss";
import { BlockHoursModal } from "./BlockHoursModal";
import { TimetableModal } from "./TimetableModal";
import { useIsMobile } from "../shared/useIsMobile";
import type { CalendarView } from "../shared/calendarDates";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

const DISPLAY_GROUPS = [
  {
    label: "Tipo de Visualização",
    options: ["Todos os Horários", "Todos os Horários, sem agrupamento", "Agendamentos, agrupados por horário", "Agendamentos, sem agrupamento"],
    initial: "Todos os Horários",
  },
  {
    label: "Cor dos Eventos",
    options: ["Ocupação do Horário", "Por agenda", "Por status", "Por serviço"],
    initial: "Por agenda",
  },
];

function DisplayMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [colorBy, setColorBy] = useState(DISPLAY_GROUPS[1].initial);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const selected = [value, colorBy];
  const setters = [onChange, setColorBy];

  return (
    <div ref={ref} className="hinline-anchor">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)}>
        <ActivityIcon width={16} height={16} className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Exibição:</span>
        <span className="hinline-value">{value}</span>
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon width={14} height={14} className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hinline-popover hinline-popover--framed heroui-scope light">
          <div className="hinline-frame-body cal-scroll">
            {DISPLAY_GROUPS.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="my-1 border-t" style={{ borderColor: "var(--color-border, #e5e9f0)" }} />}
                <div>
                  <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide inter-semibold" style={{ color: "var(--color-muted, #667085)" }}>
                    {group.label}
                  </p>
                  <ul className="hautocomplete-options" role="listbox" aria-label={group.label}>
                    {group.options.map((option) => {
                      const isSelected = selected[gi] === option;
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`hselect-option hautocomplete-option${isSelected ? " is-selected" : ""}`}
                            onClick={() => setters[gi](option)}
                          >
                            <span className={`hautocomplete-option-check is-radio${isSelected ? " is-checked" : ""}`}>
                              {isSelected && <CheckReadIcon width={12} height={12} className="w-3 h-3" />}
                            </span>
                            <span className="hautocomplete-option-content">
                              <span className="hselect-option-label">{option}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="hinline-footer">
            <span aria-hidden="true" />
            <button type="button" className="hinline-footer-done" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewTabs({ view, onView, fill }: { view: CalendarView; onView: (v: CalendarView) => void; fill?: boolean }) {
  const index = VIEWS.findIndex((v) => v.value === view);
  return (
    <div className={`htabs${fill ? " htabs--fill" : ""}`} role="tablist" aria-label="Visualização" style={{ "--htabs-count": VIEWS.length } as CSSProperties}>
      <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${index * 100}%))` }} />
      {VIEWS.map((v) => (
        <button
          key={v.value}
          type="button"
          role="tab"
          aria-selected={v.value === view}
          className={`htabs-tab${v.value === view ? " is-active" : ""}`}
          onClick={() => onView(v.value)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function ActionButtons({ onOpen }: { onOpen: (which: "block" | "timetable") => void }) {
  return (
    <>
      <button type="button" className="hbtn hbtn--ghost hbtn--sm" title="Bloquear Horários" aria-label="Bloquear Horários" onClick={() => onOpen("block")}>
        <LockIcon width={16} height={16} />
        <span className="hactionbar-label">Bloquear Horários</span>
      </button>
      <button
        type="button"
        className="hbtn hbtn--ghost hbtn--sm"
        title="Configurar Horários"
        aria-label="Configurar Horários"
        onClick={() => onOpen("timetable")}
      >
        <SettingsIcon width={16} height={16} />
        <span className="hactionbar-label">Configurar Horários</span>
      </button>
    </>
  );
}

type CalendarControlsProps = {
  view: CalendarView;
  onView: (v: CalendarView) => void;
  display: string;
  onDisplay: (v: string) => void;
  shortTitle: string;
  onPrev: () => void;
  onNext: () => void;
};

export function CalendarControls({ view, onView, display, onDisplay, shortTitle, onPrev, onNext }: CalendarControlsProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<"block" | "timetable" | null>(null);
  return (
    <>
      <div className="cal-controls w-full px-3 md:px-6 lg:px-10 pt-0 pb-3 flex-shrink-0">
        {isMobile ? (
          /* Below md: date row + full-width tabs + scrollable action bar. */
          <div className="flex flex-col gap-2 pt-1.5">
            <div className="flex items-center gap-0.5 w-full">
              <button type="button" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" aria-label="Anterior" onClick={onPrev}>
                <ChevronLeftIcon width={16} height={16} />
              </button>
              <button type="button" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" aria-label="Próximo" onClick={onNext}>
                <ChevronRightIcon width={16} height={16} />
              </button>
              <span className="flex-1 min-w-0 truncate text-sm nunito-bold text-slate-900 px-1">{shortTitle}</span>
              <button
                type="button"
                className="hbtn hbtn--primary hbtn--icon hbtn--sm flex-shrink-0"
                title="Incluir Agendamento"
                aria-label="Incluir Agendamento"
              >
                <AddAppointmentIcon width={16} height={16} />
              </button>
            </div>
            <ViewTabs view={view} onView={onView} fill />
            <div className="hactionbar w-full" role="group">
              <div className="hrail-track hactionbar-track">
                <DisplayMenu value={display} onChange={onDisplay} />
                <span className="hactionbar-sep" />
                <ActionButtons onOpen={setOpen} />
              </div>
              <button type="button" className="hrail-arrow hrail-arrow--next" tabIndex={-1} aria-label="Rolar para o fim">
                <ChevronRightIcon width={16} height={16} className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* md and up: display menu · tabs · actions. */
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <div className="flex items-center gap-2 min-w-0 col-start-1">
              <div className="hactionbar" role="group">
                <div className="hrail-track hactionbar-track">
                  <DisplayMenu value={display} onChange={onDisplay} />
                </div>
              </div>
            </div>
            <div className="flex justify-center col-start-2">
              <ViewTabs view={view} onView={onView} />
            </div>
            <div className="flex min-w-0 justify-end col-start-3">
              <div className="hactionbar" role="group">
                <div className="hrail-track hactionbar-track">
                  <ActionButtons onOpen={setOpen} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {open === "block" && <BlockHoursModal onClose={() => setOpen(null)} />}
      {open === "timetable" && <TimetableModal onClose={() => setOpen(null)} />}
    </>
  );
}
