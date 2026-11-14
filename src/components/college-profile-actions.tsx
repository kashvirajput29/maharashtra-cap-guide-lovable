import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GitCompare, Flag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MAX_COMPARE, toggleCompare, useCompareSelection } from "@/lib/compare-store";
import { MAX_OPTIONS, useOptionList } from "@/lib/option-form-store";
import { addCollegeBranch } from "@/lib/option-branch-store";

export function CollegeProfileActions({ identifier, name, branches }: { identifier: string; name: string; branches: string[] }) {
  const selection = useCompareSelection();
  const optionList = useOptionList();
  const [branch, setBranch] = useState("");
  const [added, setAdded] = useState(false);
  const [field, setField] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const recipient = import.meta.env['VITE_COLLEGE_REPORT_EMAIL'] as string | undefined;
  const selected = selection.includes(identifier);
  const optionLimit = optionList.length >= MAX_OPTIONS && !optionList.includes(name);
  return <div className="mt-5 grid gap-3">
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={!selected && selection.length >= MAX_COMPARE} onClick={() => toggleCompare(identifier)}><GitCompare className="mr-2 h-4 w-4" />{selected ? "Remove from comparison" : "Compare this college"}</Button>
      <Dialog><DialogTrigger asChild><Button variant="outline"><Flag className="mr-2 h-4 w-4" />Report outdated information</Button></DialogTrigger>
        <DialogContent><DialogHeader><DialogTitle>Report outdated information</DialogTitle><DialogDescription>{name}</DialogDescription></DialogHeader>
          <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (!recipient) return; const body = `College: ${name}\nField: ${field}\nDescription: ${description}\nContact: ${contact || "Not provided"}`; window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`College information report: ${name}`)}&body=${encodeURIComponent(body)}`; }}>
            <label className="grid gap-1 text-sm">Field<Input required value={field} onChange={(e) => setField(e.target.value)} maxLength={120} /></label>
            <label className="grid gap-1 text-sm">Description<Textarea required value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></label>
            <label className="grid gap-1 text-sm">Contact (optional)<Input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} /></label>
            {!recipient && <p role="status" className="text-sm text-muted-foreground">Reports are unavailable until a receiving email address is provided.</p>}
            <Button type="submit" disabled={!recipient}>Open email draft</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={branch} onValueChange={(v) => { setBranch(v); setAdded(false); }}><SelectTrigger className="min-w-0 sm:max-w-sm" aria-label="Choose a branch for option form" disabled={!branches.length}><SelectValue placeholder={branches.length ? "Choose verified branch" : "Not published yet"} /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
      <Button disabled={!branch || optionLimit} onClick={() => { addCollegeBranch(name, branch); setAdded(true); }}><Plus className="mr-2 h-4 w-4" />Add branch to option form</Button>
    </div>
    {optionLimit && <p className="text-sm text-muted-foreground">Your option list has reached its {MAX_OPTIONS}-college limit.</p>}
    {added && <p role="status" className="text-sm text-foreground">{branch} added. <Link to="/option-form" className="font-medium text-aqua hover:underline">View option list</Link></p>}
  </div>;
}