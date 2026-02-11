import { Badge } from "@/packages/ui/badge"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectEnvironment } from "../types/tenant-projects"

const ENVIRONMENT_CLASSNAME: Readonly<Record<TenantProjectEnvironment, string>> = {
  Dev: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  Test: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  Prod: "border-red-500/20 bg-red-500/10 text-red-500",
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
