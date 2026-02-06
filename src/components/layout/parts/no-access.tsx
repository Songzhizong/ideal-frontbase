import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogoutHandler } from "@/hooks/use-logout-handler.ts"

export function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-6 text-center space-y-6">
      <div className="p-4 rounded-full bg-warning/10 text-warning">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">暂无访问权限</h1>
        <p className="text-muted-foreground max-w-100">
          您当前没有任何页面的访问权限。请联系管理员为您分配相关权限后重新登录。
        </p>
      </div>
      <Button variant="outline" onClick={useLogoutHandler().handleLogout}>
        退出登录
      </Button>
    </div>
  )
}
