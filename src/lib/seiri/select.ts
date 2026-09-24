import type { Appointment, Data } from "./types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad = (n: number) => String(n).padStart(2, "0");

export const parse = (iso: string) => new Date(`${iso}:00`);

export const formatDate = (iso: string) => {
  const d = parse(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const formatTime = (iso: string) => iso.slice(11, 16);

/** "Qua, 24/09 · 09:00 – 10:00", the way the list shows an appointment. */
export function formatWhen(start: string, duration: number) {
  const d = parse(start);
  const end = new Date(d.getTime() + duration * 60000);
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${formatTime(start)} – ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

export const formatMoney = (value: number | null) => (value == null ? "—" : `R$ ${value.toFixed(2).replace(".", ",")}`);

/** "1 hora", "45 min" — the same wording the wizard uses. */
export const formatDuration = (minutes: number) =>
  minutes % 60 === 0
    ? `${minutes / 60} ${minutes === 60 ? "hora" : "horas"}`
    : minutes > 60
      ? `${Math.floor(minutes / 60)}h${pad(minutes % 60)}`
      : `${minutes} min`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whether a date falls inside one of the period presets, counted from `today`. */
export function inPreset(iso: string, preset: string, today = new Date()) {
  if (preset === "Todos os períodos") return true;
  const day = startOfDay(parse(iso)).getTime();
  const from = startOfDay(today).getTime();
  if (preset === "Hoje") return day === from;
  if (preset === "Este mês") {
    const d = parse(iso);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  }
  const days = preset === "Próximos 30 dias" ? 30 : 7;
  return day >= from && day < from + days * 86400000;
}

/** Names for the ids an appointment carries, so a row can be rendered without repeating lookups. */
export function expand(data: Data, a: Appointment) {
  const client = data.clients.find((c) => c.id === a.clientId);
  const agenda = data.agendas.find((g) => g.id === a.agendaId);
  const service = data.services.find((s) => s.id === a.serviceId);
  return {
    client,
    agenda,
    service,
    clientName: client?.name ?? "—",
    agendaName: agenda?.name ?? "—",
    serviceName: service?.name ?? "—",
    tags: a.tagIds.map((id) => data.tags.find((t) => t.id === id)?.name).filter(Boolean) as string[],
  };
}

/** Accent-insensitive contains, like the sidebar search. */
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Day key ("2026-09-24") of an appointment start. */
export const dayKey = (iso: string) => iso.slice(0, 10);

/** The day key `offset` days from `today`. */
export function keyFromToday(offset: number, today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whether a day key falls in the next `days` days, today included. */
export const withinDays = (iso: string, days: number, today = new Date()) => {
  const key = dayKey(iso);
  return key >= keyFromToday(0, today) && key < keyFromToday(days, today);
};
