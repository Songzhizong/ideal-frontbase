import { Plus, UserRoundPlus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/packages/ui/button"
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
import type { ProjectMember, ProjectRole } from "../types/project-settings"

interface ProjectMembersTabProps {
  members: ProjectMember[]
  adding: boolean
  updating: boolean
  removing: boolean
  onAddMember: (input: { name: string; email: string; role: ProjectRole }) => Promise<void>
  onUpdateRole: (memberId: string, role: ProjectRole) => Promise<void>
  onRemoveMember: (memberId: string) => Promise<void>
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function ProjectMembersTab({
  members,
  adding,
  updating,
  removing,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}: ProjectMembersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<ProjectRole>("Developer")
  const [pendingRoleMap, setPendingRoleMap] = useState<Record<string, ProjectRole>>({})

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)} className="cursor-pointer">
          <Plus className="size-4" aria-hidden />
          添加成员
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>加入时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const roleValue = pendingRoleMap[member.memberId] ?? member.role
              return (
                <TableRow key={member.memberId} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <p className="text-sm font-medium">{member.name}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Select
                      value={roleValue}
                      onValueChange={(value: ProjectRole) => {
                        setPendingRoleMap((prev) => ({
                          ...prev,
                          [member.memberId]: value,
                        }))
                      }}
                    >
                      <SelectTrigger className="w-[150px] cursor-pointer">
                        <SelectValue placeholder="角色" />
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
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(member.joinedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updating || roleValue === member.role}
                        onClick={async () => {
                          await onUpdateRole(member.memberId, roleValue)
                        }}
                        className="cursor-pointer"
                      >
                        保存
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={removing}
                        onClick={async () => {
                          await onRemoveMember(member.memberId)
                        }}
                        className="cursor-pointer text-destructive"
                      >
                        移除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRoundPlus className="size-4 text-primary" aria-hidden />
              添加成员
            </DialogTitle>
            <DialogDescription>从租户用户中添加成员并配置项目角色。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">姓名</Label>
              <Input
                id="member-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：李四"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">邮箱</Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">角色</Label>
              <Select value={role} onValueChange={(value: ProjectRole) => setRole(value)}>
                <SelectTrigger id="member-role" className="w-full cursor-pointer">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="cursor-pointer"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={adding || name.trim().length === 0 || email.trim().length === 0}
              onClick={async () => {
                await onAddMember({
                  name,
                  email,
                  role,
                })
                setDialogOpen(false)
                setName("")
                setEmail("")
                setRole("Developer")
              }}
              className="cursor-pointer"
            >
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
