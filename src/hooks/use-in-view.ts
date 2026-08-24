import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  /** Intersection threshold — fraction of the element that must be visible. */
  threshold?: number;
  /** Stop observing after the first time the element becomes visible. */
  once?: boolean;
  /** Root margin passed to IntersectionObserver. */
  rootMargin?: string;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Observe when an element enters the viewport.
 * Defaults: threshold 0.1 (10% visible), triggers once.
 * Users with prefers-reduced-motion are treated as always in view
 * so content renders in its final state without animation.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const { threshold = 0.1, once = true, rootMargin } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean>(() => prefersReducedMotion());

  useEffect(() => {
    if (inView && once) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin, inView]);

  return { ref, inView };
}
