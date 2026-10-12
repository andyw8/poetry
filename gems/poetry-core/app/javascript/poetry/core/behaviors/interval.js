// useInterval and useTimeout: timers that live for one connect. The
// clears are registered for you, so a ticker or an autoplay never fires
// into a disconnected controller.
import { scopeOf } from "@poetry/controllers/helpers/scope"

/**
 * Calls `callback` every `milliseconds` until teardown(controller).
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {() => void} callback - the tick
 * @param {number} milliseconds - the period
 * @returns {() => void} stops the interval early; teardown stops it otherwise
 */
export function useInterval(controller, callback, milliseconds) {
  const id = setInterval(callback, milliseconds)

  return scopeOf(controller).defer(() => clearInterval(id))
}

/**
 * Calls `callback` once after `milliseconds`, unless teardown(controller)
 * comes first.
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {() => void} callback - the delayed call
 * @param {number} milliseconds - the delay
 * @returns {() => void} cancels early; teardown cancels otherwise
 */
export function useTimeout(controller, callback, milliseconds) {
  const scope = scopeOf(controller)
  let cancel = () => {}
  const id = setTimeout(() => {
    cancel()
    callback()
  }, milliseconds)
  cancel = scope.defer(() => clearTimeout(id))

  return cancel
}
