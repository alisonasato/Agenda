"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { WEEKDAYS_SHORT, sameDay, startOfDay } from "../shared/calendarDates";
import { useData } from "@/lib/seiri/store";
import { expand, formatTime, parse } from "@/lib/seiri/select";
import { STATUS_LABELS } from "@/lib/seiri/types";

// The agenda's working hours (08:00–17:00 on the live account), one row per hour.
const FIRST_HOUR = 8;
const LAST_HOUR = 17;
const ROW_PX = 120;
const SLOT_PX = 60;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);

type TimeGridProps = { days: Date[]; today: Date };

export function TimeGrid({ days, today }: TimeGridProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const data = useData();
  const dayEvents = (day: Date) =>
    data.appointments
      .filter((a) => a.status !== "CANCELED" && sameDay(parse(a.start), day))
      .sort((a, b) => a.start.localeCompare(b.start));

  // Narrow viewports scroll the current day into view (columns have a min width).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const col = todayRef.current;
    if (!scroller || !col) return;
    scroller.scrollLeft = Math.max(0, col.offsetLeft - scroller.offsetLeft - 56);
  }, [days]);

  return (
    <div className="cal-fade-in h-full flex flex-col border-t cal-line bg-white overflow-hidden">
      <div ref={scrollerRef} className="flex-1 min-h-0 overflow-auto cal-scroll cal-tg-scroller">
        <div
          className="cal-tg-grid"
          style={{ "--tg-days": days.length, gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0px, 1fr))` } as CSSProperties}
        >
          <div className="sticky top-0 left-0 z-30 bg-white border-b cal-line border-r cal-line-day h-12" />
          {days.map((day) => {
            const isToday = sameDay(day, today);
            return (
              <div
                key={`h-${day.toISOString()}`}
                className="sticky top-0 z-20 bg-white border-b cal-line border-r cal-line-day h-12 flex flex-col items-center justify-center cal-tg-daycol"
              >
                <span className="text-[10px] text-slate-600 inter-semibold uppercase leading-tight">{WEEKDAYS_SHORT[day.getDay()]}</span>
                <span
                  className={
                    isToday
                      ? "text-sm nunito-bold leading-tight mt-0.5 w-6 h-6 rounded-full bg-accent text-white inline-flex items-center justify-center"
                      : "text-sm nunito-bold leading-tight mt-0.5 text-slate-900"
                  }
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}

          <div className="sticky left-0 z-20 bg-white border-r cal-line-day">
            {HOURS.map((hour) => (
              <div key={hour} className="pt-0.5 pr-1.5 text-right" style={{ height: ROW_PX }}>
                <span className="text-[10px] text-slate-600 inter-regular">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const isToday = sameDay(day, today);
            const bookable = startOfDay(day) >= startOfDay(today);
            return (
              <div
                key={`c-${day.toISOString()}`}
                ref={isToday ? todayRef : undefined}
                aria-label={bookable ? "Clique para incluir horário" : undefined}
                className={`relative border-r cal-line-day cal-tg-slots cal-tg-daycol${bookable ? " cursor-pointer" : ""}`}
                style={{ height: HOURS.length * ROW_PX, "--slot-px": `${SLOT_PX}px` } as CSSProperties}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {HOURS.map((hour) => (
                    <div key={hour} className="border-t cal-line" style={{ height: ROW_PX }} />
                  ))}
                </div>
                {dayEvents(day).map((a) => {
                  const start = parse(a.start);
                  const top = (start.getHours() - FIRST_HOUR + start.getMinutes() / 60) * ROW_PX;
                  const { clientName, serviceName, service } = expand(data, a);
                  const color = service?.color ?? "#0A70D6";
                  return (
                    <div
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      title={`${formatTime(a.start)} · ${clientName} · ${serviceName} (${STATUS_LABELS[a.status]})`}
                      className="cal-ev absolute left-1 right-1 rounded-md px-2 py-1 text-[11px] leading-tight overflow-hidden cursor-pointer"
                      style={{ top, height: Math.max(24, (a.duration / 60) * ROW_PX - 4), backgroundColor: `${color}22`, borderLeft: `3px solid ${color}`, color: "#101828" }}
                    >
                      <span className="block truncate inter-semibold">{formatTime(a.start)} {clientName}</span>
                      <span className="block truncate inter-regular text-slate-600">{serviceName}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
