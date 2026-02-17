import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { type ResolveErrorCode, TimeResolveError } from "@/packages/ui"
import {
  type ChangeReason,
  createDefaultTimeEngine,
  type QuickPresetItem,
  type ResolvedChangeMeta,
  type ResolvedPayload,
  type ResolveWarning,
  resolveRange,
  type TimeEngine,
  type TimeRangeDefinition,
  type TimeZoneMode,
} from "../core"
import {
  applyPresetToDraft,
  buildDefinitionFromDraft,
  createDraftStateFromDefinition,
  isDraftApplyDisabled,
  setDraftEndpointDisambiguation,
  setDraftFocus,
  updateDraftByBlur,
  updateDraftByCalendarOrScroller,
  updateDraftByTyping,
} from "./draft-state"
import { createLiveResolvedStore } from "./live-resolved-store"
import type { DraftState, PickerBehavior } from "./types"

export type SuperDateRangePickerProps = {
  value?: TimeRangeDefinition | null
  defaultValue?: TimeRangeDefinition | null

  timezone?: TimeZoneMode
  defaultTimezone?: TimeZoneMode
  onTimezoneChange?: (tz: TimeZoneMode) => void

  onResolvedChange?: (payload: ResolvedPayload | null, meta: ResolvedChangeMeta) => void

  nowProvider?: () => number
  weekStartsOn?: 0 | 1 | 6
  locale?: string

  allowEmpty?: boolean
  clearable?: boolean
  placeholder?: string
  manualEditorMode?: "datetime" | "date"

  quickPresets: QuickPresetItem[]
  quickSearchPlaceholder?: string
  quickEmptyText?: string

  quickSelectBehavior?: "commit" | "draft"
  timezoneOptions?: TimeZoneMode[]
  behavior?: PickerBehavior
  timeEngine?: TimeEngine
}

type DraftPreview =
  | {
      kind: "ok"
      payload: ResolvedPayload
      warnings: ResolveWarning[]
      applyDisabled: boolean
    }
  | {
      kind: "error"
      message: string
      applyDisabled: boolean
    }

type InitialResolution = {
  payload: ResolvedPayload | null
  error: string | null
}

type InternalSyncIntent = {
  definition: TimeRangeDefinition | null
  timezone: TimeZoneMode
}

const DEFAULT_DEFINITION: TimeRangeDefinition = {
  from: { expr: "now-15m" },
  to: { expr: "now" },
  label: "最近 15 分钟",
  ui: {
    editorMode: "relative",
  },
}

const DEFAULT_BEHAVIOR: PickerBehavior = {
  whileEditing: "freeze_trigger_ui",
}

const DEFAULT_TIMEZONE_OPTIONS: TimeZoneMode[] = [{ kind: "utc" }, { kind: "browser" }]

export function useSuperDateRangePickerController(props: SuperDateRangePickerProps) {
  const engine = props.timeEngine ?? createDefaultTimeEngine()
  const onTimezoneChange = props.onTimezoneChange
  const nowProvider = props.nowProvider ?? Date.now
  const weekStartsOn = props.weekStartsOn ?? 1
  const behavior = props.behavior ?? DEFAULT_BEHAVIOR
  const allowEmpty = props.allowEmpty ?? false
  const isValueControlled = props.value !== undefined
  const isTimezoneControlled = props.timezone !== undefined

  const [committedDefinition, setCommittedDefinition] = useState<TimeRangeDefinition | null>(() => {
    if (props.value !== undefined) {
      return props.value
    }
    if (props.defaultValue !== undefined) {
      return props.defaultValue
    }
    return allowEmpty ? null : DEFAULT_DEFINITION
  })
  const [timezone, setTimezone] = useState<TimeZoneMode>(
    props.timezone ?? props.defaultTimezone ?? { kind: "browser" },
  )
  const timezoneOptions = useMemo(
    () => normalizeTimezoneOptions(props.timezoneOptions, timezone),
    [props.timezoneOptions, timezone],
  )

  const [isOpen, setIsOpen] = useState(false)
  const [hasExternalUpdate, setHasExternalUpdate] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [manualEditorMode, setManualEditorMode] = useState<"datetime" | "date">(
    props.manualEditorMode ?? readManualEditorMode(committedDefinition),
  )

  const [draft, setDraft] = useState<DraftState>(() =>
    createDraftStateFromDefinition(committedDefinition ?? DEFAULT_DEFINITION),
  )

  const initialNowRef = useRef<number | null>(null)
  if (initialNowRef.current === null) {
    initialNowRef.current = nowProvider()
  }
  const initialNow = initialNowRef.current
  const initialResolutionRef = useRef<InitialResolution | null>(null)
  if (initialResolutionRef.current === null) {
    if (!committedDefinition) {
      initialResolutionRef.current = {
        payload: null,
        error: null,
      }
    } else {
      try {
        const resolved = resolveRange(committedDefinition, {
          nowMs: initialNow,
          timezone,
          weekStartsOn,
          engine,
        })
        initialResolutionRef.current = {
          payload: {
            definition: committedDefinition,
            resolved,
          },
          error: null,
        }
      } catch (error) {
        initialResolutionRef.current = {
          payload: null,
          error: toErrorMessage(error),
        }
      }
    }
  }

  const initialResolution = initialResolutionRef.current
  const [syncError, setSyncError] = useState<string | null>(initialResolution.error)
  const liveStoreRef = useRef(createLiveResolvedStore(initialResolution.payload))
  const [frozenSnapshot, setFrozenSnapshot] = useState<ResolvedPayload | null>(null)

  const onResolvedChangeRef = useLatestRef(props.onResolvedChange)
  const pendingInternalSyncRef = useRef<InternalSyncIntent | null>(null)

  const emitResolvedChange = useCallback(
    (payload: ResolvedPayload | null, reason: ChangeReason, nextTimezone: TimeZoneMode) => {
      onResolvedChangeRef.current?.(payload, {
        reason,
        timezone: nextTimezone,
      })
    },
    [onResolvedChangeRef],
  )

  const markPendingInternalSync = useCallback(
    (definition: TimeRangeDefinition | null, nextTimezone: TimeZoneMode) => {
      pendingInternalSyncRef.current = {
        definition,
        timezone: nextTimezone,
      }
    },
    [],
  )

  const consumePendingInternalSync = useCallback(
    (definition: TimeRangeDefinition | null, nextTimezone: TimeZoneMode) => {
      const pending = pendingInternalSyncRef.current
      if (!pending) {
        return false
      }
      pendingInternalSyncRef.current = null
      return (
        isDefinitionEqual(pending.definition, definition) &&
        isTimezoneEqual(pending.timezone, nextTimezone)
      )
    },
    [],
  )

  const resolveDefinition = useCallback(
    (definition: TimeRangeDefinition, nextTimezone: TimeZoneMode): ResolvedPayload | null => {
      try {
        const nowMs = nowProvider()
        const resolved = resolveRange(definition, {
          nowMs,
          timezone: nextTimezone,
          weekStartsOn,
          engine,
        })
        return {
          definition,
          resolved,
        }
      } catch (error) {
        setSyncError(toErrorMessage(error))
        return null
      }
    },
    [nowProvider, weekStartsOn, engine],
  )

  const todayCalendarDate = useMemo(() => {
    const { resolvedTz } = engine.resolveTimezone(timezone)
    const today = engine.nowZoned(nowProvider(), resolvedTz)
    return {
      y: today.y,
      m: today.m,
      d: today.d,
    }
  }, [engine, nowProvider, timezone])

  const syncLiveFromExternal = useCallback(
    (
      definition: TimeRangeDefinition | null,
      tz: TimeZoneMode,
      reason: ChangeReason,
      options?: { suppressEmit?: boolean },
    ) => {
      if (!definition) {
        setSyncError(null)
        liveStoreRef.current.setSnapshot(null)
        if (!options?.suppressEmit) {
          emitResolvedChange(null, reason, tz)
        }
        return
      }

      const payload = resolveDefinition(definition, tz)
      if (!payload) {
        liveStoreRef.current.setSnapshot(null)
        if (!options?.suppressEmit) {
          emitResolvedChange(null, reason, tz)
        }
        return
      }

      setSyncError(null)
      liveStoreRef.current.setSnapshot(payload)
      if (!options?.suppressEmit) {
        emitResolvedChange(payload, reason, tz)
      }
    },
    [resolveDefinition, emitResolvedChange],
  )

  useEffect(() => {
    if (props.value === undefined) {
      return
    }

    if (props.value === null) {
      if (committedDefinition === null) {
        return
      }

      if (isOpen && draft.isDirty) {
        setHasExternalUpdate(true)
      } else {
        setDraft(createDraftStateFromDefinition(DEFAULT_DEFINITION))
      }

      setCommittedDefinition(null)
      syncLiveFromExternal(null, timezone, "external_sync", {
        suppressEmit: consumePendingInternalSync(null, timezone),
      })
      return
    }

    if (!isDefinitionEqual(props.value, committedDefinition)) {
      if (isOpen && draft.isDirty) {
        setHasExternalUpdate(true)
      } else {
        setDraft(createDraftStateFromDefinition(props.value))
      }

      setCommittedDefinition(props.value)
      syncLiveFromExternal(props.value, timezone, "external_sync", {
        suppressEmit: consumePendingInternalSync(props.value, timezone),
      })
    }
  }, [
    props.value,
    committedDefinition,
    isOpen,
    draft.isDirty,
    timezone,
    syncLiveFromExternal,
    consumePendingInternalSync,
  ])

  useEffect(() => {
    if (props.timezone && !isTimezoneEqual(props.timezone, timezone)) {
      setTimezone(props.timezone)
      syncLiveFromExternal(committedDefinition, props.timezone, "external_sync", {
        suppressEmit: consumePendingInternalSync(committedDefinition, props.timezone),
      })
    }
  }, [
    props.timezone,
    timezone,
    committedDefinition,
    syncLiveFromExternal,
    consumePendingInternalSync,
  ])

  useEffect(() => {
    if (!props.manualEditorMode) {
      return
    }
    setManualEditorMode(props.manualEditorMode)
  }, [props.manualEditorMode])

  useEffect(() => {
    if (props.manualEditorMode) {
      return
    }
    setManualEditorMode(readManualEditorMode(committedDefinition))
  }, [props.manualEditorMode, committedDefinition])

  useEffect(() => {
    if (!isOpen) {
      setFrozenSnapshot(null)
      return
    }

    if (behavior.whileEditing === "freeze_trigger_ui") {
      setFrozenSnapshot(liveStoreRef.current.getSnapshot())
    } else {
      setFrozenSnapshot(null)
    }
  }, [isOpen, behavior.whileEditing])

  const draftPreview: DraftPreview = useMemo(() => {
    const fallbackDefinition = committedDefinition ?? DEFAULT_DEFINITION

    if (isDraftApplyDisabled(draft)) {
      return {
        kind: "error",
        message: "开始或结束时间表达式无效。",
        applyDisabled: true,
      }
    }

    const built = buildDefinitionFromDraft(draft, fallbackDefinition)
    if (!built.ok) {
      return {
        kind: "error",
        message: built.message,
        applyDisabled: true,
      }
    }

    try {
      const nowMs = nowProvider()
      const resolved = resolveRange(built.definition, {
        nowMs,
        timezone,
        weekStartsOn,
        engine,
      })

      return {
        kind: "ok",
        payload: {
          definition: built.definition,
          resolved,
        },
        warnings: resolved.warnings ?? [],
        applyDisabled: false,
      }
    } catch (error) {
      return {
        kind: "error",
        message: toErrorMessage(error),
        applyDisabled: false,
      }
    }
  }, [draft, committedDefinition, timezone, weekStartsOn, engine, nowProvider])

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open)

      if (open) {
        setDraft((prev) =>
          createDraftStateFromDefinition(committedDefinition ?? DEFAULT_DEFINITION, {
            source: "external_reset",
            lastFocused: prev.lastFocused,
          }),
        )
        setHasExternalUpdate(false)
        setApplyError(null)
      }
    },
    [committedDefinition],
  )

  const applyDraft = useCallback(() => {
    const fallbackDefinition = committedDefinition ?? DEFAULT_DEFINITION
    const built = buildDefinitionFromDraft(draft, fallbackDefinition)
    if (!built.ok) {
      setApplyError(built.message)
      return
    }

    try {
      const nowMs = nowProvider()
      const resolved = resolveRange(built.definition, {
        nowMs,
        timezone,
        weekStartsOn,
        engine,
      })

      const payload: ResolvedPayload = {
        definition: {
          ...built.definition,
          ui: {
            ...(built.definition.ui ?? {}),
            manualEditorMode,
          },
        },
        resolved,
      }

      if (!isValueControlled) {
        setCommittedDefinition(payload.definition)
      }
      setDraft(createDraftStateFromDefinition(payload.definition, { source: "external_reset" }))
      setApplyError(null)
      setSyncError(null)
      setIsOpen(false)
      setHasExternalUpdate(false)
      liveStoreRef.current.setSnapshot(payload)
      markPendingInternalSync(payload.definition, payload.resolved.timezone)
      emitResolvedChange(payload, "apply", payload.resolved.timezone)
    } catch (error) {
      setApplyError(toErrorMessage(error))
    }
  }, [
    draft,
    committedDefinition,
    nowProvider,
    timezone,
    weekStartsOn,
    engine,
    emitResolvedChange,
    manualEditorMode,
    isValueControlled,
    markPendingInternalSync,
  ])

  const applyQuickPreset = useCallback(
    (definition: TimeRangeDefinition) => {
      if (props.quickSelectBehavior === "draft") {
        setDraft((prev) => applyPresetToDraft(definition, prev.lastFocused))
        setApplyError(null)
        return
      }

      try {
        const nowMs = nowProvider()
        const resolved = resolveRange(definition, {
          nowMs,
          timezone,
          weekStartsOn,
          engine,
        })
        const payload: ResolvedPayload = {
          definition,
          resolved,
        }

        if (!isValueControlled) {
          setCommittedDefinition(definition)
        }
        setDraft(createDraftStateFromDefinition(definition, { source: "preset" }))
        setApplyError(null)
        setSyncError(null)
        setIsOpen(false)
        liveStoreRef.current.setSnapshot(payload)
        markPendingInternalSync(payload.definition, payload.resolved.timezone)
        emitResolvedChange(payload, "quick_select", payload.resolved.timezone)
      } catch (error) {
        setApplyError(toErrorMessage(error))
      }
    },
    [
      props.quickSelectBehavior,
      nowProvider,
      timezone,
      weekStartsOn,
      engine,
      emitResolvedChange,
      isValueControlled,
      markPendingInternalSync,
    ],
  )

  const changeTimezone = useCallback(
    (nextTimezone: TimeZoneMode) => {
      if (!isTimezoneControlled) {
        setTimezone(nextTimezone)
      }
      onTimezoneChange?.(nextTimezone)

      if (!committedDefinition) {
        setSyncError(null)
        liveStoreRef.current.setSnapshot(null)
        markPendingInternalSync(null, nextTimezone)
        emitResolvedChange(null, "timezone_change", nextTimezone)
        return
      }

      try {
        const nowMs = nowProvider()
        const resolved = resolveRange(committedDefinition, {
          nowMs,
          timezone: nextTimezone,
          weekStartsOn,
          engine,
        })
        const payload: ResolvedPayload = {
          definition: committedDefinition,
          resolved,
        }

        setSyncError(null)
        liveStoreRef.current.setSnapshot(payload)
        markPendingInternalSync(payload.definition, nextTimezone)
        emitResolvedChange(payload, "timezone_change", nextTimezone)
      } catch (error) {
        setSyncError(toErrorMessage(error))
        liveStoreRef.current.setSnapshot(null)
        markPendingInternalSync(committedDefinition, nextTimezone)
        emitResolvedChange(null, "timezone_change", nextTimezone)
      }
    },
    [
      onTimezoneChange,
      nowProvider,
      committedDefinition,
      weekStartsOn,
      engine,
      emitResolvedChange,
      isTimezoneControlled,
      markPendingInternalSync,
    ],
  )

  const clearSelection = useCallback(() => {
    if (!allowEmpty) {
      return
    }

    if (!isValueControlled) {
      setCommittedDefinition(null)
    }
    setDraft(createDraftStateFromDefinition(DEFAULT_DEFINITION, { source: "external_reset" }))
    setApplyError(null)
    setSyncError(null)
    setIsOpen(false)
    setHasExternalUpdate(false)
    setFrozenSnapshot(null)
    liveStoreRef.current.setSnapshot(null)
    markPendingInternalSync(null, timezone)
    emitResolvedChange(null, "clear", timezone)
  }, [allowEmpty, emitResolvedChange, timezone, isValueControlled, markPendingInternalSync])

  return {
    engine,
    weekStartsOn,
    locale: props.locale,
    allowEmpty,
    clearable: props.clearable ?? true,
    placeholder: props.placeholder ?? "请选择时间",
    quickPresets: props.quickPresets,
    quickSearchPlaceholder: props.quickSearchPlaceholder ?? "搜索快捷选项",
    quickEmptyText: props.quickEmptyText ?? "暂无匹配的快捷项",
    timezoneOptions,
    behavior,

    committedDefinition,
    timezone,

    isOpen,
    setOpen,
    hasExternalUpdate,
    setHasExternalUpdate,

    draft,
    setDraft,
    draftPreview,
    applyError,
    syncError,
    frozenSnapshot,
    todayCalendarDate,

    liveStore: liveStoreRef.current,

    updateDraftByTyping: (endpoint: "from" | "to", rawText: string) => {
      setApplyError(null)
      setDraft((prev) => updateDraftByTyping(prev, endpoint, rawText))
    },
    updateDraftByBlur: (endpoint: "from" | "to") => {
      setApplyError(null)
      setDraft((prev) => updateDraftByBlur(prev, endpoint))
    },
    updateDraftByCalendarOrScroller: (
      endpoint: "from" | "to",
      parts: { y: number; m: number; d: number; hh: number; mm: number; ss: number },
      source: "calendar" | "scroller",
    ) => {
      setApplyError(null)
      setDraft((prev) => updateDraftByCalendarOrScroller(prev, endpoint, parts, source))
    },
    setDraftFocus: (endpoint: "from" | "to") => {
      setDraft((prev) => setDraftFocus(prev, endpoint))
    },
    setDraftDisambiguation: (endpoint: "from" | "to", disambiguation: "earlier" | "later") => {
      setApplyError(null)
      setDraft((prev) => setDraftEndpointDisambiguation(prev, endpoint, disambiguation))
    },

    applyDraft,
    applyQuickPreset,
    changeTimezone,
    clearSelection,

    resetDraftFromCommitted: () => {
      setDraft(createDraftStateFromDefinition(committedDefinition ?? DEFAULT_DEFINITION))
      setHasExternalUpdate(false)
      setApplyError(null)
    },

    manualEditorMode,
    setManualEditorMode: (nextMode: "datetime" | "date") => {
      if (props.manualEditorMode) {
        return
      }
      setManualEditorMode(nextMode)
    },

    fromDisplayText: draft.from.rawText,
    toDisplayText: draft.to.rawText,
  }
}

function readManualEditorMode(definition: TimeRangeDefinition | null): "datetime" | "date" {
  return definition?.ui?.manualEditorMode ?? "datetime"
}

function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

function isDefinitionEqual(a: TimeRangeDefinition | null, b: TimeRangeDefinition | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function isTimezoneEqual(a: TimeZoneMode, b: TimeZoneMode): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizeTimezoneOptions(
  input: TimeZoneMode[] | undefined,
  currentTimezone: TimeZoneMode,
): TimeZoneMode[] {
  const source = input && input.length > 0 ? input : DEFAULT_TIMEZONE_OPTIONS
  const normalized: TimeZoneMode[] = []

  for (const timezone of source) {
    if (normalized.some((existing) => isTimezoneEqual(existing, timezone))) {
      continue
    }
    normalized.push(timezone)
  }

  if (!normalized.some((timezone) => isTimezoneEqual(timezone, currentTimezone))) {
    normalized.push(currentTimezone)
  }

  return normalized
}

function toErrorMessage(error: unknown): string {
  if (error instanceof TimeResolveError) {
    return localizeErrorCode(error.code)
  }
  if (error instanceof Error) {
    return error.message
  }
  return "时间范围无效"
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
      return "时间范围无效"
  }
}
