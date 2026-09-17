"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";
import { MONTHS, WEEKDAYS_SHORT, addMonths, monthDays, sameDay } from "../agendamentos-calendar-18078-85bcf86b/calendarDates";

export const PRESETS = ["Hoje", "Próximos 7 dias", "Próximos 30 dias", "Este mês", "Todos os períodos"] as const;
export type Preset = (typeof PRESETS)[number];

function MiniMonth({ month, today }: { month: Date; today: Date }): ReactNode {
  const days = monthDays(month);
  const lead = days.findIndex((d) => d.getMonth() === month.getMonth());
  return (
    <div className="hdaterange-cal">
      <div className="hdaterange-cal-title">
        {MONTHS[month.getMonth()]} {month.getFullYear()}
      </div>
      <div className="hdaterange-weekdays">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="hdaterange-grid">
        {days.slice(0, lead).map((d) => (
          <div key={`pad-${d.toISOString()}`} className="hdaterange-cell" />
        ))}
        {days
          .filter((d) => d.getMonth() === month.getMonth())
          .map((d) => (
            <div key={d.toISOString()} className="hdaterange-cell">
              <button type="button" className={`hdaterange-day${sameDay(d, today) ? " is-today" : ""}`}>
                {d.getDate()}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

// Period picker: preset column + two months, as on the live filter bar.
export function DateRangePopover({ preset, onPreset, today }: { preset: Preset; onPreset: (p: Preset) => void; today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="hselect-popover hdaterange-popover">
      <div className="hdaterange-body">
        <div className="hdaterange-presets-col">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`hdaterange-preset${p === preset ? " is-active" : ""}`} onClick={() => onPreset(p)}>
              {p}
            </button>
          ))}
        </div>
        <div className="hdaterange-cal-wrap">
          <button type="button" className="hdaterange-nav hdaterange-nav--prev" aria-label="Mês anterior" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button type="button" className="hdaterange-nav hdaterange-nav--next" aria-label="Próximo mês" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <div className="hdaterange-cals">
            <MiniMonth month={month} today={today} />
            <MiniMonth month={addMonths(month, 1)} today={today} />
          </div>
        </div>
      </div>
    </div>
  );
}
