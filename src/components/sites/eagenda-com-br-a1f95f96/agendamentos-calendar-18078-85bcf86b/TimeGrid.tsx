"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WEEKDAYS_SHORT, sameDay } from "../shared/calendarDates";
import { SlotDetailsModal } from "./SlotDetailsModal";
import { useData } from "@/lib/seiri/store";
import { expand, formatTime } from "@/lib/seiri/select";
import { hourRange, shade, slotColor, tint, type Slot, slotsOf } from "@/lib/seiri/slots";

const ROW_PX = 120;
const SLOT_PX = 60;

type TimeGridProps = { days: Date[]; today: Date };

/**
 * The original draws the agenda's own half-hour slots, not the appointments: a free slot shows its
 * time range, a taken one splits between whoever booked it, and the colour is the slot's occupancy.
 */
export function TimeGrid({ days, today }: TimeGridProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const data = useData();
  const [open, setOpen] = useState<Slot | null>(null);
  // The route carries one agenda, like the original's ?calendars=.
  const agenda = data.agendas.find((a) => a.active) ?? data.agendas[0];
  const { first, last } = hourRange(data, days, agenda ? [agenda.id] : []);
  const hours = Array.from({ length: last - first }, (_, i) => first + i);
  const minute = ROW_PX / 60;
  const topOf = (iso: string) => (Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16)) - first * 60) * minute;

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
            {hours.map((hour) => (
              <div key={hour} className="pt-0.5 pr-1.5 text-right" style={{ height: ROW_PX }}>
                <span className="text-[10px] text-slate-600 inter-regular">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const isToday = sameDay(day, today);
            const slots = agenda ? slotsOf(data, agenda.id, day) : [];
            return (
              <div
                key={`c-${day.toISOString()}`}
                ref={isToday ? todayRef : undefined}
                className="relative border-r cal-line-day cal-tg-slots cal-tg-daycol"
                style={{ height: hours.length * ROW_PX, "--slot-px": `${SLOT_PX}px` } as CSSProperties}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {hours.map((hour) => (
                    <div key={hour} className="border-t cal-line" style={{ height: ROW_PX }} />
                  ))}
                </div>

                {slots.map((slot) => {
                  const color = slot.blocked && !slot.appointments.length ? "#98A2B3" : slotColor(slot);
                  const range = `${formatTime(slot.start)}–${formatTime(slot.end)}`;
                  const style: CSSProperties = { top: topOf(slot.start), height: SLOT_PX, left: "calc(0%)", width: "calc(100%)", boxSizing: "border-box" };
                  const label = slot.blocked
                    ? `${formatTime(slot.start)} ${slot.blockReason || "Horário bloqueado"}`
                    : slot.appointments.length
                      ? `${formatTime(slot.start)} ${slot.appointments.map((a) => expand(data, a).clientName).join(", ")}`
                      : `${formatTime(slot.start)} Horário Livre`;

                  if (!slot.appointments.length)
                    return (
                      <div
                        key={slot.start}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        onClick={() => setOpen(slot)}
                        onKeyDown={(e) => e.key === "Enter" && setOpen(slot)}
                        className="absolute overflow-hidden text-left select-none cursor-pointer z-10 cal-ev border-b cal-line-block"
                        style={{ ...style, backgroundColor: tint(color, 0.72), color: shade(color, 0.45) }}
                      >
                        <div className="h-full flex items-center gap-1.5 px-2 min-w-0">
                          <span className="text-[13px] font-semibold tabular-nums leading-none shrink-0" style={{ color: shade(color, 0.45) }}>
                            {slot.blocked ? slot.blockReason || "Bloqueado" : range}
                          </span>
                        </div>
                      </div>
                    );

                  return (
                    <div
                      key={slot.start}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      onClick={() => setOpen(slot)}
                      onKeyDown={(e) => e.key === "Enter" && setOpen(slot)}
                      className="absolute overflow-hidden text-left select-none cursor-pointer z-10 cal-ev flex border-b cal-line-block"
                      style={style}
                    >
                      {slot.appointments.map((a) => {
                        const { clientName, serviceName } = expand(data, a);
                        return (
                          <div
                            key={a.id}
                            className="h-full flex-1 min-w-0 border-r cal-line-block"
                            style={{ backgroundColor: color, color: "#FFFFFF", boxSizing: "border-box" }}
                          >
                            <div className="h-full flex flex-col gap-0.5 px-1.5 py-1.5 min-w-0">
                              <span className="flex items-center gap-1 min-w-0 text-[11px] font-semibold leading-tight truncate">{clientName}</span>
                              <span className="text-[10px] leading-tight truncate opacity-90">{serviceName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {open && <SlotDetailsModal slot={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
