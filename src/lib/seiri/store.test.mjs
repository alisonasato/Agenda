// node src/lib/seiri/store.test.mjs — the localStorage layer: what survives a reload, without a browser.
import assert from "node:assert/strict";
import { register } from "node:module";

// Node wants the extension that the source's own imports leave out. Unlike the other test files
// this one also imports with a "?fresh=N" query, so the pattern has to let an extension plus a
// query through untouched.
register('data:text/javascript,export function resolve(s, c, next) { return next(s[0] === "." && !/\\.(ts|mjs|js|json)(\\?|$)/.test(s) ? s + ".ts" : s, c); }');

const KEY = "seiri.data.v1";

/** A localStorage that can be told to throw, the way a private window does. */
function fakeStorage({ failRead = false, failWrite = false } = {}) {
  const map = new Map();
  return {
    map,
    getItem: (k) => {
      if (failRead) throw new Error("storage bloqueado");
      return map.has(k) ? map.get(k) : null;
    },
    setItem: (k, v) => {
      if (failWrite) throw new Error("cota excedida");
      map.set(k, String(v));
    },
    removeItem: (k) => map.delete(k),
  };
}

/**
 * A store that has never been imported before. The module keeps `cache` and `listeners` at module
 * scope, so every scenario needs its own instance; a distinct query gives one.
 */
let n = 0;
async function freshStore(storage) {
  globalThis.localStorage = storage;
  return import(`./store.ts?fresh=${++n}`);
}

/** The data the store hands to `update`, which is the only way in to the private `read`. */
function dataOf(store) {
  let seen;
  store.update((d) => {
    seen = d;
    return d;
  });
  return seen;
}

const stored = (storage) => JSON.parse(storage.map.get(KEY));

const { seed } = await import("./seed.ts");
const SEED = seed();

// A browser with nothing stored starts on the seed, and the seed is written at once.
{
  const storage = fakeStorage();
  const store = await freshStore(storage);
  const data = dataOf(store);

  assert.equal(data.agendas.length, SEED.agendas.length);
  assert.equal(data.profile.orgSlug, SEED.profile.orgSlug);
  assert.ok(storage.map.has(KEY), "a primeira leitura já grava, para o reload achar algo");
  assert.equal(stored(storage).profile.orgSlug, SEED.profile.orgSlug);
}

// What was stored wins over the seed.
{
  const storage = fakeStorage();
  storage.map.set(KEY, JSON.stringify({ ...SEED, agendas: [], clients: [{ id: "c9", name: "Ana" }] }));
  const data = await freshStore(storage).then(dataOf);

  assert.deepEqual(data.agendas, [], "uma coleção esvaziada continua vazia");
  assert.equal(data.clients.length, 1);
  assert.equal(data.clients[0].name, "Ana");
}

// The bug this merge exists for: a field added after the browser's copy was written must not come
// back undefined. credits, profile and plan are merged key by key for exactly this.
{
  const storage = fakeStorage();
  storage.map.set(
    KEY,
    JSON.stringify({
      ...SEED,
      credits: { general: 42 },
      profile: { orgSlug: "outraempresa" },
      plan: { name: "Plano Pago" },
    }),
  );
  const data = await freshStore(storage).then(dataOf);

  assert.equal(data.credits.general, 42, "o que estava gravado continua");
  assert.equal(data.credits.sms, SEED.credits.sms, "e o campo que não existia vem do seed");
  assert.equal(data.credits.paymentMethod, SEED.credits.paymentMethod);
  assert.ok("autoRecharge" in data.credits);

  assert.equal(data.profile.orgSlug, "outraempresa");
  assert.equal(data.profile.notificationSound, SEED.profile.notificationSound);
  assert.equal(data.profile.emailVerified, SEED.profile.emailVerified);

  assert.equal(data.plan.name, "Plano Pago");
  assert.equal(data.plan.appointmentsMax, SEED.plan.appointmentsMax);
  assert.equal(data.plan.limits, SEED.plan.limits);

  // Nothing in the three may be undefined, which is the shape the forms break on.
  for (const key of ["credits", "profile", "plan"]) {
    for (const [field, value] of Object.entries(data[key])) assert.notEqual(value, undefined, `${key}.${field} ficou undefined`);
  }
}

// A whole collection added after the copy was written comes from the seed too.
{
  const storage = fakeStorage();
  const old = { ...SEED };
  delete old.webhooks;
  delete old.domains;
  delete old.clientImports;
  storage.map.set(KEY, JSON.stringify(old));
  const data = await freshStore(storage).then(dataOf);

  for (const key of ["webhooks", "domains", "clientImports"]) assert.notEqual(data[key], undefined, `${key} ficou undefined`);
  assert.deepEqual(data.webhooks, SEED.webhooks);
}

// The maps are deliberately NOT merged: a key the user removed has to stay removed. This is the
// asymmetry that makes the merge above look inconsistent, so it is pinned here.
{
  const storage = fakeStorage();
  storage.map.set(KEY, JSON.stringify({ ...SEED, hours: {}, integrations: {}, orgSettings: {} }));
  const data = await freshStore(storage).then(dataOf);

  assert.deepEqual(data.hours, {}, "uma agenda sem horários não os recupera do seed");
  assert.deepEqual(data.integrations, {});
  assert.deepEqual(data.orgSettings, {});
}

// supportCode is nullable, so a stored null must survive rather than fall back to the seed.
{
  const storage = fakeStorage();
  storage.map.set(KEY, JSON.stringify({ ...SEED, supportCode: null }));
  assert.equal((await freshStore(storage).then(dataOf)).supportCode, null);

  const withCode = fakeStorage();
  withCode.map.set(KEY, JSON.stringify({ ...SEED, supportCode: { token: "ABC123", expires: "2026-09-24T10:00" } }));
  assert.equal((await freshStore(withCode).then(dataOf)).supportCode.token, "ABC123");
}

// Storage that cannot be read or written never takes the page down.
{
  const broken = fakeStorage();
  broken.map.set(KEY, "{ isto não é json");
  const data = await freshStore(broken).then(dataOf);
  assert.equal(data.agendas.length, SEED.agendas.length, "um blob corrompido volta para o seed");

  const unreadable = await freshStore(fakeStorage({ failRead: true })).then(dataOf);
  assert.equal(unreadable.agendas.length, SEED.agendas.length, "getItem que lança volta para o seed");

  // The private-window case: setItem throws, and the data still works for this session.
  const unwritable = fakeStorage({ failWrite: true });
  const store = await freshStore(unwritable);
  const first = dataOf(store);
  assert.equal(first.agendas.length, SEED.agendas.length);
  assert.equal(unwritable.map.size, 0, "nada foi gravado");
  store.update((d) => ({ ...d, tags: [] }));
  assert.deepEqual(dataOf(store).tags, [], "e a mudança vale na memória mesmo assim");
}

// update writes through, and the next update sees what the last one left.
{
  const storage = fakeStorage();
  const store = await freshStore(storage);

  store.update((d) => ({ ...d, tags: [{ id: "t1", name: "Retorno", color: "#48CFAE" }] }));
  assert.equal(stored(storage).tags.length, 1, "gravou");

  store.update((d) => ({ ...d, tags: [...d.tags, { id: "t2", name: "Convênio", color: "#D42325" }] }));
  assert.deepEqual(
    dataOf(store).tags.map((t) => t.id),
    ["t1", "t2"],
    "a segunda chamada enxerga a primeira",
  );
  assert.equal(stored(storage).tags.length, 2);
}

// reset drops the browser's copy and goes back to the seed.
{
  const storage = fakeStorage();
  const store = await freshStore(storage);
  store.update((d) => ({ ...d, agendas: [], tags: [] }));
  assert.deepEqual(stored(storage).agendas, []);

  store.reset();
  const data = dataOf(store);
  assert.equal(data.agendas.length, SEED.agendas.length, "voltou ao seed");
  assert.equal(data.tags.length, SEED.tags.length);
  assert.equal(stored(storage).agendas.length, SEED.agendas.length, "e regravou o seed");
}

// Once read, the in-memory copy is what answers: another tab's write is not picked up by itself.
{
  const storage = fakeStorage();
  const store = await freshStore(storage);
  dataOf(store);
  storage.map.set(KEY, JSON.stringify({ ...SEED, agendas: [] }));
  assert.equal(dataOf(store).agendas.length, SEED.agendas.length, "o cache responde, não o storage");
}

// nextId: one past the highest number already used.
{
  const { nextId } = await freshStore(fakeStorage());
  assert.equal(nextId("ap", []), "ap1", "a primeira linha de uma coleção vazia");
  assert.equal(nextId("ap", [{ id: "ap1" }, { id: "ap2" }]), "ap3");
  assert.equal(nextId("ap", [{ id: "ap9" }, { id: "ap11" }, { id: "ap2" }]), "ap12", "é o maior número, não a contagem");
  assert.equal(nextId("c", [{ id: "c7" }]), "c8");
  assert.equal(nextId("ap", [{ id: "ap3" }, { id: "semnumero" }]), "ap4", "um id sem dígitos conta como zero");
  assert.equal(nextId("ap", [{ id: "semnumero" }]), "ap1");
  assert.equal(nextId("x", [{ id: "ap2026-09" }]), "x202610", "os dígitos são lidos juntos, sem os separadores");
}

console.log("store ok");
