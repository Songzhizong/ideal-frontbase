import { Button } from "@/packages/ui"

const BUTTON_COLORS = [
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
  "carbon",
  "secondary",
  "accent",
] as const

export function ButtonMdColorDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BUTTON_COLORS.map((color) => (
        <Button key={color} color={color}>
          {color}
        </Button>
      ))}
    </div>
  )
}

export default ButtonMdColorDemo
