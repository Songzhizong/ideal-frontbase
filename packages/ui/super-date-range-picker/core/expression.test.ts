import { describe, expect, it } from "vitest"
import { TimeResolveError } from "./errors"
import { normalizeInputToExpression, parseExpression, toWallDisplayText } from "./expression"

describe("expression parser", () => {
  it("normalizes wall-time absolute input to @wall:", () => {
    const normalized = normalizeInputToExpression("2026-02-13 10:00")
    expect(normalized.kindHint).toBe("wall")
    expect(normalized.expr).toBe("@wall:2026-02-13 10:00:00")
  })

  it("keeps ISO input with offset unchanged", () => {
    const normalized = normalizeInputToExpression("2026-02-13T10:00:00+08:00")
    expect(normalized.kindHint).toBe("iso")
    expect(normalized.expr).toBe("2026-02-13T10:00:00+08:00")
  })

  it("parses DateMath expression", () => {
    const parsed = parseExpression("now-1h/h")
    expect(parsed.kind).toBe("datemath")
    if (parsed.kind !== "datemath") {
      throw new Error("Unexpected parser kind")
    }

    expect(parsed.ast.adds).toHaveLength(1)
    expect(parsed.ast.roundUnit).toBe("h")
  })

  it("throws for unsupported expression", () => {
    expect(() => normalizeInputToExpression("yesterday")).toThrowError(TimeResolveError)
  })

  it("formats wall expression for input display", () => {
    expect(toWallDisplayText("@wall:2026-02-13 10:00:00")).toBe("2026-02-13 10:00:00")
  })
})
