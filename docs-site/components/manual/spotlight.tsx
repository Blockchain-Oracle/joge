/*
 * A real capture with one part lit and the rest dimmed: the picture says one thing. `spot` is the lit rectangle in
 * percent of the image (left, top, width, height).
 */
export function Spotlight({
  src,
  alt,
  spot,
  label,
}: {
  src: string
  alt: string
  spot: [number, number, number, number]
  label?: string
}) {
  const [left, top, width, height] = spot
  return (
    <div className="relative overflow-hidden">
      {/* biome-ignore lint/performance/noImgElement: a static export; the file is pre-sized */}
      <img src={src} alt={alt} className="block h-auto w-full" />
      <div
        aria-hidden
        className="absolute rounded-[18px] shadow-[0_0_0_9999px_rgb(5_5_5/0.74)] ring-2 ring-vermilion"
        style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
      />
      {label ? (
        <span
          className="absolute -translate-y-full rounded-full bg-vermilion px-3 py-1 font-mono text-[12px] font-semibold text-white"
          style={{ left: `${left}%`, top: `calc(${top}% - 10px)` }}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
