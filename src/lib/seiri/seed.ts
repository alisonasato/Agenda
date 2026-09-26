import type { Appointment, Client, Data, Hours, Interval, Service, Status, WaitingEntry } from "./types";

const AGENDAS = [
  { id: "a1", name: "Agenda Principal", color: "#0A70D6", active: true },
  { id: "a2", name: "Unidade Centro", color: "#17C964", active: true },
];

const TAGS = [
  { id: "t1", name: "VIP" },
  { id: "t2", name: "Retorno" },
  { id: "t3", name: "Convênio" },
];

const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Consulta inicial",
    price: 180,
    duration: 60,
    agendaIds: ["a1", "a2"],
    tagIds: ["t1"],
    order: 1,
    color: "#6366F1",
    maxPeople: 1,
    members: ["Maria Souza"],
  },
  {
    id: "s2",
    name: "Retorno",
    price: 90,
    duration: 30,
    agendaIds: ["a1"],
    tagIds: ["t2"],
    order: 2,
    color: "#17C964",
    maxPeople: 1,
    members: ["Maria Souza", "João Pedro"],
  },
  {
    id: "s3",
    name: "Avaliação",
    price: 120,
    duration: 45,
    agendaIds: ["a1", "a2"],
    tagIds: [],
    order: 3,
    color: "#F5A524",
    maxPeople: 2,
    members: ["João Pedro"],
  },
  { id: "s4", name: "Sessão online", price: null, duration: 30, agendaIds: ["a2"], tagIds: ["t3"], order: 4, color: "#EC4899", maxPeople: null, members: [] },
];

const CLIENTS: Client[] = [
  { id: "c1", name: "Ana Beatriz Lima", email: "ana.lima@exemplo.com.br", phone: "+55 11 98888-1010", cpf: "123.456.789-01", gender: "Feminino" },
  { id: "c2", name: "Bruno Carvalho", email: "bruno.carvalho@exemplo.com.br", phone: "+55 11 98888-2020", gender: "Masculino" },
  { id: "c3", name: "Carla Monteiro", email: "carla.monteiro@exemplo.com.br", phone: "+55 21 97777-3030", cpf: "987.654.321-00", gender: "Feminino" },
  { id: "c4", name: "Diego Ferreira", email: "diego.ferreira@exemplo.com.br", phone: "+55 31 96666-4040", gender: "Masculino" },
  { id: "c5", name: "Elisa Rocha", email: "elisa.rocha@exemplo.com.br", phone: "+55 41 95555-5050", gender: "Feminino" },
  { id: "c6", name: "Fábio Nogueira", email: "fabio.nogueira@exemplo.com.br", phone: "+55 51 94444-6060", gender: "Masculino" },
];

// The live agenda takes bookings 07:00–18:00 from Monday to Saturday and closes on Sunday.
const WEEK: Interval[] = [{ start: "07:00", end: "18:00", max: null }];
const HOURS: Hours = {
  a1: [[], WEEK, WEEK, WEEK, WEEK, WEEK, WEEK],
  a2: [
    [],
    [{ start: "09:00", end: "17:00", max: null }],
    [{ start: "09:00", end: "17:00", max: null }],
    [{ start: "09:00", end: "17:00", max: null }],
    [{ start: "09:00", end: "17:00", max: null }],
    [{ start: "09:00", end: "17:00", max: null }],
    [],
  ],
};

/** "2026-09-24T09:00" for a day offset from today and a time of day. */
function at(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}`;
}

/** [day offset, hour, client, service, agenda, status, tags, comment] */
const PLAN: [number, number, string, string, string, Status, string[], string][] = [
  [-6, 9, "c1", "s1", "a1", "ATTENDED", ["t1"], "Trouxe exames anteriores."],
  [-3, 14, "c2", "s2", "a1", "NO_SHOW", [], ""],
  [-1, 10, "c3", "s3", "a2", "ATTENDED", [], "Pagou no cartão."],
  [0, 9, "c4", "s1", "a1", "CONFIRMED", ["t2"], ""],
  [0, 11, "c5", "s2", "a1", "PENDING", [], "Pediu para confirmar por WhatsApp."],
  [0, 15, "c6", "s4", "a2", "CONFIRMED", ["t3"], ""],
  [1, 8, "c1", "s2", "a1", "CONFIRMED", ["t1", "t2"], ""],
  [1, 16, "c3", "s1", "a2", "PENDING", [], ""],
  [2, 10, "c2", "s3", "a1", "CONFIRMED", [], "Primeira avaliação."],
  [3, 9, "c5", "s1", "a1", "PENDING", [], ""],
  [4, 13, "c4", "s4", "a2", "CANCELED", [], "Cliente remarcou."],
  [5, 11, "c6", "s2", "a1", "CONFIRMED", ["t2"], ""],
  [8, 9, "c1", "s3", "a1", "PENDING", [], ""],
  [12, 14, "c3", "s2", "a2", "PENDING", [], ""],
];

const OWNERS = ["Maria Souza", "João Pedro"];

function appointments(): Appointment[] {
  return PLAN.map(([day, hour, clientId, serviceId, agendaId, status, tagIds, comment], i) => ({
    id: `ap${i + 1}`,
    code: String(48201 + i * 7),
    clientId,
    agendaId,
    serviceId,
    start: at(day, hour),
    duration: SERVICES.find((s) => s.id === serviceId)?.duration ?? 30,
    status,
    owner: OWNERS[i % OWNERS.length],
    tagIds,
    comment,
  }));
}

function waiting(): WaitingEntry[] {
  return [
    { id: "w1", clientId: "c2", agendaId: "a1", serviceId: "s1", start: at(2, 9), status: "waiting", position: 1, createdAt: at(-2, 18, 30) },
    { id: "w2", clientId: "c5", agendaId: "a1", serviceId: "s2", start: at(3, 10), status: "waiting", position: 2, createdAt: at(-1, 9, 15) },
    { id: "w3", clientId: "c6", agendaId: "a2", serviceId: "s4", start: at(-1, 15), status: "scheduled", position: 1, createdAt: at(-5, 11, 0) },
    { id: "w4", clientId: "c4", agendaId: "a2", serviceId: "s3", start: at(-4, 8), status: "cancelled", position: 1, createdAt: at(-8, 20, 45) },
  ];
}

/** The data a fresh browser starts with: two agendas, four services and a fortnight of appointments. */
export function seed(): Data {
  return { agendas: AGENDAS, services: SERVICES, tags: TAGS, clients: CLIENTS, appointments: appointments(), waiting: waiting(), hours: HOURS, blocks: [] };
}

/** What the prerendered HTML shows, before the browser loads its own data. */
export const EMPTY: Data = { agendas: [], services: [], tags: [], clients: [], appointments: [], waiting: [], hours: {}, blocks: [] };
