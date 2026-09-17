export type Period = "30d" | "90d" | "12m";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const dm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

// Same bucketing as the original: daily (30), weekly (13) or monthly (12), ending today.
export function periodLabels(period: Period, today: Date): string[] {
  const back = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  if (period === "30d") return Array.from({ length: 30 }, (_, i) => dm(back(29 - i)));
  if (period === "90d") return Array.from({ length: 13 }, (_, i) => dm(back(90 - i * 7)));
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
  });
}
