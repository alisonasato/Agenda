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
  { initial: "S", title: "Segunda-feira" },
  { initial: "T", title: "Terça-feira" },
  { initial: "Q", title: "Quarta-feira" },
  { initial: "Q", title: "Quinta-feira" },
  { initial: "S", title: "Sexta-feira" },
  { initial: "S", title: "Sábado" },
  { initial: "D", title: "Domingo" },
];
