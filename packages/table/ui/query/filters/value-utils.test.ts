import { describe, expect, it } from "vitest"
import { areValuesEqual, isEmptyValue, parseDateRange, parseNumberRange } from "./value-utils"

describe("query value-utils", () => {
  it("areValuesEqual 支持 Date 时间戳比较", () => {
    expect(areValuesEqual(new Date("2026-01-01"), new Date("2026-01-01"))).toBe(true)
    expect(areValuesEqual(new Date("2026-01-01"), new Date("2026-01-02"))).toBe(false)
  })

  it("parseNumberRange 支持对象与数组", () => {
    expect(parseNumberRange({ min: 1, max: 2 })).toEqual({ min: 1, max: 2 })
    expect(parseNumberRange([3, 4])).toEqual({ min: 3, max: 4 })
  })

  it("parseDateRange 支持对象与数组", () => {
    const from = new Date("2026-01-01")
    const to = new Date("2026-01-02")
    expect(parseDateRange({ from, to })).toEqual({ from, to })
    expect(parseDateRange([from, to])).toEqual({ from, to })
  })

  it("isEmptyValue 按字段类型判空", () => {
    expect(isEmptyValue("", "text")).toBe(true)
    expect(isEmptyValue([], "multi-select")).toBe(true)
    expect(isEmptyValue({ min: undefined, max: undefined }, "number-range")).toBe(true)
    expect(isEmptyValue({ from: undefined, to: undefined }, "date-range")).toBe(true)
  })
})
