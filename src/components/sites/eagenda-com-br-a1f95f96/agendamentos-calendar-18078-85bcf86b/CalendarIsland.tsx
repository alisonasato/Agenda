"use client";

import { useState } from "react";
import { AddAppointmentIcon, ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";
import { DashboardShell } from "../shared/DashboardShell";
import { CALENDAR_HELP } from "../shared/HelpCenter";
import { CalendarControls } from "./CalendarControls";
import { MiniCalendar } from "./MiniCalendar";
import { MonthGrid } from "./MonthGrid";
import { TimeGrid } from "./TimeGrid";
import { periodTitle, shiftDate, startOfDay, weekDays, type CalendarView } from "../shared/calendarDates";

// Whole calendar page: the topbar header (CTA + date nav) plus the island itself.
export function CalendarIsland() {
  const [today] = useState(() => startOfDay(new Date()));
  const [date, setDate] = useState(today);
  const [view, setView] = useState<CalendarView>("week");
  const [display, setDisplay] = useState("Todos os Horários");

  const go = (dir: 1 | -1) => setDate((d) => shiftDate(d, view, dir));
  const title = periodTitle(date, view);
  const shortTitle = periodTitle(date, view, true);

  const header = (
    <div className="cal-topbar-head">
      <button type="button" id="cal-cta-incluir" className="hbtn hbtn--primary hbtn--sm cal-topbar-cta" title="Incluir Agendamento" aria-label="Incluir Agendamento">
        <AddAppointmentIcon className="w-4 h-4" />
        <span className="cal-topbar-cta-label">Incluir Agendamento</span>
      </button>
      <div className="cal-topbar-center">
        <button type="button" id="cal-nav-prev" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" title="Anterior" aria-label="Anterior" onClick={() => go(-1)}>
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h1 id="calendar-period-title" className="cal-period-title truncate text-lg md:text-xl font-semibold tracking-tight text-slate-900 nunito-bold">
          {title}
        </h1>
        <button type="button" id="cal-nav-next" className="hbtn hbtn--ghost hbtn--icon hbtn--sm" title="Próximo" aria-label="Próximo" onClick={() => go(1)}>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <DashboardShell header={header} email="contato@exemplo.com.br" active="Calendário" peek helpItems={CALENDAR_HELP}>
      <div id="calendar-fullscreen" className="flex-1 min-h-0 flex flex-col">
        <div id="calendar-root" className="flex-1 min-h-0 flex flex-col heroui-scope light">
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
              <CalendarControls
                view={view}
                onView={setView}
                display={display}
                onDisplay={setDisplay}
                shortTitle={shortTitle}
                onPrev={() => go(-1)}
                onNext={() => go(1)}
              />
              <div className="flex-1 min-h-0 flex items-stretch">
                <MiniCalendar selected={date} today={today} onSelect={setDate} />
                <div className="flex-1 min-w-0 min-h-0 relative">
                  <div className="h-full transition-opacity">
                    {view === "month" ? (
                      <MonthGrid month={date} today={today} />
                    ) : (
                      <TimeGrid days={view === "day" ? [date] : weekDays(date)} today={today} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
