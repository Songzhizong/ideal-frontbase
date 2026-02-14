import type { EndpointDef, TimeRangeDefinition } from "../core"
import {
  normalizeInputToExpression,
  parseExpression,
  type ResolveErrorCode,
  TimeResolveError,
  toWallDisplayText,
  toWallExpression,
} from "../core"
import type { DraftEndpointParse, DraftEndpointState, DraftSource, DraftState } from "./types"

export function createDraftStateFromDefinition(
  definition: TimeRangeDefinition,
  options?: {
    source?: DraftSource
    lastFocused?: "from" | "to"
  },
): DraftState {
  const source = options?.source ?? "external_reset"

  const from = endpointToDraftState(definition.from, source)
  const to = endpointToDraftState(definition.to, source)

  return {
    from,
    to,
    isDirty: from.dirty || to.dirty,
    lastFocused: options?.lastFocused ?? "from",
  }
}

export function updateDraftByTyping(
  draft: DraftState,
  endpoint: "from" | "to",
  rawText: string,
): DraftState {
  const parse = parseRawText(rawText)
  const nextParts =
    parse.kind === "ok" && parse.kindHint === "wall" ? wallPartsFromExpr(parse.expr) : undefined
  const baseEndpoint: DraftEndpointState = {
    ...draft[endpoint],
    rawText,
    parse,
    dirty: true,
    source: "typing",
  }
  const nextEndpoint: DraftEndpointState = nextParts
    ? { ...baseEndpoint, parts: nextParts }
    : removeParts(baseEndpoint)

  return patchDraft(draft, endpoint, nextEndpoint)
}

export function updateDraftByBlur(draft: DraftState, endpoint: "from" | "to"): DraftState {
  const current = draft[endpoint]
  if (current.parse.kind !== "ok") {
    return draft
  }

  const normalizedRawText =
    current.parse.kindHint === "wall" ? toWallDisplayText(current.parse.expr) : current.parse.expr

  if (current.rawText === normalizedRawText) {
    return draft
  }

  return patchDraft(draft, endpoint, {
    ...current,
    rawText: normalizedRawText,
    source: "blur",
  })
}

export function updateDraftByCalendarOrScroller(
  draft: DraftState,
  endpoint: "from" | "to",
  parts: {
    y: number
    m: number
    d: number
    hh: number
    mm: number
    ss: number
  },
  source: Extract<DraftSource, "calendar" | "scroller">,
): DraftState {
  const expr = toWallExpression({
    y: parts.y,
    m: parts.m,
    d: parts.d,
    hh: parts.hh,
    mm: parts.mm,
    ss: parts.ss,
    ms: 0,
  })

  const nextEndpoint: DraftEndpointState = {
    ...draft[endpoint],
    rawText: toWallDisplayText(expr),
    parse: {
      kind: "ok",
      expr,
      kindHint: "wall",
    },
    parts: {
      calendarDate: {
        y: parts.y,
        m: parts.m,
        d: parts.d,
      },
      timeParts: {
        hh: parts.hh,
        mm: parts.mm,
        ss: parts.ss,
      },
    },
    dirty: true,
    source,
  }

  return patchDraft(draft, endpoint, nextEndpoint)
}

export function setDraftFocus(draft: DraftState, endpoint: "from" | "to"): DraftState {
  if (draft.lastFocused === endpoint) {
    return draft
  }

  return {
    ...draft,
    lastFocused: endpoint,
  }
}

export function setDraftEndpointDisambiguation(
  draft: DraftState,
  endpoint: "from" | "to",
  disambiguation: "earlier" | "later",
): DraftState {
  const current = draft[endpoint]
  return patchDraft(draft, endpoint, {
    ...current,
    disambiguation,
    dirty: true,
  })
}

export function applyPresetToDraft(
  definition: TimeRangeDefinition,
  lastFocused: "from" | "to",
): DraftState {
  return createDraftStateFromDefinition(definition, {
    source: "preset",
    lastFocused,
  })
}

export function isDraftApplyDisabled(draft: DraftState): boolean {
  return draft.from.parse.kind !== "ok" || draft.to.parse.kind !== "ok"
}

export function buildDefinitionFromDraft(
  draft: DraftState,
  fallback: TimeRangeDefinition,
): { ok: true; definition: TimeRangeDefinition } | { ok: false; message: string } {
  if (draft.from.parse.kind !== "ok") {
    return {
      ok: false,
      message: "开始时间表达式无效。",
    }
  }

  if (draft.to.parse.kind !== "ok") {
    return {
      ok: false,
      message: "结束时间表达式无效。",
    }
  }

  return {
    ok: true,
    definition: {
      ...fallback,
      from: endpointFromDraftState(draft.from.parse.expr, draft.from),
      to: endpointFromDraftState(draft.to.parse.expr, draft.to),
    },
  }
}

function endpointToDraftState(endpoint: EndpointDef, source: DraftSource): DraftEndpointState {
  const rawText = toWallDisplayText(endpoint.expr)
  const parse = parseStoredExpression(endpoint.expr)
  const parts =
    parse.kind === "ok" && parse.kindHint === "wall" ? wallPartsFromExpr(parse.expr) : undefined

  return {
    rawText,
    parse,
    ...(parts ? { parts } : {}),
    ...(endpoint.disambiguation ? { disambiguation: endpoint.disambiguation } : {}),
    ...(endpoint.gapPolicy ? { gapPolicy: endpoint.gapPolicy } : {}),
    ...(endpoint.round ? { round: endpoint.round } : {}),
    dirty: source !== "external_reset",
    source,
  }
}

function parseStoredExpression(expr: string): DraftEndpointParse {
  if (expr.trim() === "") {
    return {
      kind: "empty",
    }
  }

  try {
    const parsed = parseExpression(expr)
    if (parsed.kind === "datemath") {
      return {
        kind: "ok",
        expr: parsed.ast.source,
        kindHint: "datemath",
      }
    }

    if (parsed.kind === "iso") {
      return {
        kind: "ok",
        expr: parsed.iso,
        kindHint: "iso",
      }
    }

    return {
      kind: "ok",
      expr: parsed.normalizedExpr,
      kindHint: "wall",
    }
  } catch (error) {
    return {
      kind: "error",
      message: toErrorMessage(error),
    }
  }
}

function parseRawText(rawText: string): DraftEndpointParse {
  if (rawText.trim() === "") {
    return {
      kind: "empty",
    }
  }

  try {
    const normalized = normalizeInputToExpression(rawText)
    return {
      kind: "ok",
      expr: normalized.expr,
      kindHint: normalized.kindHint,
    }
  } catch (error) {
    return {
      kind: "error",
      message: toErrorMessage(error),
    }
  }
}

function wallPartsFromExpr(expr: string): DraftEndpointState["parts"] {
  const parsed = parseExpression(expr)
  if (parsed.kind !== "wall") {
    return undefined
  }

  return {
    calendarDate: {
      y: parsed.wall.y,
      m: parsed.wall.m,
      d: parsed.wall.d,
    },
    timeParts: {
      hh: parsed.wall.hh,
      mm: parsed.wall.mm,
      ss: parsed.wall.ss,
    },
  }
}

function patchDraft(
  draft: DraftState,
  endpoint: "from" | "to",
  nextEndpoint: DraftEndpointState,
): DraftState {
  return {
    ...draft,
    [endpoint]: nextEndpoint,
    isDirty:
      endpoint === "from"
        ? nextEndpoint.dirty || draft.to.dirty
        : draft.from.dirty || nextEndpoint.dirty,
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof TimeResolveError) {
    return localizeErrorCode(error.code)
  }
  if (error instanceof Error) {
    return error.message
  }
  return "时间表达式无效"
}

function localizeErrorCode(code: ResolveErrorCode): string {
  switch (code) {
    case "INVALID_EXPRESSION":
      return "时间表达式无效。"
    case "INVALID_ISO_WITHOUT_OFFSET":
      return "未带时区偏移的 ISO 时间请按本地时间格式输入。"
    case "INVALID_WALL_TIME":
      return "日期时间格式无效，请使用合法的年月日时分格式。"
    case "ENDPOINT_ROUND_UNIT_REQUIRED":
      return "当前表达式缺少取整单位，无法完成取整。"
    case "START_NOT_BEFORE_END":
      return "结束时间必须晚于开始时间。"
    case "DST_GAP_ERROR":
      return "时间点跨越夏令时边界，请调整输入或时区。"
    default:
      return "时间表达式无效"
  }
}

function endpointFromDraftState(expr: string, endpoint: DraftEndpointState): EndpointDef {
  return {
    expr,
    ...(endpoint.round ? { round: endpoint.round } : {}),
    ...(endpoint.disambiguation ? { disambiguation: endpoint.disambiguation } : {}),
    ...(endpoint.gapPolicy ? { gapPolicy: endpoint.gapPolicy } : {}),
  }
}

function removeParts(endpoint: DraftEndpointState): DraftEndpointState {
  const { parts: _parts, ...rest } = endpoint
  return rest
}
