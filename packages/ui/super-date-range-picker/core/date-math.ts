import { TimeResolveError } from "./errors"
import type { TimeEngine, Unit, ZonedParts } from "./types"

export type DateMathAddNode = {
  kind: "add"
  sign: 1 | -1
  value: number
  unit: Unit
}

export type DateMathAst = {
  kind: "datemath"
  source: string
  adds: DateMathAddNode[]
  roundUnit?: Unit
}

export type EvaluateDateMathContext = {
  engine: TimeEngine
  nowMs: number
  resolvedTz: string
  weekStartsOn: 0 | 1 | 6
}

const DATEMATH_PATTERN = /^now(?:[+-]\d+[smhdwMy])*(?:\/[smhdwMy])?$/
const ADD_PATTERN = /([+-])(\d+)([smhdwMy])/g

export function parseDateMath(input: string): DateMathAst {
  const expr = input.trim()
  if (!DATEMATH_PATTERN.test(expr)) {
    throw new TimeResolveError("INVALID_EXPRESSION", `Invalid DateMath expression: ${input}`)
  }

  const roundMatch = expr.match(/\/([smhdwMy])$/)
  const roundUnit = roundMatch ? (roundMatch[1] as Unit) : undefined
  const body = roundMatch ? expr.slice(0, -2) : expr

  const adds: DateMathAddNode[] = []
  for (const match of body.matchAll(ADD_PATTERN)) {
    const signToken = match[1]
    const valueToken = match[2]
    const unitToken = match[3]

    if (!signToken || !valueToken || !unitToken) {
      throw new TimeResolveError("INVALID_EXPRESSION", `Invalid DateMath token: ${input}`)
    }

    const sign = signToken === "+" ? 1 : -1
    const value = Number.parseInt(valueToken, 10)
    const unit = unitToken as Unit

    adds.push({
      kind: "add",
      sign,
      value,
      unit,
    })
  }

  return {
    kind: "datemath",
    source: expr,
    adds,
    ...(roundUnit ? { roundUnit } : {}),
  }
}

export function evaluateDateMath(ast: DateMathAst, ctx: EvaluateDateMathContext): ZonedParts {
  let parts = ctx.engine.nowZoned(ctx.nowMs, ctx.resolvedTz)

  for (const addNode of ast.adds) {
    parts = ctx.engine.add(parts, {
      [addNode.unit]: addNode.value * addNode.sign,
    })
  }

  if (ast.roundUnit) {
    parts = ctx.engine.roundDown(parts, ast.roundUnit, ctx.weekStartsOn)
  }

  return parts
}

export function hasNowInDateMath(_ast: DateMathAst): boolean {
  return true
}

export function inferEndpointRoundUnit(ast: DateMathAst): Unit | undefined {
  if (ast.roundUnit) {
    return ast.roundUnit
  }

  const last = ast.adds.at(-1)
  return last?.unit
}
