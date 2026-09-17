import type { Option } from "../shared/Combobox";

// Mock data: the live page lists the signed-in account's agendas, clients and slots.
export const AGENDAS: Option[] = [{ value: "1", label: "Agenda Principal" }];

export const ACTIONS: Option[] = [
  { value: "new", label: "Novo Agendamento" },
  { value: "waiting", label: "Incluir na lista de espera" },
  { value: "fit", label: "Encaixar no horário" },
];

export const STATUSES: Option[] = [
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PENDING", label: "Aguardando Confirmação" },
  { value: "AWAITING_PAYMENT", label: "Aguardando Pagamento" },
];

export const OWNERS: Option[] = [{ value: "1", label: "Maria Souza" }];

export const CLIENTS: Option[] = [
  { value: "1", label: "Ana Ribeiro" },
  { value: "2", label: "Bruno Carvalho" },
  { value: "3", label: "Carla Nunes" },
  { value: "4", label: "Diego Prado" },
];

export const TAGS: Option[] = [
  { value: "retorno", label: "Retorno" },
  { value: "primeira-vez", label: "Primeira vez" },
  { value: "online", label: "Online" },
];

export const TEAM: Option[] = [
  { value: "1", label: "Maria Souza" },
  { value: "2", label: "João Lima" },
];

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Next 14 days, as the original lists once an agenda is picked. */
export function dayOptions(today: Date): Option[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} — ${WEEKDAYS[d.getDay()]}`,
    };
  });
}

/** The agenda's working hours, in 30-minute slots (08:00–17:30). */
export function timeOptions(): Option[] {
  const slots: Option[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (const minute of [0, 30]) {
      const label = `${pad(hour)}:${pad(minute)}`;
      slots.push({ value: label, label });
    }
  }
  return slots;
}
