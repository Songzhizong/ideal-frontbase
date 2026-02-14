import { useId } from "react"
import { Input } from "@/packages/ui/input"
import { ScrollArea } from "@/packages/ui/scroll-area"
import { cn } from "@/packages/ui-utils"

type TimeSelectionPanelProps = {
  value: { hh: number; mm: number; ss: number }
  onChange: (next: { hh: number; mm: number }) => void
}

const HOURS = Array.from({ length: 24 }, (_, value) => value)
const MINUTES = Array.from({ length: 60 }, (_, value) => value)

export function TimeSelectionPanel(props: TimeSelectionPanelProps) {
  return (
    <div className="flex h-full min-h-[280px] min-w-[220px] flex-col rounded-md border border-border/50">
      <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-border/50">
        <TimeOptionColumn
          title="小时"
          values={HOURS}
          selected={props.value.hh}
          onSelect={(hour) => props.onChange({ hh: hour, mm: props.value.mm })}
        />
        <TimeOptionColumn
          title="分钟"
          values={MINUTES}
          selected={props.value.mm}
          onSelect={(minute) => props.onChange({ hh: props.value.hh, mm: minute })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/50 p-2">
        <TimeNumberInput
          label="小时"
          min={0}
          max={23}
          value={props.value.hh}
          onChange={(hour) => props.onChange({ hh: hour, mm: props.value.mm })}
        />
        <TimeNumberInput
          label="分钟"
          min={0}
          max={59}
          value={props.value.mm}
          onChange={(minute) => props.onChange({ hh: props.value.hh, mm: minute })}
        />
      </div>
    </div>
  )
}

function TimeOptionColumn(props: {
  title: string
  values: number[]
  selected: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="px-2 py-1.5 text-center text-xs text-muted-foreground">{props.title}</div>
      <ScrollArea className="h-[212px]">
        <div className="space-y-1 p-1.5">
          {props.values.map((value) => (
            <button
              key={`${props.title}-${value}`}
              type="button"
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-sm font-mono text-sm tabular-nums transition-colors",
                props.selected === value ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
              onClick={() => props.onSelect(value)}
            >
              {formatTwoDigits(value)}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function TimeNumberInput(props: {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}) {
  const id = useId()

  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{props.label}</span>
      <Input
        id={id}
        type="number"
        role="spinbutton"
        min={props.min}
        max={props.max}
        step={1}
        value={props.value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10)
          if (Number.isNaN(parsed)) {
            return
          }
          const clamped = Math.min(props.max, Math.max(props.min, parsed))
          props.onChange(clamped)
        }}
        className="h-8 text-sm"
      />
    </label>
  )
}

function formatTwoDigits(value: number) {
  return String(value).padStart(2, "0")
}
