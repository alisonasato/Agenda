"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { CaretDownIcon, CheckReadIcon } from "../shared/icons";
import { periodBuckets, periodLabels, type Period } from "./periods";
import { useData } from "@/lib/seiri/store";
import { dayKey } from "@/lib/seiri/select";
import { useDismiss } from "../shared/useDismiss";

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const PERIODS: { value: Period; label: string }[] = [
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "12m", label: "Últimos 12 meses" },
];

function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const label = PERIODS.find((p) => p.value === value)?.label;

  return (
    <div ref={ref} className="w-44 hselect">
      <button
        type="button"
        className={`hselect-trigger${open ? " is-open" : ""}`}
        aria-label="Período"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="hselect-value">{label}</span>
        <span className={`hselect-indicator${open ? " is-open" : ""}`} aria-hidden="true">
          <CaretDownIcon className="w-4 h-4" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover" role="listbox">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="option"
              aria-selected={p.value === value}
              className={`hselect-option${p.value === value ? " is-selected" : ""}`}
              onClick={() => {
                onChange(p.value);
                setOpen(false);
              }}
            >
              <span className="hselect-option-label">{p.label}</span>
              {p.value === value && (
                <span className="hselect-check">
                  <CheckReadIcon className="w-4 h-4" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrendChart() {
  const [period, setPeriod] = useState<Period>("12m");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const data = useData();

  // Bars count every appointment of the bucket; the line counts the ones actually attended.
  const buckets = periodBuckets(period, new Date());
  const inBucket = (from: string, to: string) => data.appointments.filter((a) => dayKey(a.start) >= from && dayKey(a.start) < to);
  const booked = buckets.map(([from, to]) => inBucket(from, to).filter((a) => a.status !== "CANCELED").length);
  const attended = buckets.map(([from, to]) => inBucket(from, to).filter((a) => a.status === "ATTENDED").length);
  const totals = { booked: booked.reduce((n, v) => n + v, 0), attended: attended.reduce((n, v) => n + v, 0) };

  useEffect(() => {
    const labels = periodLabels(period, new Date());
    const zeros = labels.map(() => 0);
    const chart = chartRef.current;
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = [...booked];
      chart.data.datasets[1].data = [...attended];
      chart.update();
      return;
    }
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--color-accent").trim() || "#0a70d6";
    const success = style.getPropertyValue("--color-success").trim() || "#008433";
    chartRef.current = new Chart(canvasRef.current!, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { type: "bar", label: "Agendamentos", data: [...booked], backgroundColor: accent, borderRadius: 6, maxBarThickness: 28, order: 2 },
          { type: "line", label: "Atendimentos", data: [...attended], borderColor: success, backgroundColor: success, borderWidth: 2.5, pointRadius: 0, tension: 0.4, order: 1 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#101828",
            bodyColor: "#667085",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            titleFont: { weight: "600" },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#667085", font: { size: 10 }, maxRotation: 0 } },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(102,112,133,0.15)", drawTicks: false },
            border: { display: false },
            ticks: { color: "#667085", font: { size: 10 }, precision: 0 },
          },
        },
      },
    });
    void zeros;
  }, [period, booked, attended]);

  useEffect(
    () => () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    },
    [],
  );

  return (
    <div className="hui-reveal">
      <div className="hsection hui-card hui-card--flush">
        <div className="hsection-head">
          <div className="hsection-titles">
            <h2 className="hsection-title">Agendamentos vs. Atendimentos</h2>
            <p className="hsection-desc">Volume agendado x efetivamente atendido</p>
          </div>
          <div className="hsection-actions">
            <PeriodSelect value={period} onChange={setPeriod} />
          </div>
        </div>
        <div className="hsection-body hsection-body--flush">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pb-1 pt-1 text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
              <span className="text-muted">Agendamentos</span>
              <span className="font-semibold tracking-tight tabular-nums">{totals.booked}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "var(--color-success)" }} />
              <span className="text-muted">Atendimentos</span>
              <span className="font-semibold tracking-tight tabular-nums">{totals.attended}</span>
            </span>
          </div>
          <div className="px-2 pb-4 pt-2">
            <div className="hcchart" style={{ height: 260 }}>
              <canvas ref={canvasRef} className="hcchart-canvas" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
