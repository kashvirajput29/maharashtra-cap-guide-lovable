import { Link } from "@tanstack/react-router";
import { Menu, GraduationCap, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { to: "/colleges", label: "Colleges" },
  { to: "/cutoffs", label: "Cutoffs" },
  { to: "/schedule", label: "Schedule" },
] as const;

const smartTools = [
  { to: "/recommend", label: "College Matchmaker" },
  { to: "/what-if", label: "Compare Scenarios" },
  { to: "/option-form", label: "Download My Options" },
] as const;

const secondaryItems = [
  { to: "/post-cap", label: "Post-CAP Process" },
  { to: "/faq", label: "FAQs" },
  { to: "/about", label: "About" },
] as const;

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-base font-semibold tracking-tight text-foreground">
              Maharashtra CAP Guide
            </span>
            <span className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Engineering Admissions
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`${linkClass} inline-flex items-center gap-1`}>
                  Smart Tools <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {smartTools.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {secondaryItems.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <nav className="mt-10 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Smart Tools
                  </p>
                  {smartTools.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 pl-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-3 h-px bg-border" />
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
