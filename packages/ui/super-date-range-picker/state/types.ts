import type {
  Disambiguation,
  EndpointRound,
  GapPolicy,
  TimeRangeDefinition,
  TimeZoneMode,
} from "../core"

export type DraftSource = "typing" | "calendar" | "scroller" | "blur" | "preset" | "external_reset"

export type DraftEndpointParse =
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | {
      kind: "ok"
      expr: string
      kindHint: "datemath" | "iso" | "wall"
    }

export type DraftEndpointState = {
  rawText: string
  parse: DraftEndpointParse
  parts?: {
    calendarDate: { y: number; m: number; d: number }
    timeParts: { hh: number; mm: number; ss: number }
  }
  disambiguation?: Disambiguation
  gapPolicy?: GapPolicy
  round?: EndpointRound
  dirty: boolean
  source: DraftSource
}

export type DraftState = {
  from: DraftEndpointState
  to: DraftEndpointState
  isDirty: boolean
  lastFocused: "from" | "to"
}

export type PickerBehavior = {
  whileEditing: "freeze_trigger_ui" | "normal"
}

export type InternalPickerState = {
  committedDefinition: TimeRangeDefinition
  timezone: TimeZoneMode
}
