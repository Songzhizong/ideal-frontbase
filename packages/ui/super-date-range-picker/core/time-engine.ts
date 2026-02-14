import { Temporal } from "@js-temporal/polyfill"
import { TimeResolveError } from "./errors"
import type {
  Disambiguation,
  DurationLike,
  GapPolicy,
  ResolveWarning,
  TimeEngine,
  TimeZoneMode,
  Unit,
  ZonedParts,
} from "./types"

type TemporalLike = typeof Temporal

const temporalRef: TemporalLike = Temporal

export function createDefaultTimeEngine(): TimeEngine {
  try {
    return createTemporalTimeEngine()
  } catch {
    return createFallbackTimeEngine()
  }
}

export function createTemporalTimeEngine(): TimeEngine {
  return {
    caps: {
      supportsDisambiguation: true,
      supportsGapResolution: true,
      supportsIanaTimeZones: true,
    },

    resolveTimezone(mode: TimeZoneMode) {
      return {
        resolvedTz: resolveTimezoneMode(mode),
      }
    },

    nowZoned(nowMs: number, resolvedTz: string): ZonedParts {
      return instantToTemporalParts(nowMs, resolvedTz)
    },

    zonedPartsToInstant(
      parts: ZonedParts,
      opts: { disambiguation?: Disambiguation; gapPolicy?: GapPolicy },
    ) {
      const earlier = zonedDateTimeFromParts(parts, "earlier")
      const later = zonedDateTimeFromParts(parts, "later")

      const earlierMatches = zonedMatchesParts(earlier, parts)
      const laterMatches = zonedMatchesParts(later, parts)

      if (!earlierMatches && !laterMatches) {
        const gapPolicy = opts.gapPolicy ?? "next_valid"
        if (gapPolicy === "error") {
          throw new TimeResolveError(
            "DST_GAP_ERROR",
            "Non-existent local time caused by DST gap and gapPolicy='error'.",
          )
        }

        return {
          ms: later.epochMilliseconds,
          warnings: [
            {
              code: "DST_GAP_SHIFTED",
              message: "Non-existent local time shifted forward to the next valid instant.",
            },
          ],
        }
      }

      const isOverlap =
        earlierMatches && laterMatches && earlier.epochMilliseconds !== later.epochMilliseconds

      if (isOverlap) {
        const warnings: ResolveWarning[] = []
        if (!opts.disambiguation) {
          warnings.push({
            code: "DST_OVERLAP_DEFAULT_EARLIER",
            message:
              "DST overlap encountered and disambiguation was not provided, defaulted to earlier.",
          })
        }

        const picked = opts.disambiguation === "later" ? later : earlier
        return {
          ms: picked.epochMilliseconds,
          ...(warnings.length > 0 ? { warnings } : {}),
        }
      }

      const normal = laterMatches ? later : earlier
      return {
        ms: normal.epochMilliseconds,
      }
    },

    instantToZonedParts(ms: number, resolvedTz: string): ZonedParts {
      return instantToTemporalParts(ms, resolvedTz)
    },

    roundDown(parts: ZonedParts, unit: Unit, weekStartsOn: 0 | 1 | 6): ZonedParts {
      const plain = toPlainDateTime(parts)
      const rounded = roundPlainDateTimeDown(plain, unit, weekStartsOn)

      return fromPlainDateTime(rounded, parts.tz)
    },

    add(parts: ZonedParts, dur: DurationLike): ZonedParts {
      const plain = toPlainDateTime(parts)
      const adjusted = plain.add({
        years: dur.y ?? 0,
        months: dur.M ?? 0,
        days: (dur.d ?? 0) + (dur.w ?? 0) * 7,
        hours: dur.h ?? 0,
        minutes: dur.m ?? 0,
        seconds: dur.s ?? 0,
      })

      return fromPlainDateTime(adjusted, parts.tz)
    },
  }
}

export function createFallbackTimeEngine(): TimeEngine {
  return {
    caps: {
      supportsDisambiguation: false,
      supportsGapResolution: true,
      supportsIanaTimeZones: true,
    },

    resolveTimezone(mode: TimeZoneMode) {
      return {
        resolvedTz: resolveTimezoneMode(mode),
      }
    },

    nowZoned(nowMs: number, resolvedTz: string): ZonedParts {
      return instantToIntlParts(nowMs, resolvedTz)
    },

    zonedPartsToInstant(
      parts: ZonedParts,
      opts: { disambiguation?: Disambiguation; gapPolicy?: GapPolicy },
    ) {
      const target = stripTz(parts)
      const warnings: ResolveWarning[] = []
      const candidate = convergeWallTime(parts)

      if (!wallMatches(candidate, target, parts.tz)) {
        if ((opts.gapPolicy ?? "next_valid") === "error") {
          throw new TimeResolveError(
            "DST_GAP_ERROR",
            "Non-existent local time caused by DST gap and gapPolicy='error'.",
          )
        }

        const shifted = moveToNextValid(candidate, target, parts.tz)
        warnings.push({
          code: "DST_GAP_SHIFTED",
          message: "Non-existent local time shifted forward to the next valid instant.",
        })

        return {
          ms: shifted,
          ...(warnings.length > 0 ? { warnings } : {}),
        }
      }

      const overlapCandidates = collectOverlapCandidates(candidate, target, parts.tz)
      if (overlapCandidates.length > 1) {
        const earlier = Math.min(...overlapCandidates)
        const overlapWarnings: ResolveWarning[] = []

        if (opts.disambiguation === "later") {
          overlapWarnings.push({
            code: "DST_OVERLAP_FORCED_EARLIER",
            message:
              "Current engine cannot guarantee overlap disambiguation; forced earlier instant.",
          })
        }

        return {
          ms: earlier,
          ...(overlapWarnings.length > 0 ? { warnings: overlapWarnings } : {}),
        }
      }

      return {
        ms: candidate,
        ...(warnings.length > 0 ? { warnings } : {}),
      }
    },

    instantToZonedParts(ms: number, resolvedTz: string): ZonedParts {
      return instantToIntlParts(ms, resolvedTz)
    },

    roundDown(parts: ZonedParts, unit: Unit, weekStartsOn: 0 | 1 | 6): ZonedParts {
      const plain = toPlainDateTime(parts)
      const rounded = roundPlainDateTimeDown(plain, unit, weekStartsOn)

      return fromPlainDateTime(rounded, parts.tz)
    },

    add(parts: ZonedParts, dur: DurationLike): ZonedParts {
      const plain = toPlainDateTime(parts)
      const adjusted = plain.add({
        years: dur.y ?? 0,
        months: dur.M ?? 0,
        days: (dur.d ?? 0) + (dur.w ?? 0) * 7,
        hours: dur.h ?? 0,
        minutes: dur.m ?? 0,
        seconds: dur.s ?? 0,
      })

      return fromPlainDateTime(adjusted, parts.tz)
    },
  }
}

function resolveTimezoneMode(mode: TimeZoneMode): string {
  if (mode.kind === "utc") {
    return "UTC"
  }

  if (mode.kind === "browser") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  }

  return mode.tz
}

function instantToTemporalParts(ms: number, tz: string): ZonedParts {
  const instant = temporalRef.Instant.fromEpochMilliseconds(ms)
  const zoned = instant.toZonedDateTimeISO(tz)
  return {
    tz,
    y: zoned.year,
    m: zoned.month,
    d: zoned.day,
    hh: zoned.hour,
    mm: zoned.minute,
    ss: zoned.second,
    ms: zoned.millisecond,
  }
}

function toPlainDateTime(parts: ZonedParts): Temporal.PlainDateTime {
  return new temporalRef.PlainDateTime(
    parts.y,
    parts.m,
    parts.d,
    parts.hh,
    parts.mm,
    parts.ss,
    parts.ms,
  )
}

function fromPlainDateTime(plain: Temporal.PlainDateTime, tz: string): ZonedParts {
  return {
    tz,
    y: plain.year,
    m: plain.month,
    d: plain.day,
    hh: plain.hour,
    mm: plain.minute,
    ss: plain.second,
    ms: plain.millisecond,
  }
}

function zonedDateTimeFromParts(
  parts: ZonedParts,
  disambiguation: "earlier" | "later",
): Temporal.ZonedDateTime {
  return temporalRef.ZonedDateTime.from(
    {
      timeZone: parts.tz,
      year: parts.y,
      month: parts.m,
      day: parts.d,
      hour: parts.hh,
      minute: parts.mm,
      second: parts.ss,
      millisecond: parts.ms,
    },
    {
      disambiguation,
    },
  )
}

function zonedMatchesParts(zoned: Temporal.ZonedDateTime, parts: ZonedParts): boolean {
  return (
    zoned.year === parts.y &&
    zoned.month === parts.m &&
    zoned.day === parts.d &&
    zoned.hour === parts.hh &&
    zoned.minute === parts.mm &&
    zoned.second === parts.ss &&
    zoned.millisecond === parts.ms
  )
}

function roundPlainDateTimeDown(
  plain: Temporal.PlainDateTime,
  unit: Unit,
  weekStartsOn: 0 | 1 | 6,
): Temporal.PlainDateTime {
  if (unit === "s") {
    return new temporalRef.PlainDateTime(
      plain.year,
      plain.month,
      plain.day,
      plain.hour,
      plain.minute,
      plain.second,
      0,
    )
  }

  if (unit === "m") {
    return new temporalRef.PlainDateTime(
      plain.year,
      plain.month,
      plain.day,
      plain.hour,
      plain.minute,
      0,
      0,
    )
  }

  if (unit === "h") {
    return new temporalRef.PlainDateTime(plain.year, plain.month, plain.day, plain.hour, 0, 0, 0)
  }

  if (unit === "d") {
    return new temporalRef.PlainDateTime(plain.year, plain.month, plain.day, 0, 0, 0, 0)
  }

  if (unit === "w") {
    const dayOfWeek = plain.dayOfWeek % 7
    const delta = (dayOfWeek - weekStartsOn + 7) % 7
    const shifted = plain.subtract({ days: delta })
    return new temporalRef.PlainDateTime(shifted.year, shifted.month, shifted.day, 0, 0, 0, 0)
  }

  if (unit === "M") {
    return new temporalRef.PlainDateTime(plain.year, plain.month, 1, 0, 0, 0, 0)
  }

  return new temporalRef.PlainDateTime(plain.year, 1, 1, 0, 0, 0, 0)
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function instantToIntlParts(ms: number, tz: string): ZonedParts {
  const formatter = getFormatter(tz)
  const parts = formatter.formatToParts(new Date(ms))

  const map = new Map(parts.map((part) => [part.type, part.value]))
  const y = Number.parseInt(map.get("year") ?? "0", 10)
  const m = Number.parseInt(map.get("month") ?? "0", 10)
  const d = Number.parseInt(map.get("day") ?? "0", 10)
  const hh = Number.parseInt(map.get("hour") ?? "0", 10)
  const mm = Number.parseInt(map.get("minute") ?? "0", 10)
  const ss = Number.parseInt(map.get("second") ?? "0", 10)

  return {
    tz,
    y,
    m,
    d,
    hh,
    mm,
    ss,
    ms: 0,
  }
}

function getFormatter(tz: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(tz)
  if (cached) {
    return cached
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  formatterCache.set(tz, formatter)
  return formatter
}

function convergeWallTime(parts: ZonedParts): number {
  const targetUtc = Date.UTC(parts.y, parts.m - 1, parts.d, parts.hh, parts.mm, parts.ss, parts.ms)
  let guess = targetUtc

  for (let i = 0; i < 6; i += 1) {
    const actual = instantToIntlParts(guess, parts.tz)
    const actualUtc = Date.UTC(
      actual.y,
      actual.m - 1,
      actual.d,
      actual.hh,
      actual.mm,
      actual.ss,
      actual.ms,
    )
    const delta = targetUtc - actualUtc

    if (delta === 0) {
      return guess
    }

    guess += delta
  }

  return guess
}

function collectOverlapCandidates(base: number, target: WallWithoutTz, tz: string): number[] {
  const values: number[] = []
  for (let offsetMinutes = -180; offsetMinutes <= 180; offsetMinutes += 15) {
    values.push(base + offsetMinutes * 60_000)
  }

  const uniqueValues = values.filter((candidate, index, arr) => arr.indexOf(candidate) === index)
  const matched = uniqueValues.filter((candidate) => wallMatches(candidate, target, tz))
  return matched.sort((a, b) => a - b)
}

type WallWithoutTz = Omit<ZonedParts, "tz">

function stripTz(parts: ZonedParts): WallWithoutTz {
  return {
    y: parts.y,
    m: parts.m,
    d: parts.d,
    hh: parts.hh,
    mm: parts.mm,
    ss: parts.ss,
    ms: parts.ms,
  }
}

function wallMatches(ms: number, target: WallWithoutTz, tz: string): boolean {
  const actual = instantToIntlParts(ms, tz)
  return (
    actual.y === target.y &&
    actual.m === target.m &&
    actual.d === target.d &&
    actual.hh === target.hh &&
    actual.mm === target.mm &&
    actual.ss === target.ss &&
    actual.ms === target.ms
  )
}

function compareWall(a: WallWithoutTz, b: WallWithoutTz): number {
  const diffs = [
    a.y - b.y,
    a.m - b.m,
    a.d - b.d,
    a.hh - b.hh,
    a.mm - b.mm,
    a.ss - b.ss,
    a.ms - b.ms,
  ]

  for (const diff of diffs) {
    if (diff !== 0) {
      return diff
    }
  }

  return 0
}

function moveToNextValid(candidate: number, target: WallWithoutTz, tz: string): number {
  let next = candidate

  for (let i = 0; i < 240; i += 1) {
    next += 60_000
    const actual = instantToIntlParts(next, tz)

    if (compareWall(stripTz(actual), target) >= 0) {
      return next
    }
  }

  return next
}
