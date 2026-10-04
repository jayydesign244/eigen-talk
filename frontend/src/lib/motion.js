// Shared motion language. Short, functional, and springy only where a
// physical metaphor (a key being pressed, a card landing) earns it.

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  plunk: [0.4, 0, 0.2, 1],
}

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 },
  soft: { type: 'spring', stiffness: 260, damping: 28 },
  bouncy: { type: 'spring', stiffness: 420, damping: 18 },
}

export const duration = { fast: 0.14, base: 0.22, slow: 0.42 }

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
