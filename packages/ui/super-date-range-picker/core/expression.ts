import { type DateMathAst, parseDateMath } from "./date-math"
import { TimeResolveError } from "./errors"

export type WallDateTimeParts = {
  y: number
  m: number
  d: number
  hh: number
  mm: number
  ss: number
  ms: number
}

export type ParsedExpression =
  | { kind: "datemath"; ast: DateMathAst }
  | { kind: "iso"; iso: string }
  | { kind: "wall"; wall: WallDateTimeParts; normalizedExpr: string }

export type ParsedInput = {
  expr: string
  kindHint: "datemath" | "iso" | "wall"
}

const ISO_WITH_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/
const WALL_BODY_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?)?$/

export function parseExpression(expr: string): ParsedExpression {
  const trimmed = expr.trim()

  if (trimmed.startsWith("@wall:")) {
    const wallBody = trimmed.slice("@wall:".length)
    const wall = parseWallBody(wallBody)
    return {
      kind: "wall",
      wall,
      normalizedExpr: toWallExpression(wall),
    }
  }

  if (trimmed.startsWith("now")) {
    return {
      kind: "datemath",
      ast: parseDateMath(trimmed),
    }
  }

  if (ISO_WITH_OFFSET_PATTERN.test(trimmed) && !Number.isNaN(Date.parse(trimmed))) {
    return {
      kind: "iso",
      iso: trimmed,
    }
  }

  const wall = tryParseWallBody(trimmed)
  if (wall) {
    return {
      kind: "wall",
      wall,
      normalizedExpr: toWallExpression(wall),
    }
  }

  throw new TimeResolveError("INVALID_EXPRESSION", `Unsupported expression: ${expr}`)
}

export function normalizeInputToExpression(rawText: string): ParsedInput {
  const trimmed = rawText.trim()

  if (trimmed === "") {
    throw new TimeResolveError("INVALID_EXPRESSION", "Expression cannot be empty")
  }

  if (trimmed.startsWith("now")) {
    const ast = parseDateMath(trimmed)
    return {
      expr: ast.source,
      kindHint: "datemath",
    }
  }

  if (trimmed.startsWith("@wall:")) {
    const parsed = parseExpression(trimmed)
    if (parsed.kind !== "wall") {
      throw new TimeResolveError("INVALID_WALL_TIME", `Invalid wall time expression: ${rawText}`)
    }
    return {
      expr: parsed.normalizedExpr,
      kindHint: "wall",
    }
  }

  if (ISO_WITH_OFFSET_PATTERN.test(trimmed)) {
    if (Number.isNaN(Date.parse(trimmed))) {
      throw new TimeResolveError("INVALID_EXPRESSION", `Invalid ISO datetime: ${rawText}`)
    }
    return {
      expr: trimmed,
      kindHint: "iso",
    }
  }

  const wall = tryParseWallBody(trimmed)
  if (wall) {
    return {
      expr: toWallExpression(wall),
      kindHint: "wall",
    }
  }

  // ISO-like absolute input without offset must be wall time.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    throw new TimeResolveError(
      "INVALID_ISO_WITHOUT_OFFSET",
      "Absolute ISO input without timezone offset must be normalized to wall time",
    )
  }

  throw new TimeResolveError("INVALID_EXPRESSION", `Unsupported expression: ${rawText}`)
}

export function toWallExpression(wall: WallDateTimeParts): string {
  return `@wall:${pad(wall.y, 4)}-${pad(wall.m)}-${pad(wall.d)} ${pad(wall.hh)}:${pad(wall.mm)}:${pad(wall.ss)}`
}

export function toWallDisplayText(expr: string): string {
  if (!expr.startsWith("@wall:")) {
    return expr
  }
  return expr.slice("@wall:".length)
}

export function parseWallExpression(expr: string): WallDateTimeParts {
  if (!expr.startsWith("@wall:")) {
    throw new TimeResolveError("INVALID_WALL_TIME", `Invalid wall expression: ${expr}`)
  }
  return parseWallBody(expr.slice("@wall:".length))
}

function tryParseWallBody(raw: string): WallDateTimeParts | null {
  try {
    return parseWallBody(raw)
  } catch {
    return null
  }
}

function parseWallBody(raw: string): WallDateTimeParts {
  const match = raw.match(WALL_BODY_PATTERN)
  if (!match) {
    throw new TimeResolveError("INVALID_WALL_TIME", `Invalid wall datetime: ${raw}`)
  }

  const yearToken = match[1]
  const monthToken = match[2]
  const dayToken = match[3]
  if (!yearToken || !monthToken || !dayToken) {
    throw new TimeResolveError("INVALID_WALL_TIME", `Invalid wall datetime: ${raw}`)
  }

  const y = Number.parseInt(yearToken, 10)
  const m = Number.parseInt(monthToken, 10)
  const d = Number.parseInt(dayToken, 10)
  const hh = Number.parseInt(match[4] ?? "0", 10)
  const mm = Number.parseInt(match[5] ?? "0", 10)
  const ss = Number.parseInt(match[6] ?? "0", 10)

  if (!isValidWallParts(y, m, d, hh, mm, ss)) {
    throw new TimeResolveError("INVALID_WALL_TIME", `Invalid wall datetime: ${raw}`)
  }

  return { y, m, d, hh, mm, ss, ms: 0 }
}

function isValidWallParts(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number,
  ss: number,
): boolean {
  if (!Number.isInteger(y) || y < 1 || y > 9999) {
    return false
  }
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    return false
  }
  const maxDay = daysInMonth(y, m)
  if (!Number.isInteger(d) || d < 1 || d > maxDay) {
    return false
  }
  if (!Number.isInteger(hh) || hh < 0 || hh > 23) {
    return false
  }
  if (!Number.isInteger(mm) || mm < 0 || mm > 59) {
    return false
  }
  return !(!Number.isInteger(ss) || ss < 0 || ss > 59)
}

function daysInMonth(y: number, m: number): number {
  if (m === 2) {
    return isLeapYear(y) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(m) ? 30 : 31
}

function isLeapYear(y: number): boolean {
  if (y % 400 === 0) {
    return true
  }

  if (y % 100 === 0) {
    return false
  }

  return y % 4 === 0
}

function pad(value: number, width = 2): string {
  return value.toString().padStart(width, "0")
}
