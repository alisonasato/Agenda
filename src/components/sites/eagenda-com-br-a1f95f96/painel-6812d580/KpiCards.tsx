import type { ComponentType, CSSProperties, SVGProps } from "react";
import { CalendarKpiIcon, ClockIcon, PlayIcon, WidgetIcon } from "../shared/icons";

type Kpi = { label: string; value: number; color: string; cta: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

const KPIS: Kpi[] = [
  { label: "Agendamentos hoje", value: 0, color: "var(--color-accent)", cta: "Acessar", icon: CalendarKpiIcon },
  { label: "Agendamentos amanhã", value: 0, color: "#f4256c", cta: "Acessar", icon: ClockIcon },
  { label: "Agendas cadastradas", value: 1, color: "#f5a524", cta: "Saiba Mais", icon: WidgetIcon },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
      {KPIS.map((k) => (
        <a
          key={k.label}
          href="#"
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
