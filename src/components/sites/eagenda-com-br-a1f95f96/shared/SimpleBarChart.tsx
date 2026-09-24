"use client";

import { useEffect, useRef } from "react";
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

/** The bar chart the report pages draw once their period has appointments. */
export function SimpleBarChart({ labels, values, height = 240 }: { labels: string[]; values: number[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#0a70d6";
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: { labels, datasets: [{ data: values, backgroundColor: accent, borderRadius: 6, maxBarThickness: 28 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#fff", titleColor: "#101828", bodyColor: "#667085", borderColor: "#e2e8f0", borderWidth: 1, cornerRadius: 8, padding: 10 } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#667085", font: { size: 10 }, maxRotation: 0 } },
          y: { beginAtZero: true, grid: { color: "rgba(102,112,133,0.15)", drawTicks: false }, border: { display: false }, ticks: { color: "#667085", font: { size: 10 }, precision: 0 } },
        },
      },
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, values]);

  return (
    <div className="hcchart" style={{ height }}>
      <canvas ref={canvasRef} className="hcchart-canvas" />
    </div>
  );
}
