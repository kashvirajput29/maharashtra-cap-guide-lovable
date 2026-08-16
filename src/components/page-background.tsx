type PageBackgroundProps = {
  image: string;
  /** Blur radius in px (18–28 range). */
  blur?: number;
};

/**
 * Static, page-specific full-screen background.
 * Fixed, heavily blurred, and covered by a strong overlay so cards,
 * tables and text stay readable in light and dark themes.
 */
export function PageBackground({ image, blur = 22 }: PageBackgroundProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})`, filter: `blur(${blur}px)` }}
      />
      <div className="absolute inset-0 bg-background/82 dark:bg-background/88" />
    </div>
  );
}
