import { Badge } from "@/packages/ui/badge"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectEnvironment } from "../types/tenant-projects"

const ENVIRONMENT_CLASSNAME: Readonly<Record<TenantProjectEnvironment, string>> = {
  Dev: "border-slate-500/30 bg-slate-500/10 text-slate-600",
  Test: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  Prod: "border-indigo-500/30 bg-indigo-500/15 text-indigo-700 font-semibold",
}

export function TenantProjectEnvironmentBadge({
  environment,
}: {
  environment: TenantProjectEnvironment
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[10px] uppercase", ENVIRONMENT_CLASSNAME[environment])}
    >
      {environment}
    </Badge>
  )
}
