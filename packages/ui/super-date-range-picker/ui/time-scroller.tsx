import { useId } from "react"
import { Input } from "@/packages/ui/input"

type TimeScrollerProps = {
  value: { hh: number; mm: number; ss: number }
  onChange: (next: { hh: number; mm: number; ss: number }) => void
  labelPrefix: string
}

export function TimeScroller(props: TimeScrollerProps) {
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">{`${props.labelPrefix} time scroller`}</legend>
      <NumberSpin
        label="Hour"
        min={0}
        max={23}
        value={props.value.hh}
        onValueChange={(hh) => props.onChange({ ...props.value, hh })}
      />
      <NumberSpin
        label="Minute"
        min={0}
        max={59}
        value={props.value.mm}
        onValueChange={(mm) => props.onChange({ ...props.value, mm })}
      />
      <NumberSpin
        label="Second"
        min={0}
        max={59}
        value={props.value.ss}
        onValueChange={(ss) => props.onChange({ ...props.value, ss })}
      />
    </fieldset>
  )
}

function NumberSpin(props: {
  label: string
  min: number
  max: number
  value: number
  onValueChange: (value: number) => void
}) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1 text-xs">
      <label htmlFor={id} className="text-muted-foreground">
        {props.label}
      </label>
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
          props.onValueChange(clamped)
        }}
        className="h-8 text-sm"
      />
    </div>
  )
}
