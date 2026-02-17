import { describe, expect, it } from "vitest"
import {
  createDraftStateFromDefinition,
  setDraftFocus,
  updateDraftByBlur,
  updateDraftByCalendarOrScroller,
  updateDraftByTyping,
} from "./draft-state"

describe("draft-state", () => {
  it("keeps typing rawText unchanged until blur", () => {
    const draft = createDraftStateFromDefinition({
      from: { expr: "now-15m" },
      to: { expr: "now" },
    })

    const typing = updateDraftByTyping(draft, "from", "2026-02-13 10:00")
    expect(typing.from.rawText).toBe("2026-02-13 10:00")
    expect(typing.from.parse.kind).toBe("ok")
    if (typing.from.parse.kind !== "ok") {
      throw new Error("unexpected parse state")
    }

    expect(typing.from.parse.expr).toBe("@wall:2026-02-13 10:00:00")

    const blurred = updateDraftByBlur(typing, "from")
    expect(blurred.from.rawText).toBe("2026-02-13 10:00:00")
  })

  it("calendar/scroller writes parts and formatted text", () => {
    const draft = createDraftStateFromDefinition({
      from: { expr: "now-15m" },
      to: { expr: "now" },
    })

    const next = updateDraftByCalendarOrScroller(
      draft,
      "to",
      {
        y: 2026,
        m: 2,
        d: 13,
        hh: 11,
        mm: 12,
        ss: 13,
      },
      "calendar",
    )

    expect(next.to.rawText).toBe("2026-02-13 11:12:13")
    expect(next.to.parts?.calendarDate).toEqual({ y: 2026, m: 2, d: 13 })
    expect(next.to.parts?.timeParts).toEqual({ hh: 11, mm: 12, ss: 13 })
  })

  it("keeps draft while switching focus", () => {
    const draft = createDraftStateFromDefinition({
      from: { expr: "now-15m" },
      to: { expr: "now" },
    })

    const typing = updateDraftByTyping(draft, "from", "2026-02-13 10:00")
    const switched = setDraftFocus(typing, "to")

    expect(switched.lastFocused).toBe("to")
    expect(switched.from.rawText).toBe("2026-02-13 10:00")
  })
})
