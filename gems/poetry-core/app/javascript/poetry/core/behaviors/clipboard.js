// useClipboard: copying text for one connect. The async Clipboard API
// where the page may use it, else a hidden textarea and execCommand; the
// copied flag resets after `resetAfter` and its timer clears at teardown.
import { scopeOf } from "@poetry/controllers/helpers/scope"

/**
 * A copier for the controller's current connect.
 *
 * @param {Object} controller - the Stimulus controller instance
 * @param {{ resetAfter?: number, onChange?: (copied: boolean) => void }} [options]
 *   how long the copied state lasts, in milliseconds, and who hears it change
 * @returns {{ copy: (text: string) => Promise<boolean> }} copy resolves true when the text reached the clipboard
 */
export function useClipboard(controller, { resetAfter = 2000, onChange = () => {} } = {}) {
  const scope = scopeOf(controller)
  let timer = null
  scope.defer(() => clearTimeout(timer))

  const copy = async (text) => {
    const copied = await write(text)
    if (!copied) return false

    clearTimeout(timer)
    onChange(true)
    timer = setTimeout(() => onChange(false), resetAfter)
    return true
  }

  return { copy }
}

const write = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Denied or unavailable: fall through to the textarea.
  }

  return fallback(text)
}

const fallback = (text) => {
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.opacity = "0"
  document.body.append(area)
  area.select()

  try {
    return document.execCommand?.("copy") === true
  } catch {
    return false
  } finally {
    area.remove()
  }
}
