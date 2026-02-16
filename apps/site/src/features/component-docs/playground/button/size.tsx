import { Button } from "@/packages/ui"

const BUTTON_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const

export function ButtonMdSizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BUTTON_SIZES.map((size) => (
        <Button key={size} size={size} variant="pure" color="success">
          {size}
        </Button>
      ))}
    </div>
  )
}

export default ButtonMdSizeDemo
