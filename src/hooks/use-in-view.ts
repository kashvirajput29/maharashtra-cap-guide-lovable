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
    const init: IntersectionObserverInit = { threshold };
    if (rootMargin !== undefined) init.rootMargin = rootMargin;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      init,
    );
    observer.observe(el);
    // Safety net: in embedded/hidden containers (preview iframes, background
    // tabs) the observer may never fire, which would leave content invisible
    // and counters stuck at 0. Reveal the final state after a short delay.
    const fallback = setTimeout(() => setInView(true), 1500);
    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold, once, rootMargin, inView]);

  return { ref, inView };
}
