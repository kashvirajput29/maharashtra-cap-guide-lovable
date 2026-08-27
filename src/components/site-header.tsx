import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, GraduationCap, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

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
  "nav-underline relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary";

const mobileLinkClass =
  "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const toolsActive = smartTools.some((t) => pathname.startsWith(t.to));

  useEffect(() => {
    if (toolsActive) setMobileToolsOpen(true);
  }, [toolsActive]);

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const openWithDelay = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setToolsOpen(true), 200);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setToolsOpen(false), 150);
  };

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

            <div
              onMouseEnter={openWithDelay}
              onMouseLeave={closeWithDelay}
              className="relative"
            >
              <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      linkClass,
                      "inline-flex items-center gap-1",
                      toolsActive && "bg-primary/10 text-primary",
                    )}
                  >
                    Smart Tools
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        toolsOpen && "rotate-180",
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-60 rounded-xl border-border/70 bg-popover p-1.5 shadow-xl duration-200"
                >
                  {smartTools.map((item) => {
                    const active = pathname.startsWith(item.to);
                    return (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "nav-underline relative cursor-pointer rounded-lg px-3 py-2 text-sm font-medium",
                            active && "bg-primary/10 text-primary",
                          )}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
              <SheetContent
                side="right"
                overlayClassName="bg-background/40 backdrop-blur-sm"
                className="w-72 overflow-y-auto"
              >
                <nav className="mt-10 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={mobileLinkClass}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    type="button"
                    aria-expanded={mobileToolsOpen}
                    onClick={() => setMobileToolsOpen((v) => !v)}
                    className={cn(
                      "mt-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary",
                      toolsActive ? "bg-primary/10 text-primary" : "text-foreground",
                    )}
                  >
                    Smart Tools
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        mobileToolsOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid overflow-hidden transition-all duration-200 ease-out",
                      mobileToolsOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="flex min-h-0 flex-col gap-1">
                      {smartTools.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={cn(mobileLinkClass, "pl-5")}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="my-3 h-px bg-border" />
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={mobileLinkClass}
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
