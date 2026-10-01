import { CHANNEL_LABELS, type Channel, type Data, type NotificationRule, type Status } from "./types";

/** What "Acompanhamento de Notificações" shows in one row. */
export type Send = {
  id: string;
  clientName: string;
  contact: string;
  agendaName: string;
  ruleTitle: string;
  channel: Channel;
  channelLabel: string;
  status: Status;
  /** "aaaa-mm-ddThh:mm", the appointment's own time. */
  start: string;
  /** When the rule has the notification go out, same format. */
  at: string;
  situation: "Aguardando" | "Enviada" | "Cancelada";
};

/** The statuses each "Filtro de Status" of a rule lets through. */
const FILTERS: Record<string, Status[]> = {
  CONFIRMADO: ["CONFIRMED"],
  PENDENTE: ["PENDING"],
  ATENDIDO: ["ATTENDED"],
  ATEND_OR_CONF: ["ATTENDED", "CONFIRMED"],
  NO_SHOW: ["NO_SHOW"],
};

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "dd/mm/aaaa hh:mm" as the tables print it. */
export const showStamp = (at: string) => (at ? `${at.slice(0, 10).split("-").reverse().join("/")} ${at.slice(11, 16)}` : "—");

/** When the rule sends, relative to the appointment. */
function sendTime(rule: NotificationRule, start: string) {
  if (rule.immediate) return start;
  const offset = ((rule.days * 24 + rule.hours) * 60 + rule.minutes) * 60000;
  return stamp(new Date(new Date(`${start}:00`).getTime() + (rule.when === "before" ? -offset : offset)));
}

/**
 * The notifications the rules schedule for the appointments on record. The original keeps these
 * as rows of its own; here they are worked out from the rules, so a rule change shows up at once.
 */
export function sendsOf(data: Data, now = new Date()): Send[] {
  const at = stamp(now);
  return data.appointments.flatMap((appointment) => {
    const client = data.clients.find((c) => c.id === appointment.clientId);
    const agenda = data.agendas.find((a) => a.id === appointment.agendaId);
    return data.notificationRules
      .filter((rule) => rule.channel && rule.recipients.client)
      .filter((rule) => !rule.agendaIds.length || rule.agendaIds.includes(appointment.agendaId))
      .filter((rule) => rule.immediate || !rule.statusFilter || (FILTERS[rule.statusFilter] ?? []).includes(appointment.status))
      .map((rule) => {
        const when = sendTime(rule, appointment.start);
        return {
          id: `${appointment.id}-${rule.id}`,
          clientName: client?.name ?? "—",
          contact: [client?.email, client?.phone].filter(Boolean).join(" · "),
          agendaName: agenda?.name ?? "—",
          ruleTitle: rule.title,
          channel: rule.channel as Channel,
          channelLabel: CHANNEL_LABELS[rule.channel as Channel],
          status: appointment.status,
          start: appointment.start,
          at: when,
          situation: appointment.status === "CANCELED" ? "Cancelada" : when <= at ? "Enviada" : "Aguardando",
        } satisfies Send;
      });
  });
}

/** The `.hchip--<tone>` each situation is painted with. */
export const SITUATION_TONES: Record<Send["situation"], string> = {
  Aguardando: "hchip--warning",
  Enviada: "hchip--success",
  Cancelada: "hchip--default",
};
