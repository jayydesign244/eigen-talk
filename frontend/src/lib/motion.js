// Shared motion language, tuned to CRED 6.1: 200 / 300 / 500ms with
// FastOutSlowIn, sheets that decelerate in, and springs only where a physical
// metaphor (a key being pressed, a card landing) earns it.

export const ease = {
  out: [0.4, 0, 0.2, 1], // FastOutSlowIn, CRED's default
  inOut: [0.43, 0, 0.58, 1], // CRED's one custom curve
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  plunk: [0.37, 0, 0.63, 1], // Android AccelerateDecelerate, 50ms key press
}

export const spring = {
  // Compose defaults CRED uses: damping ratio 1 / stiffness 1500, and 0.75 / 200.
  snappy: { type: 'spring', stiffness: 1500, damping: 77 },
  soft: { type: 'spring', stiffness: 200, damping: 21 },
  bouncy: { type: 'spring', stiffness: 420, damping: 18 },
  // NeoPOP press: stiffness 6000, critically damped (no bounce).
  press: { type: 'spring', stiffness: 6000, damping: 155 },
}

export const duration = { press: 0.05, fast: 0.2, base: 0.3, slow: 0.5, sheet: 0.35 }

/** Page / section entrance: rise 10px and fade. */
export const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
}

/** Parent that staggers its children's `rise`. */
export const stagger = (gap = 0.05, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Card landing: tiny scale + rise, like it was set down on a desk. */
export const land = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.soft },
  exit: { opacity: 0, scale: 0.96, transition: { duration: duration.fast } },
}

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}
