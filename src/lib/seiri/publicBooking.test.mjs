// node src/lib/seiri/publicBooking.test.mjs — who the public form lets book, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { knownClient, refusalFor } = await import("./publicBooking.ts");

const ana = { id: "c1", name: "Ana Lima", email: "ana@exemplo.com.br", phone: "+55 11 98888-1010" };
const bruno = { id: "c2", name: "Bruno Souza", email: "bruno@exemplo.com.br", phone: "+55 11 97777-2020" };

const appointment = (clientId, start, status = "CONFIRMED") => ({
  id: `ap-${clientId}-${start}`,
  code: "1",
  clientId,
  agendaId: "a1",
  serviceId: "s1",
  start,
  duration: 30,
  status,
  owner: "",
  tagIds: [],
  comment: "",
});
const limit = (over) => ({ id: "lm1", type: "AGENDAMENTOS", key: "email", agendaIds: [], serviceIds: [], interval: "DIA", days: 0, max: 1, ...over });
const block = (over) => ({
  id: "sp1",
  type: "email",
  contact: "ana@exemplo.com.br",
  reason: "Faltas",
  expiresAt: "",
  createdAt: "",
  createdBy: "",
  active: true,
  ...over,
});
const data = (over = {}) => ({ clients: [ana, bruno], appointments: [], limits: [], suppressions: [], ...over });
const slot = { agendaId: "a1", serviceId: "s1", start: "2026-10-13T09:00" };
const NOW = new Date(2026, 9, 12, 12, 0);
const ORG = "Minha Empresa";

// Who the visitor already is: the same e-mail or the same phone, however they are written.
{
  const d = data();
  assert.equal(knownClient(d, { email: "ana@exemplo.com.br", phone: "" })?.id, "c1");
  assert.equal(knownClient(d, { email: "  ANA@Exemplo.com.BR ", phone: "" })?.id, "c1", "caixa e espaços não importam");
  assert.equal(knownClient(d, { email: "", phone: "(11) 98888-1010" })?.id, "c1", "o telefone vale mesmo sem o +55 e com pontuação");
  assert.equal(knownClient(d, { email: "outro@exemplo.com", phone: "11 97777-2020" })?.id, "c2", "o telefone acha mesmo com outro e-mail");
  assert.equal(knownClient(d, { email: "novo@exemplo.com", phone: "11 90000-0000" }), null, "ninguém com esses dados");
}

// A field left empty matches nobody, even a client who also has it empty.
{
  const semContato = { id: "c3", name: "Sem Contato", email: "", phone: "" };
  const d = data({ clients: [ana, semContato] });
  assert.equal(knownClient(d, { email: "", phone: "" }), null, "e-mail e telefone vazios não acham o cliente vazio");
  assert.equal(knownClient(d, { email: "   ", phone: "()-" }), null, "nem o que só tem espaço e pontuação");
}

// A deactivated client is not found: the original takes them off the lists.
{
  const d = data({ clients: [{ ...ana, inactive: true }, bruno] });
  assert.equal(knownClient(d, { email: "ana@exemplo.com.br", phone: "" }), null);
}

// Nothing in the way: the visitor may book.
{
  assert.equal(refusalFor(data(), ana, slot, ORG, NOW), "");
  assert.equal(
    refusalFor(data(), { id: "novo", name: "Novo", email: "novo@exemplo.com", phone: "" }, slot, ORG, NOW),
    "",
    "um visitante novo, que a lista nem conhece",
  );
}

// The block list turns a visitor away without saying why, whether or not they are on the client list yet.
{
  const d = data({ suppressions: [block({})] });
  const why = refusalFor(d, ana, slot, ORG, NOW);
  assert.match(why, /Não foi possível concluir o agendamento/);
  assert.match(why, /Entre em contato com Minha Empresa\./, "diz com quem falar");
  assert.ok(!why.includes("Faltas"), "o motivo é da equipe, não do visitante");
  assert.equal(refusalFor(d, bruno, slot, ORG, NOW), "", "quem não está na lista passa");

  const stranger = { id: "novo", name: "Novo", email: "ANA@exemplo.com.br", phone: "" };
  assert.match(refusalFor(d, stranger, slot, ORG, NOW), /Não foi possível/, "o e-mail bloqueado vale mesmo para quem ainda não é cliente");

  assert.equal(refusalFor(data({ suppressions: [block({ active: false })] }), ana, slot, ORG, NOW), "", "um bloqueio desligado deixa passar");
  assert.equal(refusalFor(data({ suppressions: [block({ expiresAt: "2026-10-01T00:00" })] }), ana, slot, ORG, NOW), "", "e um vencido também");
  assert.match(
    refusalFor(data({ suppressions: [block({ type: "phone", contact: "(11) 98888-1010" })] }), ana, slot, ORG, NOW),
    /Não foi possível/,
    "bloqueio por telefone",
  );
}

// A limit counts what the visitor has already booked, and says what the limit is.
{
  const d = data({ limits: [limit({})], appointments: [appointment("c1", "2026-10-13T08:00")] });
  assert.equal(refusalFor(d, ana, slot, ORG, NOW), "Você já atingiu o limite de 1 agendamento(s) por dia.");
  assert.equal(refusalFor(d, ana, { ...slot, start: "2026-10-14T09:00" }, ORG, NOW), "", "no dia seguinte já cabe");
  assert.equal(refusalFor(d, bruno, slot, ORG, NOW), "", "outra pessoa tem a própria conta");
  assert.equal(
    refusalFor(data({ limits: [limit({})], appointments: [appointment("c1", "2026-10-13T08:00", "CANCELED")] }), ana, slot, ORG, NOW),
    "",
    "um agendamento cancelado não conta",
  );
}

// A visitor the list does not have yet starts from zero, and is counted from then on.
{
  const d = data({ limits: [limit({})] });
  const novo = { id: "c9", name: "Novo", email: "novo@exemplo.com", phone: "" };
  assert.equal(refusalFor(d, novo, slot, ORG, NOW), "");
  const later = data({ limits: [limit({})], clients: [ana, bruno, novo], appointments: [appointment("c9", "2026-10-13T08:00")] });
  assert.match(refusalFor(later, novo, slot, ORG, NOW), /atingiu o limite/, "agora tem um agendamento no dia");
}

// The sentence follows the limit's window and kind.
{
  const say = (over) =>
    refusalFor(data({ limits: [limit(over)], appointments: [appointment("c1", "2026-10-13T08:00")] }), ana, { ...slot, start: "2026-10-13T09:00" }, ORG, NOW);
  assert.equal(say({ interval: "HORARIO", max: 1 }).includes("por horário"), false, "o horário 08:00 não é o 09:00, então cabe");
  assert.equal(
    refusalFor(data({ limits: [limit({ interval: "HORARIO" })], appointments: [appointment("c1", "2026-10-13T09:00")] }), ana, slot, ORG, NOW),
    "Você já atingiu o limite de 1 agendamento(s) por horário.",
  );
  assert.equal(say({ interval: "SEMANA" }), "Você já atingiu o limite de 1 agendamento(s) por semana.");
  assert.equal(say({ interval: "MES", max: 1 }), "Você já atingiu o limite de 1 agendamento(s) por mês.");
  assert.equal(say({ interval: "NDAYS", days: 7 }), "Você já atingiu o limite de 1 agendamento(s) em 7 dias corridos.");
  assert.equal(
    refusalFor(
      data({
        limits: [limit({ type: "FALTAS", max: 2 })],
        appointments: [appointment("c1", "2026-10-13T08:00", "NO_SHOW"), appointment("c1", "2026-10-13T08:30", "NO_SHOW")],
      }),
      ana,
      slot,
      ORG,
      NOW,
    ),
    "Você já atingiu o limite de 2 falta(s) por dia.",
    "uma regra de faltas fala de faltas",
  );
}

// The block list is checked first: a visitor who breaks both is told only to get in touch.
{
  const d = data({ suppressions: [block({})], limits: [limit({})], appointments: [appointment("c1", "2026-10-13T08:00")] });
  assert.match(refusalFor(d, ana, slot, ORG, NOW), /Entre em contato/);
}

// The data it is handed is left as it was, even for a visitor it adds for the check.
{
  const d = data({ limits: [limit({})] });
  const before = JSON.stringify(d);
  refusalFor(d, { id: "novo", name: "N", email: "n@exemplo.com", phone: "" }, slot, ORG, NOW);
  assert.equal(JSON.stringify(d), before);
}

console.log("publicBooking ok");
