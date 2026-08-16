import { Link } from "@tanstack/react-router";
import { Menu, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/colleges", label: "Colleges" },
  { to: "/cap-process", label: "CAP Process" },
  { to: "/important-dates", label: "Important Dates" },
  { to: "/post-cap", label: "Post-CAP Process" },
  { to: "/faq", label: "FAQs" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight text-foreground">
              Maharashtra CAP Guide
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              MHT-CET Counselling
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-10 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
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
