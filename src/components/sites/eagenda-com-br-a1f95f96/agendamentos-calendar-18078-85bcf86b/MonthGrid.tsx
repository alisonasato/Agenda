import { WEEKDAYS_SHORT, eventsOn, monthDays, sameDay } from "./calendarDates";

type MonthGridProps = { month: Date; today: Date };

export function MonthGrid({ month, today }: MonthGridProps) {
  const days = monthDays(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  return (
    <div className="cal-fade-in h-full flex flex-col border-t cal-line bg-white overflow-hidden">
      <div className="grid grid-cols-7 flex-shrink-0 [&>*:nth-child(7n)]:border-r-0">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-[11px] uppercase tracking-wide text-slate-600 inter-semibold text-center py-2 bg-white border-b border-r cal-line">
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {weeks.map((week, wi) => (
          <div key={week[0].toISOString()} className="flex-1 min-h-0 grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
            {week.map((day) => {
              const events = eventsOn(day);
              const outside = day.getMonth() !== month.getMonth();
              const isToday = sameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={`group relative h-full min-h-0 flex flex-col p-1.5 border-r border-b cal-line transition-colors bg-white ${wi === weeks.length - 1 ? "border-b-0" : ""}`}
                >
                  <div className="flex-shrink-0 flex items-center justify-between h-5">
                    <span
                      className={
                        isToday
                          ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white text-[11px] font-semibold"
                          : `inline-flex items-center justify-center h-5 px-1 text-[11px] font-semibold ${outside ? "text-slate-500" : "text-slate-700"}`
                      }
                    >
                      {day.getDate()}
                    </span>
                    {events.length > 0 && <span className="text-[10px] font-semibold text-slate-500 pr-0.5">{events.length}</span>}
                  </div>
                  <div className="relative z-10 flex-1 min-h-0 flex flex-col gap-1 mt-1">
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
                      {events.map((ev) => (
                        <div
                          key={ev.title}
                          role="button"
                          tabIndex={0}
                          aria-label={ev.title}
                          className="flex items-center gap-1.5 w-full text-[11px] leading-tight text-left truncate select-none cursor-pointer rounded-md cal-ev px-2 py-[3px]"
                          style={{ backgroundColor: ev.bg, color: ev.color }}
                        >
                          <span className="truncate flex-1 inter-regular">{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
