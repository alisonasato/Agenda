// node src/lib/seiri/accessExport.test.mjs — what the individual-access export and the invite template hold.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !s.endsWith(".ts") ? s + ".ts" : s, c); }');

const { ACCESS_EXPORT_HEADER, ACCESS_EXPORT_FILE, ACCESS_EXPORT_SHEET, intervalText, periodCount, accessExportRows } = await import("./accessExport.ts");
const { INVITE_TEMPLATE_SHEET, inviteTemplateFile } = await import("./inviteTemplate.ts");

const TODAY = new Date(2026, 9, 9, 15, 0); // Friday 09/10/2026

const list = (over = {}) => ({
  id: "l1",
  title: "VIP",
  keyType: "EMAIL",
  maxAppointments: 4,
  interval: "MES",
  days: 0,
  expiresAt: "",
  maxDate: "",
  agendaIds: [],
  serviceIds: [],
  clientIds: ["c1"],
  ...over,
});
const client = (over = {}) => ({ id: "c1", name: "Ana Lima", email: "ana@exemplo.com.br", phone: "+55 11 98888-1010", ...over });
const appt = (id, key, over = {}) => ({
  id,
  clientId: "c1",
  agendaId: "a1",
  serviceId: "s1",
  start: `${key}T09:00`,
  duration: 30,
  status: "CONFIRMED",
  ...over,
});
const dataOf = (over = {}) => ({ clients: [client()], accessLists: [list()], appointments: [], ...over });
const link = (c) => `https://exemplo.com.br/agendar/?cliente=${c.accessKey ?? c.id}`;

// The file, the sheet and the thirteen columns, as the original writes them.
{
  assert.equal(ACCESS_EXPORT_FILE, "individual_client_access.xlsx");
  assert.equal(ACCESS_EXPORT_SHEET, "Sheet1");
  assert.equal(ACCESS_EXPORT_HEADER.length, 13);
  assert.deepEqual(
    [...ACCESS_EXPORT_HEADER],
    [
      "Cliente ID",
      "Nome",
      "Email",
      "Telefone",
      "CNPJ",
      "Comentários",
      "Total de Agendamentos no Período Atual",
      "Limite de Agendamentos",
      "Período",
      "Data limite de Agendamento",
      "Link expira em",
      "Status",
      "Link de Agendamento",
    ],
  );
}

// The period column's wording.
{
  const text = (interval, days = 0) => intervalText(list({ interval, days }));
  assert.equal(text("DIA"), "Por Dia");
  assert.equal(text("SEMANA"), "Por semana");
  assert.equal(text("MES"), "Por Mês");
  assert.equal(text("15D"), "15 Dias Corridos");
  assert.equal(text("30D"), "30 Dias Corridos");
  assert.equal(text("NDAYS", 5), "5 Dias Corridos", "os dias da própria lista");
  assert.equal(text("UNDEF"), "", "sem prazo não tem período a nomear");
  assert.equal(text(""), "");
  assert.equal(text("QUALQUER"), "", "um valor que ninguém definiu não vira texto");
}

// What counts against a list right now, by its own period.
{
  const count = (interval, keys, over = {}, days = 0) =>
    periodCount(dataOf({ appointments: keys.map((k, i) => appt(`a${i}`, k, over)) }), "c1", list({ interval, days }), TODAY);

  // Day: today only.
  assert.equal(count("DIA", ["2026-10-09", "2026-10-08", "2026-10-10"]), 1);

  // Week runs Sunday to Saturday (04/10 to 10/10), the way the booking limits count it.
  assert.equal(count("SEMANA", ["2026-10-03", "2026-10-04", "2026-10-10", "2026-10-11"]), 2, "os dois extremos da semana entram, os vizinhos não");

  // Month: the calendar month, ends included.
  assert.equal(count("MES", ["2026-09-30", "2026-10-01", "2026-10-31", "2026-11-01"]), 2);

  // Rolling windows end today and count it; the future is outside them.
  assert.equal(count("15D", ["2026-09-24", "2026-09-25", "2026-10-09", "2026-10-10"]), 2, "15 dias: de 25/09 a hoje");
  assert.equal(count("30D", ["2026-09-09", "2026-09-10", "2026-10-09"]), 2, "30 dias: de 10/09 a hoje");
  assert.equal(count("NDAYS", ["2026-10-06", "2026-10-07", "2026-10-09"], {}, 3), 2, "N dias: os N terminando hoje");
  assert.equal(count("NDAYS", ["2026-10-09", "2026-10-08"], {}, 0), 1, "zero dias vale um: nunca uma janela vazia");

  // No period: everything that still stands.
  assert.equal(count("UNDEF", ["2020-01-01", "2026-10-09", "2030-01-01"]), 3);

  // A cancelled appointment does not count, nor does anyone else's.
  assert.equal(count("MES", ["2026-10-02", "2026-10-03"], { status: "CANCELED" }), 0);
  const mixed = dataOf({ appointments: [appt("a", "2026-10-02"), appt("b", "2026-10-02", { clientId: "c2" })] });
  assert.equal(periodCount(mixed, "c1", list({ interval: "MES" }), TODAY), 1, "só os do próprio cliente");
}

// The rows: the header, then one per client some list lets in.
{
  assert.deepEqual(accessExportRows(dataOf({ accessLists: [] }), link, TODAY), [[...ACCESS_EXPORT_HEADER]], "sem ninguém, só o cabeçalho");

  const rows = accessExportRows(
    dataOf({
      clients: [
        client(),
        client({ id: "c2", name: "Sem lista" }),
        client({ id: "c3", name: "Bruno", email: "", phone: "", inactive: true, accessKey: "K-9", companyCnpj: "12.345.678/0001-90" }),
      ],
      accessLists: [list({ clientIds: ["c1", "c3"], maxDate: "31/12/2026", expiresAt: "30/11/2026", maxAppointments: 2, interval: "SEMANA" })],
      appointments: [appt("a1", "2026-10-05")],
    }),
    link,
    TODAY,
  );
  assert.equal(rows.length, 3, "o cabeçalho e os dois que a lista deixa entrar");
  assert.ok(
    rows.every((r) => r.length === 13),
    "toda linha tem as treze colunas",
  );

  const [, ana, bruno] = rows;
  assert.deepEqual(ana, [
    "c1",
    "Ana Lima",
    "ana@exemplo.com.br",
    "+55 11 98888-1010",
    "",
    "",
    "1",
    2,
    "Por semana",
    "31/12/2026",
    "30/11/2026",
    "Ativo",
    "https://exemplo.com.br/agendar/?cliente=c1",
  ]);
  assert.equal(bruno[0], "K-9", "o Cliente ID é a chave de acesso, que o link também leva");
  assert.equal(bruno[4], "12.345.678/0001-90");
  assert.equal(bruno[11], "Inativo");
  assert.equal(bruno[12], "https://exemplo.com.br/agendar/?cliente=K-9");
  assert.equal(typeof ana[6], "string", "o total sai como texto, como a linha do original");
  assert.equal(typeof ana[7], "number", "e o limite como número");
}

// A client on several lists is described by the first.
{
  const rows = accessExportRows(
    dataOf({ accessLists: [list({ id: "l1", maxAppointments: 1, interval: "DIA" }), list({ id: "l2", maxAppointments: 9, interval: "MES" })] }),
    link,
    TODAY,
  );
  assert.equal(rows[1][7], 1);
  assert.equal(rows[1][8], "Por Dia");
}

// The invite template, as measured: sheet Clientes, email/nome, one example row, widths 34 and 28.
{
  assert.equal(INVITE_TEMPLATE_SHEET.name, "Clientes");
  assert.deepEqual(INVITE_TEMPLATE_SHEET.widths, [34, 28]);
  assert.deepEqual(INVITE_TEMPLATE_SHEET.rows, [
    ["email", "nome"],
    ["cliente@exemplo.com", "Nome do Cliente"],
  ]);
  assert.ok(!INVITE_TEMPLATE_SHEET.styledHeader, "o modelo não estiliza o cabeçalho");

  assert.equal(inviteTemplateFile(new Date(2026, 9, 10)), "modelo_convite_clientes_2026-10-10.xlsx", "medido: a data do dia no nome");
  assert.equal(inviteTemplateFile(new Date(2026, 0, 5)), "modelo_convite_clientes_2026-01-05.xlsx", "zero à esquerda");
}

console.log("accessExport ok");
