import { useSyncExternalStore } from "react";
import { addOptions } from "@/lib/option-form-store";
const KEY = "cap-option-branches";
const empty: Record<string, string> = {};
let values: Record<string, string> = empty;
let hydrated = false;
const listeners = new Set<() => void>();
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) values = Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === "string"));
  } catch { /* unavailable storage */ }
}
export function addCollegeBranch(name: string, branch: string) {
  hydrate();
  addOptions([name]);
  values = { ...values, [name]: branch };
  try { window.localStorage.setItem(KEY, JSON.stringify(values)); } catch { /* unavailable storage */ }
  listeners.forEach((listener) => listener());
}
export function useOptionBranches() {
  return useSyncExternalStore((listener) => { hydrate(); listeners.add(listener); return () => { listeners.delete(listener); }; }, () => { hydrate(); return values; }, () => empty);
}