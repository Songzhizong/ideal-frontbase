import { Badge } from "@/packages/ui"

const VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const

export function BadgeVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  )
}

export default BadgeVariantsDemo
