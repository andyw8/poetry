// useMutation: changes under an element for one connect, over
// MutationObserver; the observer disconnects at teardown. The default
// watches children added and removed anywhere below.
import { scopeOf } from "@poetry/controllers/helpers/scope"

/**
 * Reports mutations under `element` until teardown(controller).
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {Node} element - the node to observe
 * @param {(records: MutationRecord[]) => void} onMutate - the handler
 * @param {MutationObserverInit} [options] - what to watch; children in the subtree by default
 * @returns {() => void} stops observing early; teardown stops it otherwise
 */
export function useMutation(controller, element, onMutate, options = { childList: true, subtree: true }) {
  const observer = new MutationObserver(onMutate)
  observer.observe(element, options)

  return scopeOf(controller).defer(() => observer.disconnect())
}
