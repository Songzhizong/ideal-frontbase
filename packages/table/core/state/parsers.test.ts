import { describe, expect, it } from "vitest"
import {
  parseAsLocalDate,
  parseAsLocalDateRange,
  parseAsNumberRange,
  parseAsTriStateBoolean,
} from "./parsers"

function asDateToken(value: Date | undefined): string | null {
  if (!value) return null
  const year = String(value.getFullYear())
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

describe("state parsers", () => {
  it("parseAsNumberRange 支持半边区间", () => {
    expect(parseAsNumberRange.parse("10~")).toEqual({ min: 10, max: undefined })
    expect(parseAsNumberRange.parse("~20")).toEqual({ min: undefined, max: 20 })
    expect(parseAsNumberRange.parse("")).toBeNull()
  })

  it("parseAsLocalDate 读写 YYYY-MM-DD", () => {
    const parsed = parseAsLocalDate.parse("2026-02-07")
    expect(asDateToken(parsed ?? undefined)).toBe("2026-02-07")
    expect(parseAsLocalDate.serialize(new Date(2026, 1, 7))).toBe("2026-02-07")
  })

  it("parseAsLocalDateRange 支持半边区间", () => {
    const parsed = parseAsLocalDateRange.parse("2026-01-01~")
    expect(parsed?.from ? asDateToken(parsed.from) : null).toBe("2026-01-01")
    expect(parsed?.to ?? null).toBeNull()
  })

  it("parseAsTriStateBoolean 保留 false 语义", () => {
    expect(parseAsTriStateBoolean.parse("true")).toBe(true)
    expect(parseAsTriStateBoolean.parse("1")).toBe(true)
    expect(parseAsTriStateBoolean.parse("false")).toBe(false)
    expect(parseAsTriStateBoolean.parse("0")).toBe(false)
    expect(parseAsTriStateBoolean.parse("x")).toBeNull()
    expect(parseAsTriStateBoolean.serialize(true)).toBe("1")
    expect(parseAsTriStateBoolean.serialize(false)).toBe("0")
  })
})
