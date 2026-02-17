import { Label, RadioGroup, RadioGroupItem } from "@/packages/ui"

const OPTIONS = [
  { value: "day", label: "按日" },
  { value: "week", label: "按周" },
  { value: "month", label: "按月" },
]

export function RadioGroupBasicDemo() {
  return (
    <RadioGroup defaultValue="week" className="max-w-xs">
      {OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem id={`radio-${option.value}`} value={option.value} />
          <Label htmlFor={`radio-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export default RadioGroupBasicDemo
