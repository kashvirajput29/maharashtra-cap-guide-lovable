import { useSyncExternalStore } from "react";

const KEY = "cap-option-form-list";
export const MAX_OPTIONS = 30;

let list: string[] = [];
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_OPTIONS)
      : [];
  } catch {
    return [];
  }
}

let hydrated = false;
function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    list = read();
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
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
  return list;
}

const serverSnapshot: string[] = [];

export function useOptionList() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export function toggleOption(collegeName: string) {
  ensureHydrated();
  if (list.includes(collegeName)) {
    list = list.filter((n) => n !== collegeName);
  } else {
    if (list.length >= MAX_OPTIONS) return false;
    list = [...list, collegeName];
  }
  emit();
  return true;
}

export function removeOption(collegeName: string) {
  ensureHydrated();
  list = list.filter((n) => n !== collegeName);
  emit();
}

export function clearOptions() {
  list = [];
  emit();
}

export function moveOption(collegeName: string, direction: -1 | 1) {
  ensureHydrated();
  const index = list.indexOf(collegeName);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  list = next;
  emit();
}

/** Add several colleges at once (e.g. from recommendations), keeping order and cap. */
export function addOptions(collegeNames: string[]) {
  ensureHydrated();
  const next = [...list];
  for (const name of collegeNames) {
    if (next.length >= MAX_OPTIONS) break;
    if (!next.includes(name)) next.push(name);
  }
  list = next;
  emit();
  return list.length;
}
