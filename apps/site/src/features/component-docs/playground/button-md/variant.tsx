import { Button } from "@/packages/ui"

const BUTTON_VARIANTS = [
  "solid",
  "outline",
  "dashed",
  "soft",
  "ghost",
  "link",
  "plain",
  "pure",
] as const

export function ButtonMdVariantDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BUTTON_VARIANTS.map((variant) => (
        <Button key={variant} color="destructive" variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  )
}

export default ButtonMdVariantDemo
