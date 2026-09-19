"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { FloatingPanel } from "./FloatingPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";
import { MONTHS, WEEKDAYS_SHORT, addMonths, pickerCells, sameDay } from "./calendarDates";

export const PRESETS = ["Hoje", "Próximos 7 dias", "Próximos 30 dias", "Este mês", "Todos os períodos"] as const;
export type Preset = (typeof PRESETS)[number];

// Always 42 cells (6 rows, blanks around the month), like the original's daysOf().
function MiniMonth({ month, today }: { month: Date; today: Date }): ReactNode {
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
        {pickerCells(month).map((d, i) => (
          <div key={i} className="hdaterange-cell">
            {d && (
              <button type="button" className={`hdaterange-day${sameDay(d, today) ? " is-today" : ""}`}>
                {d.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Period picker: preset column + two months, as on the live filter bar.
type DateRangePopoverProps = {
  /** The active preset; none while no period is picked. */
  preset?: Preset;
  onPreset: (p: Preset) => void;
  today: Date;
  /** The report pages add a "Limpar período" footer under the calendars. */
  onClear?: () => void;
  /** Month shown when the popover opens. Defaults to the current month; the reports open on the range start. */
  initialMonth?: Date;
  /** Teleport the panel to <body> under this trigger (6px below, like the original); needs `panelRef` for dismissal. */
  anchor?: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
};

export function DateRangePopover({ preset, onPreset, today, onClear, initialMonth, anchor, panelRef }: DateRangePopoverProps) {
  const [month, setMonth] = useState(() => {
    const base = initialMonth ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const body = (
    <>
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
      {onClear && (
        <div className="hdaterange-footer">
          <button type="button" className="hdaterange-clear" onClick={onClear}>
            Limpar período
          </button>
        </div>
      )}
    </>
  );

  return anchor && panelRef ? (
    <FloatingPanel anchor={anchor} panelRef={panelRef} className="hselect-popover hdaterange-popover" width="auto" gap={6}>
      {body}
    </FloatingPanel>
  ) : (
    <div className="hselect-popover hdaterange-popover">{body}</div>
  );
}
