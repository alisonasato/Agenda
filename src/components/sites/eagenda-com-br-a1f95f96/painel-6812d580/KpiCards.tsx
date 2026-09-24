"use client";

import type { ComponentType, CSSProperties, SVGProps } from "react";
import { CalendarKpiIcon, ClockIcon, PlayIcon, WidgetIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { useData } from "@/lib/seiri/store";
import { dayKey, keyFromToday } from "@/lib/seiri/select";

type Kpi = { label: string; value: number; color: string; cta: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

export function KpiCards() {
  const data = useData();
  const today = new Date();
  const booked = data.appointments.filter((a) => a.status !== "CANCELED");
  const on = (offset: number) => booked.filter((a) => dayKey(a.start) === keyFromToday(offset, today)).length;
  const KPIS: Kpi[] = [
    { label: "Agendamentos hoje", value: on(0), color: "var(--color-accent)", cta: "Acessar", href: ROUTES.agendamentos, icon: CalendarKpiIcon },
    { label: "Agendamentos amanhã", value: on(1), color: "#f4256c", cta: "Acessar", href: ROUTES.agendamentos, icon: ClockIcon },
    { label: "Agendas cadastradas", value: data.agendas.length, color: "#f5a524", cta: "Saiba Mais", href: ROUTES.configurarAgendas, icon: WidgetIcon },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
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
            <span>{k.cta}</span>
            <PlayIcon className="w-4 h-4 hkpi-cta-arrow" />
          </span>
        </a>
      ))}
    </div>
  );
}
