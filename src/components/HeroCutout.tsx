import { m, type Variants } from 'framer-motion'
import { photoChips, profile } from '../data/profile'
import { imageUrl, PHOTO_MAX_WIDTH, PHOTO_SIZES, srcSet } from '../lib/images'
import { usePrefersReducedMotion } from '../lib/motion'
import { useHeroParallax } from '../lib/parallax'

const { photo } = profile
const { cutout } = photo
const largest = cutout.widths[cutout.widths.length - 1]

// Max pointer-parallax offsets (px). The glow moves against the pointer, the figure and chips with
// it, so the layers read as depth.
const PARALLAX = { glow: -12, figure: 6, chips: 10 }

const glass = 'border border-line/70 bg-surface/70 shadow-lg shadow-black/10 backdrop-blur-md'

interface Props {
  /** Hero entrance variants. Applied to this box itself: a transformed wrapper would become the
   *  containing block and break the height-based sizing. */
  variants: Variants
}

/**
 * Desktop hero figure (the hero mounts it at 1024 px+ only). Sized from the hero's height and
 * absolutely positioned, so it never affects layout; aspect-ratio fixes its box before the image
 * loads (zero layout shift). Likely the desktop LCP element: eager, fetchpriority high, preloaded.
 * The canvas network stays visible around it.
 *
 * Depth: a static mint silhouette glow (kept under reduced motion: it never moves) and, only
 * without reduced motion, a breathing radial glow, floating chips, and pointer parallax on three
 * layers (glow, figure, chips). The photo itself is never zoomed, scanned or otherwise effected.
 */
export function HeroCutout({ variants }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const { root, layer } = useHeroParallax(PARALLAX, !reducedMotion)

  return (
    // Box: the right side of the hero, bottom-aligned, 85% of the hero's height.
    <m.div
      variants={variants}
      className="pointer-events-none absolute bottom-0 right-6 h-[85%] w-[28rem]"
      style={{ maxHeight: PHOTO_MAX_WIDTH * (cutout.height / cutout.width) }}
    >
      <div
        ref={root}
        className="group pointer-events-auto absolute bottom-0 left-1/2 h-full -translate-x-1/2"
        style={{ aspectRatio: `${cutout.width} / ${cutout.height}` }}
      >
        {/* Soft mint → cyan glow behind head and shoulders (strength and breathing: .hero-glow). */}
        <div ref={layer('glow')} aria-hidden="true" className="absolute inset-0">
          <div className="hero-glow absolute left-1/2 top-[3%] h-[55%] w-[125%] -translate-x-1/2">
            <div
              className="h-full w-full rounded-full opacity-80 blur-3xl motion-safe:animate-breathe"
              style={{
                background:
                  'radial-gradient(closest-side, var(--accent), color-mix(in oklab, var(--accent-2) 70%, transparent) 55%, transparent)',
              }}
            />
          </div>
        </div>

        {/* The bottom fades into the page with a mask, so it works on either theme's background.
            The silhouette drop-shadow is static (never animate the filter) and sits on this wrapper,
            not the <img>: on the <img> itself Chrome tints the image's whole rectangle. Here it also
            follows the mask, so the shadow fades out at the bottom with the figure. */}
        <div
          ref={layer('figure')}
          className="relative h-full w-full [filter:drop-shadow(0_0_24px_var(--cutout-glow))]"
        >
          <picture className="block h-full w-full [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]">
            <source type="image/avif" srcSet={srcSet(cutout, 'avif')} sizes={PHOTO_SIZES} />
            <source type="image/webp" srcSet={srcSet(cutout, 'webp')} sizes={PHOTO_SIZES} />
            <img
              src={imageUrl(cutout, largest, 'webp')}
              alt={photo.alt}
              width={cutout.width}
              height={cutout.height}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-contain"
            />
          </picture>
        </div>

        {/* Glass chips: positioned by the outer element and floating on the inner one, so parallax
            and float never fight over one transform. Both stay clear of the face (top ~37%). */}
        <div ref={layer('chips')} className="pointer-events-none absolute inset-0">
          <div className="absolute -right-4 top-[41%]">
            <p
              // Full text color: muted text on glass over the photo fell below 4.5:1 in the light theme.
              className={`${glass} whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] text-text motion-safe:animate-float-a`}
            >
              {photoChips.stats}
            </p>
          </div>
          <div className="absolute right-[90%] top-[79%]">
            <p
              className={`${glass} flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-xs motion-safe:animate-float-b`}
            >
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              {photoChips.stack}
            </p>
          </div>
        </div>
      </div>
    </m.div>
  )
}
