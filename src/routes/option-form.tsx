import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { getOfficialColleges } from "@/lib/cap.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/cap-process-bg.asset.json";
import {
  MAX_OPTIONS,
  clearOptions,
  moveOption,
  removeOption,
  toggleOption,
  useOptionList,
} from "@/lib/option-form-store";

const collegesQuery = queryOptions({
  queryKey: ["colleges-official-2026"],
  queryFn: () => getOfficialColleges(),
});

const TITLE = "Smart Option Form — Maharashtra CAP Guide | MHT-CET Counselling Help";
const DESC =
  "Build and order a sample Maharashtra CAP option form from official 2026 college records, then print it or save it as a PDF for reference.";

export const Route = createFileRoute("/option-form")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(collegesQuery);
  },
  component: OptionFormPage,
});

type College = Awaited<ReturnType<typeof getOfficialColleges>>[number];

function branchLabel(college: College | undefined) {
  const raw = college?.branches_offered as unknown;
  if (!raw) return "Not verified yet";
  const parts = Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter(Boolean)
    : String(raw)
        .split(/[;,|]/)
        .map((v) => v.trim())
        .filter(Boolean);
  if (parts.length === 0) return "Not verified yet";
  if (parts.length === 1) return parts[0]!;
  return "Multiple branches";
}

function OptionFormPage() {
  const { data: colleges } = useSuspenseQuery(collegesQuery);
  const selected = useOptionList();
  const [search, setSearch] = useState("");

  const byName = useMemo(
    () => new Map(colleges.map((c) => [c.college_name, c] as const)),
    [colleges],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colleges.slice(0, 40);
    return colleges
      .filter(
        (c) =>
          c.college_name.toLowerCase().includes(q) ||
          (c.district ?? "").toLowerCase().includes(q) ||
          (c.city ?? "").toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [colleges, search]);

  const printedAt = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div
        data-no-print
        className="theme-accent-desk mx-auto max-w-6xl px-4 py-10 print:hidden"
      >
        <PageBackground image={pageBg.url} />

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Smart Option Form
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Build a sample CAP option form by selecting and ordering colleges. You can print
          or save this as a PDF to use as a reference while filling your actual CAP form.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Selection */}
          <Card className="border-border/70">
            <CardContent className="pt-6">
              <div className="grid gap-2">
                <Label htmlFor="option-search">Search colleges</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="option-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="College name, city or district"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {colleges.length} official 2026 colleges.
                  Select up to {MAX_OPTIONS}.
                </p>
              </div>

              <ul className="mt-4 max-h-[26rem] divide-y divide-border/70 overflow-y-auto rounded-xl border border-border">
                {filtered.map((c) => {
                  const isSelected = selected.includes(c.college_name);
                  return (
                    <li
                      key={c.id}
                      className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium text-foreground">
                          {c.college_name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[c.city, c.district].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        className="shrink-0 self-start rounded-lg"
                        onClick={() => toggleOption(c.college_name)}
                        disabled={!isSelected && selected.length >= MAX_OPTIONS}
                      >
                        {isSelected ? (
                          <>
                            <X className="mr-1 h-3.5 w-3.5" /> Remove
                          </>
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </li>

                  );
                })}
                {filtered.length === 0 && (
                  <li className="p-4 text-sm text-muted-foreground">
                    No colleges match this search.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Option list */}
          <Card className="border-border/70">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <ClipboardList className="h-5 w-5 text-primary" /> Your Option List (
                  {selected.length}/{MAX_OPTIONS})
                </h2>
                {selected.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={clearOptions}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear all
                  </Button>
                )}
              </div>

              {selected.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No colleges selected yet. Search on the left and add colleges in your
                  order of preference.
                </p>
              ) : (
                <ol className="mt-4 grid gap-2">
                  {selected.map((name, index) => {
                    const college = byName.get(name);
                    return (
                      <li
                        key={name}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-3 sm:flex-row sm:items-start"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-foreground">
                              {name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {[college?.city, college?.district]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Move ${name} up`}
                            disabled={index === 0}
                            onClick={() => moveOption(name, -1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Move ${name} down`}
                            disabled={index === selected.length - 1}
                            onClick={() => moveOption(name, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Remove ${name}`}
                            onClick={() => removeOption(name)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>

                    );
                  })}
                </ol>
              )}

              <Button
                type="button"
                size="lg"
                className="mt-5 w-full rounded-lg sm:w-auto"
                disabled={selected.length === 0}
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printer-friendly view */}
      <div className="hidden print:block print:p-0 print:text-black">
        <h1 className="text-xl font-bold">
          Sample CAP Option Form – Maharashtra CAP Guide
        </h1>
        <p className="mt-1 text-xs">Generated on {printedAt}</p>

        <table className="mt-4 w-full border-collapse text-xs">
          <thead>
            <tr>
              {[
                "Preference Order",
                "College Name",
                "City",
                "District",
                "Branch",
                "Official Website",
              ].map((h) => (
                <th
                  key={h}
                  className="border border-neutral-400 px-2 py-1 text-left font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selected.map((name, index) => {
              const c = byName.get(name);
              return (
                <tr key={name}>
                  <td className="border border-neutral-400 px-2 py-1">{index + 1}</td>
                  <td className="border border-neutral-400 px-2 py-1">{name}</td>
                  <td className="border border-neutral-400 px-2 py-1">{c?.city ?? "—"}</td>
                  <td className="border border-neutral-400 px-2 py-1">
                    {c?.district ?? "—"}
                  </td>
                  <td className="border border-neutral-400 px-2 py-1">
                    {branchLabel(c)}
                  </td>
                  <td className="break-all border border-neutral-400 px-2 py-1">
                    {c?.official_website_url ?? "Official website not verified yet"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-4 text-[10px] leading-relaxed">
          This is a sample option form generated from Maharashtra CAP Guide for personal
          reference. Always verify college codes and details on the official Maharashtra
          State CET Cell FE Engineering Portal: https://fe2026.mahacet.org
        </p>
      </div>
    </>
  );
}
