// node src/lib/seiri/calendarDisplay.test.mjs
// What the calendar's "Exibição" menu asks of the grid, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { DISPLAY_MODES, COLOR_MODES, displayFlags, colorOf, STATUS_COLORS, BLOCKED_COLOR } = await import("./calendarDisplay.ts");
const { SLOT_COLORS } = await import("./slots.ts");

const appointment = (over) => ({
  id: "ap1",
  code: "1",
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start: "2026-09-24T09:00",
  duration: 30,
  status: "CONFIRMED",
  owner: "",
  tagIds: [],
  comment: "",
  ...over,
});

const slot = (over) => ({
  start: "2026-09-24T09:00",
  end: "2026-09-24T09:30",
  agendaId: "a1",
  max: 1,
  appointments: [],
  blocked: false,
  blockReason: "",
  info: {},
  ...over,
});

const data = {
  agendas: [
    { id: "a1", name: "Principal", color: "#0A70D6", active: true },
    { id: "a2", name: "Unidade", color: "#EC4899", active: true },
  ],
  services: [
    { id: "s1", name: "Consulta", color: "#17C964", price: 0, duration: 30, agendaIds: ["a1"], tagIds: [], order: 1, members: [], maxPeople: null },
    { id: "s2", name: "Retorno", color: "#6366F1", price: 0, duration: 30, agendaIds: ["a1"], tagIds: [], order: 2, members: [], maxPeople: null },
  ],
};

// The menu offers the original's four of each, in its order.
{
  assert.deepEqual(DISPLAY_MODES, [
    "Todos os Horários",
    "Todos os Horários, sem agrupamento",
    "Agendamentos, agrupados por horário",
    "Agendamentos, sem agrupamento",
  ]);
  assert.deepEqual(COLOR_MODES, ["Ocupação do Horário", "Por agenda", "Por status", "Por serviço"]);
  assert.equal(COLOR_MODES[0], "Ocupação do Horário", "o calendário abre nesta, e é a que a grade pinta");
}

// The two flags each label carries.
{
  assert.deepEqual(displayFlags("Todos os Horários"), { onlyBooked: false, grouped: true });
  assert.deepEqual(displayFlags("Todos os Horários, sem agrupamento"), { onlyBooked: false, grouped: false });
  assert.deepEqual(displayFlags("Agendamentos, agrupados por horário"), { onlyBooked: true, grouped: true });
  assert.deepEqual(displayFlags("Agendamentos, sem agrupamento"), { onlyBooked: true, grouped: false });

  // Every label the menu can produce is covered by the two rules.
  for (const mode of DISPLAY_MODES) {
    const f = displayFlags(mode);
    assert.equal(typeof f.onlyBooked, "boolean");
    assert.equal(typeof f.grouped, "boolean");
  }
}

// Occupancy, the colouring the calendar opens with.
{
  const free = slot({});
  const partial = slot({ max: 2, appointments: [appointment({})] });
  const full = slot({ max: 1, appointments: [appointment({})] });
  assert.equal(colorOf(data, free, null, "Ocupação do Horário"), SLOT_COLORS.free);
  assert.equal(colorOf(data, partial, null, "Ocupação do Horário"), SLOT_COLORS.partial);
  assert.equal(colorOf(data, full, null, "Ocupação do Horário"), SLOT_COLORS.full);
}

// A blocked and empty slot is grey whatever the mode; one with people in it is not.
{
  const blocked = slot({ blocked: true, blockReason: "Reunião" });
  for (const mode of COLOR_MODES) assert.equal(colorOf(data, blocked, null, mode), BLOCKED_COLOR, `cinza em "${mode}"`);

  const blockedButBooked = slot({ blocked: true, appointments: [appointment({})] });
  assert.notEqual(colorOf(data, blockedButBooked, null, "Por agenda"), BLOCKED_COLOR, "quem já estava agendado não vira cinza");
}

// Por agenda: the slot's own agenda, free or not.
{
  assert.equal(colorOf(data, slot({}), null, "Por agenda"), "#0A70D6");
  assert.equal(colorOf(data, slot({ agendaId: "a2" }), null, "Por agenda"), "#EC4899");
  // An agenda that is no longer there falls back rather than painting nothing.
  assert.equal(colorOf(data, slot({ agendaId: "sumiu" }), null, "Por agenda"), SLOT_COLORS.free);
}

// Por status: the appointment's own status.
{
  for (const [status, hex] of Object.entries(STATUS_COLORS)) {
    const s = slot({ appointments: [appointment({ status })] });
    assert.equal(colorOf(data, s, null, "Por status"), hex, status);
  }
  // Shown as a whole, the slot takes the first appointment's colour; shown apart, each its own.
  const mixed = slot({ max: 2, appointments: [appointment({ id: "a", status: "PENDING" }), appointment({ id: "b", status: "NO_SHOW" })] });
  assert.equal(colorOf(data, mixed, null, "Por status"), STATUS_COLORS.PENDING, "o primeiro responde pelo bloco inteiro");
  assert.equal(colorOf(data, mixed, mixed.appointments[1], "Por status"), STATUS_COLORS.NO_SHOW, "sem agrupar, cada um com o seu");
}

// Por serviço, and the fallback when there is no record to read.
{
  assert.equal(colorOf(data, slot({ appointments: [appointment({ serviceId: "s2" })] }), null, "Por serviço"), "#6366F1");
  // O recuo é a ocupação daquele slot: com um agendamento e max 1, ele está lotado.
  assert.equal(colorOf(data, slot({ appointments: [appointment({ serviceId: "sumiu" })] }), null, "Por serviço"), SLOT_COLORS.full, "serviço apagado");

  // A free slot has no status and no service, so these two modes fall back instead of breaking.
  assert.equal(colorOf(data, slot({}), null, "Por status"), SLOT_COLORS.free);
  assert.equal(colorOf(data, slot({}), null, "Por serviço"), SLOT_COLORS.free);
}

console.log("calendarDisplay ok");
