import { evaluateDateMath, inferEndpointRoundUnit } from "./date-math"
import { TimeResolveError } from "./errors"
import { parseExpression } from "./expression"
import type {
  EndpointDef,
  ResolvedTimeRange,
  ResolveOptions,
  ResolveWarning,
  TimeRangeDefinition,
  Unit,
  ZonedParts,
} from "./types"

export function resolveRange(
  definition: TimeRangeDefinition,
  options: ResolveOptions,
): ResolvedTimeRange {
  const { resolvedTz } = options.engine.resolveTimezone(options.timezone)

  const fromResult = resolveEndpoint(definition.from, {
    ...options,
    resolvedTz,
  })
  const toResult = resolveEndpoint(definition.to, {
    ...options,
    resolvedTz,
  })

  if (fromResult.ms >= toResult.ms) {
    throw new TimeResolveError(
      "START_NOT_BEFORE_END",
      `Range must satisfy start < end, got start=${fromResult.ms} and end=${toResult.ms}.`,
    )
  }

  const warnings = dedupeWarnings([...fromResult.warnings, ...toResult.warnings])

  return {
    startMs: fromResult.ms,
    endMs: toResult.ms,
    startIso: new Date(fromResult.ms).toISOString(),
    endIso: new Date(toResult.ms).toISOString(),
    nowMs: options.nowMs,
    timezone: options.timezone,
    resolvedTz,
    engineCaps: options.engine.caps,
    ...(warnings.length > 0 ? { warnings } : {}),
  }
}

type EndpointContext = ResolveOptions & {
  resolvedTz: string
}

function resolveEndpoint(
  endpoint: EndpointDef,
  ctx: EndpointContext,
): { ms: number; warnings: ResolveWarning[] } {
  const parsed = parseExpression(endpoint.expr)

  if (parsed.kind === "iso") {
    const baseMs = Date.parse(parsed.iso)

    if (endpoint.round === undefined || endpoint.round === "none") {
      return {
        ms: baseMs,
        warnings: [],
      }
    }

    const baseParts = ctx.engine.instantToZonedParts(baseMs, ctx.resolvedTz)
    const roundedParts = applyEndpointRounding(
      baseParts,
      endpoint,
      undefined,
      undefined,
      ctx.weekStartsOn,
      ctx.engine,
    )

    const instant = ctx.engine.zonedPartsToInstant(roundedParts, {
      ...(endpoint.disambiguation ? { disambiguation: endpoint.disambiguation } : {}),
      gapPolicy: endpoint.gapPolicy ?? "next_valid",
    })

    return {
      ms: instant.ms,
      warnings: instant.warnings ?? [],
    }
  }

  let wallParts: ZonedParts
  let exprRoundUnit: Unit | undefined
  let inferredRoundUnit: Unit | undefined

  if (parsed.kind === "datemath") {
    wallParts = evaluateDateMath(parsed.ast, {
      engine: ctx.engine,
      nowMs: ctx.nowMs,
      resolvedTz: ctx.resolvedTz,
      weekStartsOn: ctx.weekStartsOn,
    })
    exprRoundUnit = parsed.ast.roundUnit
    inferredRoundUnit = inferEndpointRoundUnit(parsed.ast)
  } else {
    wallParts = {
      tz: ctx.resolvedTz,
      y: parsed.wall.y,
      m: parsed.wall.m,
      d: parsed.wall.d,
      hh: parsed.wall.hh,
      mm: parsed.wall.mm,
      ss: parsed.wall.ss,
      ms: parsed.wall.ms,
    }
  }

  const roundedParts = applyEndpointRounding(
    wallParts,
    endpoint,
    exprRoundUnit,
    inferredRoundUnit,
    ctx.weekStartsOn,
    ctx.engine,
  )

  const instant = ctx.engine.zonedPartsToInstant(roundedParts, {
    ...(endpoint.disambiguation ? { disambiguation: endpoint.disambiguation } : {}),
    gapPolicy: endpoint.gapPolicy ?? "next_valid",
  })

  return {
    ms: instant.ms,
    warnings: instant.warnings ?? [],
  }
}

function applyEndpointRounding(
  parts: ZonedParts,
  endpoint: EndpointDef,
  exprRoundUnit: Unit | undefined,
  inferredRoundUnit: Unit | undefined,
  weekStartsOn: 0 | 1 | 6,
  engine: ResolveOptions["engine"],
): ZonedParts {
  const roundMode = endpoint.round ?? "none"
  if (roundMode === "none") {
    return parts
  }

  if (exprRoundUnit) {
    if (roundMode === "up") {
      return engine.add(parts, { [exprRoundUnit]: 1 })
    }

    // Expression already contains /unit round-down, so no extra round-down.
    return parts
  }

  const unit = inferredRoundUnit
  if (!unit) {
    throw new TimeResolveError(
      "ENDPOINT_ROUND_UNIT_REQUIRED",
      "Endpoint round requires a resolvable unit when expression does not contain /unit.",
    )
  }

  const down = engine.roundDown(parts, unit, weekStartsOn)
  if (roundMode === "down") {
    return down
  }

  return engine.add(down, {
    [unit]: 1,
  })
}

function dedupeWarnings(input: ResolveWarning[]): ResolveWarning[] {
  const seen = new Set<string>()
  const output: ResolveWarning[] = []

  for (const warning of input) {
    const key = `${warning.code}::${warning.message}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    output.push(warning)
  }

  return output
}

export function definitionUsesNow(definition: TimeRangeDefinition): boolean {
  return endpointUsesNow(definition.from) || endpointUsesNow(definition.to)
}

function endpointUsesNow(endpoint: EndpointDef): boolean {
  try {
    const parsed = parseExpression(endpoint.expr)
    return parsed.kind === "datemath"
  } catch {
    return false
  }
}
