import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useInterval, useTimeout } from "@poetry/controllers/behaviors/interval"
import { useInView } from "@poetry/controllers/behaviors/in_view"
import { useMeasure } from "@poetry/controllers/behaviors/measure"
import { useMutation } from "@poetry/controllers/behaviors/mutation"
import { useClipboard } from "@poetry/controllers/behaviors/clipboard"
import { hasScope, teardown } from "@poetry/controllers/helpers/scope"

// The effect behaviors the registry porting work asks for: timers,
// visibility, size, mutations and the clipboard, each living for one
// connect and undone by teardown(controller).

describe("useInterval / useTimeout", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("ticks until teardown", () => {
    const controller = {}
    const tick = vi.fn()
    useInterval(controller, tick, 100)
    vi.advanceTimersByTime(350)
    expect(tick).toHaveBeenCalledTimes(3)

    teardown(controller)
    vi.advanceTimersByTime(500)
    expect(tick).toHaveBeenCalledTimes(3)
    expect(hasScope(controller)).toBe(false)
  })

  it("stops early through its own return", () => {
    const controller = {}
    const tick = vi.fn()
    const stop = useInterval(controller, tick, 100)
    vi.advanceTimersByTime(100)
    stop()
    vi.advanceTimersByTime(300)
    expect(tick).toHaveBeenCalledTimes(1)
  })

  it("a timeout fires once, and never after teardown", () => {
    const fired = vi.fn()
    const controller = {}
    useTimeout(controller, fired, 200)
    vi.advanceTimersByTime(250)
    expect(fired).toHaveBeenCalledTimes(1)

    const late = vi.fn()
    const other = {}
    useTimeout(other, late, 200)
    teardown(other)
    vi.advanceTimersByTime(250)
    expect(late).not.toHaveBeenCalled()
  })
})

describe("useInView", () => {
  let observers

  beforeEach(() => {
    observers = []
    globalThis.IntersectionObserver = class {
      constructor(callback, options) {
        this.callback = callback
        this.options = options
        this.disconnected = false
        observers.push(this)
      }
      observe(element) { this.element = element }
      disconnect() { this.disconnected = true }
    }
  })
  afterEach(() => { delete globalThis.IntersectionObserver })

  it("reports entering and leaving, and disconnects at teardown", () => {
    const controller = {}
    const element = document.createElement("div")
    const seen = []
    useInView(controller, element, (inView) => seen.push(inView), { rootMargin: "10px" })
    const [observer] = observers

    expect(observer.element).toBe(element)
    expect(observer.options).toEqual({ rootMargin: "10px" })
    observer.callback([{ isIntersecting: true }])
    observer.callback([{ isIntersecting: false }])
    expect(seen).toEqual([true, false])

    teardown(controller)
    expect(observer.disconnected).toBe(true)
  })

  it("with once, stops after the first entry", () => {
    const controller = {}
    const onChange = vi.fn()
    useInView(controller, document.createElement("div"), onChange, { once: true })
    const [observer] = observers

    observer.callback([{ isIntersecting: false }])
    expect(observer.disconnected).toBe(false)
    observer.callback([{ isIntersecting: true }])
    expect(observer.disconnected).toBe(true)
  })

  it("counts as visible at once without IntersectionObserver", () => {
    delete globalThis.IntersectionObserver
    const onChange = vi.fn()
    useInView({}, document.createElement("div"), onChange)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe("useMeasure", () => {
  afterEach(() => { delete globalThis.ResizeObserver })

  it("reports the size now and on change, and disconnects at teardown", () => {
    let observer
    globalThis.ResizeObserver = class {
      constructor(callback) { this.callback = callback; observer = this }
      observe(element) { this.element = element }
      disconnect() { this.disconnected = true }
    }
    const controller = {}
    const element = document.createElement("div")
    const sizes = []
    useMeasure(controller, element, (size) => sizes.push(size))

    observer.callback([{ contentRect: { width: 120, height: 40 } }])
    expect(sizes).toEqual([{ width: 0, height: 0 }, { width: 120, height: 40 }])

    teardown(controller)
    expect(observer.disconnected).toBe(true)
  })

  it("reports once without ResizeObserver", () => {
    const onResize = vi.fn()
    useMeasure({}, document.createElement("div"), onResize)
    expect(onResize).toHaveBeenCalledTimes(1)
  })
})

describe("useMutation", () => {
  it("reports children added below, and stops at teardown", async () => {
    const controller = {}
    const element = document.createElement("div")
    const onMutate = vi.fn()
    useMutation(controller, element, onMutate)

    element.append(document.createElement("span"))
    await Promise.resolve()
    expect(onMutate).toHaveBeenCalledTimes(1)

    teardown(controller)
    element.append(document.createElement("span"))
    await Promise.resolve()
    expect(onMutate).toHaveBeenCalledTimes(1)
  })
})

describe("useClipboard", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("copies through the Clipboard API and resets the copied state", async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal("navigator", { clipboard: { writeText } })
    const states = []
    const { copy } = useClipboard({}, { resetAfter: 500, onChange: (copied) => states.push(copied) })

    await expect(copy("hello")).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith("hello")
    vi.advanceTimersByTime(500)
    expect(states).toEqual([true, false])
  })

  it("falls back to the textarea when the API refuses, and clears its timer at teardown", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } })
    document.execCommand = vi.fn(() => true)
    const controller = {}
    const states = []
    const { copy } = useClipboard(controller, { onChange: (copied) => states.push(copied) })

    await expect(copy("fallback")).resolves.toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith("copy")
    expect(document.querySelector("textarea")).toBeNull()

    teardown(controller)
    vi.advanceTimersByTime(5000)
    expect(states).toEqual([true])
    delete document.execCommand
  })
})
