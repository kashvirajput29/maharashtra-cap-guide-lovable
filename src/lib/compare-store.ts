import { useSyncExternalStore } from "react";

const KEY = "cap-compare-selection";
export const MAX_COMPARE = 3;

let selection: string[] = [];
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

let hydrated = false;
function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    selection = read();
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(selection));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureHydrated();
  return selection;
}

const serverSnapshot: string[] = [];

export function useCompareSelection() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export function toggleCompare(collegeName: string) {
  ensureHydrated();
  if (selection.includes(collegeName)) {
    selection = selection.filter((n) => n !== collegeName);
  } else {
    if (selection.length >= MAX_COMPARE) return false;
    selection = [...selection, collegeName];
  }
  emit();
  return true;
}

export function removeFromCompare(collegeName: string) {
  ensureHydrated();
  selection = selection.filter((n) => n !== collegeName);
  emit();
}

export function clearCompare() {
  selection = [];
  emit();
}
