import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return <div className={cn("shimmer h-4 rounded-md", className)} />;
}

/** Filter bar + result count placeholder used above lists and tables. */
export function FiltersSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="shimmer h-10 rounded-lg" />
      ))}
    </div>
  );
}

/** Card grid placeholder matching the college / notice card shape. */
export function CardListSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/70 bg-card p-5 sm:p-6">
          <Bar className="h-5 w-3/4" />
          <Bar className="mt-3 w-1/2" />
          <Bar className="mt-2 h-3 w-2/5" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="shimmer h-6 w-20 rounded-full" />
            <div className="shimmer h-6 w-16 rounded-full" />
            <div className="shimmer h-6 w-24 rounded-full" />
          </div>
          <div className="shimmer mt-5 h-9 w-36 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Table placeholder matching the cutoff table shape (with mobile cards). */
export function TableSkeleton({
  rows = 8,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div aria-hidden="true">
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-4">
            <Bar className="w-3/4" />
            <Bar className="mt-2 w-1/2" />
            <div className="mt-3 flex gap-1.5">
              <div className="shimmer h-6 w-16 rounded-full" />
              <div className="shimmer h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/70 md:block">
        <div
          className="grid gap-4 border-b border-border/70 bg-secondary/40 p-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Bar key={i} className="h-3.5" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid gap-4 border-b border-border/50 p-3 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Bar key={c} className="h-3.5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Page-level skeleton: heading, filters, then content placeholder. */
export function ListPageSkeleton({ variant }: { variant: "cards" | "table" }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="shimmer h-[200px] w-full rounded-2xl sm:h-[280px]" />
      <Bar className="mt-8 h-6 w-56" />
      <FiltersSkeleton />
      <Bar className="mt-5 h-3.5 w-40" />
      <div className="mt-4">
        {variant === "cards" ? <CardListSkeleton /> : <TableSkeleton />}
      </div>
    </div>
  );
}
