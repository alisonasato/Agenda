// node src/lib/seiri/access.test.mjs — who an agenda for authorized clients lets in, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { listsFor, clientByLink, prompt, denied, identify, isListed, accessRefusal, keyTypeOf } = await import("./access.ts");

const ana = {
  id: "c1",
  name: "Ana Lima",
  email: "ana@exemplo.com.br",
  phone: "+55 11 98888-1010",
  cpf: "123.456.789-09",
  identificationNumber: "AB123456",
  accessKey: "K-1",
};
const bruno = { id: "c2", name: "Bruno Souza", email: "bruno@exemplo.com.br", phone: "+55 11 97777-2020", cpf: "987.654.321-00" };
const carla = { id: "c3", name: "Carla Reis", email: "carla@exemplo.com.br", phone: "", inactive: true };

const list = (over = {}) => ({
  id: "al1",
  title: "Convênio",
  keyType: "EMAIL",
  maxAppointments: 0,
  interval: "UNDEF",
  days: 0,
  expiresAt: "",
  maxDate: "",
  agendaIds: [],
  serviceIds: [],
  loginRequired: false,
  helpText: "",
  useExternalList: false,
  externalApiUrl: "",
  unauthorizedMessage: "",
  clientIds: ["c1"],
  active: true,
  ...over,
});
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
const data = (over = {}) => ({ clients: [ana, bruno, carla], appointments: [], limits: [], accessLists: [list()], ...over });
const slot = { agendaId: "a1", serviceId: "s1" };
const at = (start) => ({ ...slot, start });
const TODAY = new Date(2026, 9, 12, 12, 0);

// Which lists are in force: on, covering the agenda and the service, and not past "Expira em".
{
  assert.equal(listsFor(data(), slot, TODAY).length, 1);
  assert.equal(listsFor(data({ accessLists: [list({ active: false })] }), slot, TODAY).length, 0, "desligada");
  assert.equal(listsFor(data({ accessLists: [list({ agendaIds: ["a2"] })] }), slot, TODAY).length, 0, "de outra agenda");
  assert.equal(listsFor(data({ accessLists: [list({ agendaIds: ["a1", "a2"] })] }), slot, TODAY).length, 1);
  assert.equal(listsFor(data({ accessLists: [list({ serviceIds: ["s2"] })] }), slot, TODAY).length, 0, "de outro serviço");
  assert.equal(listsFor(data({ accessLists: [list({ expiresAt: "11/10/2026" })] }), slot, TODAY).length, 0, "venceu ontem");
  assert.equal(listsFor(data({ accessLists: [list({ expiresAt: "12/10/2026" })] }), slot, TODAY).length, 1, "vale até o fim do dia em que expira");
  assert.equal(listsFor(data({ accessLists: [list({ expiresAt: "13/10/2026" })] }), slot, TODAY).length, 1);
}

// The personal link names the client by its access key, or by its id when it has none.
{
  assert.equal(clientByLink(data(), "K-1")?.id, "c1");
  assert.equal(clientByLink(data(), "c2")?.id, "c2", "sem chave, o id");
  assert.equal(clientByLink(data(), "c1"), null, "quem tem chave só abre por ela");
  assert.equal(clientByLink(data(), ""), null);
  assert.equal(clientByLink(data(), "desconhecida"), null);
  assert.equal(clientByLink(data(), "c3"), null, "cliente desativado não abre");
}

// What a key type asks for, and what it matches in the client.
{
  const lists = (keyType, ids = ["c1", "c2"]) => data({ accessLists: [list({ keyType, clientIds: ids })] });
  assert.equal(identify(lists("EMAIL"), slot, " ANA@exemplo.com.br ", TODAY)?.id, "c1", "e-mail sem caixa nem espaço");
  assert.equal(identify(lists("PHONE"), slot, "(11) 98888-1010", TODAY)?.id, "c1", "telefone sem o +55");
  assert.equal(identify(lists("PIN"), slot, "12345678909", TODAY)?.id, "c1", "CPF sem a máscara");
  assert.equal(identify(lists("CPF"), slot, "123.456.789-09", TODAY)?.id, "c1", "o 'CPF' do seed antigo vale como PIN");
  assert.equal(identify(lists("PASSPORT"), slot, "ab123456", TODAY)?.id, "c1", "passaporte");
  assert.equal(identify(lists("INVITE_CODE"), slot, "k-1", TODAY)?.id, "c1", "código de convite é a chave de acesso");
  assert.equal(identify(lists("CONTRACT"), slot, "K-1", TODAY)?.id, "c1", "número de contrato também");
  assert.equal(identify(lists("EMAIL"), slot, "bruno@exemplo.com.br", TODAY)?.id, "c2");
  assert.equal(identify(lists("EMAIL"), slot, "", TODAY), null, "vazio não abre");
  assert.equal(identify(lists("PIN", ["c2"]), slot, "123.456.789-09", TODAY), null, "só quem está na lista");
  assert.equal(identify(lists("EMAIL", ["c3"]), slot, "carla@exemplo.com.br", TODAY), null, "desativado não");
  assert.equal(identify(lists("PHONE", ["c3"]), slot, "", TODAY), null, "dois vazios não casam");
  assert.equal(keyTypeOf(list({ keyType: "CPF" })), "PIN");
  assert.equal(keyTypeOf(list({ keyType: "EMAIL" })), "EMAIL");
}

// Several lists: a client on any one that is in force gets in.
{
  const d = data({ accessLists: [list({ id: "x", keyType: "PIN", clientIds: ["c2"] }), list({ id: "y", keyType: "EMAIL", clientIds: ["c1"] })] });
  assert.equal(identify(d, slot, "ana@exemplo.com.br", TODAY)?.id, "c1");
  assert.equal(identify(d, slot, "987.654.321-00", TODAY)?.id, "c2");
  assert.equal(isListed(d, ana, slot, TODAY), true);
  assert.equal(isListed(d, bruno, slot, TODAY), true);
  assert.equal(isListed(d, { ...bruno, id: "c9" }, slot, TODAY), false);
}

// What to ask and what to say when the answer is no.
{
  assert.deepEqual(prompt(data({ accessLists: [list({ keyType: "PIN", helpText: "Informe o CPF do convênio." })] }), slot, TODAY), {
    label: "CPF",
    help: "Informe o CPF do convênio.",
  });
  assert.deepEqual(prompt(data({ accessLists: [list({ keyType: "INVITE_CODE" })] }), slot, TODAY), { label: "Código de Convite", help: "" });
  assert.equal(prompt(data({ accessLists: [] }), slot, TODAY).label, "Chave de acesso", "sem lista, um rótulo genérico");
  assert.equal(
    denied(data({ accessLists: [list({ unauthorizedMessage: " Não encontramos o seu CPF. " })] }), slot, TODAY),
    "Não encontramos o seu CPF.",
    "a mensagem da lista",
  );
  assert.match(denied(data({ accessLists: [list({ unauthorizedMessage: "   " })] }), slot, TODAY), /só para clientes autorizados/, "em branco, a do clone");
  assert.match(denied(data({ accessLists: [] }), slot, TODAY), /só para clientes autorizados/);
}

// The slot: a listed client may book; one who is not listed is denied; the list's own message wins.
{
  assert.equal(accessRefusal(data(), ana, at("2026-10-13T09:00"), TODAY), "");
  assert.match(accessRefusal(data(), bruno, at("2026-10-13T09:00"), TODAY), /só para clientes autorizados/);
  const own = data({ accessLists: [list({ unauthorizedMessage: "Procure a recepção." })] });
  assert.equal(accessRefusal(own, bruno, at("2026-10-13T09:00"), TODAY), "Procure a recepção.");
}

// "Agendar até" closes the days after it.
{
  const d = data({ accessLists: [list({ maxDate: "20/10/2026" })] });
  assert.equal(accessRefusal(d, ana, at("2026-10-20T09:00"), TODAY), "", "o próprio dia vale");
  assert.equal(accessRefusal(d, ana, at("2026-10-21T09:00"), TODAY), "Esta lista só permite agendar até 20/10/2026.");
  assert.equal(accessRefusal(d, ana, at("2026-10-13T09:00"), TODAY), "");
}

// The limit per period counts the client's own appointments, not cancelled ones, and says what it is.
{
  const per = (interval, over = {}, appts = []) => data({ accessLists: [list({ maxAppointments: 2, interval, ...over })], appointments: appts });
  const two = [appointment("c1", "2026-10-13T08:00"), appointment("c1", "2026-10-13T08:30")];

  assert.equal(accessRefusal(per("DIA", {}, two), ana, at("2026-10-13T09:00"), TODAY), "Você já atingiu o limite de 2 agendamento(s) por dia desta lista.");
  assert.equal(accessRefusal(per("DIA", {}, two), ana, at("2026-10-14T09:00"), TODAY), "", "no dia seguinte já cabe");
  assert.equal(accessRefusal(per("DIA", {}, [two[0]]), ana, at("2026-10-13T09:00"), TODAY), "", "com um só ainda cabe");
  assert.equal(
    accessRefusal(
      per("DIA", {}, [appointment("c1", "2026-10-13T08:00"), appointment("c1", "2026-10-13T08:30", "CANCELED")]),
      ana,
      at("2026-10-13T09:00"),
      TODAY,
    ),
    "",
    "cancelado não conta",
  );
  assert.equal(
    accessRefusal(per("DIA", {}, [appointment("c2", "2026-10-13T08:00"), appointment("c2", "2026-10-13T08:30")]), ana, at("2026-10-13T09:00"), TODAY),
    "",
    "só os dele",
  );

  assert.match(
    accessRefusal(per("SEMANA", {}, [appointment("c1", "2026-10-12T08:00"), appointment("c1", "2026-10-15T08:00")]), ana, at("2026-10-13T09:00"), TODAY),
    /por semana desta lista/,
  );
  assert.match(
    accessRefusal(per("MES", {}, [appointment("c1", "2026-10-01T08:00"), appointment("c1", "2026-10-30T08:00")]), ana, at("2026-10-13T09:00"), TODAY),
    /por mês desta lista/,
  );
  assert.equal(
    accessRefusal(
      per("MONTH", {}, [appointment("c1", "2026-10-01T08:00"), appointment("c1", "2026-10-30T08:00")]),
      ana,
      at("2026-10-13T09:00"),
      TODAY,
    ).includes("por mês"),
    true,
    "'MONTH' do seed antigo é por mês",
  );

  // Rolling windows: 15 and 30 days, and N.
  const near = [appointment("c1", "2026-10-05T08:00"), appointment("c1", "2026-10-10T08:00")];
  assert.match(accessRefusal(per("15D", {}, near), ana, at("2026-10-13T09:00"), TODAY), /em 15 dias corridos/);
  assert.match(accessRefusal(per("30D", {}, near), ana, at("2026-10-13T09:00"), TODAY), /em 30 dias corridos/);
  assert.match(accessRefusal(per("NDAYS", { days: 9 }, near), ana, at("2026-10-13T09:00"), TODAY), /em 9 dias corridos/);
  assert.equal(accessRefusal(per("NDAYS", { days: 3 }, near), ana, at("2026-10-13T09:00"), TODAY), "", "só um dentro de 3 dias");

  // "Sem Prazo": the total, whenever.
  const spread = [appointment("c1", "2026-01-01T08:00"), appointment("c1", "2026-08-01T08:00")];
  assert.equal(
    accessRefusal(per("UNDEF", {}, spread), ana, at("2026-10-13T09:00"), TODAY),
    "Você já atingiu o limite de 2 agendamento(s) no total desta lista.",
  );

  // No maximum, no limit.
  assert.equal(accessRefusal(per("DIA", { maxAppointments: 0 }, two), ana, at("2026-10-13T09:00"), TODAY), "");
}

// The list's own scope bounds the count: an appointment on an agenda it does not cover is not counted.
{
  const d = data({
    accessLists: [list({ maxAppointments: 1, interval: "DIA", agendaIds: ["a1"] })],
    appointments: [{ ...appointment("c1", "2026-10-13T08:00"), agendaId: "a2" }],
  });
  assert.equal(accessRefusal(d, ana, at("2026-10-13T09:00"), TODAY), "", "o agendamento da outra agenda não conta para esta lista");
}

// On several lists, one that allows it is enough; if none does, the first one's reason is given.
{
  const full = [appointment("c1", "2026-10-13T08:00")];
  const d = data({
    accessLists: [
      list({ id: "x", maxAppointments: 1, interval: "DIA", clientIds: ["c1"] }),
      list({ id: "y", maxAppointments: 5, interval: "DIA", clientIds: ["c1"] }),
    ],
    appointments: full,
  });
  assert.equal(accessRefusal(d, ana, at("2026-10-13T09:00"), TODAY), "", "a segunda lista ainda deixa");

  const both = data({
    accessLists: [list({ id: "x", maxDate: "01/10/2026", clientIds: ["c1"] }), list({ id: "y", maxAppointments: 1, interval: "DIA", clientIds: ["c1"] })],
    appointments: full,
  });
  assert.equal(
    accessRefusal(both, ana, at("2026-10-13T09:00"), TODAY),
    "Esta lista só permite agendar até 01/10/2026.",
    "nenhuma deixa: o motivo é o da primeira",
  );
}

// It leaves the data alone, and the global limits out of the access count.
{
  const d = data({
    accessLists: [list({ maxAppointments: 1, interval: "DIA" })],
    limits: [{ id: "g", type: "AGENDAMENTOS", key: "email", agendaIds: [], serviceIds: [], interval: "DIA", days: 0, max: 1 }],
  });
  const before = JSON.stringify(d);
  assert.equal(accessRefusal(d, ana, at("2026-10-13T09:00"), TODAY), "");
  assert.equal(JSON.stringify(d), before);
}

// The older seed's period names read as what the form offers now.
{
  const per = (interval, appts) => data({ accessLists: [list({ maxAppointments: 1, interval })], appointments: appts });
  assert.match(accessRefusal(per("DAY", [appointment("c1", "2026-10-13T08:00")]), ana, at("2026-10-13T09:00"), TODAY), /por dia/);
  assert.match(accessRefusal(per("WEEK", [appointment("c1", "2026-10-12T08:00")]), ana, at("2026-10-14T09:00"), TODAY), /por semana/);
}

// Nothing typed opens nothing: not a client with the field empty, not one whose access key is an empty string.
{
  const vazio = { id: "c8", name: "Sem Dados", email: "", phone: "", cpf: "", identificationNumber: "", accessKey: "" };
  const lists = (keyType) => data({ clients: [vazio, ana], accessLists: [list({ keyType, clientIds: ["c8", "c1"] })] });
  for (const type of ["EMAIL", "PHONE", "PIN", "PASSPORT", "INVITE_CODE"]) assert.equal(identify(lists(type), slot, "", TODAY), null, type);
  assert.equal(clientByLink(lists("EMAIL"), ""), null, "link sem chave");
}

// Several lists: the message comes from the first one that has one, and the reason from the first that refuses.
{
  const d = data({ accessLists: [list({ id: "x", unauthorizedMessage: "  " }), list({ id: "y", unauthorizedMessage: "Fale com a recepção." })] });
  assert.equal(denied(d, slot, TODAY), "Fale com a recepção.");
  assert.equal(accessRefusal(d, bruno, at("2026-10-13T09:00"), TODAY), "Fale com a recepção.");

  const reversed = data({
    accessLists: [list({ id: "x", maxAppointments: 1, interval: "DIA", clientIds: ["c1"] }), list({ id: "y", maxDate: "01/10/2026", clientIds: ["c1"] })],
    appointments: [appointment("c1", "2026-10-13T08:00")],
  });
  assert.match(accessRefusal(reversed, ana, at("2026-10-13T09:00"), TODAY), /limite de 1 agendamento\(s\) por dia/, "o motivo é o da primeira lista");
}

console.log("access ok");
