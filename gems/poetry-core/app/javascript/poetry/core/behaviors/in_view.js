// useInView: whether an element is on screen, for one connect, over
// IntersectionObserver. Reveal-on-scroll and lazy starts read it; the
// observer disconnects at teardown. Without IntersectionObserver the
// element counts as visible at once, so content never stays hidden.
import { scopeOf } from "@poetry/controllers/helpers/scope"

/**
 * Reports `element` entering and leaving the viewport (or `root`) until
 * teardown(controller). With `once`, it reports the first entry and stops.
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {Element} element - the element to watch
 * @param {(inView: boolean, entry?: IntersectionObserverEntry) => void} onChange - the handler
 * @param {{ root?: Element, rootMargin?: string, threshold?: number | number[], once?: boolean }} [options]
 * @returns {() => void} stops watching early; teardown stops it otherwise
 */
export function useInView(controller, element, onChange, options = {}) {
  const { once = false, ...observe } = options

  if (typeof IntersectionObserver === "undefined") {
    onChange(true)
    return () => {}
  }

  let stop = () => {}
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      onChange(entry.isIntersecting, entry)
      if (once && entry.isIntersecting) stop()
    }
  }, observe)
  observer.observe(element)
  stop = scopeOf(controller).defer(() => observer.disconnect())

  return stop
}
