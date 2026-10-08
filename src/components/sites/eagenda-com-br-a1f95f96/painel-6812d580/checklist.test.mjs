// node src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/checklist.test.mjs
// The Painel's onboarding rules: which steps count as done, and the plan quota both screens share.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { monthUsage } = await import("../../../../lib/seiri/select.ts");
const { seed } = await import("../../../../lib/seiri/seed.ts");
// The rules themselves, not a copy: a change in the component has to come through here.
const { CHECKLIST_STEPS, checklistState, FREE_PLAN } = await import("./checklist.ts");

const SEED = seed();
const NOW = new Date(2026, 8, 15, 12, 0); // a September day, mid-month

const appointment = (over) => ({
  id: "ap1",
  code: "1",
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start: "2026-09-10T09:00",
  duration: 30,
  status: "CONFIRMED",
  owner: "",
  tagIds: [],
  comment: "",
  ...over,
});

// monthUsage: the quota counts this month's appointments, and only the ones that still stand.
{
  const base = { ...SEED, appointments: [] };
  assert.equal(monthUsage(base, NOW), 0, "nada marcado, nada consumido");

  const three = {
    ...base,
    appointments: [appointment({ id: "a" }), appointment({ id: "b", start: "2026-09-01T08:00" }), appointment({ id: "c", start: "2026-09-30T23:30" })],
  };
  assert.equal(monthUsage(three, NOW), 3, "as duas pontas do mês contam");

  const canceled = { ...base, appointments: [appointment({ id: "a" }), appointment({ id: "b", status: "CANCELED" })] };
  assert.equal(monthUsage(canceled, NOW), 1, "um cancelado não consome a cota");

  const otherMonths = {
    ...base,
    appointments: [appointment({ id: "a", start: "2026-08-31T23:30" }), appointment({ id: "b", start: "2026-10-01T00:30" }), appointment({ id: "c" })],
  };
  assert.equal(monthUsage(otherMonths, NOW), 1, "o mês vizinho fica de fora, pelos dois lados");

  const otherYear = { ...base, appointments: [appointment({ id: "a", start: "2025-09-10T09:00" })] };
  assert.equal(monthUsage(otherYear, NOW), 0, "mesmo mês de outro ano não conta");

  // The same count feeds the Painel's meter and the one on Planos, which is the point of sharing it.
  assert.equal(monthUsage(three, NOW), monthUsage(three, new Date(2026, 8, 1)), "qualquer dia do mês dá o mesmo total");
}

// The checklist's four rules, kept in step with the component's own.
{
  const doneFor = (over) => checklistState({ ...SEED, appointments: [], bookingScreen: {}, orgSettings: {}, ...over }).done;

  assert.deepEqual(doneFor({}), [false, false, false, false], "uma conta recém-criada não tem passo nenhum");

  // Step 1 names two things, so one of them alone does not finish it.
  assert.equal(doneFor({ bookingScreen: { logo: "/brand/logo.png" } })[0], false, "só o logo não basta");
  assert.equal(doneFor({ bookingScreen: { mensagem: "Bem-vindo!" } })[0], false, "só a mensagem não basta");
  assert.equal(doneFor({ bookingScreen: { logo: "/brand/logo.png", mensagem: "Bem-vindo!" } })[0], true);
  assert.equal(doneFor({ bookingScreen: { logo: "  ", mensagem: "Bem-vindo!" } })[0], false, "espaço em branco não conta como preenchido");

  // Step 2 takes either of the two e-mail fields the settings form writes.
  assert.equal(doneFor({ orgSettings: { email: "contato@exemplo.com.br" } })[1], true);
  assert.equal(doneFor({ orgSettings: { from_email: "contato@exemplo.com.br" } })[1], true);
  assert.equal(doneFor({ orgSettings: { email: "" } })[1], false);

  assert.equal(doneFor({ appointments: [appointment({})] })[2], true);

  assert.equal(doneFor({ plan: { ...SEED.plan, name: "Plano Básico" } })[3], true);
  assert.equal(doneFor({ plan: { ...SEED.plan, name: FREE_PLAN } })[3], false, "o plano grátis não conta como escolhido");

  // The progress and the "próximo passo" both come from this list.
  const state = checklistState({ ...SEED, appointments: [appointment({})], bookingScreen: {}, orgSettings: {} });
  assert.equal(state.count, 1, "1 de 4");
  assert.equal(state.next, 0, "o primeiro pendente é o que recebe o destaque");

  // E o destaque anda: com o passo 1 pronto, quem recebe é o 2.
  const andou = checklistState({
    ...SEED,
    appointments: [],
    bookingScreen: { logo: "/brand/logo.png", mensagem: "Bem-vindo!" },
    orgSettings: {},
  });
  assert.deepEqual(andou.done, [true, false, false, false]);
  assert.equal(andou.next, 1, "o destaque segue o primeiro pendente, não o índice zero");

  const quaseTudo = checklistState({
    ...SEED,
    appointments: [appointment({})],
    bookingScreen: { logo: "/brand/logo.png", mensagem: "Bem-vindo!" },
    orgSettings: { email: "contato@exemplo.com.br" },
  });
  assert.equal(quaseTudo.count, 3);
  assert.equal(quaseTudo.next, 3, "sobra o plano, que é o último");
  assert.equal(quaseTudo.percent, 75);
  assert.equal(state.percent, 25);
  assert.equal(CHECKLIST_STEPS.length, 4, "o original lista quatro passos");
  assert.ok(
    CHECKLIST_STEPS.every((s) => s.label && typeof s.done === "function"),
    "todo passo tem rótulo e regra",
  );
}

console.log("checklist ok");
