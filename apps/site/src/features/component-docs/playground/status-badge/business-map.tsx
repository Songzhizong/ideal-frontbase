import { StatusBadge } from "@/packages/ui"

const rows = [
  { service: "gateway", status: "healthy", tone: "success" },
  { service: "scheduler", status: "degraded", tone: "warning" },
  { service: "worker", status: "down", tone: "error" },
] as const

export function StatusBadgeBusinessMapDemo() {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.service}
          className="flex items-center justify-between rounded border border-border/50 px-3 py-2 text-sm"
        >
          <span>{row.service}</span>
          <StatusBadge tone={row.tone} variant="subtle">
            {row.status}
          </StatusBadge>
        </div>
      ))}
    </div>
  )
}

export default StatusBadgeBusinessMapDemo
