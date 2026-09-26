import { dayKey } from "./select";
import type { Appointment, Data, Interval, SlotInfo } from "./types";

/** The original serves the calendar as half-hour slots (`slotDuration: "0:30:00"`). */
export const SLOT_MINUTES = 30;

/** "Ocupação do Horário", the colouring the calendar opens with. */
export const SLOT_COLORS = { free: "#48CFAE", partial: "#F5A524", full: "#D42325" };

/** The key "Editar Horário" and "Videoconferência" store a slot's own settings under. */
export const slotKey = (agendaId: string, start: string) => `${agendaId}|${start}`;

export type Slot = {
  /** "2026-09-24T09:30". */
  start: string;
  end: string;
  agendaId: string;
  /** Places the slot offers, `null` when the agenda sets no limit (one person). */
  max: number;
  appointments: Appointment[];
  blocked: boolean;
  blockReason: string;
  /** What the slot modals changed on this slot. */
  info: SlotInfo;
};

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** The intervals an agenda works on a given day. */
export const intervalsOf = (data: Data, agendaId: string, day: Date): Interval[] => data.hours[agendaId]?.[day.getDay()] ?? [];

/** The block covering a slot, if any. A block with no times covers the whole day. */
function blockOf(data: Data, agendaId: string, key: string, from: number, to: number) {
  return data.blocks.find((b) => {
    if (!b.agendaIds.includes(agendaId) || key < b.from || key > (b.to || b.from)) return false;
    if (!b.startTime || !b.endTime) return true;
    return from < toMinutes(b.endTime) && to > toMinutes(b.startTime);
  });
}

/** Every half-hour slot an agenda offers on `day`, with whoever booked it. */
export function slotsOf(data: Data, agendaId: string, day: Date): Slot[] {
  const key = dayKey(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}T00:00`);
  const booked = data.appointments.filter((a) => a.agendaId === agendaId && a.status !== "CANCELED" && a.start.slice(0, 10) === key);

  return intervalsOf(data, agendaId, day).flatMap((interval) => {
    const slots: Slot[] = [];
    for (let at = toMinutes(interval.start); at + SLOT_MINUTES <= toMinutes(interval.end); at += SLOT_MINUTES) {
      const to = at + SLOT_MINUTES;
      const block = blockOf(data, agendaId, key, at, to);
      const start = `${key}T${toTime(at)}`;
      const info = data.slotInfo[slotKey(agendaId, start)] ?? {};
      slots.push({
        start: info.start ? `${key}T${info.start}` : start,
        end: info.end ? `${key}T${info.end}` : `${key}T${toTime(to)}`,
        agendaId,
        max: info.max ?? interval.max ?? 1,
        info,
        // An appointment fills every slot its duration runs through.
        appointments: booked.filter((a) => {
          const from = toMinutes(a.start.slice(11, 16));
          return from < to && from + a.duration > at;
        }),
        blocked: Boolean(block),
        blockReason: block?.reason ?? "",
      });
    }
    return slots;
  });
}

/** The colour "Ocupação do Horário" paints a slot with. */
export const slotColor = (slot: Slot) =>
  slot.appointments.length === 0 ? SLOT_COLORS.free : slot.appointments.length >= slot.max ? SLOT_COLORS.full : SLOT_COLORS.partial;

/** The first and last hour any agenda works in the week being shown, for the grid's rows. */
export function hourRange(data: Data, days: Date[], agendaIds: string[]) {
  const all = days.flatMap((day) => agendaIds.flatMap((id) => intervalsOf(data, id, day)));
  if (!all.length) return { first: 8, last: 17 };
  const first = Math.min(...all.map((i) => Math.floor(toMinutes(i.start) / 60)));
  const last = Math.max(...all.map((i) => Math.ceil(toMinutes(i.end) / 60)));
  return { first, last: Math.max(first + 1, last) };
}

/** Mix with white the way the original lightens a slot's colour for its background. */
export function tint(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

/** Darken for the label, the same way. */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel * amount);
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}
