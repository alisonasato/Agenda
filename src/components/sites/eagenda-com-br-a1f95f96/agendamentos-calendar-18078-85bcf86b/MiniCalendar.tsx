"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarEmptyIcon } from "../shared/icons";
import { MONTHS, WEEKDAY_INITIALS, addMonths, monthDays, sameDay, startOfWeek } from "../shared/calendarDates";

type MiniCalendarProps = { selected: Date; today: Date; onSelect: (d: Date) => void };

// Left rail: month picker + the "nothing pending" panel. Hidden below xl.
export function MiniCalendar({ selected, today, onSelect }: MiniCalendarProps) {
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const days = monthDays(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  const selectedWeekStart = startOfWeek(selected);

  return (
    <aside className="cal-fade-in hidden xl:flex w-[264px] flex-shrink-0 flex-col min-h-0 bg-white border-t border-r cal-line-day">
      <div className="flex-shrink-0 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] nunito-bold text-slate-800 pl-1">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </span>
          <div className="inline-flex items-center">
            <button type="button" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" aria-label="Anterior" onClick={() => setMonth((m) => addMonths(m, -1))}>
              <ChevronLeftIcon width={16} height={16} />
            </button>
            <button type="button" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" aria-label="Próximo" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRightIcon width={16} height={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 mb-0.5">
          {WEEKDAY_INITIALS.map((d, i) => (
            <span key={i} className="h-6 flex items-center justify-center text-[11px] inter-semibold text-slate-500" aria-hidden="true">
              {d}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {weeks.map((week) => {
            const isSelectedWeek = sameDay(week[0], selectedWeekStart);
            return (
              <div
                key={week[0].toISOString()}
                className={`grid grid-cols-7 rounded-full transition-colors ${isSelectedWeek ? "bg-accent/10" : "hover:bg-slate-100"}`}
              >
                {week.map((day) => {
                  const outside = day.getMonth() !== month.getMonth();
                  const isToday = sameDay(day, today);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => onSelect(day)}
                      className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[12px] transition-colors ${
                        isToday
                          ? "text-accent font-semibold shadow-[inset_0_0_0_1.5px_rgba(10,112,214,0.55)]"
                          : outside
                            ? "text-slate-400"
                            : "text-slate-700"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mx-4 border-t cal-line flex-shrink-0" />
      <div className="flex-1 min-h-0 overflow-y-auto cal-scroll px-2 pb-4">
        <div className="flex flex-col items-center text-center px-4 pt-10">
          <CalendarEmptyIcon width={26} height={26} className="text-slate-300 mb-2" />
          <p className="text-[13px] inter-semibold text-slate-600">Tudo em dia</p>
          <p className="text-[12px] inter-regular text-slate-500 mt-0.5 leading-snug">
            Sem pendências nem agendamentos nos próximos 30 dias.
          </p>
        </div>
      </div>
    </aside>
  );
}

