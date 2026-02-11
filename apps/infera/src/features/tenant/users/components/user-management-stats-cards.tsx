import { Activity, ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react"
import { Card } from "@/packages/ui/card"

interface UserManagementStatsCardsProps {
  totalUsers: number
  activeUsers: number
  mfaEnabledUsers: number
  mfaBaseUsers: number
  mfaRatio: number
  newUsers: number
}

export function UserManagementStatsCards({
  totalUsers,
  activeUsers,
  mfaEnabledUsers,
  mfaBaseUsers,
  mfaRatio,
  newUsers,
}: UserManagementStatsCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-row items-center gap-4 rounded-2xl border-border p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">总用户数</p>
          <h3 className="mt-0.5 tabular-nums text-2xl font-semibold tracking-tight text-foreground">
            {totalUsers}
          </h3>
        </div>
      </Card>

      <Card className="flex flex-row items-center gap-4 rounded-2xl border-border p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <UserCheck size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">正常状态</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <h3 className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
              {activeUsers}
            </h3>
            <span className="text-xs font-medium text-muted-foreground/80">名用户</span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-row items-center gap-4 rounded-2xl border-border p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">MFA 开启率</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <h3 className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
              {mfaRatio}%
            </h3>
            <span className="tabular-nums text-xs font-medium text-muted-foreground/80">
              ({mfaEnabledUsers}/{mfaBaseUsers})
            </span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-row items-center gap-4 rounded-2xl border-border p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
          <UserPlus size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">近30天新增</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <h3 className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
              {newUsers}
            </h3>
            <span className="flex items-center text-xs font-medium text-success">
              <Activity size={12} className="mr-0.5" /> 活跃
            </span>
          </div>
        </div>
      </Card>
    </section>
  )
}
