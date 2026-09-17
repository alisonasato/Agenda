import type { ComponentType, SVGProps } from "react";
import { BuildingsDuoIcon, CalendarKpiIcon, CrownIcon, MapPointIcon, PlayIcon, UsersDuoIcon } from "../shared/icons";

type Tone = "accent" | "warning" | "success";
type Usage = { label: string; value: number; limit: number; tone: Tone; icon: ComponentType<SVGProps<SVGSVGElement>> };

const USAGE: Usage[] = [
  { label: "Agendamentos/Mês", value: 0, limit: 100, tone: "accent", icon: CalendarKpiIcon },
  { label: "Usuários", value: 1, limit: 2, tone: "accent", icon: UsersDuoIcon },
  { label: "Unidades", value: 0, limit: 2, tone: "warning", icon: MapPointIcon },
  { label: "Contas", value: 0, limit: 1, tone: "success", icon: BuildingsDuoIcon },
];

export function UsageCards() {
  return (
    <div className="mt-6 md:mt-8 hui-reveal">
      <div className="hwidget-head">
        <div className="hwidget-titles">
          <h2 className="hwidget-title">Utilização</h2>
        </div>
        <div className="hwidget-actions">
          <a href="#" className="hbtn hbtn--secondary hbtn--sm">
            <CrownIcon />
            Plano Teste
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {USAGE.map((u) => (
          <a key={u.label} href="#" className={`hmcard hmcard--${u.tone}`}>
            <div className="hmcard-top">
              <span className="hmcard-icon">
                <u.icon className="w-7 h-7" />
              </span>
              <span className="hmcard-chevron">
                <PlayIcon className="w-4 h-4" />
              </span>
            </div>
            <div className="hmcard-metric">
              <span className="hmcard-label">{u.label}</span>
              <span className="hmcard-values">
                <span className="hmcard-value">{u.value}</span>
                <span className="hmcard-limit"> / {u.limit}</span>
              </span>
            </div>
            <div className={`hmcard-meter hmeter hmeter--${u.tone} hmeter--sm`}>
              <div className="hmeter-track">
                <div className="hmeter-fill" style={{ width: `${Math.round((u.value / u.limit) * 100)}%` }} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
