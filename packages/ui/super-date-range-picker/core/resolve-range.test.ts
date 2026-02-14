import { describe, expect, it } from "vitest"
import { resolveRange } from "@/packages/ui"
import { TimeResolveError } from "./errors"
import { createTemporalTimeEngine } from "./time-engine"
import type { ResolveOptions, TimeRangeDefinition } from "./types"

const temporalEngine = createTemporalTimeEngine()

function resolve(def: TimeRangeDefinition, opts?: Partial<ResolveOptions>) {
  return resolveRange(def, {
    nowMs: opts?.nowMs ?? Date.UTC(2026, 1, 13, 10, 37, 25),
    timezone: opts?.timezone ?? { kind: "utc" },
    weekStartsOn: opts?.weekStartsOn ?? 1,
    engine: opts?.engine ?? temporalEngine,
  })
}

describe("resolveRange", () => {
  it("enforces half-open [start, end) with /d + round=up", () => {
    const result = resolve({
      from: { expr: "now/d" },
      to: { expr: "now/d", round: "up" },
    })

    expect(result.startIso).toBe("2026-02-13T00:00:00.000Z")
    expect(result.endIso).toBe("2026-02-14T00:00:00.000Z")
    expect(result.endMs - result.startMs).toBe(24 * 60 * 60 * 1000)
  })

  it("does not apply duplicate round-down for expr with /unit + round=up", () => {
    const result = resolve({
      from: { expr: "now-2h/h" },
      to: { expr: "now-1h/h", round: "up" },
    })

    expect(result.startIso).toBe("2026-02-13T08:00:00.000Z")
    expect(result.endIso).toBe("2026-02-13T10:00:00.000Z")
  })

  it("keeps month-end/leap-year behavior via wall-time calendar arithmetic", () => {
    const result = resolve(
      {
        from: { expr: "now-1M" },
        to: { expr: "now" },
      },
      {
        nowMs: Date.UTC(2024, 2, 31, 12, 0, 0),
        timezone: { kind: "utc" },
      },
    )

    expect(result.startIso).toBe("2024-02-29T12:00:00.000Z")
    expect(result.endIso).toBe("2024-03-31T12:00:00.000Z")
  })

  it("resolves DST gap with next_valid and emits warning", () => {
    const result = resolve(
      {
        from: { expr: "@wall:2026-03-08 02:30:00", gapPolicy: "next_valid" },
        to: { expr: "@wall:2026-03-08 04:00:00" },
      },
      {
        timezone: { kind: "iana", tz: "America/Los_Angeles" },
      },
    )

    expect(result.startIso).toBe("2026-03-08T10:30:00.000Z")
    expect(result.warnings?.some((warning) => warning.code === "DST_GAP_SHIFTED")).toBe(true)
  })

  it("throws when DST gapPolicy is error", () => {
    expect(() =>
      resolve(
        {
          from: { expr: "@wall:2026-03-08 02:30:00", gapPolicy: "error" },
          to: { expr: "@wall:2026-03-08 04:00:00" },
        },
        {
          timezone: { kind: "iana", tz: "America/Los_Angeles" },
        },
      ),
    ).toThrowError(TimeResolveError)
  })

  it("resolves overlap with disambiguation earlier/later deterministically", () => {
    const earlier = resolve(
      {
        from: {
          expr: "@wall:2026-11-01 01:30:00",
          disambiguation: "earlier",
        },
        to: { expr: "@wall:2026-11-01 03:00:00" },
      },
      {
        timezone: { kind: "iana", tz: "America/Los_Angeles" },
      },
    )

    const later = resolve(
      {
        from: {
          expr: "@wall:2026-11-01 01:30:00",
          disambiguation: "later",
        },
        to: { expr: "@wall:2026-11-01 03:00:00" },
      },
      {
        timezone: { kind: "iana", tz: "America/Los_Angeles" },
      },
    )

    expect(earlier.startIso).toBe("2026-11-01T08:30:00.000Z")
    expect(later.startIso).toBe("2026-11-01T09:30:00.000Z")
    expect(later.startMs - earlier.startMs).toBe(60 * 60 * 1000)
  })

  it("recomputes @wall absolute input by timezone", () => {
    const baseDef: TimeRangeDefinition = {
      from: { expr: "@wall:2026-02-13 10:00:00" },
      to: { expr: "@wall:2026-02-13 11:00:00" },
    }

    const utc = resolve(baseDef, { timezone: { kind: "utc" } })
    const la = resolve(baseDef, { timezone: { kind: "iana", tz: "America/Los_Angeles" } })

    expect(utc.startIso).toBe("2026-02-13T10:00:00.000Z")
    expect(la.startIso).toBe("2026-02-13T18:00:00.000Z")
  })
})
