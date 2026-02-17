import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCopy } from "./use-copy"

describe("useCopy", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("复制成功后会短暂保持 copied=true", async () => {
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })

    const { result } = renderHook(() => useCopy({ timeout: 120 }))

    await act(async () => {
      const copied = await result.current.copy("hello")
      expect(copied).toBe(true)
    })

    expect(writeText).toHaveBeenCalledWith("hello")
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(120)
    })

    expect(result.current.copied).toBe(false)
  })

  it("复制失败时返回 false 并保持 copied=false", async () => {
    const writeText = vi.fn(async () => {
      throw new Error("copy failed")
    })
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })

    const { result } = renderHook(() => useCopy())

    await act(async () => {
      const copied = await result.current.copy("hello")
      expect(copied).toBe(false)
    })

    expect(result.current.copied).toBe(false)
  })
})
