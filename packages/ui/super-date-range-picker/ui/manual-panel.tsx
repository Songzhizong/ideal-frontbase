import { zhCN } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { type RefObject, useEffect, useId, useRef, useState } from "react"
import { Button } from "@/packages/ui/button"
import { Calendar } from "@/packages/ui/calendar"
import { Input } from "@/packages/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover"
import { cn } from "@/packages/ui-utils"
import { parseExpression } from "../core"
import type { DraftState } from "../state/types"
import { TimeSelectionPanel } from "./time-selection-panel"

type ManualPanelProps = {
  draft: DraftState
  fromDisplayText: string
  toDisplayText: string
  editorMode: "datetime" | "date"
  modeLocked: boolean
  disambiguationEnabled: boolean
  onEditorModeChange: (mode: "datetime" | "date") => void
  onTyping: (endpoint: "from" | "to", text: string) => void
  onBlur: (endpoint: "from" | "to") => void
  onFocus: (endpoint: "from" | "to") => void
  onSetDisambiguation: (endpoint: "from" | "to", value: "earlier" | "later") => void
  onCalendarOrScroller: (
    endpoint: "from" | "to",
    parts: { y: number; m: number; d: number; hh: number; mm: number; ss: number },
    source: "calendar" | "scroller",
  ) => void
  todayCalendarDate: {
    y: number
    m: number
    d: number
  }
  inputRefs: {
    from: RefObject<HTMLInputElement | null>
    to: RefObject<HTMLInputElement | null>
  }
}

export function ManualPanel(props: ManualPanelProps) {
  const editorMode = props.editorMode
  const isEditorModeLocked = props.modeLocked

  return (
    <div className="flex h-full w-full flex-col gap-2.5">
      {!isEditorModeLocked ? (
        <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-2 py-1.5">
          <span className="text-xs text-muted-foreground">编辑模式</span>
          <div className="inline-flex items-center rounded-md border border-border/60 bg-background p-0.5">
            <ModeOptionButton
              selected={editorMode === "datetime"}
              onClick={() => props.onEditorModeChange("datetime")}
            >
              日期时间
            </ModeOptionButton>
            <ModeOptionButton
              selected={editorMode === "date"}
              onClick={() => props.onEditorModeChange("date")}
            >
              仅日期
            </ModeOptionButton>
          </div>
        </div>
      ) : null}

      <EndpointInput
        inputRef={props.inputRefs.from}
        label="开始时间"
        value={props.fromDisplayText}
        selectedDate={draftPartToDate(props.draft.from)}
        time={props.draft.from.parts?.timeParts ?? { hh: 0, mm: 0, ss: 0 }}
        editorMode={editorMode}
        parseState={props.draft.from.parse}
        onChange={(value) => props.onTyping("from", value)}
        onBlur={() => props.onBlur("from")}
        onFocus={() => props.onFocus("from")}
        onSelectDate={(date) => {
          const next = buildEndpointParts({
            draftEndpoint: props.draft.from,
            date,
            editorMode,
          })
          props.onCalendarOrScroller("from", next, "calendar")
        }}
        onChangeTime={(time) => {
          const baseDate = props.draft.from.parts?.calendarDate ?? props.todayCalendarDate
          props.onCalendarOrScroller(
            "from",
            {
              y: baseDate.y,
              m: baseDate.m,
              d: baseDate.d,
              hh: time.hh,
              mm: time.mm,
              ss: 0,
            },
            "scroller",
          )
        }}
      />

      <EndpointInput
        inputRef={props.inputRefs.to}
        label="结束时间"
        value={props.toDisplayText}
        selectedDate={draftPartToDate(props.draft.to)}
        time={props.draft.to.parts?.timeParts ?? { hh: 0, mm: 0, ss: 0 }}
        editorMode={editorMode}
        parseState={props.draft.to.parse}
        onChange={(value) => props.onTyping("to", value)}
        onBlur={() => props.onBlur("to")}
        onFocus={() => props.onFocus("to")}
        onSelectDate={(date) => {
          const next = buildEndpointParts({
            draftEndpoint: props.draft.to,
            date,
            editorMode,
          })
          props.onCalendarOrScroller("to", next, "calendar")
        }}
        onChangeTime={(time) => {
          const baseDate = props.draft.to.parts?.calendarDate ?? props.todayCalendarDate
          props.onCalendarOrScroller(
            "to",
            {
              y: baseDate.y,
              m: baseDate.m,
              d: baseDate.d,
              hh: time.hh,
              mm: time.mm,
              ss: 0,
            },
            "scroller",
          )
        }}
      />

      {props.disambiguationEnabled ? (
        <div className="flex flex-col gap-2">
          <DisambiguationControl
            label="开始时间重叠策略"
            value={props.draft.from.disambiguation ?? "earlier"}
            onChange={(value) => props.onSetDisambiguation("from", value)}
          />
          <DisambiguationControl
            label="结束时间重叠策略"
            value={props.draft.to.disambiguation ?? "earlier"}
            onChange={(value) => props.onSetDisambiguation("to", value)}
          />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          当前引擎不支持重叠时间消歧，系统会默认采用较早时间点。
        </div>
      )}
    </div>
  )
}

function EndpointInput(props: {
  label: string
  value: string
  selectedDate: Date | undefined
  time: { hh: number; mm: number; ss: number }
  editorMode: "datetime" | "date"
  parseState: DraftState["from"]["parse"]
  onChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onSelectDate: (date: Date) => void
  onChangeTime: (value: { hh: number; mm: number }) => void
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const [isPickerOpen, setPickerOpen] = useState(false)
  const inputId = useId()
  const errorId = useId()
  const hasError = props.parseState.kind === "error"
  const pickerSurfaceRef = useRef<HTMLDivElement>(null)
  const isPointerInteractingWithPickerRef = useRef(false)
  const pendingBlurTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (pendingBlurTimerRef.current !== null) {
        window.clearTimeout(pendingBlurTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-1 text-xs">
      <label htmlFor={inputId} className="text-muted-foreground">
        {props.label}
      </label>
      <div
        className={cn(
          "flex h-8 overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          hasError &&
            "border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40",
        )}
      >
        <Input
          id={inputId}
          ref={props.inputRef}
          value={toDisplayedEndpointValue(props.value, props.parseState, props.editorMode)}
          onChange={(event) => props.onChange(event.target.value)}
          onFocus={props.onFocus}
          onBlur={(event) => {
            if (isPointerInteractingWithPickerRef.current) {
              return
            }

            const nextFocusedTarget = event.relatedTarget
            if (isFocusInsidePicker(nextFocusedTarget, pickerSurfaceRef.current)) {
              return
            }

            if (isPickerOpen) {
              if (pendingBlurTimerRef.current !== null) {
                window.clearTimeout(pendingBlurTimerRef.current)
              }

              pendingBlurTimerRef.current = window.setTimeout(() => {
                pendingBlurTimerRef.current = null
                if (isFocusInsidePicker(document.activeElement, pickerSurfaceRef.current)) {
                  return
                }
                props.onBlur()
              }, 0)
              return
            }

            props.onBlur()
          }}
          onClick={() => setPickerOpen(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          placeholder="支持输入 now-1h / 2026-02-14 10:00 / 2026-02-14T10:00:00Z"
          className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Popover open={isPickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-full w-9 rounded-none border-l border-border/50 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => props.onFocus()}
              aria-label={`选择${props.label}`}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto max-w-[min(92vw,740px)] p-2"
            align="start"
            sideOffset={6}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
            }}
          >
            <div
              ref={pickerSurfaceRef}
              className="space-y-2"
              onPointerDownCapture={() => {
                isPointerInteractingWithPickerRef.current = true
              }}
              onPointerUpCapture={() => {
                queueMicrotask(() => {
                  isPointerInteractingWithPickerRef.current = false
                })
              }}
              onPointerCancelCapture={() => {
                isPointerInteractingWithPickerRef.current = false
              }}
            >
              <div className="text-xs font-medium text-foreground">{props.label}</div>

              <div
                className={cn(
                  "grid items-start gap-2",
                  props.editorMode === "datetime" && "sm:grid-cols-[max-content_220px]",
                )}
              >
                <div className="flex justify-center rounded-md border border-border/50 px-2">
                  <Calendar
                    mode="single"
                    numberOfMonths={1}
                    selected={props.selectedDate}
                    locale={zhCN}
                    weekStartsOn={1}
                    onSelect={(date) => {
                      if (!date) {
                        return
                      }
                      props.onSelectDate(date)
                    }}
                  />
                </div>

                {props.editorMode === "datetime" ? (
                  <TimeSelectionPanel
                    value={props.time}
                    onChange={(time) => {
                      props.onChangeTime(time)
                    }}
                  />
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPickerOpen(false)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasError ? (
        <span id={errorId} role="alert" className="text-[11px] text-destructive">
          {props.parseState.kind === "error" ? props.parseState.message : null}
        </span>
      ) : null}
    </div>
  )
}

function DisambiguationControl(props: {
  label: string
  value: "earlier" | "later"
  onChange: (value: "earlier" | "later") => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{props.label}</span>
      <select
        aria-label={props.label}
        className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm"
        value={props.value}
        onChange={(event) => {
          const value = event.target.value === "later" ? "later" : "earlier"
          props.onChange(value)
        }}
      >
        <option value="earlier">较早时间点</option>
        <option value="later">较晚时间点</option>
      </select>
    </label>
  )
}

function ModeOptionButton(props: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "rounded-sm px-2 py-1 text-xs transition-colors",
        props.selected
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}

function draftPartToDate(endpoint: DraftState["from"]): Date | undefined {
  if (!endpoint.parts) {
    return undefined
  }

  const { y, m, d } = endpoint.parts.calendarDate
  return new Date(y, m - 1, d)
}

function buildEndpointParts(args: {
  draftEndpoint: DraftState["from"]
  date: Date
  editorMode: "datetime" | "date"
}) {
  const current = args.draftEndpoint.parts?.timeParts ?? { hh: 0, mm: 0, ss: 0 }
  const time =
    args.editorMode === "date" ? { hh: 0, mm: 0, ss: 0 } : { hh: current.hh, mm: current.mm, ss: 0 }
  return {
    y: args.date.getFullYear(),
    m: args.date.getMonth() + 1,
    d: args.date.getDate(),
    hh: time.hh,
    mm: time.mm,
    ss: time.ss,
  }
}

function isFocusInsidePicker(
  target: EventTarget | null,
  pickerSurface: HTMLDivElement | null,
): boolean {
  if (!(target instanceof Node)) {
    return false
  }

  return Boolean(pickerSurface?.contains(target))
}

function toDisplayedEndpointValue(
  rawValue: string,
  parseState: DraftState["from"]["parse"],
  editorMode: "datetime" | "date",
): string {
  if (editorMode === "datetime") {
    return rawValue
  }

  if (parseState.kind === "ok" && parseState.kindHint === "wall") {
    const parsed = parseExpression(parseState.expr)
    if (parsed.kind === "wall") {
      return `${pad(parsed.wall.y, 4)}-${pad(parsed.wall.m)}-${pad(parsed.wall.d)}`
    }
  }

  return rawValue
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0")
}
