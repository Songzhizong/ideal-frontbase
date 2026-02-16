import { StatusBadge } from "@/packages/ui"

const tones = ["success", "warning", "error", "info", "neutral"] as const

export function StatusBadgeTonesDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => (
        <StatusBadge key={tone} tone={tone}>
          {tone}
        </StatusBadge>
      ))}
    </div>
  )
}

export default StatusBadgeTonesDemo
