type PageHeroProps = {
  /** CDN url of the hero background image. */
  image: string;
  title: string;
  subtitle?: string;
};

/**
 * Full-width page hero: cover background image, dark gradient overlay,
 * centered white title and subtle subtitle, fading smoothly into the
 * page content below.
 */
export function PageHero({ image, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative h-[200px] w-full overflow-hidden md:h-[280px]">
      <img
        src={image}
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Dark overlay: solid at top, fading to transparent at the bottom */}
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
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
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
