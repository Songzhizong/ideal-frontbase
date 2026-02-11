import { KeyRound, Plus } from "lucide-react"
import { useState } from "react"
import { CopySecretOnceDialog, DangerConfirmDialog } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ProjectRole, ServiceAccountItem } from "../types/project-settings"

interface ProjectServiceAccountsTabProps {
  items: ServiceAccountItem[]
  creating: boolean
  rotating: boolean
  toggling: boolean
  deleting: boolean
  onCreate: (input: { name: string; role: ProjectRole; note: string }) => Promise<void>
  onRotateToken: (serviceAccountId: string, disableOldToken: boolean) => Promise<string>
  onToggleStatus: (
    serviceAccountId: string,
    nextStatus: ServiceAccountItem["status"],
  ) => Promise<void>
  onDelete: (serviceAccountId: string) => Promise<void>
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

function getStatusBadge(status: ServiceAccountItem["status"]) {
  if (status === "Active") {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600">Active</Badge>
  }
  return <Badge className="bg-muted text-muted-foreground">Disabled</Badge>
}

export function ProjectServiceAccountsTab({
  items,
  creating,
  rotating,
  toggling,
  deleting,
  onCreate,
  onRotateToken,
  onToggleStatus,
  onDelete,
}: ProjectServiceAccountsTabProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState<ProjectRole>("Developer")
  const [note, setNote] = useState("")
  const [rotateTarget, setRotateTarget] = useState<string | null>(null)
  const [disableOldToken, setDisableOldToken] = useState(false)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [secret, setSecret] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ServiceAccountItem | null>(null)

  const rotateItem = rotateTarget
    ? items.find((item) => item.serviceAccountId === rotateTarget)
    : null

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
          <Plus className="size-4" aria-hidden />
          创建服务账号
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后使用</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.serviceAccountId} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.note || "-"}</p>
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(item.lastUsedAt)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRotateTarget(item.serviceAccountId)
                        setDisableOldToken(false)
                      }}
                      disabled={rotating}
                      className="cursor-pointer"
                    >
                      轮换 Token
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={toggling}
                      onClick={async () => {
                        await onToggleStatus(
                          item.serviceAccountId,
                          item.status === "Active" ? "Disabled" : "Active",
                        )
                      }}
                      className="cursor-pointer"
                    >
                      {item.status === "Active" ? "禁用" : "启用"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deleting}
                      onClick={() => setDeleteTarget(item)}
                      className="cursor-pointer text-destructive"
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建服务账号</DialogTitle>
            <DialogDescription>创建后可用于 CI/CD 或离线任务访问项目资源。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-account-name">名称</Label>
              <Input
                id="service-account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-account-role">角色</Label>
              <Select value={role} onValueChange={(value: ProjectRole) => setRole(value)}>
                <SelectTrigger id="service-account-role" className="w-full cursor-pointer">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner" className="cursor-pointer">
                    Owner
                  </SelectItem>
                  <SelectItem value="Developer" className="cursor-pointer">
                    Developer
                  </SelectItem>
                  <SelectItem value="Viewer" className="cursor-pointer">
                    Viewer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-account-note">备注</Label>
              <Input
                id="service-account-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={creating || name.trim().length < 2}
              onClick={async () => {
                await onCreate({ name, role, note })
                setCreateDialogOpen(false)
                setName("")
                setRole("Developer")
                setNote("")
              }}
              className="cursor-pointer"
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rotateTarget !== null}
        onOpenChange={(open) => (!open ? setRotateTarget(null) : null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" aria-hidden />
              轮换 Token
            </DialogTitle>
            <DialogDescription>
              将为 {rotateItem?.name ?? "服务账号"} 生成新 Token。明文仅展示一次。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 p-3">
            <Checkbox
              id="disable-old-token"
              checked={disableOldToken}
              onCheckedChange={(value) => setDisableOldToken(value === true)}
            />
            <Label htmlFor="disable-old-token" className="cursor-pointer text-sm">
              同时禁用旧 Token
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRotateTarget(null)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={rotating || !rotateTarget}
              onClick={async () => {
                if (!rotateTarget) {
                  return
                }
                const nextSecret = await onRotateToken(rotateTarget, disableOldToken)
                setRotateTarget(null)
                setSecret(nextSecret)
                setSecretDialogOpen(true)
              }}
              className="cursor-pointer"
            >
              生成 Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CopySecretOnceDialog
        open={secretDialogOpen}
        onOpenChange={setSecretDialogOpen}
        secret={secret}
        title="保存服务账号 Token"
        description="Token 仅显示一次，请在关闭前完成复制。"
      />

      <DangerConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        targetName={deleteTarget?.name ?? ""}
        title="删除服务账号"
        description="删除后该账号将无法再访问项目资源，且不可恢复。"
        confirmLabel="确认删除"
        onConfirm={async () => {
          if (!deleteTarget) {
            return
          }
          await onDelete(deleteTarget.serviceAccountId)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
