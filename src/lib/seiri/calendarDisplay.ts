import { slotColor, type Slot } from "./slots";
import type { Appointment, Data, Status } from "./types";

/** "Tipo de Visualização", the four the original's Exibição menu offers, in its order. */
export const DISPLAY_MODES = [
  "Todos os Horários",
  "Todos os Horários, sem agrupamento",
  "Agendamentos, agrupados por horário",
  "Agendamentos, sem agrupamento",
] as const;

/** "Cor dos Eventos", in the original's order. */
export const COLOR_MODES = ["Ocupação do Horário", "Por agenda", "Por status", "Por serviço"] as const;

/**
 * What the calendar opens on. Measured by clearing the original's own `calendar:preferences`
 * and reloading: it comes back on "Por agenda", not on the occupancy that the screen notes and
 * the comment in slots.ts both claimed.
 */
export const DEFAULT_COLOR_MODE: ColorMode = "Por agenda";

export type ColorMode = (typeof COLOR_MODES)[number];

/**
 * What the chosen "Tipo de Visualização" asks of the grid. Measured against the original on
 * 2026-10-08, on a week whose 09:00 slot held two appointments:
 *
 * | Opção | blocos | ocupados |
 * |---|---|---|
 * | Todos os Horários | 96 | 1, dividido entre os dois |
 * | Todos os Horários, sem agrupamento | 96 | 1, dividido entre os dois |
 * | Agendamentos, agrupados por horário | 1 | 1, dividido entre os dois |
 * | Agendamentos, sem agrupamento | 2 | 2, um por agendamento |
 *
 * So "Agendamentos…" drops the free slots, and "…sem agrupamento" only does anything in that
 * family: with the free slots on screen the original groups either way, and the second option is
 * the same view as the first.
 */
export function displayFlags(mode: string) {
  const onlyBooked = mode.startsWith("Agendamentos");
  return { onlyBooked, grouped: !(onlyBooked && mode.includes("sem agrupamento")) };
}

/** The hex behind each status chip, for "Por status". */
export const STATUS_COLORS: Record<Status, string> = {
  PENDING: "#F5A524",
  CONFIRMED: "#0A70D6",
  ATTENDED: "#17C964",
  NO_SHOW: "#D42325",
  CANCELED: "#98A2B3",
};

/** The grey a blocked slot takes, whatever the colouring. */
export const BLOCKED_COLOR = "#98A2B3";

/**
 * The colour one block gets. A blocked slot with nobody in it is always grey; otherwise the mode
 * decides, and the modes that read a record fall back to the occupancy when there is none to read
 * — a free slot has no status, no service and no one booked.
 */
export function colorOf(data: Data, slot: Slot, appointment: Appointment | null, mode: ColorMode): string {
  if (slot.blocked && !slot.appointments.length) return BLOCKED_COLOR;
  // Every mode but the first describes a booking, so an empty slot keeps the occupancy colour
  // whichever is chosen. Measured on the original: under "Por agenda" the free slots stay mint,
  // they do not take the agenda's colour.
  if (!slot.appointments.length || mode === "Ocupação do Horário") return slotColor(slot);

  if (mode === "Por agenda") return data.agendas.find((a) => a.id === slot.agendaId)?.color ?? slotColor(slot);

  // The two below describe one appointment, so a slot shown as a whole uses the first one in it.
  const row = appointment ?? slot.appointments[0];
  if (mode === "Por status") return STATUS_COLORS[row.status];
  return data.services.find((s) => s.id === row.serviceId)?.color ?? slotColor(slot);
}
