"use client";

import { useRef, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "./icons";
import { MONTHS, WEEKDAYS_SHORT, addMonths, formatBR, parseBR, pickerCells, sameDay } from "./calendarDates";
import { useDismiss } from "./useDismiss";

type DatePickerProps = {
  id: string;
  name: string;
  ariaLabel: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  today: Date;
};

/** Text field + month calendar (.hdatepicker). Typing dd/mm/aaaa or picking a day both set the value. */
export function DatePicker({ id, name, ariaLabel, value, onChange, today }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ? formatBR(value) : "");
  const [month, setMonth] = useState(() => new Date((value ?? today).getFullYear(), (value ?? today).getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const pick = (d: Date | null) => {
    onChange(d);
    setText(d ? formatBR(d) : "");
    setOpen(false);
  };

  const openAt = () => {
    const base = value ?? today;
    setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} id={id} className="hdatepicker">
      <div className="hdatepicker-field">
        <input
          type="text"
          className="hdatepicker-input"
          name={name}
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          aria-label={ariaLabel}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const d = parseBR(text);
            if (d) onChange(d);
            else if (!text.trim()) onChange(null);
            else setText(value ? formatBR(value) : "");
          }}
        />
        <button type="button" className="hdatepicker-cal" tabIndex={-1} aria-haspopup="dialog" aria-label="Abrir calendário" aria-expanded={open} onClick={openAt}>
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <div className="hselect-popover hdatepicker-popover" role="dialog" aria-label="Selecionar data">
          <div className="hdatepicker-head">
            <div className="hdatepicker-nav-group">
              <button type="button" className="hdatepicker-nav" aria-label="Ano anterior" onClick={() => setMonth((m) => addMonths(m, -12))}>
                <ChevronsLeftIcon className="w-4 h-4" />
              </button>
              <button type="button" className="hdatepicker-nav" aria-label="Mês anterior" onClick={() => setMonth((m) => addMonths(m, -1))}>
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="hdatepicker-title">
              {MONTHS[month.getMonth()]} {month.getFullYear()}
            </div>
            <div className="hdatepicker-nav-group">
              <button type="button" className="hdatepicker-nav" aria-label="Próximo mês" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button type="button" className="hdatepicker-nav" aria-label="Próximo ano" onClick={() => setMonth((m) => addMonths(m, 12))}>
                <ChevronsRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="hdatepicker-weekdays">
            {WEEKDAYS_SHORT.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="hdatepicker-grid">
            {pickerCells(month).map((d, i) => (
              <div key={i} className="hdatepicker-cell">
                {d && (
                  <button
                    type="button"
                    className={`hdatepicker-day${value && sameDay(d, value) ? " is-selected" : ""}${sameDay(d, today) ? " is-today" : ""}`}
                    onClick={() => pick(d)}
                  >
                    {d.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="hdatepicker-footer">
            <button type="button" className="hdatepicker-foot-btn" onClick={() => pick(today)}>
              Hoje
            </button>
            <button type="button" className="hdatepicker-foot-btn hdatepicker-foot-btn--muted" onClick={() => pick(null)}>
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
