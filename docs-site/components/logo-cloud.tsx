import type { CSSProperties } from "react"

/*
 * The services, chains and wallets Jōge works with, as an endless row with faded edges and a slow drift, on one
 * CSS keyframe (no animation library). Real marks in their own colours, each on a small white tile like the app's
 * wallet row; hover pauses the row.
 */

export type Brand = { name: string; logo?: string }

/** One brand's real mark (a file in public/logos), also used inline in tables. */
export function Logo({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const src = `/logos/${name}`
  return (
    // biome-ignore lint/performance/noImgElement: a static export; the marks are tiny pre-sized files
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-[22%] object-contain align-[-0.22em] ${className}`}
    />
  )
}

function Mark({ brand }: { brand: Brand }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5 text-fd-foreground/80">
      {brand.logo ? (
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-white shadow-[0_1px_0_rgb(0_0_0/0.04),0_6px_16px_-10px_rgb(0_0_0/0.3)] ring-1 ring-black/5">
          <Logo name={brand.logo} size={20} />
        </span>
      ) : null}
      <span className="text-[14px] font-medium whitespace-nowrap">{brand.name}</span>
    </span>
  )
}

export function LogoCloud({ brands, seconds = 60 }: { brands: Brand[]; seconds?: number }) {
  return (
    <div
      className="not-prose group overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      aria-label={brands.map((b) => b.name).join(", ")}
      role="img"
    >
      <div
        className="flex w-max group-hover:[animation-play-state:paused] motion-safe:animate-[marquee_var(--marquee)_linear_infinite]"
        style={{ "--marquee": `${seconds}s` } as CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-10 pe-10" aria-hidden={copy === 1}>
            {brands.map((b) => (
              <Mark key={b.name} brand={b} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
