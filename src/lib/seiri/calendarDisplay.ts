import { SLOT_COLORS, slotColor, type Slot } from "./slots";
import type { Appointment, Data, Status } from "./types";

/** "Tipo de Visualização", the four the original's Exibição menu offers, in its order. */
export const DISPLAY_MODES = [
  "Todos os Horários",
  "Todos os Horários, sem agrupamento",
  "Agendamentos, agrupados por horário",
  "Agendamentos, sem agrupamento",
] as const;

/** "Cor dos Eventos". The calendar opens on the first, which is what the grid paints. */
export const COLOR_MODES = ["Ocupação do Horário", "Por agenda", "Por status", "Por serviço"] as const;

export type ColorMode = (typeof COLOR_MODES)[number];

/**
 * What the chosen "Tipo de Visualização" asks of the grid, read off the label itself:
 * - "Agendamentos…" drops the free slots and leaves only the booked ones;
 * - "…sem agrupamento" stops a slot being shared between the people in it, and draws one block per
 *   appointment at its own time instead.
 */
export function displayFlags(mode: string) {
  return { onlyBooked: mode.startsWith("Agendamentos"), grouped: !mode.includes("sem agrupamento") };
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
  if (mode === "Ocupação do Horário") return slotColor(slot);

  if (mode === "Por agenda") return data.agendas.find((a) => a.id === slot.agendaId)?.color ?? slotColor(slot);

  // The two below describe one appointment, so a slot shown as a whole uses the first one in it.
  const row = appointment ?? slot.appointments[0];
  if (!row) return SLOT_COLORS.free;
  if (mode === "Por status") return STATUS_COLORS[row.status];
  return data.services.find((s) => s.id === row.serviceId)?.color ?? slotColor(slot);
}
