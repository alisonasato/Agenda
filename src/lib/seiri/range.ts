import { dayKey, inPreset, keyFromToday } from "./select";

export const PRESETS = ["Hoje", "Próximos 7 dias", "Próximos 30 dias", "Este mês", "Todos os períodos"] as const;
// "Amanhã" never shows in the menu: it only arrives from the dashboard's "Agendamentos amanhã" card,
// the same way the original links that card to a single day instead of one of its presets.
export type Preset = (typeof PRESETS)[number] | "Amanhã";

/** Both ends included, as "2026-10-15" keys so they compare as strings, like dayKey. */
export type DateRange = { from: string; to: string };

/** What a period filter holds: a named preset, or the two days someone picked. */
export type Period = Preset | DateRange;

export const ALL_PERIODS: Preset = "Todos os períodos";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parses a key back to a local date at midnight. */
const dateOf = (key: string) => new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)));

export const isRange = (p: Period): p is DateRange => typeof p === "object";

/** The two ends in order, whichever was picked first. */
export function normalizeRange(a: string, b: string): DateRange {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

/**
 * The days a preset stands for, counted from `today`. "Todos os períodos" has none: it is the
 * absence of a range. Measured on the original on 2026-10-09: Próximos 7 dias is 09/10 – 15/10 and
 * Próximos 30 dias is 09/10 – 07/11, so both count today as the first day.
 */
export function presetRange(preset: Preset, today: Date): DateRange | null {
  switch (preset) {
    case "Hoje":
      return { from: keyFromToday(0, today), to: keyFromToday(0, today) };
    case "Amanhã":
      return { from: keyFromToday(1, today), to: keyFromToday(1, today) };
    case "Próximos 7 dias":
      return { from: keyFromToday(0, today), to: keyFromToday(6, today) };
    case "Próximos 30 dias":
      return { from: keyFromToday(0, today), to: keyFromToday(29, today) };
    case "Este mês":
      return { from: keyOf(new Date(today.getFullYear(), today.getMonth(), 1)), to: keyOf(new Date(today.getFullYear(), today.getMonth() + 1, 0)) };
    default:
      return null;
  }
}

/**
 * What choosing a preset in the menu leaves behind. The original does not keep the preset: it
 * navigates with explicit dates, so the trigger then reads "09/10 – 15/10" and no preset is
 * highlighted. "Todos os períodos" is the exception, since there is no range to convert it to.
 */
export function pickPreset(preset: Preset, today: Date): Period {
  return presetRange(preset, today) ?? ALL_PERIODS;
}

/** "15/10 – 22/10", or "15/10" for one day. The original never prints the year, even across two. */
export function rangeLabel(range: DateRange) {
  const short = (k: string) => `${k.slice(8, 10)}/${k.slice(5, 7)}`;
  return range.from === range.to ? short(range.from) : `${short(range.from)} – ${short(range.to)}`;
}

export const periodLabel = (p: Period) => (isRange(p) ? rangeLabel(p) : p);

/** Whether an ISO start ("2026-09-24T09:00") falls in the period. */
export function inPeriod(iso: string, period: Period, today = new Date()) {
  if (!isRange(period)) return inPreset(iso, period, today);
  const key = dayKey(iso);
  return key >= period.from && key <= period.to;
}

/** The first click of a range, waiting for the second, and where the pointer is meanwhile. */
export type Pending = { start: string; hover: string | null };

/**
 * One click on a day. The first starts a range; the second ends it, in whichever order, and that is
 * the only moment the filter changes. A click after that starts over: the original keeps the old
 * range on screen until the new one is complete.
 */
export function pickDay(pending: Pending | null, day: string): { pending: Pending | null; commit: DateRange | null } {
  if (!pending) return { pending: { start: day, hover: null }, commit: null };
  return { pending: null, commit: normalizeRange(pending.start, day) };
}

/**
 * The range to draw. While one day is picked, the pointer's day previews the other end (so the
 * hover can reach before the start); with no preview, the lone start is shown by itself. Otherwise
 * it is the committed range, if there is one.
 */
export function shownRange(committed: DateRange | null, pending: Pending | null): (DateRange & { lone: boolean }) | null {
  if (pending) {
    const other = pending.hover ?? pending.start;
    return { ...normalizeRange(pending.start, other), lone: pending.hover === null || pending.hover === pending.start };
  }
  return committed ? { ...committed, lone: false } : null;
}

/** Classes for one day cell and its button, as measured on the original's `.hdaterange-cell`. */
export function cellFlags(day: string, shown: (DateRange & { lone: boolean }) | null) {
  if (!shown) return { inRange: false, start: false, end: false, selected: false };
  // A lone start is only the start: no band, and no end until the second day exists.
  if (shown.lone) return { inRange: false, start: day === shown.from, end: false, selected: day === shown.from };
  const inRange = day >= shown.from && day <= shown.to;
  return { inRange, start: day === shown.from, end: day === shown.to, selected: day === shown.from || day === shown.to };
}

/** The first month the picker shows: the range's own, else the current one. */
export const monthToShow = (range: DateRange | null, today: Date) => {
  const base = range ? dateOf(range.from) : today;
  return new Date(base.getFullYear(), base.getMonth(), 1);
};

/** The last `n` days, ending today and counting it: the reports open on 30 of them (10/09 – 09/10 on 09/10). */
export function lastDays(n: number, today: Date): DateRange {
  return { from: keyFromToday(-(n - 1), today), to: keyFromToday(0, today) };
}

/** "15/10/2026 – 22/10/2026": the long form the reports print above their results, year included. */
export function rangeLongLabel(range: DateRange) {
  const long = (k: string) => `${k.slice(8, 10)}/${k.slice(5, 7)}/${k.slice(0, 4)}`;
  return range.from === range.to ? long(range.from) : `${long(range.from)} – ${long(range.to)}`;
}

export const periodLongLabel = (p: Period) => (isRange(p) ? rangeLongLabel(p) : p);

/** A stable string for comparing two periods by what they cover rather than by identity. */
export const periodKey = (p: Period) => (isRange(p) ? `${p.from}..${p.to}` : p);

export { keyOf as dayKeyOf };
