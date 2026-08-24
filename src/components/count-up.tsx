import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

type CountUpProps = {
  /** Final number to count up to. */
  value: number;
  /** Animation duration in ms. Default 1500 (1.5s). */
  duration?: number;
  className?: string;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts from 0 to `value` over `duration` ms with ease-out timing,
 * starting when the element scrolls into view (10% threshold, once).
 * Reduced-motion users see the final number immediately.
 */
export function CountUp({ value, duration = 1500, className }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.1, once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOutCubic(progress) * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
    </span>
  );
}
