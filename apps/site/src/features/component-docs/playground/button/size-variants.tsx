import { Plus } from "lucide-react"
import { Button, type ButtonSize, Separator } from "@/packages/ui"

interface SizeVariantItem {
  label: string
  text: string
  buttonSize: ButtonSize
  iconSize: ButtonSize
  iconClassName: string
}

const SIZE_VARIANTS: SizeVariantItem[] = [
  {
    label: "lg",
    text: "Large Button",
    buttonSize: "lg",
    iconSize: "xl",
    iconClassName: "size-5",
  },
  {
    label: "md",
    text: "Default Button",
    buttonSize: "md",
    iconSize: "lg",
    iconClassName: "size-4",
  },
  {
    label: "sm",
    text: "Small Button",
    buttonSize: "sm",
    iconSize: "md",
    iconClassName: "size-3.5",
  },
]

export function ButtonMdSizeVariantsDemo() {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4">
        {SIZE_VARIANTS.map((item, index) => (
          <div key={item.label}>
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="font-code text-xs text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <Button size={item.buttonSize}>{item.text}</Button>
                <Button size={item.iconSize} shape="square">
                  <Plus className={item.iconClassName} />
                </Button>
              </div>
            </div>
            {index < SIZE_VARIANTS.length - 1 ? <Separator className="mt-4" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ButtonMdSizeVariantsDemo
