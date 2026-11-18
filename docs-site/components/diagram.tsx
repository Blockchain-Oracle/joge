import { ImageZoom } from "fumadocs-ui/components/image-zoom"
import { DIAGRAM_SCALE, DIAGRAMS, type DiagramName } from "@/lib/diagrams"

/*
 * An architecture diagram, drawn from its source in .github/diagrams in Jōge's own colours: the light
 * picture in light mode, the dark one in dark, either one opening full size on a tap.
 */
export function Diagram({ name, alt, caption }: { name: DiagramName; alt: string; caption?: string }) {
  const { width, height } = DIAGRAMS[name]
  return (
    <figure className="not-prose mx-auto my-8" style={{ maxWidth: width / DIAGRAM_SCALE }}>
      <div className="overflow-hidden rounded-xl border border-fd-border">
        <ImageZoom
          src={`/diagrams/${name}-light.png`}
          alt={alt}
          width={width}
          height={height}
          className="block w-full dark:hidden"
        />
        <ImageZoom
          src={`/diagrams/${name}-dark.png`}
          alt={alt}
          width={width}
          height={height}
          className="hidden w-full dark:block"
        />
      </div>
      {caption ? <figcaption className="mt-2.5 text-[13px] text-fd-muted-foreground">{caption}</figcaption> : null}
    </figure>
  )
}
