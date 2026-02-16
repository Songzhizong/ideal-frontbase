import { StatusBadge } from "@/packages/ui"

const variants = ["subtle", "solid", "ghost"] as const

export function StatusBadgeVariantsDemo() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {variants.map((variant) => (
        <StatusBadge key={variant} tone="success" variant={variant}>
          {variant}
        </StatusBadge>
      ))}
    </div>
  )
}

export default StatusBadgeVariantsDemo
