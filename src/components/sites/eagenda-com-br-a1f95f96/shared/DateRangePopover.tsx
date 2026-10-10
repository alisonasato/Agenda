"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { FloatingPanel } from "./FloatingPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";
import { MONTHS, WEEKDAYS_SHORT, addMonths, pickerCells, sameDay } from "./calendarDates";
import {
  PRESETS,
  cellFlags,
  dayKeyOf,
  isRange,
  monthToShow,
  pickDay,
  pickPreset,
  shownRange,
  type DateRange,
  type Pending,
  type Period,
} from "@/lib/seiri/range";

export { PRESETS, type Period, type Preset } from "@/lib/seiri/range";

type MiniMonthProps = {
  month: Date;
  today: Date;
  shown: ReturnType<typeof shownRange>;
  onDay: (key: string) => void;
  onHover: (key: string) => void;
};

// Always 42 cells (6 rows, blanks around the month), like the original's daysOf().
function MiniMonth({ month, today, shown, onDay, onHover }: MiniMonthProps): ReactNode {
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
        {pickerCells(month).map((d, i) => {
          if (!d) return <div key={i} className="hdaterange-cell" />;
          const key = dayKeyOf(d);
          const f = cellFlags(key, shown);
          return (
            // The band sits on the cell and the ring on the button, as the original's two classes do.
            <div key={i} className={`hdaterange-cell${f.inRange ? " is-inrange" : ""}${f.start ? " is-rstart" : ""}${f.end ? " is-rend" : ""}`}>
              <button
                type="button"
                className={`hdaterange-day${sameDay(d, today) ? " is-today" : ""}${f.selected ? " is-selected" : ""}`}
                onClick={() => onDay(key)}
                onMouseEnter={() => onHover(key)}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Period picker: preset column + two months, as on the live filter bar.
type DateRangePopoverProps = {
  /** What is active: a preset by name, a range, or nothing while no period is picked. */
  period?: Period;
  /**
   * Called with a range when its second day is clicked, and with what a preset becomes when one is
   * chosen — a range for all of them but "Todos os períodos", which stays a name.
   */
  onPeriod: (p: Period) => void;
  today: Date;
  /** The report pages add a "Limpar período" footer under the calendars. */
  onClear?: () => void;
  /** Month shown when the popover opens. Defaults to the range's own month, else the current one. */
  initialMonth?: Date;
  /** Teleport the panel to <body> under this trigger (6px below, like the original); needs `panelRef` for dismissal. */
  anchor?: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
};

export function DateRangePopover({ period, onPeriod, today, onClear, initialMonth, anchor, panelRef }: DateRangePopoverProps) {
  const committed: DateRange | null = period && isRange(period) ? period : null;
  const [month, setMonth] = useState(() => initialMonth ?? monthToShow(committed, today));
  // The first day of a range, waiting for the second. Local to this open: the filter only changes
  // when the second day is clicked, and the original keeps the old range on screen until then.
  const [pending, setPending] = useState<Pending | null>(null);
  const shown = shownRange(committed, pending);

  const onDay = (key: string) => {
    const next = pickDay(pending, key);
    setPending(next.pending);
    if (next.commit) onPeriod(next.commit);
  };
  const onHover = (key: string) => {
    if (pending) setPending({ ...pending, hover: key });
  };

  const body = (
    <>
      <div className="hdaterange-body">
        <div className="hdaterange-presets-col">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`hdaterange-preset${p === period ? " is-active" : ""}`} onClick={() => onPeriod(pickPreset(p, today))}>
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
            <MiniMonth month={month} today={today} shown={shown} onDay={onDay} onHover={onHover} />
            <MiniMonth month={addMonths(month, 1)} today={today} shown={shown} onDay={onDay} onHover={onHover} />
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
