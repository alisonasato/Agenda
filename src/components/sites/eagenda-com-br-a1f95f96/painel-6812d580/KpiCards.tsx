"use client";

import type { ComponentType, CSSProperties, SVGProps } from "react";
import { CalendarKpiIcon, ClockIcon, CrownIcon, PlayIcon, ReportIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useData } from "@/lib/seiri/store";
import { dayKey, keyFromToday, monthUsage } from "@/lib/seiri/select";

type Kpi = { label: string; value: number; color: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

/** The top of the dashboard: "Agendamentos" beside "Utilização", the way the original lays it out. */
export function KpiCards() {
  const data = useData();
  const today = new Date();
  const booked = data.appointments.filter((a) => a.status !== "CANCELED");
  const on = (offset: number) => booked.filter((a) => dayKey(a.start) === keyFromToday(offset, today)).length;
  // The quota and its name belong to the plan, so this card and Planos cannot disagree.
  const month = monthUsage(data, today);
  const limit = data.plan.appointmentsMax;

  const KPIS: Kpi[] = [
    { label: "Agendamentos hoje", value: on(0), color: "var(--color-accent)", href: `${ROUTES.agendamentos}/?interval=today`, icon: CalendarKpiIcon },
    { label: "Agendamentos amanhã", value: on(1), color: "#f4256c", href: `${ROUTES.agendamentos}/?interval=tomorrow`, icon: ClockIcon },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
      <div className="flex flex-col lg:col-span-2 hui-reveal">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Agendamentos</h2>
          </div>
          <div className="hwidget-actions">
            <a href={ROUTES.agendamentos} className="hbtn hbtn--secondary hbtn--sm">
              <ReportIcon className="w-4 h-4" />
              Ver todos
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 flex-1">
          {KPIS.map((k) => (
            <a
              key={k.label}
              href={k.href}
              style={{ "--hkpi-solid": k.color } as CSSProperties}
              className="hui-reveal hui-card hui-card--flush hkpi hkpi--link hkpi--solid"
            >
              <div className="hkpi-body">
                <span className="hkpi-glyph" aria-hidden="true">
                  <k.icon className="w-full h-full" />
                </span>
                <p className="hkpi-label">{k.label}</p>
                <div className="hkpi-value-row">
                  <span className="hkpi-value">{k.value}</span>
                </div>
              </div>
              <span className="hkpi-cta" aria-hidden="true">
                <span>Acessar</span>
                <PlayIcon className="w-4 h-4 hkpi-cta-arrow" />
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col hui-reveal">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Utilização</h2>
          </div>
          <div className="hwidget-actions">
            <a href={ROUTES.pacotesEnvio} className="hbtn hbtn--secondary hbtn--sm">
              <CrownIcon className="w-4 h-4" />
              {data.plan.name}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:gap-6 flex-1">
          <a href={ROUTES.pacotesEnvio} className="hmcard hmcard--accent">
            <div className="hmcard-top">
              <span className="hmcard-icon">
                <CalendarKpiIcon className="w-7 h-7" />
              </span>
              <span className="hmcard-chevron">
                <PlayIcon className="w-4 h-4" />
              </span>
            </div>
            <div className="hmcard-metric">
              <span className="hmcard-label">Agendamentos/Mês</span>
              <span className="hmcard-values">
                <span className="hmcard-value">{month}</span>
                <span className="hmcard-limit"> / {limit}</span>
              </span>
            </div>
            <div className="hmcard-meter hmeter hmeter--accent hmeter--sm">
              <div className="hmeter-track">
                <div className="hmeter-fill" style={{ width: `${limit ? Math.min(100, Math.round((month / limit) * 100)) : 0}%` }} />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
