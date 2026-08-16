import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBackground } from "@/components/page-background";
import pageBg from "@/assets/colleges-bg.asset.json";
import { getInsights } from "@/lib/cap.functions";

const CATEGORIES = ["OPEN", "OBC", "SC", "ST", "EWS"] as const;

const insightsQuery = (category: string) =>
  queryOptions({
    queryKey: ["insights", category],
    queryFn: () => getInsights({ data: { category } }),
  });

const TITLE = "Insights — Maharashtra CAP Guide | MHT-CET Counselling Help";
const DESC =
  "Charts summarising official 2026 MHT-CET CAP cutoffs, district-wise college distribution and NAAC grades for the engineering colleges in this guide.";

export const Route = createFileRoute("/insights")({
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
  component: InsightsPage,
});

function Empty({ label }: { label?: string | undefined }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border/70 text-sm text-muted-foreground">
      {label ?? "Insufficient data for this chart"}
    </div>
  );
}

function ChartCard({
  title,
  caption,
  children,
  action,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {children}
        <p className="mt-3 text-sm text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}

function InsightsPage() {
  const [category, setCategory] = useState<string>("OPEN");
  const { data, isPending, isError } = useQuery(insightsQuery(category));

  const cutoff = data?.cutoffDistribution ?? [];
  const hasCutoff = cutoff.some((c) => c.count > 0);
  const districts = data?.districts ?? [];
  const naac = data?.naac ?? [];

  const loading = isPending ? "Loading data…" : undefined;
  const state = isError ? "Insufficient data for this chart" : loading;

  return (
    <div className="theme-accent-campus mx-auto max-w-6xl px-4 py-10">
      <PageBackground image={pageBg.url} />

      <h1 className="text-3xl font-bold tracking-tight text-foreground">Insights</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
        These charts summarize official 2026 CAP data and institutional indicators for
        the engineering colleges in this guide.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <ChartCard
          title={`CSE (${category}) Cutoff Distribution – 2026`}
          caption="Number of colleges whose published 2026 closing percentile for Computer Science and Engineering falls in each range."
          action={
            <div className="flex items-center gap-2">
              <Label htmlFor="ins-category" className="text-sm text-muted-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="ins-category" className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        >
          {state || !hasCutoff ? (
            <Empty label={state} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cutoff}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Colleges"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Colleges per District (in this guide)"
          caption="How the verified colleges in this guide are spread across Maharashtra districts."
        >
          {state || districts.length === 0 ? (
            <Empty label={state} />
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={districts} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="district"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Colleges"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="NAAC Grade Distribution"
          caption="Colleges grouped by their verified NAAC grade, where the grade has been published."
        >
          {state || naac.length === 0 ? (
            <Empty label={state} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={naac}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Colleges"
                  fill="currentColor"
                  className="fill-accent"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
