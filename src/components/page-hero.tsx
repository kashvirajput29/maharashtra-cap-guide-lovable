import { cn } from "@/lib/utils";

type PageHeroProps = {
  /** CDN url of the hero background image. */
  image: string;
  title: string;
  subtitle?: string;
  /** Extra classes, e.g. negative top margin when nested in a padded container. */
  className?: string;
};

/**
 * Full-width page hero: cover background image, dark gradient overlay,
 * centered white title and subtle subtitle, fading smoothly into the
 * page content below. Breaks out of constrained parents (full bleed).
 */
export function PageHero({ image, title, subtitle, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative left-1/2 h-[200px] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden md:h-[280px]",
        className,
      )}
    >
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Dark overlay: strong at top, fading toward the bottom */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/10"
      />
      {/* Smooth fade into the content below */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background"
      />
      <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
