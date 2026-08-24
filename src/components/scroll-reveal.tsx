import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  /** Animation style: fade-up (cards), slide-left (section titles), fade (generic). */
  variant?: "fade-up" | "slide-left" | "fade";
  /** Stagger delay in ms (e.g. 0, 100, 200). */
  delay?: number;
  className?: string;
};

/**
 * Scroll-triggered reveal wrapper. Starts hidden, animates in when
 * 10% of the element is visible (once). Reduced-motion users see
 * content immediately with no animation.
 */
export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
}: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1, once: true });

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", `scroll-reveal-${variant}`, inView && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
