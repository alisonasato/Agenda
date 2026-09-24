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

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Same buckets as the labels, as [start, end) day keys, so rows can be counted into them. */
export function periodBuckets(period: Period, today: Date): [string, string][] {
  const back = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  if (period === "30d") return Array.from({ length: 30 }, (_, i) => [key(back(29 - i)), key(back(28 - i))] as [string, string]);
  if (period === "90d") return Array.from({ length: 13 }, (_, i) => [key(back(90 - i * 7)), key(back(83 - i * 7))] as [string, string]);
  return Array.from({ length: 12 }, (_, i) => {
    const from = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    const to = new Date(today.getFullYear(), today.getMonth() - 10 + i, 1);
    return [key(from), key(to)] as [string, string];
  });
}
