import { describe, expect, it } from "vitest"
import { createFallbackTimeEngine } from "./time-engine"

describe("fallback TimeEngine", () => {
  const engine = createFallbackTimeEngine()

  it("exposes downgraded capabilities", () => {
    expect(engine.caps.supportsDisambiguation).toBe(false)
    expect(engine.caps.supportsGapResolution).toBe(true)
  })

  it("forces earlier in overlap and emits warning when later is requested", () => {
    const result = engine.zonedPartsToInstant(
      {
        tz: "America/Los_Angeles",
        y: 2026,
        m: 11,
        d: 1,
        hh: 1,
        mm: 30,
        ss: 0,
        ms: 0,
      },
      {
        disambiguation: "later",
      },
    )

    expect(result.warnings?.some((warning) => warning.code === "DST_OVERLAP_FORCED_EARLIER")).toBe(
      true,
    )
  })

  it("detects non-hour overlap shifts in fallback engine", () => {
    const result = engine.zonedPartsToInstant(
      {
        tz: "Australia/Lord_Howe",
        y: 2026,
        m: 4,
        d: 5,
        hh: 1,
        mm: 45,
        ss: 0,
        ms: 0,
      },
      {
        disambiguation: "later",
      },
    )

    expect(result.warnings?.some((warning) => warning.code === "DST_OVERLAP_FORCED_EARLIER")).toBe(
      true,
    )
  })
})
