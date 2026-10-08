"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Per-browser view preferences: which optional columns a list shows, and anything else that is a
 * choice about looking rather than a fact about the account.
 *
 * Deliberately apart from `seiri.data.v1`. That store models what a server would own, collection by
 * collection, and `docs/database/schema.sql` turns it into tables; a column someone ticked is not
 * account data and has no business becoming a column in a database. The original keeps these in
 * localStorage too, one key per checkbox (`check_owner`, `check_tags`…); the clone keeps the same
 * idea in one namespaced key.
 */
const KEY = "seiri.view.v1";

type Prefs = Record<string, string[]>;

let cache: Prefs | null = null;
const listeners = new Set<() => void>();

/** Everything saved. Exported so the behaviour can be tested without a renderer. */
export function readPrefs(): Prefs {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    // Guards against a stored `null`, which is the one shape that throws on the lookup below;
    // a stray array, string or number just reads as undefined and falls back on its own.
    cache = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Prefs) : {};
  } catch {
    // Private windows and blocked storage: the choice still holds for this session.
    cache = {};
  }
  return cache;
}

function write(next: Prefs) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignored: the in-memory copy is what the page reads
  }
  listeners.forEach((l) => l());
}

/**
 * The set saved under `name`, or `fallback` while nothing has been saved. An empty set that was
 * saved stays empty: it means everything was switched off, not "start again from the default".
 */
export function selectedIn(name: string, fallback: string[]): string[] {
  return readPrefs()[name] ?? fallback;
}

/** Adds or removes one id from that set, and saves the result. */
export function toggleIn(name: string, id: string, fallback: string[]): string[] {
  const current = selectedIn(name, fallback);
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  write({ ...readPrefs(), [name]: next });
  return next;
}

/** Drops everything saved; for tests and for a reset. */
export function clearPrefs() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignored
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * A remembered set of choices under `name`, starting from `fallback` the first time. Returns the
 * prerendered `fallback` until hydration, like `useData`, so the server and the first paint agree.
 */
export function useViewPref(name: string, fallback: string[]) {
  const selected = useSyncExternalStore(
    subscribe,
    () => selectedIn(name, fallback),
    () => fallback,
  );

  const toggle = useCallback((id: string) => toggleIn(name, id, fallback), [name, fallback]);

  return [selected, toggle] as const;
}
