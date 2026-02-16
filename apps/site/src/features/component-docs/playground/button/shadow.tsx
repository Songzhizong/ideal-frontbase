import { Button } from "@/packages/ui"

const BUTTON_SHADOWS = ["none", "sm", "md", "lg"] as const

export function ButtonMdShadowDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BUTTON_SHADOWS.map((shadow) => (
        <Button key={shadow} variant="pure" shadow={shadow}>
          {shadow}
        </Button>
      ))}
    </div>
  )
}

export default ButtonMdShadowDemo
