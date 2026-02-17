export type TimeZoneMode = { kind: "utc" } | { kind: "browser" } | { kind: "iana"; tz: string }

export type Disambiguation = "earlier" | "later"
export type GapPolicy = "next_valid" | "error"

export type EndpointRound = "down" | "up" | "none"

export type EndpointDef = {
  expr: string
  round?: EndpointRound
  disambiguation?: Disambiguation
  gapPolicy?: GapPolicy
}

export type TimeRangeDefinition = {
  from: EndpointDef
  to: EndpointDef
  label?: string
  ui?: {
    editorMode?: "relative" | "absolute" | "mixed"
    rangeTokenMode?: "two_endpoints" | "single_endpoint"
    manualEditorMode?: "datetime" | "date"
  }
}

export type QuickPresetItem = {
  key: string
  label: string
  group: string
  keywords?: string[]
  definition: TimeRangeDefinition
}

export type EngineCaps = {
  supportsDisambiguation: boolean
  supportsGapResolution: boolean
  supportsIanaTimeZones: boolean
}

export type ResolveWarning = {
  code: string
  message: string
}

export type ResolvedTimeRange = {
  startMs: number
  endMs: number
  startIso: string
  endIso: string
  nowMs: number
  timezone: TimeZoneMode
  resolvedTz: string
  engineCaps: EngineCaps
  warnings?: ResolveWarning[]
}

export type ChangeReason = "apply" | "quick_select" | "timezone_change" | "external_sync" | "clear"

export type ZonedParts = {
  tz: string
  y: number
  m: number
  d: number
  hh: number
  mm: number
  ss: number
  ms: number
}

export type Unit = "s" | "m" | "h" | "d" | "w" | "M" | "y"

export type DurationLike = {
  s?: number
  m?: number
  h?: number
  d?: number
  w?: number
  M?: number
  y?: number
}

export type TimeEngine = {
  caps: EngineCaps
  resolveTimezone(mode: TimeZoneMode): { resolvedTz: string }
  nowZoned(nowMs: number, resolvedTz: string): ZonedParts
  zonedPartsToInstant(
    parts: ZonedParts,
    opts: { disambiguation?: Disambiguation; gapPolicy?: GapPolicy },
  ): { ms: number; warnings?: ResolveWarning[] }
  instantToZonedParts(ms: number, resolvedTz: string): ZonedParts
  roundDown(parts: ZonedParts, unit: Unit, weekStartsOn: 0 | 1 | 6): ZonedParts
  add(parts: ZonedParts, dur: DurationLike): ZonedParts
}

export type ResolveOptions = {
  nowMs: number
  timezone: TimeZoneMode
  weekStartsOn: 0 | 1 | 6
  engine: TimeEngine
}

export type ResolvedPayload = {
  definition: TimeRangeDefinition
  resolved: ResolvedTimeRange
}

export type ResolvedChangeMeta = {
  reason: ChangeReason
  timezone: TimeZoneMode
}
