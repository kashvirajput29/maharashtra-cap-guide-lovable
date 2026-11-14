import { Link } from "@tanstack/react-router";
import { GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE, clearCompare, removeFromCompare, useCompareSelection } from "@/lib/compare-store";

export function CollegeComparisonTray({ colleges }: { colleges: { institute_code?: string | null; college_name: string }[] }) {
  const selection = useCompareSelection();
  if (!selection.length) return null;
  const names = new Map(colleges.map((c) => [(c.institute_code?.trim() || c.college_name.trim()).toLowerCase(), c.college_name]));
  return <aside aria-label="Comparison selection" className="fixed inset-x-0 bottom-0 z-[51] max-h-[45vh] overflow-y-auto border-t border-border bg-background/95 backdrop-blur">
    <div className="mx-auto grid max-w-6xl gap-2 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{selection.length} of {MAX_COMPARE} selected</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={clearCompare}><X className="mr-1 h-4 w-4" />Clear Selection</Button>
          {selection.length < 2 ? <Button size="sm" disabled><GitCompare className="mr-1 h-4 w-4" />Compare Now</Button> : <Button size="sm" asChild><Link to="/compare"><GitCompare className="mr-1 h-4 w-4" />Compare Now</Link></Button>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{selection.map((key) => <Button key={key} size="sm" variant="secondary" className="h-auto min-h-9 max-w-full whitespace-normal text-left" onClick={() => removeFromCompare(key)} aria-label={`Remove ${names.get(key) ?? key} from comparison`}><span className="min-w-0 break-words">{names.get(key) ?? key}</span><X className="ml-2 h-3.5 w-3.5 shrink-0" /></Button>)}</div>
    </div>
  </aside>;
}