import { expect, test } from "bun:test";
import { clearCompare, toggleCompare } from "./compare-store.ts";
test("comparison accepts at most three colleges and toggling removes duplicates", () => {
  clearCompare();
  expect(toggleCompare("A")).toBe(true);
  expect(toggleCompare("B")).toBe(true);
  expect(toggleCompare("C")).toBe(true);
  expect(toggleCompare("D")).toBe(false);
  expect(toggleCompare("A")).toBe(true);
  expect(toggleCompare("D")).toBe(true);
  clearCompare();
});