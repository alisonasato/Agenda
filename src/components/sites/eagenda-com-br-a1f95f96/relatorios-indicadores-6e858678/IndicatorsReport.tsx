"use client";

import { useRef, useState } from "react";
import {
  CalendarEmptyIcon,
  CalendarIcon,
  CaretDownIcon,
  ChartEmptyIcon,
  CheckReadIcon,
  ClipboardIcon,
  CloseCircleIcon,
  FunnelIcon,
  PlayIcon,
} from "../shared/icons";
import { comparisonWindow, daysBetween, formatBR } from "../shared/calendarDates";
import { DatePicker } from "../shared/DatePicker";
import { InlineFilter } from "../shared/InlineFilter";
import { InlineSelect, type SelectOption } from "../shared/InlineSelect";
import { ROUTES } from "../shared/Sidebar";
import { ScrollRail } from "../shared/ScrollRail";
import { useDismiss } from "../shared/useDismiss";

const PERIODS: SelectOption[] = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 3 meses" },
  { value: "180", label: "Últimos 6 meses" },
  { value: "custom", label: "Período Personalizado" },
];

const SITUATIONS: SelectOption[] = [
  { value: "ALL", label: "Todos" },
  { value: "ALL_EXCEPTED_CANCELED", label: "Todos, exceto os cancelados" },
  { value: "ATTENDED", label: "Atendido" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "NO_SHOW", label: "Não compareceu" },
];

const AGENDAS = ["Agenda Principal"];
const SERVICES: string[] = [];

type Kpi = { label: string; title: string; value: string; prefix?: string; status?: string };

// The live account has no appointments, so every indicator reads zero.
const KPIS: Kpi[] = [
  { label: "Total de Agendamentos", title: "Total de agendamentos realizados no período selecionado.", value: "0", status: "" },
  { label: "Total de Clientes", title: "Número de clientes únicos atendidos no período.", value: "0" },
  { label: "Cancelamentos", title: "Total de agendamentos cancelados no período.", value: "0", status: "CANCELED" },
  { label: "Faturamento Total", title: "Somatório do valor de todos os agendamentos do período.", value: "0,00", prefix: "$" },
  { label: "Taxa de Ocupação", title: "Percentual de vagas ocupadas em relação ao total disponível.", value: "0%" },
  { label: "Taxa de não Comparecimento", title: "Percentual de agendamentos em que o cliente não compareceu.", value: "0%" },
  { label: "Taxa de Retorno de Clientes", title: "Percentual de clientes que retornaram para mais de um atendimento.", value: "0%" },
  { label: "Ticket Médio", title: "Média de valor por cliente no período selecionado.", value: "0,00", prefix: "$" },
];

const CHARTS = [
  { title: "Agendamentos do Período", desc: "Evolução por dia dentro do período selecionado" },
  { title: "Agendamentos por Agenda", desc: "Distribuição de volume por agenda no período" },
];

/** The "Filtros" menu here holds a single "Situação" select. */
function MoreFilters({ situation, onSituation }: { situation: string; onSituation: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const count = situation === "ALL" ? 0 : 1;

  return (
    <div ref={ref} className="hinline">
      <button
        type="button"
        className={`hinline-trigger hinline-trigger--bare${count > 0 ? " is-active" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FunnelIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label hactionbar-label">Filtros</span>
        {count > 0 && <span className="hinline-count">{count}</span>}
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div id="indicadores-more-panel" className="hselect-popover hmenu-popover hmenu-filters" role="dialog">
          <div className="hmenu-filter-row">
            <InlineSelect label="Situação" icon={<CheckReadIcon className="hinline-icon w-4 h-4" />} options={SITUATIONS} value={situation} onChange={onSituation} />
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ kpi, from, to }: { kpi: Kpi; from: Date; to: Date }) {
  const body = (
    <>
      <div className="hkpi-body hkpi-body--trend">
        <p className="hkpi-label">{kpi.label}</p>
        <div className="hkpi-value-row">
          <span className="hkpi-value">
            {kpi.prefix && <span className="hkpi-prefix">{kpi.prefix}</span>}
            {kpi.prefix ? ` ${kpi.value}` : kpi.value}
          </span>
        </div>
        <p className="hkpi-caption">&nbsp;</p>
      </div>
      {kpi.status !== undefined && (
        <span className="hkpi-cta" aria-hidden="true">
          <span>Acessar</span>
          <PlayIcon className="w-4 h-4 hkpi-cta-arrow" />
        </span>
      )}
      <div className="hkpi-spark">
        <div className="hkpi-spark-empty" aria-hidden="true" />
      </div>
    </>
  );

  // Two cards deep-link into the appointments list for the same window, in a new tab like the original.
  if (kpi.status !== undefined) {
    const query = new URLSearchParams({ start_date: formatBR(from), end_date: formatBR(to) });
    if (kpi.status) query.set("status", kpi.status);
    return (
      <a
        href={`${ROUTES.agendamentos}?${query}`}
        title={kpi.title}
        target="_blank"
        rel="noopener noreferrer"
        className="hui-reveal hui-card hui-card--flush hkpi hkpi--link hkpi--cta"
      >
        {body}
      </a>
    );
  }
  return (
    <div title={kpi.title} className="hui-reveal hui-card hui-card--flush hkpi">
      {body}
    </div>
  );
}

export function IndicatorsReport() {
  const [today] = useState(() => new Date());
  const [period, setPeriod] = useState("90");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [situation, setSituation] = useState("ALL");
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  // The indicators only change once "Aplicar filtros" is pressed; any staged change reveals the button.
  const [applied, setApplied] = useState(() => ({
    period: "90",
    agendas: [] as string[],
    services: [] as string[],
    situation: "ALL",
    customFrom: null as Date | null,
    customTo: null as Date | null,
  }));
  const dirty =
    period !== applied.period ||
    situation !== applied.situation ||
    agendas.join() !== applied.agendas.join() ||
    services.join() !== applied.services.join() ||
    customFrom?.getTime() !== applied.customFrom?.getTime() ||
    customTo?.getTime() !== applied.customTo?.getTime();

  const span =
    applied.period === "custom" && applied.customFrom && applied.customTo
      ? comparisonWindow(applied.customTo, daysBetween(applied.customFrom, applied.customTo))
      : comparisonWindow(today, Number(applied.period === "custom" ? "90" : applied.period));

  return (
    <>
      <form id="formFilter" className="hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex min-w-0">
          <div className="w-full md:w-auto flex items-center gap-2 min-w-0">
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <InlineSelect label="Período" icon={<CalendarEmptyIcon className="hinline-icon w-4 h-4" />} options={PERIODS} value={period} onChange={setPeriod} clearTo="90" />
              <InlineFilter label="Agendas" icon={<CalendarIcon className="hinline-icon w-4 h-4" />} options={AGENDAS} values={agendas} onChange={setAgendas} />
              <InlineFilter label="Serviços" icon={<ClipboardIcon className="hinline-icon w-4 h-4" />} options={SERVICES} values={services} onChange={setServices} />
              <MoreFilters situation={situation} onSituation={setSituation} />

              <span className="hactionbar-sep" aria-hidden="true" />

              <span id="report-apply-wrap" className={`report-apply${dirty ? " is-visible" : ""}`} style={dirty ? undefined : { display: "none" }}>
                <button
                  type="button"
                  id="report-apply-btn"
                  className="hbtn hbtn--ghost hbtn--sm"
                  onClick={() => setApplied({ period, agendas, services, situation, customFrom, customTo })}
                >
                  <span className="hactionbar-label">Aplicar filtros</span>
                </button>
              </span>
              <a href={`${ROUTES.relatorioIndicadores}?reset=1`} className="hbtn hbtn--ghost hbtn--sm">
                <CloseCircleIcon className="w-4 h-4" />
                <span className="hactionbar-label">Limpar filtros</span>
              </a>
            </ScrollRail>
          </div>
        </div>

        <div data-period-custom-row="" className={`${period === "custom" ? "" : "hidden "}flex mt-4 flex-col sm:flex-row sm:items-start gap-3 min-w-0`}>
          <div className="w-full sm:w-56">
            <label htmlFor="id_data_inicio" className="hui-label inter-semibold block mb-1.5">
              Início do período
            </label>
            <DatePicker id="id_data_inicio" name="data_inicio" ariaLabel="Data Agendada - Início" value={customFrom} onChange={setCustomFrom} today={today} />
          </div>
          <div className="w-full sm:w-56">
            <label htmlFor="id_data_fim" className="hui-label inter-semibold block mb-1.5">
              Fim do período
            </label>
            <DatePicker id="id_data_fim" name="data_fim" ariaLabel="Data Agendada - Fim" value={customTo} onChange={setCustomTo} today={today} />
          </div>
        </div>
      </form>

      <div className="mt-6 md:mt-8 hui-reveal">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Indicadores</h2>
            <p className="hwidget-desc">
              {formatBR(span.from)} - {formatBR(span.to)} · Comparação: {formatBR(span.prevFrom)} - {formatBR(span.prevTo)}
            </p>
          </div>
          <div className="hwidget-actions" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} from={span.from} to={span.to} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
        {CHARTS.map((chart) => (
          <div key={chart.title} className="hui-reveal">
            <div className="hsection hui-card hui-card--flush">
              <div className="hsection-head">
                <div className="hsection-titles">
                  <h2 className="hsection-title">{chart.title}</h2>
                  <p className="hsection-desc">{chart.desc}</p>
                </div>
                <div className="hsection-actions" />
              </div>
              <div className="hsection-body">
                <div className="chart-empty">
                  <ChartEmptyIcon className="w-8 h-8 text-slate-300" />
                  <p className="text-sm text-gray-500 inter-regular mt-2">Sem agendamentos no período selecionado.</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
