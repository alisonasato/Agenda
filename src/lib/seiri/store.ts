"use client";

import { useSyncExternalStore } from "react";
import { EMPTY, seed } from "./seed";
import type { Data } from "./types";

const KEY = "seiri.data.v1";

let cache: Data | null = null;
const listeners = new Set<() => void>();

function write(data: Data) {
  cache = data;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private windows and blocked storage: the data still lives in memory for this session.
  }
}

function read(): Data {
  if (cache) return cache;
  let parsed: Data | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) parsed = JSON.parse(raw) as Data;
  } catch {
    parsed = null;
  }
  const data = parsed ?? seed();
  write(data);
  return data;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reads the browser's data. The prerendered HTML has none, so a page starts on its empty state and
 * fills in right after hydration — which is also why this reads in an effect instead of during render.
 */
export function useData(): Data {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Replaces the data and repaints every component reading it. */
export function update(change: (data: Data) => Data) {
  write(change(read()));
  listeners.forEach((l) => l());
}

/** Drops what this browser has stored and goes back to the seed. */
export function reset() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignored: the in-memory copy is cleared either way
  }
  read();
  listeners.forEach((l) => l());
}

/** Next id for a collection whose ids look like "ap12". */
export const nextId = (prefix: string, rows: { id: string }[]) =>
  `${prefix}${rows.reduce((max, r) => Math.max(max, Number(r.id.replace(/\D/g, "")) || 0), 0) + 1}`;
