import { ShieldAlert } from "lucide-react"

export function NoAccess() {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center space-y-6 p-6 text-center">
      <div className="rounded-full bg-warning/10 p-4 text-warning">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">暂无访问权限</h1>
        <p className="max-w-100 text-muted-foreground">
          您当前没有任何页面的访问权限。请联系管理员为您分配相关权限后重新登录。
        </p>
      </div>
    </div>
  )
}
