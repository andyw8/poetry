// useMeasure: an element's size for one connect, over ResizeObserver.
// The handler runs now with the current size and again on every change;
// the observer disconnects at teardown. Without ResizeObserver it runs
// once.
import { scopeOf } from "@poetry/controllers/helpers/scope"

/**
 * Reports `element`'s content box until teardown(controller).
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {Element} element - the element to measure
 * @param {(size: { width: number, height: number }) => void} onResize - the handler
 * @returns {() => void} stops measuring early; teardown stops it otherwise
 */
export function useMeasure(controller, element, onResize) {
  const rect = element.getBoundingClientRect()
  onResize({ width: rect.width, height: rect.height })

  if (typeof ResizeObserver === "undefined") return () => {}

  const observer = new ResizeObserver((entries) => {
    const box = entries[entries.length - 1]?.contentRect
    if (box) onResize({ width: box.width, height: box.height })
  })
  observer.observe(element)

  return scopeOf(controller).defer(() => observer.disconnect())
}
