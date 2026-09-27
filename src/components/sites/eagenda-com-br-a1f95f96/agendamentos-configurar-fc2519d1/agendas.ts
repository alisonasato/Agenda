export type Agenda = {
  id: string;
  name: string;
  color: string;
  active: boolean;
  videoconference: boolean;
  problems: boolean;
  upcoming: number;
  freeSlots: number;
  lastDate: string;
  duration: string;
  step: string;
  maxPerSlot: number;
  notice: string;
  asks: string;
  notifications: { label: string; on: boolean }[];
  services: string[];
  requested: string[];
  /** Working intervals per weekday (0 = Sunday), from the browser's data. */
  week?: { start: string; end: string }[][];
};

// Mock data mirroring the live account's single, still-unconfigured agenda.
export const AGENDAS: Agenda[] = [
  {
    id: "18078",
    name: "Agenda Principal",
    color: "#48CFAE",
    active: true,
    videoconference: true,
    problems: true,
    upcoming: 0,
    freeSlots: 0,
    lastDate: "—",
    duration: "30min",
    step: "30min",
    maxPerSlot: 1,
    notice: "1h – 7 dia(s)",
    asks: "Nome · email · telefone · cpf · endereço",
    notifications: [
      { label: "Confirmar", on: false },
      { label: "Novos", on: true },
      { label: "E-mail", on: false },
    ],
    services: [],
    requested: ["CPF", "Email", "Tel"],
  },
];

export const WEEKDAY_TABS = [
  { initial: "S", title: "Segunda-feira", weekday: 1 },
  { initial: "T", title: "Terça-feira", weekday: 2 },
  { initial: "Q", title: "Quarta-feira", weekday: 3 },
  { initial: "Q", title: "Quinta-feira", weekday: 4 },
  { initial: "S", title: "Sexta-feira", weekday: 5 },
  { initial: "S", title: "Sábado", weekday: 6 },
  { initial: "D", title: "Domingo", weekday: 0 },
];
